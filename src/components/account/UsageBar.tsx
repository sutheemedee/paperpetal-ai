import { UsageMetric } from '@/lib/plans';
import { useEntitlements } from '@/auth/useEntitlements';

const TONE: Record<string, string> = {
  ok: 'bg-info',
  warn: 'bg-highlight',
  critical: 'bg-magenta',
  limit: 'bg-destructive',
};

export const UsageBar = ({ metric, compact }: { metric: UsageMetric; compact?: boolean }) => {
  const { usage } = useEntitlements();
  const { used, limit, ratio, tone, label, unlimited } = usage(metric);

  if (unlimited) {
    return (
      <div>
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[11px] font-ui font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
          <span className="text-xs font-ui font-bold tabular-nums">
            {used.toLocaleString()} <span className="text-muted-foreground">/ ∞</span>
          </span>
        </div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-elevated">
          <div className="h-full w-full rounded-full bg-gradient-ai" />
        </div>
        {!compact && <p className="mt-1 text-[11px] font-ui text-muted-foreground">สิทธิ์ Admin — ใช้งานได้ไม่จำกัด (∞)</p>}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] font-ui font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className="text-xs font-ui font-bold tabular-nums">
          {used.toLocaleString()} <span className="text-muted-foreground">/ {limit === null ? 'Fair Use' : limit.toLocaleString()}</span>
        </span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-elevated">
        <div className={`h-full rounded-full transition-all ${TONE[tone]}`} style={{ width: `${Math.round(ratio * 100)}%` }} />
      </div>
      {!compact && tone === 'warn' && (
        <p className="mt-1 text-[11px] font-ui text-highlight">ใช้ไปแล้ว {Math.round(ratio * 100)}% ของสิทธิ์เดือนนี้</p>
      )}
      {!compact && tone === 'critical' && (
        <p className="mt-1 text-[11px] font-ui text-magenta">เหลือสิทธิ์ไม่มาก — พิจารณาอัปเกรดแผน</p>
      )}
      {!compact && tone === 'limit' && (
        <p className="mt-1 text-[11px] font-ui text-destructive">ครบสิทธิ์แล้ว — โปรเจกต์ยังแก้ไขได้ปกติ</p>
      )}
    </div>
  );
};

export default UsageBar;
