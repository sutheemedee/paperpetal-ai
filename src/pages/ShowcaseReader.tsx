import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Columns2, Maximize2, Minus, Plus, Sparkles } from 'lucide-react';
import PublicHeader from '@/components/marketing/PublicHeader';
import PublicFooter from '@/components/marketing/PublicFooter';
import Seo, { breadcrumbJsonLd, publicationJsonLd } from '@/components/Seo';
import ShowcaseCover from '@/components/showcase/ShowcaseCover';
import { CATEGORY_LABEL, getShowcaseProject, ShowcasePage, ShowcaseProject } from '@/showcase/data';

type ReaderMode = 'single' | 'spread' | 'scroll';
type PaperSpec = { label: string; ratio: string; maxWidth: string; color: string };
type ReaderPage = ShowcasePage & {
  role: 'cover' | 'title' | 'copyright' | 'front' | 'toc' | 'chapter' | 'visual' | 'summary' | 'references' | 'back';
  paperNumber?: string;
  realPage?: number;
};

const paperFor = (project: ShowcaseProject): PaperSpec => {
  if (project.category === 'presentation') return { label: '16:9 Slide', ratio: '16 / 9', maxWidth: '900px', color: '#0B1020' };
  if (project.category === 'kids') return { label: 'Square 210 x 210 mm', ratio: '1 / 1', maxWidth: '720px', color: '#FFFBEB' };
  if (project.category === 'manga') return { label: 'Manga 182 x 257 mm', ratio: '182 / 257', maxWidth: '560px', color: '#F8FAFC' };
  if (project.format.toLowerCase().includes('a5')) return { label: 'A5 148 x 210 mm', ratio: '148 / 210', maxWidth: '560px', color: '#F8FAFC' };
  return { label: 'A4 210 x 297 mm', ratio: '210 / 297', maxWidth: '620px', color: '#F8FAFC' };
};

const roman = ['i', 'ii', 'iii', 'iv', 'v'];

const buildReaderPages = (project: ShowcaseProject): ReaderPage[] => {
  const total = project.pageCount ?? project.slideCount ?? project.pages.length;
  const base = project.pages;
  const first = base[0];
  const second = base[1] ?? first;
  const third = base[2] ?? second;

  if (project.category === 'presentation') {
    return [
      { ...first, role: 'cover', title: project.title, kicker: 'Slide 1', realPage: 1, paperNumber: '1' },
      { ...second, role: 'chapter', title: 'Problem / Opportunity', kicker: 'Slide 2', realPage: 2, paperNumber: '2' },
      { ...third, role: 'visual', title: 'Roadmap & Visual System', kicker: 'Slide 3', realPage: 3, paperNumber: '3' },
      { ...third, role: 'summary', title: 'Implementation Plan', kicker: 'Slide 8', realPage: Math.min(total, 8), paperNumber: String(Math.min(total, 8)) },
    ];
  }

  return [
    { ...first, role: 'cover', title: project.title, kicker: 'Cover', realPage: 1 },
    { ...first, role: 'title', title: project.title, kicker: 'Title Page', realPage: 2 },
    { title: 'Copyright', role: 'copyright', kicker: 'Copyright', realPage: 3, paperNumber: roman[0], body: ['ตัวอย่างเพื่อสาธิตรูปแบบผลงาน KIVORA เนื้อหาและภาพประกอบทั้งหมดเป็น demo สำหรับพรีวิว ไม่ใช่ไฟล์ฉบับเต็ม'], layout: first.layout },
    { ...first, role: 'front', title: project.category === 'academic' ? 'Abstract' : 'คำนำ', kicker: 'Front Matter', realPage: 4, paperNumber: roman[1] },
    { title: 'สารบัญ', role: 'toc', kicker: 'Table of Contents', realPage: 5, paperNumber: roman[2], body: ['ตัวอย่างลำดับหน้าแบบหนังสือจริง พร้อมบทหลัก หน้า visual และหน้าสรุป'], bullets: project.tableOfContents, layout: first.layout },
    { ...first, role: 'chapter', title: first.title, kicker: project.tableOfContents[0] ?? 'Chapter 1', realPage: 6, paperNumber: '1' },
    { ...second, role: 'chapter', title: second.title, kicker: project.tableOfContents[1] ?? 'Content Page', realPage: Math.max(7, Math.round(total * 0.12)), paperNumber: String(Math.max(2, Math.round(total * 0.12))) },
    { ...third, role: 'visual', title: third.title, kicker: 'Image / Diagram Page', realPage: Math.max(8, Math.round(total * 0.22)), paperNumber: String(Math.max(3, Math.round(total * 0.22))) },
    { ...second, role: 'chapter', title: project.category === 'kids' ? 'กิจกรรมท้ายเล่ม' : 'Later Chapter Preview', kicker: project.tableOfContents[2] ?? 'Preview', realPage: Math.max(9, Math.round(total * 0.55)), paperNumber: String(Math.max(4, Math.round(total * 0.55))) },
    { ...third, role: 'summary', title: project.category === 'academic' ? 'Discussion Summary' : 'สรุปเนื้อหา', kicker: 'Summary', realPage: Math.max(10, total - 3), paperNumber: String(Math.max(5, total - 3)) },
    { title: project.category === 'academic' || project.category === 'medical' || project.category === 'legal' ? 'References' : 'About This Demo', role: 'references', kicker: 'References / Author', realPage: Math.max(11, total - 1), paperNumber: String(Math.max(6, total - 1)), body: ['ในไฟล์จริง ส่วนนี้จะแสดงข้อมูลอ้างอิง ผู้เขียน แหล่งข้อมูล หรือหมายเหตุเฉพาะทางตามประเภทผลงาน'], layout: first.layout },
    { ...first, role: 'back', title: 'Back Cover', kicker: 'Back Cover', realPage: total, paperNumber: String(total), body: [project.description], layout: first.layout },
  ];
};

