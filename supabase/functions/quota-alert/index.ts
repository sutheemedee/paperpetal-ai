import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { admin, corsHeaders, json, loadAccount, requireUser } from '../_shared/entitlements.ts';

const METRICS = ['aiPages', 'aiImages', 'slides', 'sourceProcessing', 'exports', 'research'];
const LEVELS = ['warn', 'critical', 'limit'];

const METRIC_LABEL: Record<string, string> = {
  aiPages: 'AI Pages',
  aiImages: 'AI Images',
  slides: 'สไลด์',
  sourceProcessing: 'ประมวลผลแหล่งข้อมูล',
  exports: 'การส่งออก',
  research: 'งานวิจัย AI',
};

const LEVEL_LABEL: Record<string, string> = {
  warn: 'ใช้ไปแล้ว 75%',
  critical: 'ใกล้หมด (90%)',
  limit: 'ครบโควต้าแล้ว',
};

/**
 * Records quota threshold notifications (one per user · billing period · metric · level)
 * and sends the upgrade-reminder email when app email infrastructure is configured.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { user, error } = await requireUser(req);
    if (!user) return json({ error: 'unauthorized', reason: error }, 401);

    const body = await req.json().catch(() => ({}));
    const incoming = Array.isArray(body.alerts) ? body.alerts.slice(0, 12) : [];
    if (incoming.length === 0) return json({ ok: true, created: 0 });

    // Never trust client-reported usage — recompute from the server-side account.
    const account = await loadAccount(user.id);
    const periodStart = new Date(account.periodStart).toISOString().slice(0, 10);
    const db = admin();

    const rows: Record<string, unknown>[] = [];
    for (const raw of incoming) {
      const metric = String(raw?.metric ?? '');
      const level = String(raw?.level ?? '');
      if (!METRICS.includes(metric) || !LEVELS.includes(level)) continue;

      const base = (account.entitlements as Record<string, unknown>)[metric];
      if (base === null || base === undefined) continue;
      const limit = Number(base) + (account.bonus[metric] ?? 0);
      if (!Number.isFinite(limit) || limit <= 0) continue;
      const used = account.counters[metric] ?? 0;
      const ratio = used / limit;
      const threshold = level === 'limit' ? 1 : level === 'critical' ? 0.9 : 0.75;
      if (ratio < threshold) continue;

      rows.push({
        user_id: user.id,
        period_start: periodStart,
        metric,
        level,
        used,
        limit_value: limit,
        plan_code: account.planCode,
        email_status: 'pending',
      });
    }

    if (rows.length === 0) return json({ ok: true, created: 0 });

    // The unique constraint makes this idempotent: only genuinely new alerts come back.
    const { data: created } = await db
      .from('quota_notifications')
      .upsert(rows, { onConflict: 'user_id,period_start,metric,level', ignoreDuplicates: true })
      .select('id, metric, level, used, limit_value');

    const newAlerts = created ?? [];
    if (newAlerts.length === 0) return json({ ok: true, created: 0 });

    let emailStatus = 'skipped_no_email_infra';
    const worst = newAlerts.sort(
      (a, b) => LEVELS.indexOf(b.level) - LEVELS.indexOf(a.level),
    )[0];

    try {
      const { error: mailError } = await db.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'quota-alert',
          recipientEmail: user.email,
          idempotencyKey: `quota-${user.id}-${periodStart}-${worst.metric}-${worst.level}`,
          templateData: {
            planName: account.planName,
            metricLabel: METRIC_LABEL[worst.metric] ?? worst.metric,
            levelLabel: LEVEL_LABEL[worst.level] ?? worst.level,
            used: worst.used,
            limit: worst.limit_value,
            percent: Math.round((worst.used / worst.limit_value) * 100),
            periodEnd: account.periodEnd,
          },
        },
      });
      emailStatus = mailError ? 'failed' : 'sent';
    } catch {
      emailStatus = 'skipped_no_email_infra';
    }

    await db
      .from('quota_notifications')
      .update({ email_status: emailStatus })
      .in('id', newAlerts.map(a => a.id));

    await db.from('analytics_events').insert({
      user_id: user.id,
      event: 'quota_alert',
      props: { alerts: newAlerts.map(a => `${a.metric}:${a.level}`), emailStatus, planCode: account.planCode },
    });

    return json({ ok: true, created: newAlerts.length, emailStatus });
  } catch (e) {
    console.error('quota-alert error', e);
    return json({ error: e instanceof Error ? e.message : 'unknown_error' }, 500);
  }
});
