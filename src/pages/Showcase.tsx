import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, BookOpen, Search, Sparkles } from 'lucide-react';
import PublicHeader from '@/components/marketing/PublicHeader';
import PublicFooter from '@/components/marketing/PublicFooter';
import Seo from '@/components/Seo';
import ShowcaseCover from '@/components/showcase/ShowcaseCover';
import { CATEGORY_LABEL, ShowcaseCategory, SHOWCASE_PROJECTS } from '@/showcase/data';

const FILTERS: (ShowcaseCategory | 'all')[] = [
  'all',
  'book',
  'academic',
  'presentation',
  'business',
  'medical',
  'legal',
  'education',
  'kids',
  'language',
  'manga',
  'novel',
];

const Showcase = () => {
  const [params, setParams] = useSearchParams();
  const initialCategory = (params.get('category') as ShowcaseCategory | null) ?? 'all';
  const [category, setCategory] = useState<ShowcaseCategory | 'all'>(FILTERS.includes(initialCategory) ? initialCategory : 'all');
  const [query, setQuery] = useState('');

  const projects = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SHOWCASE_PROJECTS.filter(project => {
      const inCategory = category === 'all' || project.category === category;
      const hay = `${project.title} ${project.subtitle} ${project.description} ${project.subcategory} ${project.language}`.toLowerCase();
      return inCategory && (!q || hay.includes(q));
    });
  }, [category, query]);

  const chooseCategory = (next: ShowcaseCategory | 'all') => {
    setCategory(next);
    if (next === 'all') setParams({});
    else setParams({ category: next });
  };

  return (
    <div className="min-h-[100dvh] bg-[#070A18] text-white">
      <Seo
        title="ตัวอย่างผลงาน KIVORA — อ่านตัวอย่างจริง"
        description="ดูตัวอย่างผลงานที่สร้างได้ด้วย KIVORA ทั้งหนังสือ งานวิจัย พรีเซนเทชัน หนังสือเด็ก มังงะ การแพทย์ กฎหมาย และภาษา พร้อม preview อ่านได้จริง"
        path="/showcase"
      />
      <PublicHeader />

      <main>
        <section className="mx-auto max-w-7xl px-4 py-14 md:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1.5 text-[11px] font-ui font-bold uppercase tracking-[0.16em] text-violet-200">
                <Sparkles className="h-3.5 w-3.5" /> KIVORA SHOWCASE
              </p>
              <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight md:text-6xl">
                ดูผลงานที่สร้างได้ด้วย KIVORA
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
                หนังสือ งานวิจัย พรีเซนเทชัน คู่มือ สื่อการเรียนรู้ งานเด็ก มังงะ งานภาษา การแพทย์ กฎหมาย และงานสร้างสรรค์ พร้อมตัวอย่างที่เปิดอ่านได้จริง
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a href="#library" className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-ai px-6 text-sm font-ui font-bold text-primary-foreground">
                  สำรวจผลงาน <ArrowRight className="h-4 w-4" />
                </a>
                <Link to="/auth/sign-up" className="flex min-h-12 items-center justify-center rounded-2xl border border-white/10 px-6 text-sm font-ui font-bold">
                  เริ่มสร้างฟรี
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {SHOWCASE_PROJECTS.slice(0, 6).map(project => (
                <Link key={project.slug} to={`/showcase/${project.slug}`} className="block aspect-[3/4]">
                  <ShowcaseCover project={project} compact />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="library" className="border-y border-white/10 bg-[#090E1D]">
          <div className="mx-auto max-w-7xl px-4 py-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-display text-2xl font-extrabold">คลังตัวอย่างผลงาน</h2>
                <p className="mt-1 text-sm text-slate-400">เลือกหมวด แล้วเปิดอ่านตัวอย่างภายในได้ทันที</p>
              </div>
              <label className="relative w-full lg:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Search showcase..."
                  className="min-h-11 w-full rounded-xl border border-white/10 bg-[#10172B] pl-9 pr-3 text-sm outline-none focus:border-primary"
                />
              </label>
            </div>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
              {FILTERS.map(filter => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => chooseCategory(filter)}
                  className={`min-h-10 shrink-0 rounded-full border px-4 text-xs font-ui font-bold ${
                    category === filter ? 'border-transparent bg-gradient-ai text-primary-foreground' : 'border-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  {CATEGORY_LABEL[filter]}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map(project => (
              <article key={project.slug} className="overflow-hidden rounded-2xl border border-white/10 bg-[#10172B]">
                <Link to={`/showcase/${project.slug}`} className="block aspect-[3/4]">
                  <ShowcaseCover project={project} />
                </Link>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-violet-500/10 px-2 py-1 text-[10px] font-ui font-bold text-violet-300">
                      {CATEGORY_LABEL[project.category]}
                    </span>
                    <span className="text-[10px] font-ui text-slate-500">
                      {project.pageCount ? `${project.pageCount} หน้า` : `${project.slideCount} สไลด์`}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-base font-bold">{project.title}</h3>
                  <p className="mt-1 line-clamp-2 min-h-10 text-xs leading-5 text-slate-400">{project.description}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Link to={`/showcase/${project.slug}`} className="flex min-h-10 items-center justify-center rounded-xl border border-white/10 text-xs font-ui font-bold">
                      เปิดอ่าน
                    </Link>
                    <Link to={`/auth/sign-up?template=${project.templateId}&showcase=${project.slug}`} className="flex min-h-10 items-center justify-center rounded-xl bg-gradient-ai text-xs font-ui font-bold text-primary-foreground">
                      สร้างแบบนี้
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {projects.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-[#10172B] p-8 text-center text-sm text-slate-400">
              ไม่พบตัวอย่างที่ตรงกับการค้นหา
            </div>
          )}
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-14">
          <div className="grid gap-5 rounded-3xl border border-white/10 bg-[#10172B] p-5 md:grid-cols-[0.8fr_1.2fr] md:p-8">
            <div>
              <p className="text-xs font-ui font-bold uppercase tracking-[0.16em] text-cyan-300">Inside Page Gallery</p>
              <h2 className="mt-2 font-display text-2xl font-extrabold">ไม่ได้มีแค่ปก แต่มีเนื้อหาข้างใน</h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                ตัวอย่างทุกชิ้นมีหน้าอ่านจริง เช่น บทนำ สารบัญ สไลด์ มังงะเพจ หน้ากิจกรรมเด็ก และ disclaimer สำหรับหมวดเฉพาะทาง
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {['Chapter Opener', 'Comic Page', 'Kids Activity'].map((label, index) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="aspect-[4/5] rounded-xl bg-gradient-to-br from-violet-500/30 via-blue-500/20 to-cyan-400/20 p-4">
                    <BookOpen className="h-6 w-6 text-cyan-200" />
                    <div className="mt-8 font-display text-lg font-bold">{label}</div>
                    <div className="mt-3 h-1.5 w-20 rounded-full bg-white/30" />
                    <div className="mt-2 h-1.5 w-28 rounded-full bg-white/20" />
                    <div className="mt-2 h-1.5 w-16 rounded-full bg-white/20" />
                  </div>
                  <p className="mt-2 text-xs font-ui text-slate-400">หน้าตัวอย่างด้านใน {index + 1}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};

export default Showcase;
