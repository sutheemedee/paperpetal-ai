import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { supabase } from '@/integrations/supabase/client';
import { PlanCode, UsageMetric } from '@/lib/plans';

interface Metrics {
  totalUsers: number;
  byPlan: Record<string, number>;
  paying: number;
  mrr: number;
  arr: number;
  arpu: number;
  conversion: number;
  cancellations: number;
  usageTotals: Record<string, number>;
  estimatedAiCost: number;
  exports: number;
  topUsers: [string, number][];
}

interface AdminUser {
  id: string;
  display_name: string | null;
  suspended: boolean;
  created_at: string;
  subscription: { plan_code: string; status: string; current_period_end: string } | null;
}

interface AiProvider {
  id: string;
  provider: 'gemini' | 'openrouter' | 'lovable';
  label: string;
  base_url: string | null;
  chat_model: string;
  image_model: string | null;
  enabled: boolean;
  priority: number;
  key_mask: string;
}

interface ProviderForm {
  id: string;
  provider: AiProvider['provider'];
  label: string;
  apiKey: string;
  baseUrl: string;
  chatModel: string;
  imageModel: string;
  enabled: boolean;
  priority: number;
}

const emptyProvider: ProviderForm = {
  id: '',
  provider: 'gemini',
  label: 'Gemini Primary',
  apiKey: '',
  baseUrl: '',
  chatModel: 'gemini-2.5-flash',
  imageModel: '',
  enabled: true,
  priority: 10,
};

const PLAN_CODES: PlanCode[] = ['free', 'starter', 'creator', 'unlimited'];
const METRICS: UsageMetric[] = ['aiPages', 'aiImages', 'slides', 'exports'];