const VisualBlock = ({ page, project }: { page: ReaderPage; project: ShowcaseProject }) => {
  if (page.role === 'cover' || page.role === 'back') return <ShowcaseCover project={project} />;
  if (project.category === 'kids') {
    return (
      <div className="mt-6 min-h-40 rounded-3xl border-4 border-white bg-gradient-to-br from-sky-200 via-pink-200 to-yellow-100 p-5">
        <div className="mx-auto h-16 w-16 rounded-full bg-amber-200" />
        <div className="mx-auto mt-2 h-16 w-12 rounded-full bg-violet-500" />
        <p className="thai-safe mt-4 text-center text-sm font-bold text-slate-700">ภาพประกอบตัวละครและฉากสำหรับหนังสือเด็ก</p>
      </div>
    );
  }
  if (project.category === 'manga') {
    return (
      <div className="mt-6 grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map(n => <div key={n} className="min-h-28 rounded-xl border-4 border-slate-950 bg-gradient-to-br from-slate-200 via-violet-200 to-cyan-100 p-3 text-xs font-bold">Panel {n}</div>)}
      </div>
    );
  }
  if (page.role === 'visual' || project.category === 'medical') {
    return (
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_1.2fr]">
          <div className="min-h-36 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-200 p-4">
            <div className="mx-auto h-32 w-20 rounded-full border-2 border-cyan-700/50" />
          </div>
          <div className="space-y-2">
            <span className="block h-3 w-full rounded bg-slate-300" />
            <span className="block h-3 w-4/5 rounded bg-slate-200" />
            <span className="block h-3 w-2/3 rounded bg-slate-200" />
            <span className="block h-16 rounded border border-slate-200 bg-white" />
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const ShowcaseReader = () => {
  const { slug } = useParams();
  const project = getShowcaseProject(slug);
  const [pageIndex, setPageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [mode, setMode] = useState<ReaderMode>('single');

  const pages = useMemo(() => (project ? buildReaderPages(project) : []), [project]);
  const paper = useMemo(() => (project ? paperFor(project) : null), [project]);
  const page = pages[pageIndex];
  const totalPages = project?.pageCount ?? project?.slideCount ?? pages.length;
  const previewCount = pages.length;
  const progress = previewCount ? Math.round(((pageIndex + 1) / previewCount) * 100) : 0;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') setPageIndex(i => Math.min(previewCount - 1, i + 1));
      if (event.key === 'ArrowLeft') setPageIndex(i => Math.max(0, i - 1));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [previewCount]);

  if (!project || !paper) return <Navigate to="/showcase" replace />;
  if (!page) return null;

  const next = () => setPageIndex(i => Math.min(previewCount - 1, i + 1));
  const prev = () => setPageIndex(i => Math.max(0, i - 1));
  const spreadPages = mode === 'spread' ? [page, pages[Math.min(pageIndex + 1, previewCount - 1)]].filter(Boolean) : [page];

  return (
    <div className="min-h-[100dvh] bg-[#070A18] text-white">
      <Seo
        title={`${project.title} — ตัวอย่างอ่านจริง | KIVORA`}
        description={`${project.description} เปิดอ่านตัวอย่าง ${previewCount} จาก ${totalPages} ${project.category === 'presentation' ? 'สไลด์' : 'หน้า'} พร้อมสารบัญและข้อมูลรูปแบบงาน`}
        path={`/showcase/${project.slug}`}
        jsonLd={[
          breadcrumbJsonLd([
            { name: 'หน้าแรก', path: '/' },
            { name: 'ตัวอย่างผลงาน', path: '/showcase' },
            { name: project.title, path: `/showcase/${project.slug}` },
          ]),
          publicationJsonLd({
            title: project.title,
            description: project.description,
            path: `/showcase/${project.slug}`,
            language: project.language,
            format: project.format,
            pages: project.pageCount ?? project.slideCount,
            category: project.category,
          }),
        ]}
      />
      <PublicHeader />

      <main className="mx-auto grid max-w-[1540px] gap-4 px-4 py-5 lg:grid-cols-[280px_minmax(0,1fr)_310px]">
        <aside className="hidden rounded-2xl border border-white/10 bg-[#10172B] p-4 lg:block">
          <Link to="/showcase" className="mb-4 flex items-center gap-2 text-xs font-ui font-bold text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> กลับไป Showcase
          </Link>
          <div className="aspect-[3/4]">
            <ShowcaseCover project={project} compact />
          </div>
          <h1 className="thai-heading-safe mt-4 font-heading text-lg font-bold">{project.title}</h1>
          <p className="thai-safe mt-1 text-xs text-slate-400">{project.subtitle}</p>
          <p className="thai-safe mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-300">
            ตัวอย่าง {previewCount} จาก {totalPages} {project.category === 'presentation' ? 'สไลด์' : 'หน้า'} / {paper.label}
          </p>
          <div className="mt-4 h-1.5 rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-ai" style={{ width: `${progress}%` }} />
          </div>
          <nav className="mt-4 max-h-[52vh] space-y-1 overflow-y-auto pr-1">
            {pages.map((item, index) => (
              <button
                key={`${item.role}-${item.title}-${index}`}
                type="button"
                onClick={() => setPageIndex(index)}
                className={`w-full rounded-xl px-3 py-2 text-left text-xs font-ui ${
                  pageIndex === index ? 'bg-gradient-subtle text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="block text-[10px] text-slate-500">{item.paperNumber ? `หน้า ${item.paperNumber}` : item.kicker}</span>
                <span className="thai-safe block">{item.title}</span>
              </button>
            ))}
          </nav>
        </aside>

        <section className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-[#10172B] p-2">
            <div className="min-w-0 px-2">
              <p className="truncate text-xs font-ui font-bold text-slate-400">{CATEGORY_LABEL[project.category]} / {paper.label}</p>
              <h1 className="thai-heading-safe truncate font-heading text-sm font-bold md:text-base">{project.title}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <button type="button" onClick={() => setMode('single')} className={`min-h-9 rounded-xl border border-white/10 px-3 text-xs font-ui font-bold ${mode === 'single' ? 'bg-white/10' : ''}`}>Single</button>
              <button type="button" onClick={() => setMode('spread')} className={`hidden min-h-9 rounded-xl border border-white/10 px-3 text-xs font-ui font-bold md:flex md:items-center md:gap-1 ${mode === 'spread' ? 'bg-white/10' : ''}`}><Columns2 className="h-4 w-4" /> Spread</button>
              <button type="button" onClick={() => setZoom(z => Math.max(0.75, z - 0.1))} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10"><Minus className="h-4 w-4" /></button>
              <span className="w-12 text-center text-xs font-ui text-slate-400">{Math.round(zoom * 100)}%</span>
              <button type="button" onClick={() => setZoom(z => Math.min(1.35, z + 0.1))} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10"><Plus className="h-4 w-4" /></button>
              <button type="button" onClick={() => setZoom(1)} className="hidden h-9 items-center gap-1 rounded-xl border border-white/10 px-3 text-xs font-ui font-bold sm:flex"><Maximize2 className="h-4 w-4" /> Fit</button>
            </div>
          </div>

          <div className="relative overflow-auto rounded-2xl border border-white/10 bg-[#0B1020] p-4 md:p-8">
            <div className={`mx-auto flex ${mode === 'spread' ? 'max-w-6xl flex-row items-start justify-center gap-5' : 'max-w-4xl flex-col items-center'} ${mode === 'scroll' ? 'gap-8' : ''}`}>
              {spreadPages.map((readerPage, index) => (
                <article
                  key={`${readerPage.title}-${index}`}
                  className={`relative w-full rounded-lg p-6 shadow-2xl shadow-black/40 transition-transform md:p-9 ${project.category === 'presentation' ? 'text-white' : 'text-slate-950'}`}
                  style={{
                    aspectRatio: paper.ratio,
                    maxWidth: mode === 'spread' ? `calc(${paper.maxWidth} * .82)` : paper.maxWidth,
                    background: readerPage.role === 'cover' || readerPage.role === 'back' ? '#10172B' : paper.color,
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top center',
                  }}
                >
                  {readerPage.role === 'cover' || readerPage.role === 'back' ? (
                    <ShowcaseCover project={project} />
                  ) : (
                    <>
                      <p className="text-[11px] font-ui font-bold uppercase tracking-[0.16em] text-violet-500">{readerPage.kicker ?? project.subcategory}</p>
                      <h2 className={`thai-heading-safe mt-3 font-heading font-extrabold ${project.category === 'presentation' ? 'text-3xl md:text-5xl text-white' : 'text-2xl md:text-3xl'}`}>
                        {readerPage.title}
                      </h2>
                      {readerPage.role === 'toc' ? (
                        <ol className="thai-safe mt-6 grid gap-2 text-sm">
                          {project.tableOfContents.map((toc, i) => (
                            <li key={toc} className="flex justify-between gap-4 border-b border-slate-200 pb-2">
                              <span>{toc}</span>
                              <span>{i < pages.length ? pages[Math.min(i + 3, pages.length - 1)].paperNumber ?? '-' : 'locked'}</span>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <div className="mt-6 grid gap-5 md:grid-cols-[1fr_.9fr]">
                          <div className="space-y-4">
                            {readerPage.body.map((paragraph, pIndex) => (
                              <p key={`${paragraph}-${pIndex}`} className={`thai-safe text-sm ${project.category === 'presentation' ? 'text-white/88 md:text-lg' : 'text-slate-700'}`}>
                                {paragraph}
                              </p>
                            ))}
                          </div>
                          {readerPage.bullets && (
                            <ul className={`thai-safe space-y-2 rounded-2xl p-4 ${project.category === 'presentation' ? 'bg-white/10' : 'bg-slate-100'}`}>
                              {readerPage.bullets.map(item => (
                                <li key={item} className={`text-sm ${project.category === 'presentation' ? 'text-white' : 'text-slate-700'}`}>
                                  <span className="mr-2 text-violet-500">•</span>{item}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                      <VisualBlock page={readerPage} project={project} />
                      {readerPage.note && <p className="thai-safe mt-6 rounded-xl bg-amber-100 p-3 text-xs text-amber-900">{readerPage.note}</p>}
                      {readerPage.paperNumber && (
                        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-ui text-slate-400">{readerPage.paperNumber}</span>
                      )}
                    </>
                  )}
                  <span className="pointer-events-none absolute right-4 top-4 text-[10px] font-ui font-bold tracking-[0.14em] text-slate-400/50">KIVORA DEMO</span>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <button type="button" onClick={prev} disabled={pageIndex === 0} className="flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-xs font-ui font-bold disabled:opacity-40">
              <ChevronLeft className="h-4 w-4" /> ก่อนหน้า
            </button>
            <span className="text-xs font-ui text-slate-400">
              หน้า {page.paperNumber ?? pageIndex + 1} / {totalPages} / Preview {pageIndex + 1} จาก {previewCount}
            </span>
            <button type="button" onClick={next} disabled={pageIndex === previewCount - 1} className="flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-xs font-ui font-bold disabled:opacity-40">
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
              ['ขนาด', paper.label],
              ['Preview', `${previewCount} จาก ${totalPages}`],
              ['สไตล์', project.style],
              ['เหมาะสำหรับ', project.audience],
              ['Export', project.exportFormats.join(' / ')],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <dt className="text-[10px] uppercase tracking-[0.14em] text-slate-500">{label}</dt>
                <dd className="thai-safe mt-1 text-slate-200">{value}</dd>
              </div>
            ))}
          </dl>
          <Link to={`/auth/sign-up?template=${project.templateId}&showcase=${project.slug}`} className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-ai text-xs font-ui font-bold text-primary-foreground">
            <Sparkles className="h-4 w-4" /> สร้างงานแบบนี้
          </Link>
          <Link to={`/templates?template=${project.templateId}`} className="mt-2 flex min-h-11 items-center justify-center rounded-xl border border-white/10 text-xs font-ui font-bold">
            ดู Template
          </Link>
        </aside>
      </main>

      <PublicFooter />
    </div>
  );
};

export default ShowcaseReader;
