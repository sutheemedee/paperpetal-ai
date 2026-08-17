import { Link, Navigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Check,
  FileText,
  GraduationCap,
  Layers3,
  MessageCircle,
  Presentation,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Wand2,
  WandSparkles,
} from 'lucide-react';
import { FullLogo } from '@/components/brand/Logo';
import PublicHeader from '@/components/marketing/PublicHeader';
import PublicFooter from '@/components/marketing/PublicFooter';
import ShowcaseCover from '@/components/showcase/ShowcaseCover';
import { useAuth } from '@/auth/AuthProvider';
import { FALLBACK_PLANS, PLAN_HIGHLIGHTS } from '@/lib/plans';
import Seo, { SITE_URL, faqJsonLd } from '@/components/Seo';
import { CATEGORY_LABEL, featuredShowcase } from '@/showcase/data';

const OUTPUTS = [
  { icon: BookOpen, label: 'หนังสือ / eBook' },
  { icon: Presentation, label: 'Presentation' },
  { icon: GraduationCap, label: 'Course / Workbook' },
  { icon: FileText, label: 'Research / Report' },
  { icon: Stethoscope, label: 'Medical Content' },
  { icon: Scale, label: 'Legal Draft' },
];

const FEATURES = [
  {
    icon: BrainCircuit,
    title: 'Knowledge Engine',
    body: 'รวม YouTube, PDF, เว็บไซต์, Word และโน้ต ให้กลายเป็นคลังความรู้ที่ AI เข้าใจและอ้างอิงได้',
  },
  {
    icon: Search,
    title: 'Ask KIVORA',
    body: 'ถาม-ตอบจากแหล่งข้อมูลจริง พร้อมย้อนกลับไปตรวจต้นทาง ลดการเดาและลดงานค้นมือ',
  },
  {
    icon: BookOpen,
    title: 'Book Studio',
    body: 'วางโครง เขียนเนื้อหา สร้างปกและภาพประกอบ สำหรับหนังสือ คู่มือ ตำรา และ eBook',
  },
  {
    icon: Presentation,
    title: 'Presentation Studio',
    body: 'เปลี่ยนความรู้เป็นสไลด์พร้อมสคริปต์ผู้พูด โครงเรื่อง และ visual direction',
  },
  {
    icon: WandSparkles,
    title: 'Visual Director',
    body: 'กำหนดสไตล์ภาพ ไดอะแกรม อินโฟกราฟิก หรือภาพประกอบให้เข้ากับเนื้อหา',
  },
  {
    icon: FileText,
    title: 'Multi-format Publish',
    body: 'ส่งออกเป็น PDF, DOCX, EPUB, PPTX และไฟล์ปก PNG พร้อมใช้งานจริง',
  },
];

const FAQS = [
  {
    q: 'KIVORA คืออะไร?',
    a: 'KIVORA คือแพลตฟอร์ม AI ที่เปลี่ยนแหล่งข้อมูลและความรู้ของคุณให้กลายเป็นหนังสือ eBook คู่มือ งานวิจัย มังงะ และพรีเซนเทชัน พร้อม workflow สำหรับแก้ไขและส่งออกไฟล์',
  },
  {
    q: 'ต้องเริ่มจากอะไร?',
    a: 'คุณเริ่มได้จากไอเดียเปล่า ๆ หรือเพิ่มแหล่งข้อมูล เช่น YouTube, PDF, เว็บไซต์, Word และโน้ต จากนั้นเลือกชนิดผลงานที่ต้องการสร้าง',
  },
  {
    q: 'ส่งออกไฟล์ได้กี่รูปแบบ?',
    a: 'รองรับ PDF, Word (.docx), EPUB 3, PowerPoint (.pptx) และภาพปก PNG ตามสิทธิ์ของแพ็กเกจ',
  },
  {
    q: 'งานที่สร้างเป็นของใคร?',
    a: 'ผลงานที่คุณสร้างเป็นของคุณ นำไปแก้ไข เผยแพร่ หรือต่อยอดเชิงพาณิชย์ได้ตามสิทธิ์การใช้งานและแหล่งข้อมูลที่คุณนำเข้ามา',
  },
];

