import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, BookOpen, Briefcase, GraduationCap, Languages, Presentation, Scale, Stethoscope } from 'lucide-react';
import PublicHeader from '@/components/marketing/PublicHeader';
import PublicFooter from '@/components/marketing/PublicFooter';
import Seo, { breadcrumbJsonLd, itemListJsonLd, webPageJsonLd } from '@/components/Seo';
import { PageMiniature } from '@/components/marketing/MiniPreviews';

const filters = [
  ['all', 'ทั้งหมด'],
  ['book', 'หนังสือ'],
  ['academic', 'วิชาการ'],
  ['business', 'ธุรกิจ'],
  ['presentation', 'Presentation'],
  ['education', 'การศึกษา'],
  ['kids', 'เด็ก'],
  ['language', 'ภาษา'],
  ['medical', 'การแพทย์'],
  ['legal', 'กฎหมาย'],
  ['creative', 'Creative'],
];

const groups = [
  {
    id: 'book',
    icon: BookOpen,
    title: 'Book & Publishing',
    items: ['หนังสือทั่วไป', 'คู่มือ', 'eBook', 'ตำรา', 'Pocket Book'],
  },
  {
    id: 'academic',
    icon: GraduationCap,
    title: 'Research & Academic',
    items: ['Research', 'Thesis', 'Dissertation', 'Literature Review', 'Academic Report', 'Journal Article'],
  },
  {
    id: 'presentation',
    icon: Presentation,
    title: 'Presentation',
    items: ['Teaching', 'Business', 'Pitch Deck', 'Research', 'Conference', 'Training'],
  },
  {
    id: 'kids',
    icon: GraduationCap,
    title: 'Kids & Learning',
    items: ['Picture Book', 'Story Book', 'Writing Practice', 'Activity Book', 'Coloring Book', 'Learning Book'],
  },
  {
    id: 'language',
    icon: Languages,
    title: 'Language',
    items: ['English', 'Thai', 'Chinese', 'Japanese', 'Bilingual', 'Vocabulary', 'Conversation', 'Writing Practice'],
  },
  {
    id: 'medical',
    icon: Stethoscope,
    title: 'Medical',
    items: ['Medical Guide', 'Anatomy', 'Health Education', 'Medical Presentation', 'Scientific Visual Guide'],
  },
  {
    id: 'legal',
    icon: Scale,
    title: 'Legal',
    items: ['Legal Guide', 'Legal Research', 'Case Analysis', 'Legal Manual'],
  },
  {
    id: 'creative',
    icon: Briefcase,
    title: 'Creative',
    items: ['Novel', 'Short Story', 'Manga', 'Comic', 'Illustrated Story', 'Fantasy', 'Mystery'],
  },
];

const thaiContext: Record<string, string> = {
  Research: 'งานวิจัย',
  Thesis: 'วิทยานิพนธ์',
  Dissertation: 'ดุษฎีนิพนธ์',
  'Literature Review': 'การทบทวนวรรณกรรม',
  'Academic Report': 'รายงานวิชาการ',
  'Journal Article': 'บทความวารสาร',
  Teaching: 'สไลด์การสอน',
  Business: 'งานนำเสนอธุรกิจ',
  'Pitch Deck': 'พรีเซนต์ระดมทุน',
  Conference: 'งานประชุมวิชาการ',
  Training: 'สื่อฝึกอบรม',
  'Picture Book': 'หนังสือภาพเด็ก',
  'Story Book': 'นิทานเด็ก',
  'Writing Practice': 'แบบฝึกเขียน',
  'Activity Book': 'หนังสือกิจกรรม',
  'Coloring Book': 'สมุดระบายสี',
  'Learning Book': 'หนังสือเรียนรู้',
  English: 'ภาษาอังกฤษ',
  Thai: 'ภาษาไทย',
  Chinese: 'ภาษาจีน',
  Japanese: 'ภาษาญี่ปุ่น',
  Bilingual: 'สองภาษา',
  Vocabulary: 'คำศัพท์',
  Conversation: 'บทสนทนา',
  'Medical Guide': 'คู่มือสุขภาพ',
  Anatomy: 'กายวิภาคศาสตร์',
  'Health Education': 'สุขศึกษา',
  'Medical Presentation': 'งานนำเสนอการแพทย์',
  'Scientific Visual Guide': 'คู่มือภาพวิทยาศาสตร์',
  'Legal Guide': 'คู่มือกฎหมาย',
  'Legal Research': 'งานวิจัยกฎหมาย',
  'Case Analysis': 'วิเคราะห์คดี',
  'Legal Manual': 'คู่มือปฏิบัติกฎหมาย',
  Novel: 'นิยาย',
  'Short Story': 'เรื่องสั้น',
  Manga: 'มังงะ',
  Comic: 'การ์ตูน',
  'Illustrated Story': 'เรื่องเล่าภาพประกอบ',
  Fantasy: 'แฟนตาซี',
  Mystery: 'สืบสวน',
};

