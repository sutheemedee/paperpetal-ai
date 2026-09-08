import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, Clock, Download, Loader2, RotateCcw, XCircle } from 'lucide-react';
import AppShell from '@/components/AppShell';
import Seo from '@/components/Seo';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/auth/AuthProvider';

interface Invoice {
  id: string;
  plan_code: string | null;
  amount_thb: number;
  status: string;
  provider: string | null;
  provider_reference?: string | null;
  period_start: string | null;
  period_end: string | null;
  created_at: string;
}

const STATUS: Record<string, { label: string; className: string; Icon: typeof CheckCircle2 }> = {
  paid: { label: 'ชำระสำเร็จ', className: 'bg-success/15 text-success', Icon: CheckCircle2 },
  pending: { label: 'รอชำระเงิน', className: 'bg-highlight/15 text-highlight', Icon: Clock },
  failed: { label: 'ชำระล้มเหลว', className: 'bg-destructive/15 text-destructive', Icon: XCircle },
  refunded: { label: 'คืนเงินแล้ว', className: 'bg-muted text-muted-foreground', Icon: RotateCcw },
};

const FILTERS: { key: string; label: string }[] = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'paid', label: 'สำเร็จ' },
  { key: 'pending', label: 'รอชำระ' },
  { key: 'failed', label: 'ล้มเหลว' },
];

const fmtDate = (v?: string | null) =>
  v ? new Date(v).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const cycleLabel = (inv: Invoice) => {
  const base = inv.period_start ?? inv.created_at;
  return new Date(base).toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
};

const receiptNo = (inv: Invoice) => `PP-${new Date(inv.created_at).getFullYear()}-${inv.id.slice(0, 8).toUpperCase()}`;

