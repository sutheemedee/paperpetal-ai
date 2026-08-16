import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { abnormalUsage, admin, commitUsage, corsHeaders, isAdmin, json, loadAccount, requireUser } from '../_shared/entitlements.ts';

type Metric = 'aiPages' | 'aiImages' | 'slides' | 'sourceProcessing' | 'exports' | 'research';
const METRICS: Metric[] = ['aiPages', 'aiImages', 'slides', 'sourceProcessing', 'exports', 'research'];

const limitFor = (ent: Record<string, unknown>, metric: Metric): number | null => {
  const raw = ent[metric];
  if (raw === null || raw === undefined) return null;
  return Number(raw);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { user, error } = await requireUser(req);
    if (!user) return json({ error: 'unauthorized', reason: error }, 401);

    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? 'state');
    const account = await loadAccount(user.id);

    if (action === 'state') return json({ account });

    if (action === 'check' || action === 'consume') {
      const metric = String(body.metric ?? '') as Metric;
      if (!METRICS.includes(metric)) return json({ error: 'invalid_metric' }, 400);
      const quantity = Math.max(1, Math.min(500, Number(body.quantity ?? 1)));

      const limit = limitFor(account.entitlements, metric);
      const bonus = account.bonus[metric] ?? 0;
      const used = account.counters[metric] ?? 0;
      const effectiveLimit = limit === null ? null : limit + bonus;

      // Free-trial style daily export cap
      if (metric === 'exports') {
        const perDay = limitFor(account.entitlements, 'exportsPerDay' as Metric);
        if (perDay !== null && account.exportsToday >= perDay) {
          return json({
            allowed: false,
            reason: 'daily_export_limit',
            perDay,
            exportsToday: account.exportsToday,
            planCode: account.planCode,
            account,
          }, 200);
        }
      }

      if (effectiveLimit !== null && used + quantity > effectiveLimit) {
        return json({
          allowed: false,
          reason: 'monthly_limit',
          metric,
          used,
          limit: effectiveLimit,
          planCode: account.planCode,
          account,
        }, 200);
      }

      if (await abnormalUsage(user.id)) {
        return json({ allowed: false, reason: 'rate_limited', metric, account }, 200);
      }

      if (action === 'check') {
        return json({ allowed: true, metric, used, limit: effectiveLimit, account });
      }

      await commitUsage({
        userId: user.id,
        metric,
        quantity,
        operation: String(body.operation ?? metric),
        planCode: account.planCode,
        periodStart: account.periodStart,
        projectId: body.projectId ?? null,
        model: body.model ?? null,
        costEstimate: body.costEstimate ?? null,
        metadata: typeof body.metadata === 'object' && body.metadata ? body.metadata : {},
      });

      if (metric === 'exports') {
        await admin().from('export_records').insert({
          user_id: user.id,
          project_id: body.projectId ?? null,
          format: String(body.format ?? 'unknown'),
          status: 'success',
        });
      }

      const fresh = await loadAccount(user.id);
      return json({ allowed: true, metric, account: fresh });
    }

    if (action === 'feature') {
      const feature = String(body.feature ?? '');
      const enabled = account.entitlements[feature];
      return json({ enabled: enabled === true, value: enabled ?? false, planCode: account.planCode });
    }

    if (action === 'track') {
      const event = String(body.event ?? '').slice(0, 64);
      if (!event) return json({ error: 'invalid_event' }, 400);
      await admin().from('analytics_events').insert({
        user_id: user.id,
        event,
        props: typeof body.props === 'object' && body.props ? body.props : {},
      });
      return json({ ok: true });
    }

    return json({ error: 'unknown_action' }, 400);
  } catch (e) {
    console.error('entitlements error', e);
    return json({ error: e instanceof Error ? e.message : 'unknown_error' }, 500);
  }
});
