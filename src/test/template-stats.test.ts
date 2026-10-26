import { describe, expect, it } from 'vitest';
import { bucketByDay } from '@/components/admin/TemplateStats';

describe('template stats by period', () => {
  const now = new Date('2026-10-26T10:00:00');

  it('returns one bucket per day in the chosen period, including empty days', () => {
    expect(bucketByDay([], 7, now)).toHaveLength(7);
    expect(bucketByDay([], 30, now)).toHaveLength(30);
  });

  it('counts previews and uses on the day they happened', () => {
    const series = bucketByDay(
      [
        { template_id: 'a', event: 'template_preview', created_at: '2026-10-26T08:00:00' },
        { template_id: 'a', event: 'template_preview', created_at: '2026-10-26T09:00:00' },
        { template_id: 'a', event: 'template_use', created_at: '2026-10-25T09:00:00' },
      ],
      7,
      now,
    );
    const today = series[series.length - 1];
    const yesterday = series[series.length - 2];
    expect(today.preview).toBe(2);
    expect(today.use).toBe(0);
    expect(yesterday.use).toBe(1);
  });

  it('ignores events older than the chosen period', () => {
    const series = bucketByDay([{ template_id: 'a', event: 'template_use', created_at: '2026-09-01T09:00:00' }], 7, now);
    expect(series.reduce((s, d) => s + d.use, 0)).toBe(0);
  });
});
