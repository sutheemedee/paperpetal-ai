import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

export const admin = () =>
  createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });

/** Never trust a client-supplied userId — always derive it from the bearer token. */
export async function requireUser(req: Request) {
  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) return { user: null, error: 'missing_token' as const };
  const { data, error } = await admin().auth.getUser(token);
  if (error || !data.user) return { user: null, error: 'invalid_token' as const };
  return { user: data.user, error: null };
}

const OPERATOR_ROLES = ['admin', 'superadmin', 'subperadmin'];

export async function isAdmin(userId: string) {
  const { data } = await admin().from('user_roles').select('role').eq('user_id', userId).in('role', OPERATOR_ROLES);
  return (data ?? []).length > 0;
}

export interface AccountState {
  planCode: string;
  planName: string;
  status: string;
  entitlements: Record<string, unknown>;
  periodStart: string;
  periodEnd: string;
  cancelAtPeriodEnd: boolean;
  counters: Record<string, number>;
  bonus: Record<string, number>;
  exportsToday: number;
  projectCount: number;
}

export async function loadAccount(userId: string): Promise<AccountState> {
  const db = admin();

  let { data: sub } = await db.from('subscriptions').select('*').eq('user_id', userId).maybeSingle();
  if (!sub) {
    const start = new Date();
    start.setUTCDate(1);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setUTCMonth(end.getUTCMonth() + 1);
    const inserted = await db
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_code: 'free',
        status: 'trialing',
        current_period_start: start.toISOString(),
        current_period_end: end.toISOString(),
      })
      .select('*')
      .single();
    sub = inserted.data!;
  }

  // Roll the period forward when the billing cycle has elapsed (monthly counter reset).
  if (new Date(sub.current_period_end).getTime() <= Date.now()) {
    const start = new Date(sub.current_period_end);
    const end = new Date(start);
    end.setUTCMonth(end.getUTCMonth() + 1);
    const nextPlan = sub.cancel_at_period_end ? 'free' : sub.plan_code;
    const nextStatus = sub.cancel_at_period_end ? 'canceled' : sub.status;
    const rolled = await db
      .from('subscriptions')
      .update({
        current_period_start: start.toISOString(),
        current_period_end: end.toISOString(),
        plan_code: nextPlan,
        status: nextStatus,
        cancel_at_period_end: false,
      })
      .eq('user_id', userId)
      .select('*')
      .single();
    sub = rolled.data ?? sub;
  }

  const { data: plan } = await db.from('plans').select('*').eq('code', sub.plan_code).maybeSingle();
  const periodStart = new Date(sub.current_period_start).toISOString().slice(0, 10);

  const { data: counterRows } = await db
    .from('usage_counters')
    .select('metric, used')
    .eq('user_id', userId)
    .eq('period_start', periodStart);

  const counters: Record<string, number> = {};
  for (const row of counterRows ?? []) counters[row.metric] = row.used;

  const { data: bonusRows } = await db
    .from('bonus_credits')
    .select('metric, amount, expires_at')
    .eq('user_id', userId);
  const bonus: Record<string, number> = {};
  for (const row of bonusRows ?? []) {
    if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) continue;
    bonus[row.metric] = (bonus[row.metric] ?? 0) + row.amount;
  }

  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const { count: exportsToday } = await db
    .from('export_records')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'success')
    .gte('created_at', dayStart.toISOString());

  const { count: projectCount } = await db
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('archived', false);

  return {
    planCode: sub.plan_code,
    planName: plan?.name ?? sub.plan_code,
    status: sub.status,
    entitlements: (plan?.entitlements ?? {}) as Record<string, unknown>,
    periodStart: sub.current_period_start,
    periodEnd: sub.current_period_end,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    counters,
    bonus,
    exportsToday: exportsToday ?? 0,
    projectCount: projectCount ?? 0,
  };
}

/** Increments the counter and writes a ledger row. Only call for successful work. */
export async function commitUsage(opts: {
  userId: string;
  metric: string;
  quantity: number;
  operation: string;
  planCode: string;
  periodStart: string;
  projectId?: string | null;
  model?: string | null;
  costEstimate?: number | null;
  metadata?: Record<string, unknown>;
}) {
  if (await isAdmin(opts.userId)) {
    await admin().from('usage_ledger').insert({
      user_id: opts.userId,
      operation: opts.operation,
      metric: opts.metric,
      project_id: opts.projectId ?? null,
      quantity: opts.quantity,
      model: opts.model ?? null,
      status: 'success',
      plan_code: opts.planCode,
      cost_estimate: opts.costEstimate ?? null,
      metadata: { ...(opts.metadata ?? {}), operator_unmetered: true },
    });
    return;
  }

  const db = admin();
  const period = new Date(opts.periodStart).toISOString().slice(0, 10);

  const { data: existing } = await db
    .from('usage_counters')
    .select('id, used')
    .eq('user_id', opts.userId)
    .eq('period_start', period)
    .eq('metric', opts.metric)
    .maybeSingle();

  if (existing) {
    await db
      .from('usage_counters')
      .update({ used: existing.used + opts.quantity, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
  } else {
    await db.from('usage_counters').insert({
      user_id: opts.userId,
      period_start: period,
      metric: opts.metric,
      used: opts.quantity,
    });
  }

  await db.from('usage_ledger').insert({
    user_id: opts.userId,
    operation: opts.operation,
    metric: opts.metric,
    project_id: opts.projectId ?? null,
    quantity: opts.quantity,
    model: opts.model ?? null,
    status: 'success',
    plan_code: opts.planCode,
    cost_estimate: opts.costEstimate ?? null,
    metadata: opts.metadata ?? {},
  });
}

/** Internal abuse guard — thresholds are intentionally not surfaced to users. */
export async function abnormalUsage(userId: string) {
  const db = admin();
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data } = await db
    .from('usage_ledger')
    .select('quantity')
    .eq('user_id', userId)
    .gte('created_at', since);
  const total = (data ?? []).reduce((sum, row) => sum + (row.quantity ?? 0), 0);
  return total > 1200;
}
