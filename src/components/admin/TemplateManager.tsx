import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Search, Star, Eye, EyeOff } from 'lucide-react';
import { TEMPLATES } from '@/templates/catalog';
import { readOverrides, saveOverride, readTemplateAnalytics } from '@/templates/store';
import { CATEGORY_LABEL, PLAN_ORDER, PlanCodeName, TemplateDefinition } from '@/templates/types';

/** จัดการเทมเพลตในหลังบ้าน: เปิด/ปิดการแสดง, แผนขั้นต่ำ, ป้ายแนะนำ, และสถิติการใช้ */
const TemplateManager = () => {
  const [tick, setTick] = useState(0);
  const [q, setQ] = useState('');
  const [onlyHidden, setOnlyHidden] = useState(false);

  const overrides = useMemo(() => readOverrides(), [tick]);
  const analytics = useMemo(() => readTemplateAnalytics(), [tick]);

  const rows = useMemo<TemplateDefinition[]>(() => {
    const needle = q.trim().toLowerCase();
    return TEMPLATES.map(t => ({ ...t, ...(overrides[t.id] ?? {}) }))
      .filter(t => (onlyHidden ? t.published === false : true))
      .filter(t =>
        needle
          ? `${t.name} ${t.description} ${t.tags.join(' ')} ${CATEGORY_LABEL[t.category]}`.toLowerCase().includes(needle)
          : true,
      )
      .slice(0, 120);
  }, [overrides, q, onlyHidden, tick]);

  const patch = (id: string, value: Parameters<typeof saveOverride>[1], message: string) => {
    saveOverride(id, value);
    setTick(v => v + 1);
    toast.success(message);
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">จัดการเทมเพลต</h2>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex min-h-11 items-center gap-2 rounded-xl border border-border bg-elevated px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="ค้นหาเทมเพลต"
              className="w-40 bg-transparent text-xs font-ui outline-none"
            />
          </label>
          <button
            type="button"
            onClick={() => setOnlyHidden(v => !v)}
            className={`min-h-11 rounded-full px-3 text-xs font-ui font-bold ${
              onlyHidden ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground'
            }`}
          >
            เฉพาะที่ซ่อน
          </button>
        </div>
      </div>

      <p className="mt-2 text-[11px] font-ui text-muted-foreground">
        แสดง {rows.length} รายการ จากทั้งหมด {TEMPLATES.length} เทมเพลต
      </p>

      <ul className="mt-3 flex flex-col gap-2">
        {rows.map(t => {
          const stat = analytics[t.id] ?? {};
          return (
            <li key={t.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-elevated p-3">
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-ui font-bold">
                  {t.name}
                  {t.featured && <Star className="ml-1 inline h-3 w-3 text-accent" />}
                </div>
                <div className="truncate text-[11px] font-ui text-muted-foreground">
                  {CATEGORY_LABEL[t.category]} · เปิดดู {stat.template_preview ?? 0} · ใช้งาน {stat.template_use ?? 0} ครั้ง
                </div>
              </div>

              <select
                value={t.minimumPlan}
                onChange={e => patch(t.id, { minimumPlan: e.target.value as PlanCodeName, isPremium: e.target.value !== 'free' }, 'อัปเดตแผนขั้นต่ำแล้ว')}
                className="min-h-11 rounded-xl border border-border bg-card px-2 text-xs font-ui"
              >
                {PLAN_ORDER.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => patch(t.id, { featured: !t.featured }, t.featured ? 'ยกเลิกแนะนำแล้ว' : 'ตั้งเป็นแนะนำแล้ว')}
                className={`min-h-11 rounded-full px-3 text-xs font-ui font-bold ${
                  t.featured ? 'border border-accent/60 text-accent' : 'border border-border text-muted-foreground'
                }`}
              >
                แนะนำ
              </button>

              <button
                type="button"
                onClick={() => patch(t.id, { published: t.published === false }, t.published === false ? 'เปิดแสดงแล้ว' : 'ซ่อนแล้ว')}
                className={`press flex min-h-11 items-center gap-1 rounded-full px-3 text-xs font-ui font-bold ${
                  t.published === false ? 'border border-success/50 text-success' : 'border border-destructive/50 text-destructive'
                }`}
              >
                {t.published === false ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                {t.published === false ? 'เปิดแสดง' : 'ซ่อน'}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default TemplateManager;