const Admin = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [providers, setProviders] = useState<AiProvider[]>([]);
  const [providerForm, setProviderForm] = useState<ProviderForm>(emptyProvider);

  const call = async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke('billing', { body });
    if (error || data?.error) throw new Error(data?.error ?? 'failed');
    return data;
  };

  const load = async () => {
    try {
      const [m, u, p] = await Promise.all([
        call({ action: 'admin_metrics' }),
        call({ action: 'admin_users' }),
        call({ action: 'admin_ai_providers' }),
      ]);
      setMetrics(m);
      setUsers(u.users ?? []);
      setProviders(p.providers ?? []);
    } catch {
      toast.error('โหลดข้อมูลผู้ดูแลไม่สำเร็จ');
    }
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const setPlan = async (userId: string, planCode: string) => {
    await call({ action: 'admin_set_plan', userId, planCode }).catch(() => toast.error('เปลี่ยนแผนไม่สำเร็จ'));
    toast.success('อัปเดตแผนแล้ว');
    load();
  };

  const grant = async (userId: string) => {
    const metric = window.prompt('metric (aiPages / aiImages / slides / exports)', 'aiPages');
    if (!metric) return;
    const amount = Number(window.prompt('จำนวนเครดิตโบนัส', '50'));
    if (!amount) return;
    await call({ action: 'admin_grant_credits', userId, metric, amount, reason: 'admin console' }).catch(() =>
      toast.error('เพิ่มเครดิตไม่สำเร็จ'),
    );
    toast.success('เพิ่มเครดิตโบนัสแล้ว');
  };

  const suspend = async (u: AdminUser) => {
    await call({ action: 'admin_suspend', userId: u.id, suspended: !u.suspended }).catch(() => toast.error('ทำรายการไม่สำเร็จ'));
    load();
  };

  const editProvider = (p: AiProvider) => {
    setProviderForm({
      id: p.id,
      provider: p.provider,
      label: p.label || p.provider,
      apiKey: '',
      baseUrl: p.base_url ?? '',
      chatModel: p.chat_model,
      imageModel: p.image_model ?? '',
      enabled: p.enabled,
      priority: p.priority,
    });
  };

  const saveProvider = async () => {
    await call({
      action: 'admin_save_ai_provider',
      id: providerForm.id || undefined,
      provider: providerForm.provider,
      label: providerForm.label,
      apiKey: providerForm.apiKey,
      baseUrl: providerForm.baseUrl,
      chatModel: providerForm.chatModel,
      imageModel: providerForm.imageModel,
      enabled: providerForm.enabled,
      priority: providerForm.priority,
    }).catch(() => toast.error('บันทึก API provider ไม่สำเร็จ'));
    toast.success('บันทึก API provider แล้ว');
    setProviderForm(emptyProvider);
    load();
  };

  const deleteProvider = async (id: string) => {
    if (!window.confirm('ลบ API provider นี้ใช่ไหม?')) return;
    await call({ action: 'admin_delete_ai_provider', id }).catch(() => toast.error('ลบ API provider ไม่สำเร็จ'));
    toast.success('ลบ API provider แล้ว');
    load();
  };

  const filtered = users.filter(u =>
    (u.display_name ?? '').toLowerCase().includes(query.toLowerCase()) || u.id.includes(query),
  );

  const cards = metrics
    ? [
        { label: 'ผู้ใช้ทั้งหมด', value: metrics.totalUsers.toLocaleString() },
        { label: 'ผู้ใช้ที่จ่ายเงิน', value: metrics.paying.toLocaleString() },
        { label: 'MRR', value: `฿${metrics.mrr.toLocaleString()}` },
        { label: 'ARR', value: `฿${metrics.arr.toLocaleString()}` },
        { label: 'ARPU', value: `฿${metrics.arpu.toLocaleString()}` },
        { label: 'Conversion', value: `${metrics.conversion}%` },
        { label: 'ยกเลิก', value: metrics.cancellations.toLocaleString() },
        { label: 'ต้นทุน AI (ประมาณ)', value: `$${metrics.estimatedAiCost}` },
      ]
    : [];

  return (
    <AppShell title="Admin Console">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 md:p-6">
        <h1 className="font-display text-xl font-extrabold md:text-2xl">Admin Dashboard</h1>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <section className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {cards.map(c => (
                <div key={c.label} className="rounded-2xl border border-border bg-card p-3">
                  <div className="text-[11px] font-ui uppercase tracking-wide text-muted-foreground">{c.label}</div>
                  <div className="mt-1 font-display text-xl font-extrabold">{c.value}</div>
                </div>
              ))}
            </section>

            <section className="grid gap-3 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-4">
                <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">ผู้ใช้ตามแผน</h2>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {PLAN_CODES.map(code => (
                    <li key={code} className="flex items-center justify-between text-xs font-ui">
                      <span className="uppercase">{code}</span>
                      <span className="font-bold tabular-nums">{metrics?.byPlan?.[code] ?? 0}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">การใช้งานรวม</h2>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {METRICS.map(m => (
                    <li key={m} className="flex items-center justify-between text-xs font-ui">
                      <span>{m}</span>
                      <span className="font-bold tabular-nums">{(metrics?.usageTotals?.[m] ?? 0).toLocaleString()}</span>
                    </li>
                  ))}
                  <li className="flex items-center justify-between text-xs font-ui">
                    <span>ไฟล์ที่ส่งออก</span>
                    <span className="font-bold tabular-nums">{metrics?.exports ?? 0}</span>
                  </li>
                </ul>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">AI API Providers</h2>
                  <p className="mt-1 text-xs font-ui text-muted-foreground">Gemini / OpenRouter / Lovable เรียงตาม priority ต่ำสุดก่อน ใช้เป็น fallback อัตโนมัติ</p>
                </div>
                <button onClick={() => setProviderForm(emptyProvider)} className="min-h-10 rounded-full border border-border px-3 text-xs font-ui font-bold">
                  เพิ่มใหม่
                </button>
              </div>

              <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_0.9fr]">
                <div className="flex flex-col gap-2">
                  {providers.length === 0 && (
                    <div className="rounded-xl border border-dashed border-border bg-elevated p-3 text-xs font-ui text-muted-foreground">
                      ยังไม่มี API provider ในฐานข้อมูล ระบบจะ fallback ไปใช้ ENV ถ้ามี เช่น GEMINI_API_KEY หรือ LOVABLE_API_KEY
                    </div>
                  )}
                  {providers.map(p => (
                    <div key={p.id} className="rounded-xl border border-border bg-elevated p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-ui font-bold">{p.label || p.provider}</div>
                          <div className="mt-1 text-[11px] font-ui text-muted-foreground">
                            {p.provider} · {p.chat_model} · key {p.key_mask || 'not shown'} · priority {p.priority}
                          </div>
                        </div>
                        <span className={`rounded-full px-2 py-1 text-[10px] font-ui font-bold ${p.enabled ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                          {p.enabled ? 'ON' : 'OFF'}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button onClick={() => editProvider(p)} className="min-h-9 rounded-full border border-border px-3 text-[11px] font-ui font-bold">แก้ไข</button>
                        <button onClick={() => deleteProvider(p.id)} className="min-h-9 rounded-full border border-destructive/50 px-3 text-[11px] font-ui font-bold text-destructive">ลบ</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-border bg-elevated p-3">
                  <div className="grid gap-2">
                    <label className="text-xs font-ui font-bold">
                      Provider
                      <select value={providerForm.provider} onChange={e => setProviderForm(f => ({ ...f, provider: e.target.value as any }))} className="mt-1 min-h-10 w-full rounded-xl border border-border bg-card px-3 text-xs">
                        <option value="gemini">Gemini</option>
                        <option value="openrouter">OpenRouter</option>
                        <option value="lovable">Lovable</option>
                      </select>
                    </label>
                    <label className="text-xs font-ui font-bold">
                      Label
                      <input value={providerForm.label} onChange={e => setProviderForm(f => ({ ...f, label: e.target.value }))} className="mt-1 min-h-10 w-full rounded-xl border border-border bg-card px-3 text-xs" />
                    </label>
                    <label className="text-xs font-ui font-bold">
                      API Key {providerForm.id ? '(เว้นว่างถ้าไม่เปลี่ยน)' : ''}
                      <input value={providerForm.apiKey} onChange={e => setProviderForm(f => ({ ...f, apiKey: e.target.value }))} type="password" className="mt-1 min-h-10 w-full rounded-xl border border-border bg-card px-3 text-xs" placeholder="AIza... / sk-or-... / lvbl..." />
                    </label>
                    <label className="text-xs font-ui font-bold">
                      Chat Model
                      <input value={providerForm.chatModel} onChange={e => setProviderForm(f => ({ ...f, chatModel: e.target.value }))} className="mt-1 min-h-10 w-full rounded-xl border border-border bg-card px-3 text-xs" placeholder="gemini-2.5-flash" />
                    </label>
                    <label className="text-xs font-ui font-bold">
                      Base URL (OpenRouter/Lovable เท่านั้น)
                      <input value={providerForm.baseUrl} onChange={e => setProviderForm(f => ({ ...f, baseUrl: e.target.value }))} className="mt-1 min-h-10 w-full rounded-xl border border-border bg-card px-3 text-xs" placeholder="https://openrouter.ai/api/v1" />
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="text-xs font-ui font-bold">
                        Priority
                        <input value={providerForm.priority} onChange={e => setProviderForm(f => ({ ...f, priority: Number(e.target.value) || 100 }))} type="number" className="mt-1 min-h-10 w-full rounded-xl border border-border bg-card px-3 text-xs" />
                      </label>
                      <label className="flex items-end gap-2 text-xs font-ui font-bold">
                        <input checked={providerForm.enabled} onChange={e => setProviderForm(f => ({ ...f, enabled: e.target.checked }))} type="checkbox" className="h-4 w-4" />
                        เปิดใช้งาน
                      </label>
                    </div>
                    <button onClick={saveProvider} className="mt-1 min-h-11 rounded-full bg-primary px-4 text-xs font-ui font-bold text-primary-foreground">
                      บันทึก API Provider
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">ผู้ใช้</h2>
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="ค้นหาชื่อหรือ user id"
                  className="min-h-11 w-full max-w-xs rounded-xl border border-border bg-elevated px-3 text-xs outline-none focus:border-primary"
                />
              </div>
              <ul className="mt-3 flex flex-col gap-2">
                {filtered.map(u => (
                  <li key={u.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-elevated p-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-ui font-bold">{u.display_name || 'ไม่ระบุชื่อ'}</div>
                      <div className="truncate text-[11px] font-ui text-muted-foreground">
                        {u.subscription?.plan_code ?? 'free'} · {u.subscription?.status ?? 'trialing'} · สมัคร{' '}
                        {new Date(u.created_at).toLocaleDateString('th-TH')}
                      </div>
                    </div>
                    <select
                      value={u.subscription?.plan_code ?? 'free'}
                      onChange={e => setPlan(u.id, e.target.value)}
                      className="min-h-11 rounded-xl border border-border bg-card px-2 text-xs font-ui"
                    >
                      {PLAN_CODES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <button onClick={() => grant(u.id)} className="min-h-11 rounded-full border border-border px-3 text-xs font-ui font-bold">
                      + เครดิต
                    </button>
                    <button
                      onClick={() => suspend(u)}
                      className={`min-h-11 rounded-full px-3 text-xs font-ui font-bold ${
                        u.suspended ? 'border border-success/50 text-success' : 'border border-destructive/50 text-destructive'
                      }`}
                    >
                      {u.suspended ? 'คืนสิทธิ์' : 'ระงับบัญชี'}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
};

export default Admin;
