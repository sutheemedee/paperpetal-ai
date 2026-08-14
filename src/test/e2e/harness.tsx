import { vi } from 'vitest';
import type { AccountState } from '@/auth/AuthProvider';
import { FALLBACK_PLANS, PlanCode, UsageMetric } from '@/lib/plans';

export const planOf = (code: PlanCode) => FALLBACK_PLANS.find(p => p.code === code)!;

/** Build an account snapshot for a given plan + usage — mirrors the server `state` payload. */
export const makeAccount = (
  code: PlanCode,
  counters: Partial<Record<UsageMetric, number>> = {},
  extra: Partial<AccountState> = {},
): AccountState => {
  const plan = planOf(code);
  const start = new Date('2026-08-01T00:00:00.000Z');
  const end = new Date('2026-09-01T00:00:00.000Z');
  return {
    planCode: plan.code,
    planName: plan.name,
    status: code === 'free' ? 'trialing' : 'active',
    entitlements: plan.entitlements,
    periodStart: start.toISOString(),
    periodEnd: end.toISOString(),
    cancelAtPeriodEnd: false,
    counters,
    bonus: {},
    exportsToday: 0,
    projectCount: 0,
    ...extra,
  };
};

export interface FakeUser {
  id: string;
  email: string;
}

/**
 * Server stand-in for the `entitlements` edge function.
 * Usage counters live per user id, so a call made as user A can never read or
 * mutate user B's ledger — the same isolation guarantee RLS gives us in the DB.
 */
export class FakeEntitlementsServer {
  accounts = new Map<string, AccountState>();
  calls: { userId: string | null; body: any }[] = [];

  setAccount(userId: string, account: AccountState) {
    this.accounts.set(userId, account);
  }

  upgrade(userId: string, code: PlanCode) {
    const current = this.accounts.get(userId);
    this.accounts.set(userId, makeAccount(code, current?.counters ?? {}));
  }

  async invoke(userId: string | null, body: any) {
    this.calls.push({ userId, body });
    if (!userId) return { data: null, error: { message: 'Unauthorized' } };
    const account = this.accounts.get(userId)!;
    const metric: UsageMetric = body.metric;

    if (body.action === 'state') return { data: { account }, error: null };
    if (body.action === 'track') return { data: { ok: true }, error: null };

    const base = (account.entitlements as any)[metric];
    const limit = base === null || base === undefined ? null : Number(base);
    const used = account.counters[metric] ?? 0;
    const qty = body.quantity ?? 1;

    if (metric === 'exports' && account.entitlements.exportsPerDay !== null) {
      if (account.exportsToday >= (account.entitlements.exportsPerDay as number)) {
        return {
          data: {
            allowed: false,
            reason: 'daily_export_limit',
            exportsToday: account.exportsToday,
            perDay: account.entitlements.exportsPerDay,
            planCode: account.planCode,
            account,
          },
          error: null,
        };
      }
    }

    if (limit !== null && used + qty > limit) {
      return { data: { allowed: false, reason: 'quota', used, limit, planCode: account.planCode, account }, error: null };
    }

    if (body.action === 'consume') {
      const next: AccountState = {
        ...account,
        counters: { ...account.counters, [metric]: used + qty },
        exportsToday: metric === 'exports' ? account.exportsToday + qty : account.exportsToday,
      };
      this.accounts.set(userId, next);
      return { data: { allowed: true, account: next }, error: null };
    }
    return { data: { allowed: true, account }, error: null };
  }
}

/** Rows keyed by owner — the fake enforces the `user_id = auth.uid()` policy. */
export class FakeRlsTable<T extends { id: string; user_id: string }> {
  rows: T[] = [];
  insert(row: T) {
    this.rows.push(row);
  }
  /** Reads as `uid`; anonymous callers (uid = null) get nothing. */
  selectAs(uid: string | null) {
    if (!uid) return [] as T[];
    return this.rows.filter(r => r.user_id === uid);
  }
  deleteAs(uid: string | null, id: string) {
    const before = this.rows.length;
    this.rows = this.rows.filter(r => !(r.id === id && r.user_id === uid));
    return before - this.rows.length;
  }
}

export const flush = () => new Promise(r => setTimeout(r, 0));

export const mockToast = () => {
  vi.mock('sonner', () => ({
    toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn(), message: vi.fn() },
    Toaster: () => null,
  }));
};
