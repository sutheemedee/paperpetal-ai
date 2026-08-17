import { ShowcaseProject } from '@/showcase/data';

const ShowcaseCover = ({ project, compact = false }: { project: ShowcaseProject; compact?: boolean }) => (
  <div className={`relative flex h-full min-h-[220px] overflow-hidden rounded-2xl bg-gradient-to-br ${project.cover.theme} p-5 text-white`}>
    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,.22),transparent_24%,rgba(255,255,255,.08)_46%,transparent_68%),linear-gradient(135deg,rgba(7,10,24,.08),rgba(7,10,24,.74))]" />
    <div className="absolute inset-x-0 top-0 h-20 bg-white/10 [clip-path:polygon(0_0,100%_0,74%_100%,0_44%)]" />
    <div className="absolute inset-x-0 bottom-0 h-24 bg-black/18 [clip-path:polygon(0_36%,100%_0,100%_100%,0_100%)]" />
    <div className="relative z-10 flex min-h-full w-full flex-col justify-between">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[10px] font-ui font-bold uppercase tracking-[0.16em]">
          {project.cover.eyebrow}
        </span>
        <span className="text-[10px] font-ui font-bold uppercase tracking-[0.18em] text-white/70">KIVORA</span>
      </div>
      <div className={compact ? 'mt-10' : 'mt-16'}>
        <h3 className={`${compact ? 'text-2xl' : 'text-4xl'} max-w-[12ch] font-display font-extrabold leading-[1.02]`}>
          {project.cover.title}
        </h3>
        <p className="mt-3 max-w-xs text-xs font-ui leading-5 text-white/82">{project.cover.subtitle}</p>
      </div>
      <div className="mt-8 flex items-center justify-between border-t border-white/20 pt-3 text-[10px] font-ui text-white/70">
        <span>{project.format}</span>
        <span>{project.language}</span>
      </div>
    </div>
  </div>
);

export default ShowcaseCover;
