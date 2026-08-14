import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, LogOut, ShieldCheck } from 'lucide-react';
import AppShell from '@/components/AppShell';
import UsageBar from '@/components/account/UsageBar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/auth/AuthProvider';

interface Invoice {
  id: string;
  plan_code: string;
  amount_thb: number;
  status: string;
  created_at: string;
  provider: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'รอชำระเงิน',
  paid: 'ชำระแล้ว',
  failed: 'ไม่สำเร็จ',
  refunded: 'คืนเงินแล้ว',
};

const Billing = () => {
  const { account, profile, user, refresh, signOut } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState(profile?.display_name ?? '');

  useEffect(() => setName(profile?.display_name ?? ''), [profile?.display_name]);

  const load = () => {
    supabase.functions.invoke('billing', { body: { action: 'state' } }).then(({ data }) => {
      if (data?.invoices) setInvoices(data.invoices);
    });
  };
  useEffect(load, []);

  const act = async (action: 'cancel' | 'resume') => {
    setBusy(true);
    const { error } = await supabase.functions.invoke('billing', { body: { action } });
    setBusy(false);
    if (error) {
      toast.error('ดำเนินการไม่สำเร็จ');
      return;
    }
    await refresh();
    toast.success(action === 'cancel' ? 'ยกเลิกเมื่อสิ้นรอบบิลแล้ว' : 'ต่ออายุแผนต่อเรียบร้อย');
  };

  const saveProfile = async () => {
    if (!user) return;
    setBusy(true);
    await supabase.from('profiles').update({ display_name: name.trim() }).eq('id', user.id);
    setBusy(false);
    await refresh();
    toast.success('บันทึกโปรไฟล์แล้ว');
  };

  return (
    <AppShell title="บัญชี & การชำระเงิน">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4 md:p-6">
        <section className="rounded-3xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-ui font-bold uppercase tracking-[0.14em] text-muted-foreground">แผนปัจจุบัน</p>
              <h1 className="mt-1 font-display text-2xl font-extrabold">{account?.planName ?? 'Free Trial'}</h1>
              <p className="mt-1 text-xs font-ui text-muted-foreground">
                สถานะ: {account?.status} · รอบบิลถึง{' '}
                {account ? new Date(account.periodEnd).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                {account?.cancelAtPeriodEnd ? ' · จะยกเลิกเมื่อสิ้นรอบ' : ''}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/pricing" className="flex min-h-11 items-center rounded-full bg-gradient-ai px-4 text-xs font-ui font-bold text-primary-foreground">
                เปลี่ยน / อัปเกรดแผน
              </Link>
              {account?.planCode !== 'free' && (
                <button
                  disabled={busy}
                  onClick={() => act(account?.cancelAtPeriodEnd ? 'resume' : 'cancel')}
                  className="flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-xs font-ui font-bold disabled:opacity-60"
                >
                  {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {account?.cancelAtPeriodEnd ? 'ใช้แผนต่อ' : 'ยกเลิกเมื่อสิ้นรอบบิล'}
                </button>
              )}
            </div>
          </div>
          <p className="mt-3 flex items-start gap-1.5 rounded-xl border border-border bg-elevated p-3 text-[11px] font-ui text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            การลดแผนหรือยกเลิกไม่ลบงานของคุณ — โปรเจกต์ทั้งหมดยังเปิด แก้ไข และส่งออกได้ตามสิทธิ์ของแผนใหม่
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-5">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">การใช้งานรอบนี้</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <UsageBar metric="aiPages" />
            <UsageBar metric="aiImages" />
            <UsageBar metric="slides" />
            <UsageBar metric="exports" />
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-5">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">ประวัติการชำระเงิน</h2>
          {invoices.length === 0 ? (
            <p className="mt-3 text-xs font-ui text-muted-foreground">ยังไม่มีใบแจ้งหนี้</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {invoices.map(inv => (
                <li key={inv.id} className="flex min-h-12 flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-elevated px-3 py-2">
                  <span className="text-xs font-ui font-bold uppercase">{inv.plan_code}</span>
                  <span className="text-xs font-ui text-muted-foreground">
                    {new Date(inv.created_at).toLocaleDateString('th-TH')}
                  </span>
                  <span className="text-xs font-ui font-bold tabular-nums">฿{inv.amount_thb.toLocaleString()}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-ui font-bold ${
                      inv.status === 'paid' ? 'bg-success/15 text-success' : 'bg-highlight/15 text-highlight'
                    }`}
                  >
                    {STATUS_LABEL[inv.status] ?? inv.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-3xl border border-border bg-card p-5">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">โปรไฟล์</h2>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="flex flex-1 flex-col gap-1.5">
              <span className="text-xs font-ui font-semibold text-muted-foreground">ชื่อที่ใช้แสดง</span>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={60}
                className="min-h-12 rounded-xl border border-border bg-elevated px-3 text-sm outline-none focus:border-primary"
              />
            </label>
            <button onClick={saveProfile} disabled={busy} className="flex min-h-12 items-center justify-center rounded-full border border-border px-5 text-xs font-ui font-bold disabled:opacity-60">
              บันทึก
            </button>
          </div>
          <p className="mt-2 text-[11px] font-ui text-muted-foreground">อีเมล: {user?.email}</p>
          <button onClick={signOut} className="mt-4 flex min-h-11 items-center gap-2 rounded-full border border-destructive/40 px-4 text-xs font-ui font-bold text-destructive">
            <LogOut className="h-4 w-4" /> ออกจากระบบ
          </button>
        </section>
      </div>
    </AppShell>
  );
};

export default Billing;
