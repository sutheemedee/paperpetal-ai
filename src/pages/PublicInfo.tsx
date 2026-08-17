import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, BookOpen, FileText, GraduationCap, Layers, Presentation, Sparkles } from 'lucide-react';
import PublicHeader from '@/components/marketing/PublicHeader';
import PublicFooter from '@/components/marketing/PublicFooter';
import Seo from '@/components/Seo';
import { CATEGORY_LABEL, SHOWCASE_PROJECTS } from '@/showcase/data';

const CONTENT = {
  '/features': {
    label: 'FEATURES',
    title: 'ความสามารถของ KIVORA',
    body: 'ตั้งแต่การรวมแหล่งข้อมูล ถามตอบจากความรู้จริง วางโครง เขียน สร้างภาพ ไปจนถึงส่งออกไฟล์พร้อมเผยแพร่',
  },
  '/create-with-kivora': {
    label: 'WHAT YOU CAN CREATE',
    title: 'สร้างอะไรได้บ้างด้วย KIVORA',
    body: 'หนังสือ eBook งานวิจัย พรีเซนเทชัน คู่มือ หนังสือเด็ก มังงะ งานภาษา การแพทย์ กฎหมาย และคอนเทนต์ธุรกิจ',
  },
  '/templates': {
    label: 'TEMPLATES',
    title: 'เทมเพลตสำหรับเริ่มสร้างเร็วขึ้น',
    body: 'เลือกโครงงานที่เหมาะกับเป้าหมาย แล้วให้ KIVORA เติม workflow, structure, style และ output format ให้พร้อม',
  },
};

const CARDS = [
  { icon: BookOpen, title: 'Books & Publishing', body: 'หนังสือ คู่มือ ตำรา eBook และ pocket book' },
  { icon: FileText, title: 'Research & Reports', body: 'รายงาน งานวิจัย literature review และ white paper' },
  { icon: Presentation, title: 'Presentation', body: 'สไลด์สอนงาน pitch deck และ conference deck' },
  { icon: GraduationCap, title: 'Education & Kids', body: 'workbook หนังสือเด็ก กิจกรรม และสื่อการเรียนรู้' },
  { icon: Layers, title: 'Knowledge Engine', body: 'YouTube, PDF, Website, Word และ notes รวมเป็นคลังความรู้' },
  { icon: Sparkles, title: 'Visual Publishing', body: 'ปก ภาพประกอบ infographic manga page และ visual style' },
];

const PublicInfo = () => {
  const { pathname } = useLocation();
  const content = CONTENT[pathname as keyof typeof CONTENT] ?? CONTENT['/features'];

  return (
    <div className="min-h-[100dvh] bg-[#070A18] text-white">
      <Seo title={`${content.title} | KIVORA`} description={content.body} path={pathname} />
      <PublicHeader />
      <main>
        <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
          <p className="inline-flex rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1.5 text-[11px] font-ui font-bold uppercase tracking-[0.16em] text-violet-200">
            {content.label}
          </p>
          <h1 className="mt-5 max-w-4xl font-display text-4xl font-extrabold leading-tight md:text-6xl">{content.title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">{content.body}</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link to="/showcase" className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-ai px-6 text-sm font-ui font-bold text-primary-foreground">
              ดูตัวอย่างผลงาน <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/auth/sign-up" className="flex min-h-12 items-center justify-center rounded-2xl border border-white/10 px-6 text-sm font-ui font-bold">
              เริ่มใช้ฟรี
            </Link>
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#090E1D]">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
            {CARDS.map(card => (
              <div key={card.title} className="rounded-2xl border border-white/10 bg-[#10172B] p-5">
                <card.icon className="h-6 w-6 text-violet-300" />
                <h2 className="mt-4 font-display text-base font-bold">{card.title}</h2>
                <p className="mt-2 text-sm leading-7 text-slate-400">{card.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12">
          <h2 className="font-display text-2xl font-extrabold">ตัวอย่างที่เกี่ยวข้อง</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SHOWCASE_PROJECTS.slice(0, 4).map(project => (
              <Link key={project.slug} to={`/showcase/${project.slug}`} className="rounded-2xl border border-white/10 bg-[#10172B] p-4 hover:border-primary/50">
                <span className="text-[10px] font-ui font-bold text-violet-300">{CATEGORY_LABEL[project.category]}</span>
                <h3 className="mt-2 font-display text-sm font-bold">{project.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{project.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
};

export default PublicInfo;
