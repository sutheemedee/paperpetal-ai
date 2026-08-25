import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Infinity as InfinityIcon } from 'lucide-react';
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
  provider: 'gemini' | 'openai' | 'openrouter' | 'lovable';
  capability: 'text' | 'image' | 'both';
  label: string;
  base_url: string | null;
  chat_model: string;
  image_model: string | null;
  enabled: boolean;
  priority: number;
  key_mask: string;
}

interface Sales {
  invoices: { id: string; user_id: string; plan_code: string; amount_thb: number; status: string; provider: string; created_at: string }[];
  audit: { id: string; action: string; target_user_id: string | null; details: Record<string, unknown>; created_at: string }[];
  revenue: number;
  paidCount: number;
  pendingCount: number;
  pendingAmount: number;
  byMonth: Record<string, number>;
}

interface ProviderForm {
  id: string;
  provider: AiProvider['provider'];
  capability: AiProvider['capability'];
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
  provider: 'openai',
  capability: 'both',
  label: 'GPT Primary',
  apiKey: '',
  baseUrl: '',
  chatModel: 'gpt-4o-mini',
  imageModel: 'gpt-image-1',
  enabled: true,
  priority: 10,
};

const PRESETS: Record<AiProvider['provider'], Partial<ProviderForm>> = {
  openai: { label: 'GPT (OpenAI)', baseUrl: 'https://api.openai.com/v1', chatModel: 'gpt-4o-mini', imageModel: 'gpt-image-1' },
  gemini: { label: 'Gemini (Google AI)', baseUrl: '', chatModel: 'gemini-2.5-flash', imageModel: 'gemini-2.5-flash-image' },
  openrouter: { label: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', chatModel: 'google/gemini-2.0-flash-exp:free', imageModel: '' },
  lovable: { label: 'Lovable AI', baseUrl: 'https://ai.gateway.lovable.dev/v1', chatModel: 'google/gemini-3-flash-preview', imageModel: 'google/gemini-2.5-flash-image' },
};

const CAPABILITY_LABEL: Record<AiProvider['capability'], string> = {
  text: 'เนื้อหา (ข้อความ)',
  image: 'ภาพประกอบ / หน้าปก',
  both: 'เนื้อหา + ภาพประกอบ',
};

const PLAN_CODES: PlanCode[] = ['free', 'starter', 'creator', 'unlimited'];
const METRICS: UsageMetric[] = ['aiPages', 'aiImages', 'slides', 'exports'];
const TABS = [
  { id: 'overview', label: 'ภาพรวม' },
  { id: 'sales', label: 'ยอดขาย' },
  { id: 'ai', label: 'ตั้งค่า AI / API' },
  { id: 'users', label: 'ผู้ใช้' },
] as const;

type TabId = (typeof TABS)[number]['id'];

const Card = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div className="rounded-2xl border border-border bg-card p-3">
    <div className="text-[11px] font-ui uppercase tracking-wide text-muted-foreground">{label}</div>
    <div className="mt-1 font-display text-xl font-extrabold">{value}</div>
    {hint && <div className="mt-1 text-[11px] font-ui text-muted-foreground">{hint}</div>}
  </div>
);

