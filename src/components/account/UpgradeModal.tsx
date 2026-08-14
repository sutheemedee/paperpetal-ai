import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FALLBACK_PLANS, PLAN_HIGHLIGHTS, PlanCode } from '@/lib/plans';

export interface UpgradeReason {
  kind: 'quota' | 'daily_export' | 'feature' | 'rate_limited' | 'auth';
  title: string;
  detail: string;
  planCode?: PlanCode | string;
}

const NEXT_PLAN: Record<string, PlanCode> = {
  free: 'starter',
  starter: 'creator',
  creator: 'unlimited',
  unlimited: 'unlimited',
};

const UpgradeModal = ({ reason, onClose }: { reason: UpgradeReason | null; onClose: () => void }) => {
  const current = (reason?.planCode as string) ?? 'free';
  const target = NEXT_PLAN[current] ?? 'creator';
  const plan = FALLBACK_PLANS.find(p => p.code === target)!;

  return (
    <Dialog open={!!reason} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-md gap-4 border-border bg-card p-5">
        <DialogHeader className="text-left">
          <DialogTitle className="font-display text-lg leading-snug">{reason?.title}</DialogTitle>
        </DialogHeader>

        <div className="flex items-start gap-2 rounded-xl border border-border bg-elevated p-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          <p className="text-xs font-ui text-muted-foreground">{reason?.detail}</p>
        </div>

        {reason?.kind !== 'rate_limited' && (
          <div className="rounded-2xl border border-primary/40 bg-gradient-ai p-[1px]">
            <div className="rounded-2xl bg-card p-4">
              <div className="flex items-center gap-2 text-xs font-ui font-bold uppercase tracking-wide text-primary">
                <Sparkles className="h-4 w-4" /> อัปเกรดเป็น {plan.name}
              </div>
              <p className="mt-1 font-display text-xl font-bold">
                ฿{plan.price_thb.toLocaleString()} <span className="text-xs font-ui text-muted-foreground">/ เดือน</span>
              </p>
              <ul className="mt-2 space-y-1">
                {PLAN_HIGHLIGHTS[plan.code].slice(0, 5).map(h => (
                  <li key={h} className="text-xs font-ui text-muted-foreground">• {h}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {reason?.kind === 'auth' ? (
            <Link
              to="/auth/sign-up"
              onClick={onClose}
              className="flex min-h-11 items-center justify-center rounded-full bg-gradient-ai px-4 text-sm font-ui font-bold text-primary-foreground"
            >
              เริ่มใช้ฟรี
            </Link>
          ) : (
            <Link
              to="/pricing"
              onClick={onClose}
              className="flex min-h-11 items-center justify-center rounded-full bg-gradient-ai px-4 text-sm font-ui font-bold text-primary-foreground"
            >
              อัปเกรดเป็น {plan.name}
            </Link>
          )}
          <button
            onClick={onClose}
            className="flex min-h-11 items-center justify-center rounded-full border border-border px-4 text-sm font-ui font-semibold"
          >
            แก้ไขงานต่อ
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
