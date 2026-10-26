import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Eye, MousePointerClick, CheckCircle2, TrendingUp } from 'lucide-react';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { TEMPLATES } from '@/templates/catalog';

export interface TemplateEventRow {
  template_id: string;
  event: string;
  created_at: string;
}

export const RANGE_OPTIONS = [
  { days: 7, label: '7 วัน' },
  { days: 30, label: '30 วัน' },
  { days: 90, label: '90 วัน' },
] as const;

const chartConfig = {
  preview: { label: 'เปิดดู', color: 'hsl(var(--primary))' },
  use: { label: 'ใช้งาน', color: 'hsl(var(--magenta))' },
  completion: { label: 'สร้างสำเร็จ', color: 'hsl(var(--warning))' },
} satisfies ChartConfig;

const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** รวมเหตุการณ์เป็นรายวัน (ครบทุกวันในช่วง แม้วันที่ไม่มีข้อมูล) */
export const bucketByDay = (events: TemplateEventRow[], days: number, now = new Date()) => {
  const buckets = new Map<string, { date: string; label: string; preview: number; use: number; completion: number }>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    buckets.set(dayKey(d), {
      date: dayKey(d),
      label: d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
      preview: 0,
      use: 0,
      completion: 0,
    });
  }
  for (const e of events) {
    const b = buckets.get(dayKey(new Date(e.created_at)));
    if (!b) continue;
    if (e.event === 'template_preview' || e.event === 'template_view') b.preview += 1;
    else if (e.event === 'template_use') b.use += 1;
    else if (e.event === 'template_completion') b.completion += 1;
  }
  return [...buckets.values()];
};

const nameOf = (id: string) => TEMPLATES.find(t => t.id === id)?.name ?? (id.startsWith('user-') ? 'เทมเพลตของผู้ใช้' : id);

interface Props {
  events: TemplateEventRow[];
  days: number;
  onDaysChange: (days: number) => void;
  loading: boolean;
  error: string;
}

const TemplateStats = ({ events, days, onDaysChange, loading, error }: Props) => {
  const series = useMemo(() => bucketByDay(events, days), [events, days]);
  const totals = useMemo(
    () => series.reduce((acc, d) => ({ preview: acc.preview + d.preview, use: acc.use + d.use, completion: acc.completion + d.completion }), { preview: 0, use: 0, completion: 0 }),
    [series],
  );
  const conversion = totals.preview ? Math.round((totals.use / totals.preview) * 100) : 0;

  const top = useMemo(() => {
    const map = new Map<string, { preview: number; use: number }>();
    for (const e of events) {
      const row = map.get(e.template_id) ?? { preview: 0, use: 0 };
      if (e.event === 'template_preview' || e.event === 'template_view') row.preview += 1;
      if (e.event === 'template_use') row.use += 1;
      map.set(e.template_id, row);
    }
    return [...map.entries()]
      .map(([id, v]) => ({ id, name: nameOf(id), ...v }))
      .sort((a, b) => b.use - a.use || b.preview - a.preview)
      .slice(0, 5);
  }, [events]);

  const cards = [
    { label: 'เปิดดู', value: totals.preview, icon: Eye, tone: 'text-primary' },
    { label: 'ใช้งาน', value: totals.use, icon: MousePointerClick, tone: 'text-magenta' },
    { label: 'สร้างสำเร็จ', value: totals.completion, icon: CheckCircle2, tone: 'text-warning' },
    { label: 'อัตราเปิดดู → ใช้งาน', value: `${conversion}%`, icon: TrendingUp, tone: 'text-success' },
  ];

  return (
    <div className="rounded-2xl border border-border bg-elevated p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-sm font-bold">สถิติการใช้เทมเพลตตามช่วงเวลา</h3>
        <div className="flex gap-1 rounded-full border border-border p-1" role="tablist" aria-label="ช่วงเวลา">
          {RANGE_OPTIONS.map(r => (
            <button
              key={r.days}
              type="button"
              role="tab"
              aria-selected={days === r.days}
              onClick={() => onDaysChange(r.days)}
              className={`min-h-9 rounded-full px-3 text-xs font-ui font-bold ${
                days === r.days ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
        {cards.map(c => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-ui text-muted-foreground">
              <c.icon className={`h-3.5 w-3.5 ${c.tone}`} />
              {c.label}
            </div>
            <div className="mt-1 font-display text-xl font-bold">{loading ? '…' : c.value.toLocaleString('th-TH')}</div>
          </div>
        ))}
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-destructive/40 p-3 text-xs font-ui text-destructive">{error}</p>
      ) : (
        <ChartContainer config={chartConfig} className="mt-4 aspect-auto h-56 w-full">
          <AreaChart data={series} margin={{ left: -16, right: 8, top: 8 }}>
            <defs>
              {(['preview', 'use', 'completion'] as const).map(k => (
                <linearGradient key={k} id={`fill-${k}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={`var(--color-${k})`} stopOpacity={0.45} />
                  <stop offset="95%" stopColor={`var(--color-${k})`} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={40} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area type="monotone" dataKey="preview" stroke="var(--color-preview)" fill="url(#fill-preview)" strokeWidth={2} />
            <Area type="monotone" dataKey="use" stroke="var(--color-use)" fill="url(#fill-use)" strokeWidth={2} />
            <Area type="monotone" dataKey="completion" stroke="var(--color-completion)" fill="url(#fill-completion)" strokeWidth={2} />
          </AreaChart>
        </ChartContainer>
      )}

      <div className="mt-4">
        <h4 className="text-xs font-ui font-bold text-muted-foreground">เทมเพลตยอดนิยมในช่วงนี้</h4>
        {top.length === 0 ? (
          <p className="mt-2 text-xs font-ui text-muted-foreground">{loading ? 'กำลังโหลด…' : 'ยังไม่มีการเปิดดูหรือใช้งานในช่วงเวลานี้'}</p>
        ) : (
          <ol className="mt-2 flex flex-col gap-1.5">
            {top.map((t, i) => {
              const max = Math.max(1, top[0].use || top[0].preview);
              const width = Math.max(4, Math.round(((t.use || t.preview) / max) * 100));
              return (
                <li key={t.id} className="rounded-lg bg-card px-3 py-2">
                  <div className="flex items-center justify-between gap-2 text-xs font-ui">
                    <span className="truncate font-bold">{i + 1}. {t.name}</span>
                    <span className="shrink-0 text-muted-foreground">ดู {t.preview} · ใช้ {t.use}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-muted">
                    <div className="h-1.5 rounded-full bg-gradient-ai" style={{ width: `${width}%` }} />
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
};

export default TemplateStats;
