import { METRIC_LABEL, UsageMetric, usageRatio } from '@/lib/plans';

export type QuotaLevel = 'warn' | 'critical' | 'limit';

export const QUOTA_LEVELS: { level: QuotaLevel; at: number }[] = [
  { level: 'limit', at: 1 },
  { level: 'critical', at: 0.9 },
  { level: 'warn', at: 0.75 },
];

export const levelFor = (ratio: number): QuotaLevel | null =>
  QUOTA_LEVELS.find(l => ratio >= l.at)?.level ?? null;

export interface QuotaAlert {
  metric: UsageMetric;
  label: string;
  level: QuotaLevel;
  used: number;
  limit: number;
  ratio: number;
  percent: number;
  remaining: number;
}

const WATCHED: UsageMetric[] = ['aiPages', 'aiImages', 'slides', 'sourceProcessing', 'exports', 'research'];

interface AccountLike {
  counters?: Partial<Record<UsageMetric, number>> | null;
  bonus?: Partial<Record<UsageMetric, number>> | null;
  entitlements?: Record<string, unknown> | null;
}

/** All metrics that reached a notification threshold, worst first. */
export const collectQuotaAlerts = (account: AccountLike | null | undefined): QuotaAlert[] => {
  if (!account) return [];
  const out: QuotaAlert[] = [];
  for (const metric of WATCHED) {
    const base = (account.entitlements as Record<string, unknown> | null)?.[metric];
    if (base === null || base === undefined) continue;
    const limit = Number(base) + (account.bonus?.[metric] ?? 0);
    if (!Number.isFinite(limit) || limit <= 0) continue;
    const used = account.counters?.[metric] ?? 0;
    const ratio = usageRatio(used, limit);
    const level = levelFor(ratio);
    if (!level) continue;
    out.push({
      metric,
      label: METRIC_LABEL[metric],
      level,
      used,
      limit,
      ratio,
      percent: Math.round(ratio * 100),
      remaining: Math.max(0, limit - used),
    });
  }
  const rank: Record<QuotaLevel, number> = { limit: 0, critical: 1, warn: 2 };
  return out.sort((a, b) => rank[a.level] - rank[b.level] || b.ratio - a.ratio);
};

export const alertMessage = (a: QuotaAlert) => {
  if (a.level === 'limit') return `${a.label} ครบโควต้าเดือนนี้แล้ว (${a.used.toLocaleString()}/${a.limit.toLocaleString()})`;
  if (a.level === 'critical') return `${a.label} เหลืออีกเพียง ${a.remaining.toLocaleString()} จาก ${a.limit.toLocaleString()} (${a.percent}%)`;
  return `${a.label} ใช้ไปแล้ว ${a.percent}% ของโควต้าเดือนนี้`;
};

export const alertTitle = (a: QuotaAlert) => {
  if (a.level === 'limit') return 'โควต้าหมดแล้ว';
  if (a.level === 'critical') return 'โควต้าใกล้หมด';
  return 'โควต้าเดือนนี้ใช้ไปมากแล้ว';
};

/** One notification per user · billing period · metric · level. */
const seenKey = (uid: string, periodStart: string) => `pp:quota-notified:${uid}:${periodStart}`;

const readSeen = (uid: string, periodStart: string): Record<string, number> => {
  try {
    return JSON.parse(localStorage.getItem(seenKey(uid, periodStart)) || '{}');
  } catch {
    return {};
  }
};

export const isNewAlert = (uid: string, periodStart: string, a: QuotaAlert) =>
  !readSeen(uid, periodStart)[`${a.metric}:${a.level}`];

export const markAlertSeen = (uid: string, periodStart: string, a: QuotaAlert) => {
  try {
    const seen = readSeen(uid, periodStart);
    seen[`${a.metric}:${a.level}`] = Date.now();
    localStorage.setItem(seenKey(uid, periodStart), JSON.stringify(seen));
  } catch {
    /* storage unavailable — notify again next time */
  }
};

const DISMISS_KEY = 'pp:quota-banner-dismissed';

export const isBannerDismissed = (uid: string, periodStart: string, signature: string) => {
  try {
    return localStorage.getItem(`${DISMISS_KEY}:${uid}:${periodStart}`) === signature;
  } catch {
    return false;
  }
};

export const dismissBanner = (uid: string, periodStart: string, signature: string) => {
  try {
    localStorage.setItem(`${DISMISS_KEY}:${uid}:${periodStart}`, signature);
  } catch {
    /* ignore */
  }
};
