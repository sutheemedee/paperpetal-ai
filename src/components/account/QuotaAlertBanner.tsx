import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, X, Zap } from 'lucide-react';
import { useAuth } from '@/auth/AuthProvider';
import {
  QuotaAlert,
  alertMessage,
  alertTitle,
  collectQuotaAlerts,
  dismissBanner,
  isBannerDismissed,
} from '@/lib/quotaAlerts';

const TONE: Record<QuotaAlert['level'], string> = {
  warn: 'border-highlight/40 bg-highlight/10 text-highlight',
  critical: 'border-magenta/40 bg-magenta/10 text-magenta',
  limit: 'border-destructive/40 bg-destructive/10 text-destructive',
};

/** Persistent in-app quota warning with a one-tap upgrade path. */
const QuotaAlertBanner = ({ compact }: { compact?: boolean }) => {
  const { account, user } = useAuth();
  const alerts = useMemo(() => collectQuotaAlerts(account), [account]);
  const top = alerts[0];
  const signature = alerts.map(a => `${a.metric}:${a.level}`).join(',');
  const uid = user?.id ?? '';
  const period = account?.periodStart ?? '';
  const [hidden, setHidden] = useState(() => (uid ? isBannerDismissed(uid, period, signature) : false));

  if (!top || !uid || hidden) return null;

  const others = alerts.slice(1);

  return (
    <div className={`flex flex-col gap-2 rounded-2xl border p-3 ${TONE[top.level]} ${compact ? '' : 'md:flex-row md:items-center md:gap-3'}`}>
      <div className="flex min-w-0 flex-1 items-start gap-2">
        {top.level === 'limit' ? (
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        ) : (
          <Zap className="mt-0.5 h-4 w-4 shrink-0" />
        )}
        <div className="min-w-0">
          <p className="font-display text-xs font-bold">{alertTitle(top)}</p>
          <p className="mt-0.5 text-[11px] font-ui text-foreground/80">{alertMessage(top)}</p>
          {others.length > 0 && (
            <p className="mt-0.5 text-[11px] font-ui text-muted-foreground">
              และอีก {others.length} รายการ: {others.map(o => `${o.label} ${o.percent}%`).join(' · ')}
            </p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Link
          to="/pricing"
          className="flex min-h-11 items-center gap-1.5 rounded-full bg-gradient-ai px-4 text-xs font-ui font-bold text-primary-foreground"
        >
          อัปเกรดแผน <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <button
          type="button"
          aria-label="ปิดการแจ้งเตือน"
          onClick={() => {
            dismissBanner(uid, period, signature);
            setHidden(true);
          }}
          className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground hover:bg-elevated"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default QuotaAlertBanner;
