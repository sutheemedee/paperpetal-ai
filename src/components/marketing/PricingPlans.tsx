import { useState } from 'react';
import { Check, Loader2, Minus } from 'lucide-react';
import { FALLBACK_PLANS, PLAN_CTA, Plan, PlanCode } from '@/lib/plans';

const PLAN_FEATURES: Record<PlanCode, string[]> = {
  free: ['3 โปรเจกต์', '30 AI Pages', '10 AI Images', '10 สไลด์พรีเซนเทชัน', '3 แหล่งข้อมูล / โปรเจกต์', 'ส่งออกสำเร็จ 1 ครั้ง / วัน', 'AI Chat พื้นฐาน', 'พรีวิว PDF'],
  starter: ['10 โปรเจกต์', '300 AI Pages / เดือน', '100 AI Images', '100 สไลด์', '10 แหล่งข้อมูล / โปรเจกต์', 'ส่งออก 20 ครั้ง / เดือน', 'PDF · DOCX · EPUB', 'พรีเซนเทชันพื้นฐาน', 'ไม่มีลายน้ำ'],
  creator: ['30 โปรเจกต์', '1,000 AI Pages', '400 AI Images', '400 สไลด์', '30 แหล่งข้อมูล / โปรเจกต์', 'ส่งออก 100 ครั้ง', 'PDF · DOCX · EPUB', 'PPTX แก้ไขต่อได้', 'YouTube Knowledge', 'แหล่งข้อมูลขั้นสูง', 'ภาพสมจริงระดับสูง', 'Manga / Comic', 'Visual DNA', 'Character DNA', 'การอ้างอิงขั้นสูง', 'คิวสร้างงานลำดับต้น'],
  unlimited: ['โปรเจกต์ไม่จำกัด', 'AI Pages ไม่จำกัด', 'AI Images ไม่จำกัด', 'สไลด์ไม่จำกัด', 'แหล่งข้อมูลไม่จำกัด', 'ส่งออกไม่จำกัด', 'ทุกอย่างในแผน Creator', 'งานวิจัยขั้นสูง', 'คุณภาพการสร้างสูงสุด', 'หนังสือขนาดใหญ่', 'พรีเซนเทชันขนาดใหญ่', 'Manga ขั้นสูง', 'Priority Queue', 'Priority Support'],
};

interface CardsProps {
  plans?: Plan[];
  busy?: PlanCode | null;
  onChoose: (code: PlanCode) => void;
  currentPlan?: PlanCode | null;
}