const CreateWithKivora = () => {
  const [searchParams] = useSearchParams();
  const selected = searchParams.get('category') ?? 'all';
  const visibleGroups = selected === 'all' ? groups : groups.filter(group => group.id === selected);

  return (
    <div className="min-h-[100dvh] bg-[#070A18] text-white">
      <Seo
        path="/create-with-kivora"
        title="สร้างอะไรได้บ้างด้วย KIVORA"
        description="Catalog ผลงานที่สร้างได้ด้วย KIVORA ตั้งแต่หนังสือ งานวิจัย Presentation Manga หนังสือเด็ก ภาษา การแพทย์ และกฎหมาย"
        jsonLd={[
          breadcrumbJsonLd([{ name: 'หน้าแรก', path: '/' }, { name: 'สร้างอะไรได้บ้าง', path: '/create-with-kivora' }]),
          webPageJsonLd({
            name: 'สร้างอะไรได้บ้างด้วย KIVORA',
            description: 'Catalog ประเภทผลงานที่ KIVORA สร้างได้ ตั้งแต่หนังสือ วิจัย พรีเซนเทชัน ไปจนถึง Medical, Legal, Kids และ Creative',
            path: '/create-with-kivora',
            about: ['Books', 'Research', 'Presentation', 'Kids Books', 'Medical Publishing', 'Legal Publishing', 'Manga'],
          }),
          itemListJsonLd(groups.flatMap(group => group.items).map(item => ({
            name: thaiContext[item] ? `${item} — ${thaiContext[item]}` : item,
            path: `/create-with-kivora?type=${encodeURIComponent(item)}`,
          }))),
        ]}
      />
      <PublicHeader />
      <main>
        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-[0.86fr_1.14fr] md:items-center md:py-16">
          <div>
            <p className="text-xs font-ui font-bold uppercase tracking-[0.16em] text-pink-300">Creation Catalog</p>
            <h1 className="thai-heading-safe mt-3 max-w-3xl font-heading text-4xl font-extrabold md:text-5xl">
              สร้างอะไรได้บ้างด้วย KIVORA
            </h1>
            <p className="thai-safe mt-4 max-w-2xl text-base text-slate-300 md:text-lg">
              จากหนังสือและงานวิจัย ไปจนถึง Presentation, Manga, สื่อการเรียนรู้ การแพทย์ และกฎหมาย เลือกประเภทงานที่ต้องการแล้วเริ่มจากตัวอย่างหรือเทมเพลตได้ทันที
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <PageMiniature title="Book Cover" label="BOOK" variant={0} />
            <PageMiniature title="Research Page" label="A4 REPORT" variant={3} />
            <PageMiniature title="Pitch Slide" label="16:9" variant={1} />
            <PageMiniature title="Kids Page" label="STORY" variant={4} />
            <PageMiniature title="Medical Guide" label="ATLAS" variant={2} />
            <PageMiniature title="Manga Page" label="COMIC" variant={1} />
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#090E1D]">
          <div className="mx-auto max-w-7xl px-4 py-5">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {filters.map(([id, label]) => (
                <Link
                  key={id}
                  to={id === 'all' ? '/create-with-kivora' : `/create-with-kivora?category=${id}`}
                  className={`flex min-h-10 shrink-0 items-center rounded-full border px-4 text-xs font-ui font-bold ${
                    selected === id ? 'border-violet-300 bg-violet-400/15 text-white' : 'border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid gap-5">
            {visibleGroups.map((group, groupIndex) => (
              <section key={group.id} className="rounded-2xl border border-white/10 bg-[#10172B] p-5">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
                  <div>
                    <group.icon className="h-6 w-6 text-cyan-300" />
                    <h2 className="thai-heading-safe mt-3 font-heading text-2xl font-extrabold">{group.title}</h2>
                  </div>
                  <Link to={`/showcase?category=${group.id}`} className="text-sm font-ui font-bold text-cyan-300">
                    ดูตัวอย่างหมวดนี้
                  </Link>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {group.items.map((item, itemIndex) => (
                    <article key={item} className="rounded-xl border border-white/10 bg-[#070A18] p-3">
                      <PageMiniature title={item} label={group.title} variant={groupIndex + itemIndex} />
                      <div className="pt-4">
                        <h3 className="thai-heading-safe font-heading text-base font-extrabold">{item}</h3>
                        {thaiContext[item] && <p className="thai-safe mt-1 text-xs font-ui font-bold text-cyan-200">{thaiContext[item]}</p>}
                        <p className="thai-safe mt-1 text-xs text-slate-400">
                          โครงงานพร้อมปก โครงสร้างเนื้อหา ตัวอย่างหน้า และไฟล์ส่งออกที่เหมาะกับงานประเภทนี้
                        </p>
                        <p className="mt-3 text-[11px] font-ui text-slate-500">ช่วงงานทั่วไป 24-120 หน้า / PDF / DOCX / EPUB / PPTX</p>
                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                          <Link to={`/showcase?category=${group.id}`} className="flex min-h-10 items-center justify-center rounded-lg border border-white/10 text-xs font-ui font-bold">
                            ดูตัวอย่าง
                          </Link>
                          <Link to={`/auth/sign-up?template=${encodeURIComponent(group.id)}`} className="flex min-h-10 items-center justify-center gap-1 rounded-lg bg-gradient-ai px-3 text-xs font-ui font-bold text-primary-foreground">
                            เริ่มสร้าง <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
};

export default CreateWithKivora;
