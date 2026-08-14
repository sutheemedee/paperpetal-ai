/**
 * E2E: quota alert thresholds (75% / 90% / 100%) and reset after upgrade.
 */
import { describe, it, expect } from 'vitest';
import { collectQuotaAlerts, levelFor } from '@/lib/quotaAlerts';
import { makeAccount } from './harness';

describe('quota alert levels', () => {
  it('maps ratios to levels', () => {
    expect(levelFor(0.5)).toBeNull();
    expect(levelFor(0.75)).toBe('warn');
    expect(levelFor(0.9)).toBe('critical');
    expect(levelFor(1)).toBe('limit');
  });

  it('reports the worst metric first', () => {
    const account = makeAccount('free', { aiPages: 23, aiImages: 10 }); // 76% and 100%
    const alerts = collectQuotaAlerts(account);
    expect(alerts[0].metric).toBe('aiImages');
    expect(alerts[0].level).toBe('limit');
    expect(alerts.find(a => a.metric === 'aiPages')?.level).toBe('warn');
  });

  it('clears alerts after upgrading to a bigger plan with the same usage', () => {
    const used = { aiPages: 29, aiImages: 10 };
    expect(collectQuotaAlerts(makeAccount('free', used)).length).toBeGreaterThan(0);
    expect(collectQuotaAlerts(makeAccount('creator', used))).toHaveLength(0);
  });

  it('counts bonus credits toward the limit', () => {
    const account = makeAccount('free', { aiImages: 10 });
    expect(collectQuotaAlerts(account)[0].level).toBe('limit');
    const withBonus = { ...account, bonus: { aiImages: 20 } };
    expect(collectQuotaAlerts(withBonus)).toHaveLength(0);
  });
});
