import { TemplateDefinition } from '@/templates/types';

const themes = [
  'from-[#14213D] via-[#2D7CFF] to-[#00CFFF]',
  'from-[#1E1B4B] via-[#7C3AED] to-[#FF4CC8]',
  'from-[#0F766E] via-[#2563EB] to-[#0F172A]',
  'from-[#111827] via-[#475569] to-[#7C3AED]',
  'from-[#581C87] via-[#EC4899] to-[#FACC15]',
];

export const TemplateVisual = ({ template, index = 0, compact = false }: { template: TemplateDefinition; index?: number; compact?: boolean }) => {
  const isSlide = template.contentType === 'presentation';
  const theme = themes[index % themes.length];

  return (
    <div className={`relative flex min-h-[220px] flex-col overflow-hidden rounded-xl bg-gradient-to-br ${theme} p-5 text-white`}>
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,.2),transparent_28%,rgba(255,255,255,.08)_50%,transparent_74%),linear-gradient(180deg,transparent,rgba(5,8,20,.72))]" />
      <div className="absolute inset-x-0 top-0 h-16 bg-white/10 [clip-path:polygon(0_0,100%_0,78%_100%,0_52%)]" />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <span className="rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[10px] font-ui font-bold uppercase tracking-[0.14em]">
          {isSlide ? 'SLIDE' : template.layoutDNA.pageSize ?? 'A4'}
        </span>
        <span className="text-[10px] font-ui font-bold uppercase tracking-[0.16em] text-white/75">KIVORA</span>
      </div>
      <div className="relative z-10 mt-auto pt-10">
        <p className="text-[10px] font-ui font-bold uppercase tracking-[0.16em] text-white/70">{template.contentType}</p>
        <h3 className={`${compact ? 'text-xl' : 'text-2xl'} thai-heading-safe mt-2 max-w-[14ch] font-display font-extrabold`}>
          {template.name}
        </h3>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {(isSlide ? ['Cover', 'Agenda', 'Chart'] : ['Cover', 'TOC', 'Page']).map(label => (
            <div key={label} className="min-h-10 rounded-lg border border-white/18 bg-white/12 px-2 py-1.5 text-[10px] font-ui text-white/78">
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const PageMiniature = ({ title, label, variant = 0 }: { title: string; label: string; variant?: number }) => (
  <div className={`min-h-[150px] rounded-xl border border-white/12 bg-gradient-to-br ${themes[variant % themes.length]} p-[1px] shadow-xl shadow-black/20`}>
    <div className="flex min-h-[150px] flex-col rounded-xl bg-[#10172B]/88 p-4">
      <span className="text-[10px] font-ui font-bold uppercase tracking-[0.14em] text-cyan-200">{label}</span>
      <h3 className="thai-heading-safe mt-3 font-display text-lg font-extrabold text-white">{title}</h3>
      <div className="mt-auto space-y-2">
        <span className="block h-2 w-full rounded bg-white/18" />
        <span className="block h-2 w-4/5 rounded bg-white/12" />
        <span className="block h-2 w-2/3 rounded bg-white/12" />
      </div>
    </div>
  </div>
);