const BillingHistory = () => {
  const { account, user, profile } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    supabase.functions.invoke('billing', { body: { action: 'state' } }).then(({ data, error }) => {
      if (error) toast.error('โหลดประวัติการชำระเงินไม่สำเร็จ');
      if (data?.invoices) setInvoices(data.invoices as Invoice[]);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(
    () => (filter === 'all' ? invoices : invoices.filter(i => i.status === filter)),
    [invoices, filter],
  );

  const groups = useMemo(() => {
    const map = new Map<string, Invoice[]>();
    for (const inv of filtered) {
      const key = cycleLabel(inv);
      map.set(key, [...(map.get(key) ?? []), inv]);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const totalPaid = useMemo(
    () => invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.amount_thb ?? 0), 0),
    [invoices],
  );

  const downloadReceipt = (inv: Invoice) => {
    if (inv.status !== 'paid') {
      toast.error('ดาวน์โหลดใบเสร็จได้เมื่อชำระเงินสำเร็จแล้ว');
      return;
    }
    const rows: [string, string][] = [
      ['เลขที่ใบเสร็จ', receiptNo(inv)],
      ['วันที่ออก', fmtDate(inv.created_at)],
      ['ลูกค้า', profile?.display_name || user?.email || '-'],
      ['อีเมล', user?.email ?? '-'],
      ['แผน', (inv.plan_code ?? '-').toUpperCase()],
      ['รอบบิล', `${fmtDate(inv.period_start)} – ${fmtDate(inv.period_end)}`],
      ['ช่องทางชำระเงิน', inv.provider ?? '-'],
      ['สถานะ', STATUS[inv.status]?.label ?? inv.status],
    ];
    const html = `<!doctype html><html lang="th"><head><meta charset="utf-8">
<title>ใบเสร็จ ${receiptNo(inv)}</title>
<style>
body{font-family:"Noto Sans Thai","Segoe UI",sans-serif;padding:40px;color:#101322;max-width:720px;margin:auto}
h1{font-size:22px;margin:0}
.brand{color:#7C5CFF;font-weight:800;letter-spacing:.08em;text-transform:uppercase;font-size:12px}
table{width:100%;border-collapse:collapse;margin-top:24px}
td{padding:10px 0;border-bottom:1px solid #E7E8F0;font-size:14px}
td:first-child{color:#6B6F86;width:42%}
.total{margin-top:24px;padding:16px 20px;background:#F4F2FF;border-radius:14px;display:flex;justify-content:space-between;font-weight:800;font-size:18px}
.foot{margin-top:28px;font-size:12px;color:#8A8FA3;line-height:1.7}
@media print{.no-print{display:none}}
button{margin-top:24px;padding:10px 18px;border:0;border-radius:999px;background:#7C5CFF;color:#fff;font-weight:700;cursor:pointer}
</style></head><body>
<p class="brand">PaperPetal AI</p>
<h1>ใบเสร็จรับเงิน / RECEIPT</h1>
<table>${rows.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>
<div class="total"><span>ยอดชำระทั้งสิ้น</span><span>฿${Number(inv.amount_thb).toLocaleString()}</span></div>
<p class="foot">เอกสารนี้ออกโดยระบบอัตโนมัติของ PaperPetal AI และใช้เป็นหลักฐานการชำระเงินได้<br/>หากต้องการใบกำกับภาษีแบบเต็มรูป กรุณาติดต่อฝ่ายสนับสนุน</p>
<button class="no-print" onclick="window.print()">บันทึกเป็น PDF / พิมพ์</button>
</body></html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${receiptNo(inv)}.html`;
    a.click();
    URL.revokeObjectURL(url);
    window.open(url, '_blank');
    toast.success('ดาวน์โหลดใบเสร็จแล้ว');
  };

  return (
    <AppShell title="ประวัติการชำระเงิน">
      <Seo title="ประวัติการชำระเงิน | PaperPetal AI" description="ดูรอบบิล สถานะการชำระเงิน และดาวน์โหลดใบเสร็จของบัญชี PaperPetal AI" path="/billing/history" noindex />
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link to="/billing" className="inline-flex min-h-11 items-center gap-1.5 text-xs font-ui font-bold text-muted-foreground">
              <ArrowLeft className="h-4 w-4" /> กลับหน้าบัญชี
            </Link>
            <h1 className="font-display text-2xl font-extrabold">ประวัติการชำระเงิน</h1>
            <p className="mt-1 text-xs font-ui text-muted-foreground">
              แผนปัจจุบัน: {account?.planName ?? 'Free Trial'} · ชำระสะสม ฿{totalPaid.toLocaleString()}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`min-h-11 rounded-full px-4 text-xs font-ui font-bold transition ${
                  filter === f.key ? 'bg-gradient-ai text-primary-foreground' : 'border border-border text-muted-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-40 items-center justify-center rounded-3xl border border-border bg-card">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : groups.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-8 text-center">
            <p className="font-display text-sm font-bold">ยังไม่มีรายการในหมวดนี้</p>
            <p className="mt-1 text-xs font-ui text-muted-foreground">เมื่อมีการชำระเงิน ใบเสร็จจะแสดงที่นี่ทันที</p>
            <Link to="/pricing" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-gradient-ai px-5 text-xs font-ui font-bold text-primary-foreground">
              ดูแผนและราคา
            </Link>
          </div>
        ) : (
          groups.map(([cycle, items]) => (
            <section key={cycle} className="rounded-3xl border border-border bg-card p-4 md:p-5">
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">รอบบิล {cycle}</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {items.map(inv => {
                  const st = STATUS[inv.status] ?? { label: inv.status, className: 'bg-muted text-muted-foreground', Icon: Clock };
                  return (
                    <li key={inv.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-elevated p-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-ui font-bold uppercase">{inv.plan_code ?? '—'}</span>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-ui font-bold ${st.className}`}>
                            <st.Icon className="h-3 w-3" /> {st.label}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-[11px] font-ui text-muted-foreground">
                          {receiptNo(inv)} · {fmtDate(inv.period_start)} – {fmtDate(inv.period_end)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <span className="text-sm font-ui font-extrabold tabular-nums">฿{Number(inv.amount_thb).toLocaleString()}</span>
                        <button
                          onClick={() => downloadReceipt(inv)}
                          disabled={inv.status !== 'paid'}
                          className="flex min-h-11 items-center gap-1.5 rounded-full border border-border px-4 text-xs font-ui font-bold disabled:opacity-40"
                        >
                          <Download className="h-3.5 w-3.5" /> ใบเสร็จ
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </div>
    </AppShell>
  );
};

export default BillingHistory;
