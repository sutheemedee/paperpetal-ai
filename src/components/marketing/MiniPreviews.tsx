import { TemplateDefinition } from '@/templates/types';

const palette = [
  'from-[#14213D] via-[#2D7CFF] to-[#00CFFF]',
  'from-[#1E1B4B] via-[#7C3AED] to-[#FF4CC8]',
  'from-[#0F766E] via-[#2563EB] to-[#0F172A]',
  'from-[#111827] via-[#475569] to-[#7C3AED]',
  'from-[#581C87] via-[#EC4899] to-[#FACC15]',
];

const visualKind = (template: TemplateDefinition) => {
  if (template.category === 'research' || template.category === 'report') return 'research';
  if (template.contentType === 'presentation') return 'presentation';
  if (template.contentType === 'children') return 'kids';
  if (template.contentType === 'manga') return 'manga';
  if (template.category === 'business' || template.category === 'marketing') return 'business';
  if (template.category === 'manual' || template.category === 'education') return 'manual';
  if (template.category === 'novel') return 'novel';
  return 'book';
};

const Art = ({ kind, index = 0 }: { kind: string; index?: number }) => {
  if (kind === 'research') {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-violet-100">
        <div className="absolute inset-x-6 top-7 rounded-xl border border-slate-300 bg-white/85 p-4">
          <span className="block h-2 w-24 rounded bg-slate-700/30" />
          <span className="mt-3 block h-2 w-36 rounded bg-slate-700/20" />
          <span className="mt-3 block h-2 w-28 rounded bg-slate-700/20" />
        </div>
        <div className="absolute bottom-7 left-6 right-6 grid grid-cols-5 gap-1.5">
          {[44, 68, 52, 82, 60].map((h, i) => <span key={i} className="rounded-t bg-violet-500/35" style={{ height: `${h}px` }} />)}
        </div>
      </div>
    );
  }
  if (kind === 'presentation' || kind === 'business') {
    return (
      <div className={`absolute inset-0 bg-gradient-to-br ${kind === 'business' ? palette[3] : palette[1]}`}>
        <div className="absolute left-6 right-6 top-8 rounded-2xl border border-white/20 bg-white/12 p-4">
          <span className="block h-2.5 w-24 rounded bg-cyan-200/80" />
          <div className="mt-6 flex h-16 items-end gap-2">
            {[42, 64, 48, 82, 70].map((h, i) => <span key={i} className="w-full rounded-t bg-white/34" style={{ height: `${h}%` }} />)}
          </div>
        </div>
        <div className="absolute bottom-7 left-6 h-16 w-32 rounded-2xl bg-cyan-200/20" />
      </div>
    );
  }
  if (kind === 'kids') {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-sky-300 via-fuchsia-200 to-yellow-100">
        <div className="absolute left-8 top-10 h-16 w-16 rounded-full bg-amber-200" />
        <div className="absolute left-11 top-18 h-16 w-11 rounded-full bg-violet-500" />
        <div className="absolute right-7 top-12 h-12 w-12 rotate-12 bg-yellow-300 [clip-path:polygon(50%_0,62%_35%,100%_35%,70%_56%,82%_100%,50%_72%,18%_100%,30%_56%,0_35%,38%_35%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-emerald-300 [clip-path:ellipse(80%_58%_at_50%_100%)]" />
      </div>
    );
  }
  if (kind === 'manga') {
    return (
      <div className="absolute inset-0 bg-slate-950">
        <div className="absolute inset-5 grid grid-cols-2 gap-2">
          <span className="rounded-lg border-4 border-white bg-indigo-500" />
          <span className="rounded-lg border-4 border-white bg-cyan-300" />
          <span className="col-span-2 rounded-lg border-4 border-white bg-gradient-to-r from-slate-800 to-pink-500" />
        </div>
      </div>
    );
  }
  if (kind === 'manual') {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-800 to-slate-950">
        <div className="absolute inset-x-7 top-8 grid gap-2">
          {[0, 1, 2, 3].map(i => <span key={i} className="h-9 rounded-lg border border-white/12 bg-white/10" />)}
        </div>
      </div>
    );
  }
  if (kind === 'novel') {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-[#2B153D] via-[#7C2D12] to-[#020617]">
        <div className="absolute inset-x-10 bottom-10 h-32 rounded-t-full border border-amber-200/30 bg-amber-200/10" />
      </div>
    );
  }
  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${palette[index % palette.length]}`}>
      <div className="absolute inset-8 rounded-3xl border border-white/15 bg-white/10" />
      <div className="absolute right-8 top-10 grid grid-cols-2 gap-2">
        {[0, 1, 2, 3].map(i => <span key={i} className="h-10 w-10 rounded-xl bg-white/15" />)}
      </div>
    </div>
  );
};

export const TemplateVisual = ({ template, index = 0, compact = false }: { template: TemplateDefinition; index?: number; compact?: boolean }) => {
  const isSlide = template.contentType === 'presentation';
  const kind = visualKind(template);

  return (
    <div className="relative flex min-h-[230px] flex-col overflow-hidden rounded-xl bg-[#10172B] p-5 text-white">
      <Art kind={kind} index={index} />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,10,24,.08),rgba(7,10,24,.18)_38%,rgba(7,10,24,.88))]" />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <span className="rounded-full border border-white/25 bg-black/24 px-2.5 py-1 text-[10px] font-ui font-bold uppercase tracking-[0.14em] backdrop-blur">
          {isSlide ? 'SLIDE' : template.layoutDNA.pageSize ?? 'A4'}
        </span>
        <span className="text-[10px] font-ui font-bold uppercase tracking-[0.16em] text-white/75">KIVORA</span>
      </div>
      <div className="relative z-10 mt-auto pt-24">
        <p className="text-[10px] font-ui font-bold uppercase tracking-[0.16em] text-white/70">{template.contentType}</p>
        <h3 className={`${compact ? 'text-xl' : 'text-2xl'} thai-heading-safe mt-2 max-w-[14ch] font-heading font-extrabold`}>
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
  <div className="relative min-h-[160px] overflow-hidden rounded-xl border border-white/12 bg-[#10172B] shadow-xl shadow-black/20">
    <Art kind={label.toLowerCase().includes('manga') || title.toLowerCase().includes('manga') ? 'manga' : label.toLowerCase().includes('medical') ? 'research' : variant % 5 === 0 ? 'kids' : variant % 4 === 0 ? 'presentation' : variant % 3 === 0 ? 'research' : 'book'} index={variant} />
    <div className="absolute inset-0 bg-gradient-to-t from-[#070A18] via-[#070A18]/45 to-transparent" />
    <div className="relative z-10 flex min-h-[160px] flex-col p-4">
      <span className="text-[10px] font-ui font-bold uppercase tracking-[0.14em] text-cyan-200">{label}</span>
      <h3 className="thai-heading-safe mt-auto font-heading text-lg font-extrabold text-white">{title}</h3>
      <div className="mt-3 flex gap-2">
        <span className="h-8 flex-1 rounded border border-white/16 bg-white/10" />
        <span className="h-8 flex-1 rounded border border-white/16 bg-white/10" />
        <span className="h-8 flex-1 rounded border border-white/16 bg-white/10" />
      </div>
    </div>
  </div>
);