const Home = () => {
  const { session, loading } = useAuth();
  if (session && !loading) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-[100dvh] bg-[#070A18] text-white">
      <Seo
        path="/"
        title="KIVORA — เปลี่ยนความรู้ให้กลายเป็นผลงานด้วย AI"
        description="KIVORA เปลี่ยน YouTube, PDF, เว็บไซต์, Word และไอเดียของคุณให้เป็นหนังสือ eBook คู่มือ งานวิจัย มังงะ และพรีเซนเทชัน ส่งออก PDF, DOCX, EPUB, PPTX ได้"
        jsonLd={[
          faqJsonLd(FAQS),
          {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'KIVORA',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            url: SITE_URL,
            inLanguage: 'th-TH',
            description: 'AI Knowledge & Creation Platform สำหรับสร้างหนังสือ สไลด์ คู่มือ งานวิจัย และผลงานเผยแพร่จากแหล่งข้อมูลจริง',
            offers: FALLBACK_PLANS.map(p => ({
              '@type': 'Offer',
              name: p.name,
              price: p.price_thb,
              priceCurrency: 'THB',
              url: `${SITE_URL}/pricing`,
            })),
          },
        ]}
      />

      <PublicHeader />

      <main>
        <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 md:py-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:py-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1.5 text-[11px] font-ui font-bold uppercase tracking-[0.14em] text-violet-200">
              <Sparkles className="h-3.5 w-3.5" />
              CREATE FROM KNOWLEDGE
            </div>

            <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-[1.08] md:text-6xl">
              เปลี่ยนความรู้ของคุณ
              <span className="block text-gradient-ai">ให้กลายเป็นผลงาน</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
              KIVORA ช่วยเปลี่ยน YouTube, PDF, เว็บไซต์, Word, โน้ต และไอเดียของคุณ
              ให้เป็นหนังสือ eBook คู่มือ งานวิจัย สไลด์ มังงะ และคอนเทนต์เผยแพร่ได้ในที่เดียว
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/auth/sign-up" className="press flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-ai px-6 text-sm font-ui font-bold text-primary-foreground shadow-[var(--shadow-glow)]">
                เริ่มสร้างผลงานฟรี
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#showcase" className="press flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-6 text-sm font-ui font-bold text-slate-100">
                ดูตัวอย่างผลงาน
              </a>
            </div>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-ui text-slate-400">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-success" /> ไม่ต้องใช้บัตรเครดิต</span>
              <span>Source-grounded AI</span>
              <span>PDF · DOCX · EPUB · PPTX</span>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl border border-white/10 bg-[#090E1D] p-5 shadow-2xl shadow-black/30">
              <FullLogo className="mx-auto w-full max-w-md" />
              <p className="mx-auto mt-3 max-w-md text-center font-ui text-sm text-slate-300">
                <span className="text-gradient-ai font-bold">Turn Knowledge Into Anything</span>
                <span className="block">เปลี่ยนทุกความรู้ ให้กลายเป็นทุกผลงาน</span>
              </p>
              <div className="mt-6 grid grid-cols-5 gap-2 text-center">
                {[
                  ['AI', 'Powered'],
                  ['Book', 'Knowledge'],
                  ['Create', 'Studio'],
                  ['Any', 'Format'],
                  ['Publish', 'Export'],
                ].map(([a, b]) => (
                  <div key={a} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="text-xs font-display font-bold text-slate-100">{a}</div>
                    <div className="mt-1 text-[10px] font-ui text-slate-500">{b}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {OUTPUTS.map(item => (
                <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#10172B] p-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-ui font-bold text-slate-100">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="showcase" className="mx-auto w-full max-w-7xl px-4 py-12">
          <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-ui font-bold uppercase tracking-[0.16em] text-cyan-300">AI Showcase</p>
              <h2 className="mt-2 font-display text-2xl font-extrabold md:text-4xl">ตัวอย่างผลงานที่สร้างได้</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
                ให้ผู้ใช้เห็นทันทีว่า KIVORA ไม่ได้เป็นแค่แชต แต่เป็น workspace สำหรับสร้างชิ้นงานที่นำไปใช้ต่อได้จริง
              </p>
            </div>
            <Link to="/showcase" className="text-sm font-ui font-bold text-cyan-300">
              ดูผลงานทั้งหมด →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredShowcase.slice(0, 8).map(item => (
              <article key={item.slug} className="group overflow-hidden rounded-2xl border border-white/10 bg-[#10172B]">
                <Link to={`/showcase/${item.slug}`} className="block aspect-[3/4]">
                  <ShowcaseCover project={item} compact />
                </Link>
                <div className="p-4">
                  <span className="rounded-full bg-violet-500/10 px-2 py-1 text-[10px] font-ui font-bold text-violet-300">
                    {CATEGORY_LABEL[item.category]}
                  </span>
                  <h3 className="mt-3 font-display text-sm font-bold">{item.title}</h3>
                  <p className="mt-1 text-xs font-ui text-slate-400">
                    {item.pageCount ? `${item.pageCount} หน้า` : `${item.slideCount} สไลด์`} · เปิดอ่านได้
                  </p>
                  <Link to={`/showcase/${item.slug}`} className="mt-3 flex min-h-9 items-center justify-center rounded-xl border border-white/10 text-xs font-ui font-bold">
                    เปิดอ่าน
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="features" className="border-y border-white/10 bg-[#090E1D]">
          <div className="mx-auto w-full max-w-7xl px-4 py-14">
            <div className="mx-auto mb-8 max-w-3xl text-center">
              <p className="text-xs font-ui font-bold uppercase tracking-[0.16em] text-violet-300">One Workspace</p>
              <h2 className="mt-2 font-display text-2xl font-extrabold md:text-4xl">ตั้งแต่แหล่งข้อมูลจนถึงไฟล์ส่งออก</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(feature => (
                <div key={feature.title} className="rounded-2xl border border-white/10 bg-[#11172B] p-5">
                  <feature.icon className="h-6 w-6 text-violet-300" />
                  <h3 className="mt-4 font-display text-base font-bold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-400">{feature.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="workflow" className="mx-auto w-full max-w-7xl px-4 py-14">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-ui font-bold uppercase tracking-[0.16em] text-pink-300">Simple Workflow</p>
            <h2 className="mt-2 font-display text-2xl font-extrabold md:text-4xl">จากข้อมูลสู่ผลงานใน 4 ขั้นตอน</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {[
              ['01', 'เพิ่มข้อมูล', 'YouTube · PDF · Website · Notes'],
              ['02', 'AI ทำความเข้าใจ', 'Summary · Knowledge · Citation'],
              ['03', 'เลือกสิ่งที่จะสร้าง', 'Book · Research · Present · More'],
              ['04', 'แก้ไขและ Publish', 'PDF · DOCX · EPUB · PPTX'],
            ].map(([number, title, text]) => (
              <div key={number} className="rounded-2xl border border-white/10 bg-[#10172B] p-5">
                <div className="font-display text-3xl font-extrabold text-white/10">{number}</div>
                <h3 className="mt-1 font-display text-base font-bold">{title}</h3>
                <p className="mt-2 text-xs leading-6 text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 pb-14">
          <h2 className="font-display text-2xl font-extrabold md:text-4xl">แผนที่โตไปกับงานของคุณ</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {FALLBACK_PLANS.map(p => (
              <div key={p.code} className={`rounded-2xl p-[1px] ${p.badge === 'MOST POPULAR' ? 'bg-gradient-ai' : 'bg-white/10'}`}>
                <div className="flex h-full flex-col rounded-2xl bg-[#10172B] p-4">
                  <span className="font-display text-sm font-bold uppercase">{p.name}</span>
                  <span className="mt-1 font-display text-2xl font-extrabold">
                    ฿{p.price_thb.toLocaleString()}
                    {p.price_thb > 0 && <span className="text-xs font-ui text-slate-500"> / เดือน</span>}
                  </span>
                  <ul className="mt-3 flex flex-1 flex-col gap-1">
                    {PLAN_HIGHLIGHTS[p.code].slice(0, 4).map(h => (
                      <li key={h} className="flex items-start gap-1.5 text-[11px] font-ui text-slate-400">
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-success" /> {h}
                      </li>
                    ))}
                  </ul>
                  <Link to="/auth/sign-up" className="mt-3 flex min-h-10 items-center justify-center rounded-xl border border-white/10 text-xs font-ui font-bold">
                    เริ่มต้น
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-white/10 bg-[#090E1D] px-4 py-14 text-center">
          <h2 className="font-display text-2xl font-extrabold md:text-4xl">พร้อมเปลี่ยนความรู้ของคุณเป็นผลงาน?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-400">
            เริ่มจากไอเดียเดียว หรืออัปโหลดแหล่งข้อมูลของคุณ แล้วให้ KIVORA ช่วยวางโครง สร้าง และส่งออกผลงาน
          </p>
          <Link to="/auth/sign-up" className="mx-auto mt-6 flex min-h-12 w-full max-w-xs items-center justify-center gap-2 rounded-2xl bg-gradient-ai text-sm font-ui font-bold text-primary-foreground">
            สร้างบัญชีฟรี <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};

export default Home;