export const PricingCards = ({ plans = FALLBACK_PLANS, busy, onChoose, currentPlan }: CardsProps) => (
  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
    {plans.map(plan => {
      const popular = plan.code === 'creator';
      return (
        <div key={plan.code} className={`rounded-3xl p-[1.5px] ${popular ? 'bg-gradient-ai' : 'bg-border'}`}>
          <div className="flex h-full flex-col rounded-3xl bg-card p-5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-base font-extrabold uppercase">{plan.name}</h3>
              {popular && (
                <span className="rounded-full bg-gradient-ai px-2.5 py-1 font-ui text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                  MOST POPULAR
                </span>
              )}
            </div>
            <p className="mt-3 font-display text-3xl font-extrabold">
              ฿{plan.price_thb.toLocaleString()}
              {plan.price_thb > 0 && <span className="font-ui text-xs font-bold text-muted-foreground"> / เดือน</span>}
            </p>
            {plan.code === 'unlimited' && (
              <p className="mt-1 font-ui text-[11px] text-muted-foreground">
                โปรเจกต์ แหล่งข้อมูล AI Pages ภาพ สไลด์ และการส่งออกไม่จำกัด
              </p>
            )}
            <ul className="mt-4 flex flex-1 flex-col gap-1.5">
              {PLAN_FEATURES[plan.code].map(f => (
                <li key={f} className="flex items-start gap-1.5 font-ui text-[11px] text-foreground/85">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => onChoose(plan.code)}
              disabled={busy === plan.code || currentPlan === plan.code}
              className={`mt-5 flex min-h-12 items-center justify-center gap-1.5 rounded-full font-ui text-sm font-bold disabled:opacity-60 ${
                popular || plan.code === 'unlimited'
                  ? 'bg-gradient-ai text-primary-foreground'
                  : 'border border-border text-foreground'
              }`}
            >
              {busy === plan.code && <Loader2 className="h-4 w-4 animate-spin" />}
              {currentPlan === plan.code ? 'แผนปัจจุบันของคุณ' : plan.code === 'unlimited' ? 'Go Unlimited' : PLAN_CTA[plan.code]}
            </button>
          </div>
        </div>
      );
    })}
  </div>
);

type Cell = string | boolean;
const ROWS: { label: string; values: Record<PlanCode, Cell> }[] = [
  { label: 'โปรเจกต์', values: { free: '3', starter: '10', creator: '30', unlimited: 'ไม่จำกัด' } },
  { label: 'AI Pages', values: { free: '30', starter: '300', creator: '1,000', unlimited: 'ไม่จำกัด' } },
  { label: 'AI Images', values: { free: '10', starter: '100', creator: '400', unlimited: 'ไม่จำกัด' } },
  { label: 'สไลด์', values: { free: '10', starter: '100', creator: '400', unlimited: 'ไม่จำกัด' } },
  { label: 'แหล่งข้อมูล / โปรเจกต์', values: { free: '3', starter: '10', creator: '30', unlimited: 'ไม่จำกัด' } },
  { label: 'AI Chat', values: { free: 'พื้นฐาน', starter: 'มาตรฐาน', creator: 'ขั้นสูง', unlimited: 'ขั้นสูง' } },
  { label: 'หนังสือ / eBook', values: { free: true, starter: true, creator: true, unlimited: true } },
  { label: 'พรีเซนเทชัน', values: { free: 'พรีวิว', starter: 'พื้นฐาน', creator: 'เต็มรูปแบบ', unlimited: 'เต็มรูปแบบ' } },
  { label: 'Manga / Comic', values: { free: false, starter: false, creator: true, unlimited: true } },
  { label: 'เขียนโดยอ้างอิงแหล่งข้อมูล', values: { free: 'พื้นฐาน', starter: true, creator: 'ขั้นสูง', unlimited: 'ขั้นสูง' } },
  { label: 'YouTube เป็นแหล่งข้อมูล', values: { free: false, starter: false, creator: true, unlimited: true } },
  { label: 'ส่งออก PDF', values: { free: 'พรีวิว', starter: true, creator: true, unlimited: true } },
  { label: 'ส่งออก DOCX', values: { free: false, starter: true, creator: true, unlimited: true } },
  { label: 'ส่งออก EPUB', values: { free: false, starter: true, creator: true, unlimited: true } },
  { label: 'ส่งออก PPTX แก้ไขได้', values: { free: false, starter: false, creator: true, unlimited: true } },
  { label: 'ภาพสมจริงระดับสูง', values: { free: false, starter: false, creator: true, unlimited: true } },
  { label: 'Visual DNA', values: { free: false, starter: false, creator: true, unlimited: true } },
  { label: 'Character DNA', values: { free: false, starter: false, creator: true, unlimited: true } },
  { label: 'จำนวนการส่งออก', values: { free: '1 / วัน', starter: '20 / เดือน', creator: '100 / เดือน', unlimited: 'ไม่จำกัด' } },
  { label: 'คิวลำดับต้น / การสนับสนุน', values: { free: false, starter: false, creator: 'Priority', unlimited: 'Priority + Support' } },
];

const CODES: PlanCode[] = ['free', 'starter', 'creator', 'unlimited'];
const NAMES: Record<PlanCode, string> = { free: 'Free Trial', starter: 'Starter ฿399', creator: 'Creator ฿799', unlimited: 'Unlimited ฿1,490' };

const cell = (v: Cell) =>
  v === true ? <Check className="mx-auto h-4 w-4 text-success" /> : v === false ? <Minus className="mx-auto h-4 w-4 text-muted-foreground/60" /> : <span>{v}</span>;

/** Responsive plan comparison: table on desktop, plan selector + list on mobile. */
export const PlanComparison = () => {
  const [selected, setSelected] = useState<PlanCode>('creator');

  return (
    <div>
      <h2 className="font-display text-xl font-extrabold md:text-3xl">เปรียบเทียบแพ็กเกจ</h2>

      {/* Mobile: selector + feature list */}
      <div className="mt-4 lg:hidden">
        <div className="grid grid-cols-2 gap-2">
          {CODES.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setSelected(c)}
              className={`min-h-11 rounded-full px-3 font-ui text-xs font-bold ${
                selected === c ? 'bg-gradient-ai text-primary-foreground' : 'border border-border text-muted-foreground'
              }`}
            >
              {NAMES[c]}
            </button>
          ))}
        </div>
        <ul className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {ROWS.map(r => (
            <li key={r.label} className="flex items-center justify-between gap-3 px-3 py-2.5">
              <span className="font-ui text-xs text-muted-foreground">{r.label}</span>
              <span className="text-right font-ui text-xs font-bold">{cell(r.values[selected])}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Desktop: full table */}
      <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-border lg:block">
        <table className="w-full border-collapse">
          <thead className="bg-secondary/60">
            <tr>
              <th className="px-4 py-3 text-left font-ui text-[11px] font-bold uppercase tracking-wider text-muted-foreground">คุณสมบัติ</th>
              {CODES.map(c => (
                <th key={c} className="px-4 py-3 text-center font-display text-xs font-bold">{NAMES[c]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map(r => (
              <tr key={r.label} className="border-t border-border">
                <td className="px-4 py-2.5 font-ui text-xs text-muted-foreground">{r.label}</td>
                {CODES.map(c => (
                  <td key={c} className="px-4 py-2.5 text-center font-ui text-xs font-bold">{cell(r.values[c])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { PLAN_FEATURES };