const Admin = () => {
  const [tab, setTab] = useState<TabId>('overview');
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [sales, setSales] = useState<Sales | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      const [m, u, p, s] = await Promise.all([
        call({ action: 'admin_metrics' }),
        call({ action: 'admin_users' }),
        call({ action: 'admin_ai_providers' }),
        call({ action: 'admin_sales' }),
      ]);
      setMetrics(m);
      setUsers(u.users ?? []);
      setProviders(p.providers ?? []);
      setSales(s);
    } catch {
      toast.error('โหลดข้อมูลผู้ดูแลไม่สำเร็จ');
    }
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const setPlan = async (userId: string, planCode: string) => {
    try {
      await call({ action: 'admin_set_plan', userId, planCode });
      toast.success('อัปเดตแผนแล้ว');
      load();
    } catch {
      toast.error('เปลี่ยนแผนไม่สำเร็จ');
    }
  };

  const grant = async (userId: string) => {
    const metric = window.prompt('metric (aiPages / aiImages / slides / exports)', 'aiPages');
    if (!metric) return;
    const amount = Number(window.prompt('จำนวนเครดิตโบนัส', '50'));
    if (!amount) return;
    try {
      await call({ action: 'admin_grant_credits', userId, metric, amount, reason: 'admin console' });
      toast.success('เพิ่มเครดิตโบนัสแล้ว');
    } catch {
      toast.error('เพิ่มเครดิตไม่สำเร็จ');
    }
  };

  const suspend = async (u: AdminUser) => {
    try {
      await call({ action: 'admin_suspend', userId: u.id, suspended: !u.suspended });
      load();
    } catch {
      toast.error('ทำรายการไม่สำเร็จ');
    }
  };

  const editProvider = (p: AiProvider) => {
    setTab('ai');
    setProviderForm({
      id: p.id,
      provider: p.provider,
      capability: p.capability ?? 'text',
      label: p.label || p.provider,
      apiKey: '',
      baseUrl: p.base_url ?? '',
      chatModel: p.chat_model,
      imageModel: p.image_model ?? '',
      enabled: p.enabled,
      priority: p.priority,
    });
  };

  const pickProvider = (provider: AiProvider['provider']) =>
    setProviderForm(f => ({ ...f, provider, ...PRESETS[provider] } as ProviderForm));

  const saveProvider = async () => {
    setSaving(true);
    try {
      await call({
        action: 'admin_save_ai_provider',
        id: providerForm.id || undefined,
        provider: providerForm.provider,
        capability: providerForm.capability,
        label: providerForm.label,
        apiKey: providerForm.apiKey,
        baseUrl: providerForm.baseUrl,
        chatModel: providerForm.chatModel,
        imageModel: providerForm.imageModel,
        enabled: providerForm.enabled,
        priority: providerForm.priority,
      });
      toast.success('บันทึก API provider แล้ว');
      setProviderForm(emptyProvider);
      load();
    } catch (e: any) {
      toast.error(`บันทึกไม่สำเร็จ: ${e?.message ?? 'error'}`);
    }
    setSaving(false);
  };

  const deleteProvider = async (id: string) => {
    if (!window.confirm('ลบ API provider นี้ใช่ไหม?')) return;
    try {
      await call({ action: 'admin_delete_ai_provider', id });
      toast.success('ลบ API provider แล้ว');
      load();
    } catch {
      toast.error('ลบ API provider ไม่สำเร็จ');
    }
  };

  const filtered = users.filter(u =>
    (u.display_name ?? '').toLowerCase().includes(query.toLowerCase()) || u.id.includes(query),
  );

  const textProviders = providers.filter(p => (p.capability ?? 'text') !== 'image');
  const imageProviders = providers.filter(p => (p.capability ?? 'text') !== 'text');

  const months = useMemo(
    () => Object.entries(sales?.byMonth ?? {}).sort((a, b) => (a[0] < b[0] ? 1 : -1)).slice(0, 6),
    [sales],
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

  const providerCard = (p: AiProvider) => (
    <div key={p.id} className="rounded-xl border border-border bg-elevated p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-ui font-bold">{p.label || p.provider}</div>
          <div className="mt-1 text-[11px] font-ui text-muted-foreground">
            {p.provider} · {CAPABILITY_LABEL[p.capability ?? 'text']} · chat {p.chat_model}
            {p.image_model ? ` · image ${p.image_model}` : ''} · key {p.key_mask || 'ซ่อน'} · priority {p.priority}
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
  );

  return (
    <AppShell title="Admin Console">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 md:p-6">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="font-display text-xl font-extrabold md:text-2xl">Super Admin Dashboard</h1>
            <p className="mt-1 flex items-center gap-1 text-xs font-ui text-muted-foreground">
              สิทธิ์สร้างงานไม่จำกัด <InfinityIcon className="h-3.5 w-3.5 text-primary" /> ทั้งหน้าบ้านและหลังบ้าน
            </p>
          </div>
          <button onClick={load} className="min-h-10 rounded-full border border-border px-4 text-xs font-ui font-bold">รีเฟรช</button>
        </header>

        <nav className="-mx-1 flex gap-1 overflow-x-auto pb-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`min-h-10 shrink-0 rounded-full px-4 text-xs font-ui font-bold transition ${
                tab === t.id ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {tab === 'overview' && (
              <>
                <section className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {cards.map(c => (
                    <Card key={c.label} label={c.label} value={c.value} />
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
                      <li className="flex items-center justify-between text-xs font-ui">
                        <span>แนบแหล่งข้อมูลภายนอก</span>
                        <span className="flex items-center gap-1 font-bold text-primary">
                          ฟรีทุกแผน <InfinityIcon className="h-3.5 w-3.5" />
                        </span>
                      </li>
                    </ul>
                  </div>
                </section>

                <section className="rounded-2xl border border-border bg-card p-4">
                  <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">ผู้ใช้ที่ใช้งานสูงสุด</h2>
                  <ul className="mt-2 flex flex-col gap-1.5">
                    {(metrics?.topUsers ?? []).map(([uid, qty]) => (
                      <li key={uid} className="flex items-center justify-between gap-2 text-xs font-ui">
                        <span className="truncate text-muted-foreground">{uid}</span>
                        <span className="font-bold tabular-nums">{qty.toLocaleString()}</span>
                      </li>
                    ))}
                    {!metrics?.topUsers?.length && <li className="text-xs font-ui text-muted-foreground">ยังไม่มีข้อมูลการใช้งาน</li>}
                  </ul>
                </section>
              </>
            )}

            {tab === 'sales' && (
              <>
                <section className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  <Card label="รายได้รวม (ชำระแล้ว)" value={`฿${(sales?.revenue ?? 0).toLocaleString()}`} />
                  <Card label="ใบแจ้งหนี้ที่ชำระ" value={String(sales?.paidCount ?? 0)} />
                  <Card label="รอชำระ" value={String(sales?.pendingCount ?? 0)} hint={`฿${(sales?.pendingAmount ?? 0).toLocaleString()}`} />
                  <Card label="MRR ปัจจุบัน" value={`฿${(metrics?.mrr ?? 0).toLocaleString()}`} />
                </section>

                <section className="rounded-2xl border border-border bg-card p-4">
                  <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">รายได้รายเดือน</h2>
                  <ul className="mt-2 flex flex-col gap-2">
                    {months.map(([month, amount]) => {
                      const max = Math.max(...months.map(m => m[1]), 1);
                      return (
                        <li key={month} className="text-xs font-ui">
                          <div className="flex justify-between">
                            <span>{month}</span>
                            <span className="font-bold tabular-nums">฿{amount.toLocaleString()}</span>
                          </div>
                          <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${(amount / max) * 100}%` }} />
                          </div>
                        </li>
                      );
                    })}
                    {!months.length && <li className="text-xs font-ui text-muted-foreground">ยังไม่มียอดขายที่ชำระแล้ว</li>}
                  </ul>
                </section>

                <section className="rounded-2xl border border-border bg-card p-4">
                  <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">ใบแจ้งหนี้ล่าสุด</h2>
                  <ul className="mt-2 flex flex-col gap-2">
                    {(sales?.invoices ?? []).slice(0, 25).map(inv => (
                      <li key={inv.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-elevated p-3 text-xs font-ui">
                        <div className="min-w-0">
                          <div className="font-bold uppercase">{inv.plan_code}</div>
                          <div className="truncate text-[11px] text-muted-foreground">
                            {inv.user_id} · {new Date(inv.created_at).toLocaleString('th-TH')}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold tabular-nums">฿{Number(inv.amount_thb).toLocaleString()}</span>
                          <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${inv.status === 'paid' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                            {inv.status}
                          </span>
                        </div>
                      </li>
                    ))}
                    {!sales?.invoices?.length && <li className="text-xs font-ui text-muted-foreground">ยังไม่มีใบแจ้งหนี้</li>}
                  </ul>
                </section>

                <section className="rounded-2xl border border-border bg-card p-4">
                  <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">บันทึกการทำงานของผู้ดูแล</h2>
                  <ul className="mt-2 flex flex-col gap-1.5">
                    {(sales?.audit ?? []).map(a => (
                      <li key={a.id} className="text-[11px] font-ui text-muted-foreground">
                        {new Date(a.created_at).toLocaleString('th-TH')} · <span className="font-bold text-foreground">{a.action}</span>
                        {a.target_user_id ? ` · ${a.target_user_id}` : ''}
                      </li>
                    ))}
                    {!sales?.audit?.length && <li className="text-xs font-ui text-muted-foreground">ยังไม่มีบันทึก</li>}
                  </ul>
                </section>
              </>
            )}

            {tab === 'ai' && (
              <section className="rounded-2xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">ตั้งค่า API สำหรับสร้างเนื้อหาและภาพ</h2>
                    <p className="mt-1 text-xs font-ui text-muted-foreground">
                      ใส่คีย์ GPT (OpenAI) หรือ Gemini ได้ทั้งคู่ — เลือกได้ว่าคีย์นี้ใช้สร้างเนื้อหา, ภาพประกอบ/หน้าปก หรือทั้งสองอย่าง ระบบจะเรียงตาม priority ต่ำสุดก่อนและสลับ fallback ให้อัตโนมัติ
                    </p>
                  </div>
                  <button onClick={() => setProviderForm(emptyProvider)} className="min-h-10 rounded-full border border-border px-3 text-xs font-ui font-bold">
                    เพิ่มใหม่
                  </button>
                </div>

                <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_0.9fr]">
                  <div className="flex flex-col gap-4">
                    <div>
                      <div className="text-[11px] font-ui font-bold uppercase tracking-wide text-muted-foreground">คีย์สร้างเนื้อหา</div>
                      <div className="mt-2 flex flex-col gap-2">
                        {textProviders.map(providerCard)}
                        {!textProviders.length && (
                          <div className="rounded-xl border border-dashed border-border bg-elevated p-3 text-xs font-ui text-muted-foreground">
                            ยังไม่มีคีย์สร้างเนื้อหา — ระบบจะ fallback ไปใช้ ENV (GEMINI_API_KEY / OPENAI_API_KEY / LOVABLE_API_KEY)
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-ui font-bold uppercase tracking-wide text-muted-foreground">คีย์สร้างภาพประกอบ / หน้าปก</div>
                      <div className="mt-2 flex flex-col gap-2">
                        {imageProviders.map(providerCard)}
                        {!imageProviders.length && (
                          <div className="rounded-xl border border-dashed border-border bg-elevated p-3 text-xs font-ui text-muted-foreground">
                            ยังไม่มีคีย์สร้างภาพ — แนะนำ OpenAI (gpt-image-1) หรือ Gemini (gemini-2.5-flash-image)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-elevated p-3">
                    <div className="grid gap-2">
                      <label className="text-xs font-ui font-bold">
                        Provider
                        <select value={providerForm.provider} onChange={e => pickProvider(e.target.value as AiProvider['provider'])} className="mt-1 min-h-10 w-full rounded-xl border border-border bg-card px-3 text-xs">
                          <option value="openai">GPT (OpenAI)</option>
                          <option value="gemini">Gemini (Google AI)</option>
                          <option value="openrouter">OpenRouter</option>
                          <option value="lovable">Lovable AI</option>
                        </select>
                      </label>
                      <label className="text-xs font-ui font-bold">
                        ใช้สำหรับ
                        <select value={providerForm.capability} onChange={e => setProviderForm(f => ({ ...f, capability: e.target.value as AiProvider['capability'] }))} className="mt-1 min-h-10 w-full rounded-xl border border-border bg-card px-3 text-xs">
                          <option value="both">เนื้อหา + ภาพประกอบ</option>
                          <option value="text">เนื้อหา (ข้อความ)</option>
                          <option value="image">ภาพประกอบ / หน้าปก</option>
                        </select>
                      </label>
                      <label className="text-xs font-ui font-bold">
                        Label
                        <input value={providerForm.label} onChange={e => setProviderForm(f => ({ ...f, label: e.target.value }))} className="mt-1 min-h-10 w-full rounded-xl border border-border bg-card px-3 text-xs" />
                      </label>
                      <label className="text-xs font-ui font-bold">
                        API Key {providerForm.id ? '(เว้นว่างถ้าไม่เปลี่ยน)' : ''}
                        <input value={providerForm.apiKey} onChange={e => setProviderForm(f => ({ ...f, apiKey: e.target.value }))} type="password" autoComplete="off" className="mt-1 min-h-10 w-full rounded-xl border border-border bg-card px-3 text-xs" placeholder="sk-... / AIza... / sk-or-..." />
                      </label>
                      <label className="text-xs font-ui font-bold">
                        Chat / Content Model
                        <input value={providerForm.chatModel} onChange={e => setProviderForm(f => ({ ...f, chatModel: e.target.value }))} className="mt-1 min-h-10 w-full rounded-xl border border-border bg-card px-3 text-xs" placeholder="gpt-4o-mini / gemini-2.5-flash" />
                      </label>
                      <label className="text-xs font-ui font-bold">
                        Image Model {providerForm.capability !== 'text' ? '(จำเป็น)' : '(ถ้ามี)'}
                        <input value={providerForm.imageModel} onChange={e => setProviderForm(f => ({ ...f, imageModel: e.target.value }))} className="mt-1 min-h-10 w-full rounded-xl border border-border bg-card px-3 text-xs" placeholder="gpt-image-1 / gemini-2.5-flash-image" />
                      </label>
                      <label className="text-xs font-ui font-bold">
                        Base URL (OpenAI/OpenRouter/Lovable)
                        <input value={providerForm.baseUrl} onChange={e => setProviderForm(f => ({ ...f, baseUrl: e.target.value }))} className="mt-1 min-h-10 w-full rounded-xl border border-border bg-card px-3 text-xs" placeholder="https://api.openai.com/v1" />
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
                      <button onClick={saveProvider} disabled={saving} className="mt-1 flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-4 text-xs font-ui font-bold text-primary-foreground disabled:opacity-60">
                        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                        บันทึก API Provider
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {tab === 'users' && (
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
            )}
          </>
        )}
      </div>
    </AppShell>
  );
};

export default Admin;
