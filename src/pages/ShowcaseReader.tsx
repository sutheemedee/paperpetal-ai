import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Maximize2, Minus, Plus, Sparkles } from 'lucide-react';
import PublicHeader from '@/components/marketing/PublicHeader';
import PublicFooter from '@/components/marketing/PublicFooter';
import Seo from '@/components/Seo';
import ShowcaseCover from '@/components/showcase/ShowcaseCover';
import { CATEGORY_LABEL, getShowcaseProject } from '@/showcase/data';

const ShowcaseReader = () => {
  const { slug } = useParams();
  const project = getShowcaseProject(slug);
  const [pageIndex, setPageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);

  const page = project?.pages[pageIndex];
  const pageCount = project?.pages.length ?? 0;
  const progress = useMemo(() => (pageCount ? Math.round(((pageIndex + 1) / pageCount) * 100) : 0), [pageCount, pageIndex]);

  if (!project) return <Navigate to="/showcase" replace />;
  if (!page) return null;

  const next = () => setPageIndex(i => Math.min(pageCount - 1, i + 1));
  const prev = () => setPageIndex(i => Math.max(0, i - 1));

  return (
    <div className="min-h-[100dvh] bg-[#070A18] text-white">
      <Seo
        title={`${project.title} — KIVORA Showcase`}
        description={project.description}
        path={`/showcase/${project.slug}`}
      />
      <PublicHeader />

      <main className="mx-auto grid max-w-7xl gap-4 px-4 py-5 lg:grid-cols-[260px_minmax(0,1fr)_300px]">
        <aside className="hidden rounded-2xl border border-white/10 bg-[#10172B] p-4 lg:block">
          <Link to="/showcase" className="mb-4 flex items-center gap-2 text-xs font-ui font-bold text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> กลับไป Showcase
          </Link>
          <div className="aspect-[3/4]">
            <ShowcaseCover project={project} compact />
          </div>
          <h1 className="mt-4 font-display text-lg font-bold">{project.title}</h1>
          <p className="mt-1 text-xs leading-5 text-slate-400">{project.subtitle}</p>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-ai" style={{ width: `${progress}%` }} />
          </div>
          <nav className="mt-4 flex flex-col gap-1">
            {project.pages.map((item, index) => (
              <button
                key={`${item.title}-${index}`}
                type="button"
                onClick={() => setPageIndex(index)}
                className={`rounded-xl px-3 py-2 text-left text-xs font-ui ${
                  pageIndex === index ? 'bg-gradient-subtle text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {index + 1}. {item.title}
              </button>
            ))}
          </nav>
        </aside>

        <section className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-[#10172B] p-2">
            <div className="min-w-0 px-2">
              <p className="truncate text-xs font-ui font-bold text-slate-400">{CATEGORY_LABEL[project.category]} · {project.format}</p>
              <h1 className="truncate font-display text-sm font-bold md:text-base">{project.title}</h1>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setZoom(z => Math.max(0.8, z - 0.1))} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center text-xs font-ui text-slate-400">{Math.round(zoom * 100)}%</span>
              <button type="button" onClick={() => setZoom(z => Math.min(1.25, z + 0.1))} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10">
                <Plus className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setZoom(1)} className="hidden h-9 items-center gap-1 rounded-xl border border-white/10 px-3 text-xs font-ui font-bold sm:flex">
                <Maximize2 className="h-4 w-4" /> Fit
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B1020] p-3 md:p-6">
            <div
              className={`mx-auto min-h-[560px] max-w-3xl rounded-2xl p-6 shadow-2xl transition-transform md:p-10 ${
                page.layout === 'slide'
                  ? 'aspect-video min-h-0 bg-gradient-to-br from-[#111827] via-[#312E81] to-[#0E7490] text-white'
                  : page.layout === 'comic'
                    ? 'bg-[#F8FAFC] text-slate-950'
                    : page.layout === 'kids'
                      ? 'bg-gradient-to-br from-white via-[#FDF2F8] to-[#E0F2FE] text-slate-950'
                      : 'bg-[#F8FAFC] text-slate-950'
              }`}
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
            >
              <p className="text-[11px] font-ui font-bold uppercase tracking-[0.16em] text-violet-500">{page.kicker ?? project.subcategory}</p>
              <h2 className={`mt-3 font-display font-extrabold leading-tight ${page.layout === 'slide' ? 'text-4xl md:text-5xl' : 'text-3xl'}`}>
                {page.title}
              </h2>
              <div className={`mt-6 grid gap-5 ${page.layout === 'comic' ? 'md:grid-cols-2' : page.layout === 'spread' ? 'md:grid-cols-2' : ''}`}>
                <div className="space-y-4">
                  {page.body.map((paragraph, index) => (
                    <p key={`${paragraph}-${index}`} className={`font-body leading-8 ${page.layout === 'slide' ? 'text-lg text-white/88' : 'text-sm text-slate-700'}`}>
                      {paragraph}
                    </p>
                  ))}
                </div>
                {page.bullets && (
                  <ul className={`space-y-2 rounded-2xl p-4 ${page.layout === 'slide' ? 'bg-white/10' : 'bg-slate-100'}`}>
                    {page.bullets.map(item => (
                      <li key={item} className={`text-sm font-ui ${page.layout === 'slide' ? 'text-white' : 'text-slate-700'}`}>
                        <span className="mr-2 text-violet-500">●</span>{item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {page.layout === 'comic' && (
                <div className="mt-6 grid grid-cols-3 gap-2">
                  {[1, 2, 3].map(n => <div key={n} className="aspect-square rounded-xl border-2 border-slate-900 bg-gradient-to-br from-slate-200 to-violet-200" />)}
                </div>
              )}
              {page.layout === 'kids' && (
                <div className="mt-6 rounded-3xl border-4 border-white bg-gradient-to-br from-cyan-200 via-pink-200 to-yellow-100 p-6 text-center font-display text-xl font-bold text-slate-800">
                  Illustration Preview
                </div>
              )}
              {page.note && <p className="mt-6 rounded-xl bg-amber-100 p-3 text-xs font-ui text-amber-900">{page.note}</p>}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <button type="button" onClick={prev} disabled={pageIndex === 0} className="flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-xs font-ui font-bold disabled:opacity-40">
              <ChevronLeft className="h-4 w-4" /> ก่อนหน้า
            </button>
            <span className="text-xs font-ui text-slate-400">หน้า {pageIndex + 1} / {pageCount}</span>
            <button type="button" onClick={next} disabled={pageIndex === pageCount - 1} className="flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-xs font-ui font-bold disabled:opacity-40">
              ถัดไป <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        <aside className="rounded-2xl border border-white/10 bg-[#10172B] p-4 lg:sticky lg:top-24 lg:self-start">
          <h2 className="font-display text-sm font-bold">Project Information</h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-xs font-ui">
            {[
              ['ประเภท', project.subcategory],
              ['ภาษา', project.language],
              ['จำนวน', project.pageCount ? `${project.pageCount} หน้า` : `${project.slideCount} สไลด์`],
              ['สไตล์', project.style],
              ['เหมาะสำหรับ', project.audience],
              ['Export', project.exportFormats.join(' · ')],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <dt className="text-[10px] uppercase tracking-[0.14em] text-slate-500">{label}</dt>
                <dd className="mt-1 text-slate-200">{value}</dd>
              </div>
            ))}
          </dl>
          <Link
            to={`/auth/sign-up?template=${project.templateId}&showcase=${project.slug}`}
            className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-ai text-xs font-ui font-bold text-primary-foreground"
          >
            <Sparkles className="h-4 w-4" /> สร้างงานแบบนี้
          </Link>
          <Link to="/showcase" className="mt-2 flex min-h-11 items-center justify-center rounded-xl border border-white/10 text-xs font-ui font-bold">
            ดูตัวอย่างอื่น
          </Link>
        </aside>
      </main>

      <PublicFooter />
    </div>
  );
};

export default ShowcaseReader;
