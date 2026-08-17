import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { admin, corsHeaders, isAdmin, json, loadAccount, requireUser } from '../_shared/entitlements.ts';
import { listAiProvidersForAdmin, maskSecret } from '../_shared/ai-providers.ts';

/**
 * Provider-agnostic subscription lifecycle.
 * Plans are NEVER activated from a client claim — only a verified provider
 * webhook (or an admin action) may move a subscription to `active`.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const db = admin();
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? url.searchParams.get('action') ?? '');

    // ---- Provider webhook (server-verified state changes) ----
    if (action === 'webhook') {
      const secret = Deno.env.get('PAYMENT_WEBHOOK_SECRET');
      const signature = req.headers.get('x-provider-signature');
      if (!secret || !signature || signature !== secret) {
        return json({ error: 'invalid_signature' }, 401);
      }
      const { userId, planCode, status, providerReference, provider } = body;
      if (!userId || !planCode) return json({ error: 'invalid_payload' }, 400);

      const start = new Date();
      const end = new Date(start);
      end.setUTCMonth(end.getUTCMonth() + 1);

      await db.from('subscriptions').upsert({
        user_id: userId,
        plan_code: planCode,
        status: status ?? 'active',
        provider: provider ?? 'external',
        provider_subscription_id: providerReference ?? null,
        current_period_start: start.toISOString(),
        current_period_end: end.toISOString(),
        cancel_at_period_end: false,
      }, { onConflict: 'user_id' });

      const { data: plan } = await db.from('plans').select('price_thb').eq('code', planCode).maybeSingle();
      await db.from('invoices').insert({
        user_id: userId,
        plan_code: planCode,
        amount_thb: plan?.price_thb ?? 0,
        status: 'paid',
        provider: provider ?? 'external',
        provider_reference: providerReference ?? null,
        period_start: start.toISOString(),
        period_end: end.toISOString(),
      });
      return json({ ok: true });
    }

    const { user, error } = await requireUser(req);
    if (!user) return json({ error: 'unauthorized', reason: error }, 401);

    if (action === 'state') {
      const account = await loadAccount(user.id);
      const { data: invoices } = await db
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(24);
      return json({ account, invoices: invoices ?? [] });
    }

    // ---- Checkout: creates a pending invoice, never activates the plan ----
    if (action === 'checkout') {
      const planCode = String(body.planCode ?? '');
      const { data: plan } = await db.from('plans').select('*').eq('code', planCode).eq('is_active', true).maybeSingle();
      if (!plan) return json({ error: 'invalid_plan' }, 400);
      if (planCode === 'free') return json({ error: 'free_plan_not_purchasable' }, 400);

      let discount = 0;
      const promoCode = typeof body.promoCode === 'string' ? body.promoCode.trim().toUpperCase() : '';
      let promo: { id: string; kind: string; value: number; redemptions: number; max_redemptions: number | null } | null = null;
      if (promoCode) {
        const { data } = await db.from('promos').select('*').eq('code', promoCode).eq('active', true).maybeSingle();
        if (!data) return json({ error: 'invalid_promo' }, 400);
        if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) return json({ error: 'promo_expired' }, 400);
        if (data.max_redemptions !== null && data.redemptions >= data.max_redemptions) return json({ error: 'promo_exhausted' }, 400);
        promo = data;
        if (data.kind === 'percent_off') discount = Math.round((plan.price_thb * Number(data.value)) / 100);
        if (data.kind === 'amount_off') discount = Math.round(Number(data.value));
        if (data.kind === 'free_month') discount = plan.price_thb;
      }

      const amount = Math.max(0, plan.price_thb - discount);
      const { data: invoice } = await db
        .from('invoices')
        .insert({
          user_id: user.id,
          plan_code: planCode,
          amount_thb: amount,
          status: 'pending',
          provider: 'pending_provider',
        })
        .select('*')
        .single();

      if (promo) await db.from('promos').update({ redemptions: promo.redemptions + 1 }).eq('id', promo.id);

      await db.from('analytics_events').insert({ user_id: user.id, event: 'checkout_started', props: { planCode, amount } });

      return json({
        invoice,
        amount,
        discount,
        checkoutReady: false,
        message: 'ยังไม่ได้เชื่อมต่อผู้ให้บริการชำระเงิน — ใบแจ้งหนี้ถูกสร้างเป็นสถานะรอชำระ แผนจะเปิดใช้งานเมื่อระบบยืนยันการชำระเงินจากฝั่งผู้ให้บริการ',
      });
    }

    if (action === 'cancel') {
      await db.from('subscriptions').update({ cancel_at_period_end: true, status: 'canceling' }).eq('user_id', user.id);
      await db.from('analytics_events').insert({ user_id: user.id, event: 'subscription_cancelled', props: {} });
      return json({ ok: true, account: await loadAccount(user.id) });
    }

    if (action === 'resume') {
      await db.from('subscriptions').update({ cancel_at_period_end: false, status: 'active' }).eq('user_id', user.id);
      return json({ ok: true, account: await loadAccount(user.id) });
    }

    // ---- Admin operations ----
    if (!(await isAdmin(user.id))) return json({ error: 'forbidden' }, 403);

    if (action === 'admin_metrics') {
      const { data: subs } = await db.from('subscriptions').select('plan_code, status, created_at');
      const { data: plans } = await db.from('plans').select('code, price_thb');
      const priceOf = (code: string) => plans?.find(p => p.code === code)?.price_thb ?? 0;
      const byPlan: Record<string, number> = {};
      let mrr = 0;
      let paying = 0;
      for (const s of subs ?? []) {
        byPlan[s.plan_code] = (byPlan[s.plan_code] ?? 0) + 1;
        if (['active', 'canceling'].includes(s.status) && s.plan_code !== 'free') {
          mrr += priceOf(s.plan_code);
          paying += 1;
        }
      }
      const { data: usage } = await db.from('usage_ledger').select('metric, quantity, cost_estimate, user_id');
      const totals: Record<string, number> = {};
      let cost = 0;
      const perUser: Record<string, number> = {};
      for (const row of usage ?? []) {
        totals[row.metric ?? 'other'] = (totals[row.metric ?? 'other'] ?? 0) + (row.quantity ?? 0);
        cost += Number(row.cost_estimate ?? 0);
        perUser[row.user_id] = (perUser[row.user_id] ?? 0) + (row.quantity ?? 0);
      }
      const topUsers = Object.entries(perUser).sort((a, b) => b[1] - a[1]).slice(0, 10);
      const { count: cancellations } = await db
        .from('subscriptions')
        .select('id', { count: 'exact', head: true })
        .in('status', ['canceling', 'canceled']);
      const { count: totalUsers } = await db.from('profiles').select('id', { count: 'exact', head: true });
      const { count: exports } = await db.from('export_records').select('id', { count: 'exact', head: true });

      return json({
        totalUsers: totalUsers ?? 0,
        byPlan,
        paying,
        mrr,
        arr: mrr * 12,
        arpu: paying ? Math.round(mrr / paying) : 0,
        conversion: totalUsers ? Number(((paying / totalUsers) * 100).toFixed(1)) : 0,
        cancellations: cancellations ?? 0,
        usageTotals: totals,
        estimatedAiCost: Number(cost.toFixed(2)),
        exports: exports ?? 0,
        topUsers,
      });
    }

    if (action === 'admin_users') {
      const { data: profiles } = await db
        .from('profiles')
        .select('id, display_name, suspended, created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      const { data: subs } = await db.from('subscriptions').select('user_id, plan_code, status, current_period_end');
      return json({
        users: (profiles ?? []).map(p => ({
          ...p,
          subscription: subs?.find(s => s.user_id === p.id) ?? null,
        })),
      });
    }

    if (action === 'admin_set_plan') {
      const { userId, planCode } = body;
      if (!userId || !planCode) return json({ error: 'invalid_payload' }, 400);
      await db.from('subscriptions').update({ plan_code: planCode, status: planCode === 'free' ? 'trialing' : 'active' }).eq('user_id', userId);
      await db.from('admin_audit_log').insert({ admin_id: user.id, action: 'set_plan', target_user_id: userId, details: { planCode } });
      return json({ ok: true });
    }

    if (action === 'admin_grant_credits') {
      const { userId, metric, amount, reason } = body;
      if (!userId || !metric || !amount) return json({ error: 'invalid_payload' }, 400);
      await db.from('bonus_credits').insert({ user_id: userId, metric, amount: Number(amount), reason: reason ?? 'admin grant' });
      await db.from('admin_audit_log').insert({ admin_id: user.id, action: 'grant_credits', target_user_id: userId, details: { metric, amount } });
      return json({ ok: true });
    }

    if (action === 'admin_suspend') {
      const { userId, suspended } = body;
      if (!userId) return json({ error: 'invalid_payload' }, 400);
      await db.from('profiles').update({ suspended: !!suspended }).eq('id', userId);
      await db.from('admin_audit_log').insert({ admin_id: user.id, action: suspended ? 'suspend' : 'restore', target_user_id: userId, details: {} });
      return json({ ok: true });
    }

    if (action === 'admin_update_plan') {
      const { planCode, entitlements, price_thb } = body;
      if (!planCode) return json({ error: 'invalid_payload' }, 400);
      const patch: Record<string, unknown> = {};
      if (entitlements && typeof entitlements === 'object') patch.entitlements = entitlements;
      if (price_thb !== undefined) patch.price_thb = Number(price_thb);
      await db.from('plans').update(patch).eq('code', planCode);
      await db.from('admin_audit_log').insert({ admin_id: user.id, action: 'update_plan', details: { planCode, patch } });
      return json({ ok: true });
    }

    if (action === 'admin_ai_providers') {
      const providers = await listAiProvidersForAdmin();
      const { data: rawProviders } = await db
        .from('ai_provider_settings')
        .select('id, api_key');
      const masked = providers.map((p: any) => ({
        ...p,
        key_mask: maskSecret(rawProviders?.find((r: any) => r.id === p.id)?.api_key),
      }));
      return json({ providers: masked });
    }

    if (action === 'admin_save_ai_provider') {
      const provider = String(body.provider ?? '');
      const label = String(body.label ?? provider).trim();
      const apiKey = typeof body.apiKey === 'string' ? body.apiKey.trim() : '';
      const chatModel = String(body.chatModel ?? '').trim();
      const imageModel = typeof body.imageModel === 'string' ? body.imageModel.trim() : null;
      const baseUrl = typeof body.baseUrl === 'string' && body.baseUrl.trim() ? body.baseUrl.trim() : null;
      const enabled = body.enabled !== false;
      const priority = Math.max(1, Math.min(999, Number(body.priority ?? 100)));
      const id = typeof body.id === 'string' && body.id ? body.id : null;

      if (!['gemini', 'openrouter', 'lovable'].includes(provider)) return json({ error: 'invalid_provider' }, 400);
      if (!chatModel) return json({ error: 'chat_model_required' }, 400);
      if (!id && !apiKey) return json({ error: 'api_key_required' }, 400);

      const patch: Record<string, unknown> = {
        provider,
        label,
        base_url: baseUrl,
        chat_model: chatModel,
        image_model: imageModel,
        enabled,
        priority,
        updated_at: new Date().toISOString(),
      };
      if (apiKey) patch.api_key = apiKey;

      let savedId = id;
      if (id) {
        await db.from('ai_provider_settings').update(patch).eq('id', id);
      } else {
        const { data: inserted, error: insertError } = await db
          .from('ai_provider_settings')
          .insert(patch)
          .select('id')
          .single();
        if (insertError) throw insertError;
        savedId = inserted.id;
      }

      await db.from('admin_audit_log').insert({
        admin_id: user.id,
        action: id ? 'update_ai_provider' : 'create_ai_provider',
        details: { id: savedId, provider, label, chatModel, enabled, priority },
      });
      return json({ ok: true, id: savedId });
    }

    if (action === 'admin_delete_ai_provider') {
      const id = String(body.id ?? '');
      if (!id) return json({ error: 'invalid_payload' }, 400);
      await db.from('ai_provider_settings').delete().eq('id', id);
      await db.from('admin_audit_log').insert({ admin_id: user.id, action: 'delete_ai_provider', details: { id } });
      return json({ ok: true });
    }

    return json({ error: 'unknown_action' }, 400);
  } catch (e) {
    console.error('billing error', e);
    return json({ error: e instanceof Error ? e.message : 'unknown_error' }, 500);
  }
});
