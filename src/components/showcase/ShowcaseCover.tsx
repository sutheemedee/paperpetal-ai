import { ShowcaseProject } from '@/showcase/data';

const CoverArtwork = ({ project }: { project: ShowcaseProject }) => {
  if (project.category === 'kids') {
    return (
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-300 via-fuchsia-200 to-amber-100" />
        <div className="absolute left-8 top-12 h-20 w-20 rounded-full bg-amber-200 shadow-[0_0_0_8px_rgba(255,255,255,.3)]" />
        <div className="absolute left-12 top-20 h-20 w-14 rounded-full bg-violet-500" />
        <div className="absolute right-10 top-14 h-16 w-16 rotate-12 bg-yellow-200 [clip-path:polygon(50%_0,62%_35%,100%_35%,70%_56%,82%_100%,50%_72%,18%_100%,30%_56%,0_35%,38%_35%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-emerald-300/80 [clip-path:ellipse(80%_60%_at_50%_100%)]" />
      </div>
    );
  }

  if (project.category === 'manga') {
    return (
      <div className="absolute inset-0 bg-[#070A18]">
        <div className="absolute inset-6 grid grid-cols-2 gap-2 opacity-90">
          <div className="rounded-xl border-4 border-white bg-gradient-to-br from-indigo-500 to-fuchsia-500" />
          <div className="rounded-xl border-4 border-white bg-gradient-to-br from-cyan-300 to-slate-900" />
          <div className="col-span-2 rounded-xl border-4 border-white bg-gradient-to-br from-slate-900 via-violet-700 to-pink-500" />
        </div>
        <div className="absolute right-8 top-12 h-28 w-20 rounded-t-full bg-slate-950 shadow-[0_0_24px_rgba(34,211,238,.45)]" />
        <div className="absolute right-12 top-20 h-6 w-12 rounded-full bg-cyan-300" />
      </div>
    );
  }

  if (project.category === 'medical') {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-blue-900 to-slate-950">
        <div className="absolute inset-y-8 right-10 w-24 rounded-full border border-cyan-200/40 bg-cyan-200/10" />
        <div className="absolute right-20 top-16 h-52 w-1 rounded bg-cyan-100/70" />
        <div className="absolute right-12 top-28 h-1 w-28 rotate-12 rounded bg-cyan-100/60" />
        <div className="absolute right-12 top-40 h-1 w-28 -rotate-12 rounded bg-cyan-100/60" />
        <div className="absolute left-8 bottom-8 grid w-36 gap-2">
          <span className="h-2 rounded bg-cyan-200/40" />
          <span className="h-2 w-4/5 rounded bg-cyan-200/30" />
          <span className="h-2 w-2/3 rounded bg-cyan-200/25" />
        </div>
      </div>
    );
  }

  if (project.category === 'academic' || project.category === 'legal') {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-200 to-violet-200">
        <div className="absolute inset-x-8 top-10 h-28 rounded-xl border border-slate-500/20 bg-white/70 p-4">
          <span className="block h-2 w-24 rounded bg-slate-700/30" />
          <span className="mt-3 block h-2 w-36 rounded bg-slate-700/20" />
          <span className="mt-3 block h-2 w-28 rounded bg-slate-700/20" />
        </div>
        <div className="absolute bottom-8 left-8 right-8 grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map(i => <span key={i} className="h-16 rounded-t bg-slate-700/25" />)}
        </div>
      </div>
    );
  }

  if (project.category === 'presentation' || project.category === 'business') {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-violet-900 to-fuchsia-800">
        <div className="absolute left-8 right-8 top-12 h-32 rounded-2xl border border-white/20 bg-white/10 p-4">
          <span className="block h-3 w-24 rounded bg-cyan-300/70" />
          <div className="mt-6 flex h-16 items-end gap-2">
            {[38, 58, 44, 76, 64].map((h, i) => <span key={i} className="w-full rounded-t bg-white/35" style={{ height: `${h}%` }} />)}
          </div>
        </div>
        <div className="absolute bottom-8 left-8 h-20 w-40 rounded-2xl bg-cyan-300/20" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[#14213D] via-[#2D7CFF] to-[#00CFFF]">
      <div className="absolute inset-8 rounded-3xl border border-white/15 bg-white/10" />
      <div className="absolute left-10 top-14 grid grid-cols-3 gap-2">
        {[0, 1, 2, 3, 4, 5].map(i => <span key={i} className="h-12 w-12 rounded-xl bg-white/15" />)}
      </div>
      <div className="absolute bottom-10 right-8 h-28 w-28 rounded-2xl border border-cyan-200/40 bg-cyan-200/20" />
    </div>
  );
};

const ShowcaseCover = ({ project, compact = false }: { project: ShowcaseProject; compact?: boolean }) => (
  <div className="relative flex h-full min-h-[260px] overflow-hidden rounded-2xl bg-[#10172B] p-6 text-white shadow-xl shadow-black/25">
    <CoverArtwork project={project} />
    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,10,24,.12),rgba(7,10,24,.22)_38%,rgba(7,10,24,.88))]" />
    <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#070A18] to-transparent" />
    <div className="relative z-10 flex min-h-full w-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-full border border-white/25 bg-black/22 px-2.5 py-1 text-[10px] font-ui font-bold uppercase tracking-[0.16em] backdrop-blur">
          {project.cover.eyebrow}
        </span>
        <span className="text-[10px] font-ui font-bold uppercase tracking-[0.18em] text-white/78">KIVORA</span>
      </div>
      <div className="mt-auto pt-28">
        <h3 className={`${compact ? 'text-xl md:text-2xl' : 'text-3xl md:text-4xl'} thai-heading-safe max-w-[14ch] font-display font-extrabold drop-shadow`}>
          {project.cover.title}
        </h3>
        <p className="thai-safe mt-3 max-w-xs text-xs text-white/84">{project.cover.subtitle}</p>
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-white/20 pt-3 text-[10px] font-ui text-white/72">
        <span>{project.format}</span>
        <span>{project.language}</span>
      </div>
    </div>
  </div>
);

export default ShowcaseCover;
