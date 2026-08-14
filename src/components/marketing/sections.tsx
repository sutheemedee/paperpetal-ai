import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BookOpen, Brain, FileDown, FileText, Film, Globe, Image as ImageIcon, Layers,
  MessageCircle, Mic, Presentation, Quote, Sparkles, Wand2, Youtube,
} from 'lucide-react';
import { PUBLIC_FAQS } from '@/marketing/faq';

export const SectionTitle = ({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) => (
  <header className="max-w-3xl">
    {eyebrow && (
      <span className="font-ui text-[11px] font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</span>
    )}
    <h2 className="mt-1.5 whitespace-pre-line font-display text-xl font-extrabold leading-tight md:text-3xl">{title}</h2>
    {sub && <p className="mt-2 font-body text-sm leading-7 text-muted-foreground md:text-base">{sub}</p>}
  </header>
);

/* ---------------------------------------------------------------- hero visual */

const SOURCE_CHIPS = [
  { icon: Youtube, label: 'YouTube' },
  { icon: FileText, label: 'PDF' },
  { icon: Globe, label: 'Website' },
  { icon: FileDown, label: 'DOCX' },
  { icon: Quote, label: 'Notes' },
];
const OUTPUT_CHIPS = [
  { icon: BookOpen, label: 'Book' },
  { icon: Presentation, label: 'Presentation' },
  { icon: Layers, label: 'Manual' },
  { icon: ImageIcon, label: 'Manga' },
  { icon: FileText, label: 'Report' },
];

/** Product mockup: sources → PaperPetal AI → outputs, with animated connectors. */
export const HeroFlow = () => (
  <div className="relative w-full overflow-hidden rounded-3xl border border-border bg-card/80 p-4 md:p-6">
    <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-primary/25 blur-3xl" />
    <div className="relative flex flex-col gap-3">
      <span className="font-ui text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Sources</span>
      <div className="flex flex-wrap gap-1.5">
        {SOURCE_CHIPS.map(c => (
          <span key={c.label} className="flex items-center gap-1.5 rounded-xl border border-border bg-background/70 px-2.5 py-1.5 font-ui text-[11px] font-bold">
            <c.icon className="h-3.5 w-3.5 text-primary" /> {c.label}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-center py-1" aria-hidden="true">
        <span className="h-8 w-px animate-pulse bg-gradient-to-b from-transparent via-primary to-transparent" />
      </div>

      <div className="rounded-2xl bg-gradient-ai p-[1.5px]">
        <div className="flex items-center gap-2 rounded-2xl bg-background-deep px-3 py-3">
          <Brain className="h-5 w-5 text-primary" />
          <div>
            <p className="font-display text-sm font-extrabold">PAPERPETAL AI</p>
            <p className="font-ui text-[11px] text-muted-foreground">วิเคราะห์ · สรุป · จัดโครงสร้าง · อ้างอิงแหล่งข้อมูล</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center py-1" aria-hidden="true">
        <span className="h-8 w-px animate-pulse bg-gradient-to-b from-transparent via-primary to-transparent" />
      </div>

      <span className="font-ui text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Output</span>
      <div className="flex flex-wrap gap-1.5">
        {OUTPUT_CHIPS.map(c => (
          <span key={c.label} className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-2.5 py-1.5 font-ui text-[11px] font-bold">
            <c.icon className="h-3.5 w-3.5 text-primary" /> {c.label}
          </span>
        ))}
      </div>
    </div>
  </div>
);

/* --------------------------------------------------------------- source strip */

const INPUTS = ['YouTube', 'PDF', 'Word', 'Website', 'Text', 'Images', 'Audio', 'Video', 'Notes'];
const OUTPUTS = ['BOOK', 'PRESENTATION', 'MANUAL', 'REPORT', 'MANGA', 'MORE'];

export const SourceFlowStrip = () => (
  <section className="border-y border-border bg-card/40 py-8">
    <div className="mx-auto w-full max-w-6xl px-4">
      <span className="font-ui text-[11px] font-bold uppercase tracking-[0.18em] text-primary">From sources to creation</span>
      <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
        <div className="flex flex-wrap gap-1.5">
          {INPUTS.map(i => (
            <span key={i} className="rounded-lg border border-border bg-background/60 px-2 py-1 font-ui text-[11px]">{i}</span>
          ))}
        </div>
        <ArrowRight className="hidden h-4 w-4 text-muted-foreground md:block" />
        <div className="rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 text-center font-display text-xs font-extrabold">
          AI KNOWLEDGE
        </div>
        <ArrowRight className="hidden h-4 w-4 text-muted-foreground md:block" />
        <div className="flex flex-wrap gap-1.5">
          {OUTPUTS.map(o => (
            <span key={o} className="rounded-lg bg-gradient-ai px-2 py-1 font-ui text-[11px] font-bold text-primary-foreground">{o}</span>
          ))}
        </div>
      </div>
      <p className="mt-3 font-ui text-[11px] text-muted-foreground">
        ชื่อแพลตฟอร์มด้านบนใช้เพื่ออธิบายประเภทไฟล์และลิงก์ที่นำเข้าได้เท่านั้น ไม่ได้แสดงความเป็นพันธมิตรทางธุรกิจกับแพลตฟอร์มใด
      </p>
    </div>
  </section>
);

/* ------------------------------------------------------------------- features */

export const FEATURES = [
  { icon: Layers, name: 'KNOWLEDGE', body: 'รวม YouTube, PDF, Website, Word และ Notes ไว้ในคลังความรู้เดียว' },
  { icon: MessageCircle, name: 'ASK PAPERPETAL', body: 'ถาม AI จากข้อมูลของคุณ พร้อมระบบอ้างอิงแหล่งข้อมูล' },
  { icon: BookOpen, name: 'WRITE', body: 'สร้างหนังสือ eBook คู่มือ บทความ รายงาน และงานเขียนหลายประเภท' },
  { icon: Presentation, name: 'PRESENT', body: 'สร้าง Presentation ตามจำนวนสไลด์และโทนที่ต้องการ' },
  { icon: Wand2, name: 'VISUAL AI', body: 'สร้างภาพประกอบ ภาพสมจริง Diagram Infographic และงานภาพ' },
  { icon: FileDown, name: 'PUBLISH', body: 'ส่งออกผลงานเป็น PDF, DOCX, EPUB และ PPTX ตามประเภทงาน' },
];

export const FeatureCards = () => (
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {FEATURES.map(f => (
      <article key={f.name} className="rounded-3xl border border-border bg-card p-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-ai">
          <f.icon className="h-5 w-5 text-primary-foreground" />
        </span>
        <h3 className="mt-3 font-display text-sm font-extrabold tracking-wide">{f.name}</h3>
        <p className="mt-1.5 font-body text-xs leading-6 text-muted-foreground md:text-sm">{f.body}</p>
      </article>
    ))}
  </div>
);

/* ------------------------------------------------------------------ how it works */

const STEPS = [
  { n: '01', title: 'เพิ่มข้อมูล', items: ['YouTube', 'PDF', 'Website', 'Word', 'Text'] },
  { n: '02', title: 'AI ทำความเข้าใจ', items: ['Summary', 'Knowledge', 'Citation', 'Topic', 'Structure'] },
  { n: '03', title: 'เลือกสิ่งที่ต้องการสร้าง', items: ['Book', 'Presentation', 'Manual', 'Manga', 'Report'] },
  { n: '04', title: 'แก้ไขและ Publish', items: ['PDF', 'Word', 'EPUB', 'PowerPoint'] },
];

export const HowItWorks = () => (
  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
    {STEPS.map(s => (
      <article key={s.n} className="relative overflow-hidden rounded-3xl border border-border bg-card p-5">
        <span className="font-display text-3xl font-extrabold text-gradient-ai">{s.n}</span>
        <h3 className="mt-1 font-display text-sm font-extrabold">{s.title}</h3>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {s.items.map(i => (
            <li key={i} className="rounded-lg border border-border bg-background/60 px-2 py-1 font-ui text-[11px] text-muted-foreground">{i}</li>
          ))}
        </ul>
      </article>
    ))}
  </div>
);

/* ------------------------------------------------------------- product preview */

const TABS = [
  { key: 'knowledge', label: 'Knowledge', body: 'เพิ่มลิงก์ ไฟล์ หรือข้อความ ระบบจะสรุปและจัดเก็บเป็นความรู้ที่ค้นหาได้ พร้อมจัดโฟลเดอร์และแท็กตามหัวข้อของคุณ', rows: ['คลิปสัมมนา 42 นาที · สรุปแล้ว', 'คู่มือสินค้า.pdf · 18 หน้า', 'บทความอ้างอิง 3 ลิงก์'] },
  { key: 'chat', label: 'AI Chat', body: 'ถามคำถามกับคลังความรู้ของคุณ คำตอบจะแนบชิปอ้างอิงให้กดกลับไปดูต้นทางได้ทุกครั้ง', rows: ['ถาม: สรุปข้อจำกัดของแผน B', 'ตอบพร้อมอ้างอิง [1] [2]', 'โหมด: อ้างอิงแหล่งข้อมูลเท่านั้น'] },
  { key: 'write', label: 'Write', body: 'กำหนดชื่อเรื่อง จำนวนหน้า และโทน ระบบร่างสารบัญและเขียนต่อเนื่องทั้งเล่ม พร้อมภาพประกอบรายหัวข้อ', rows: ['สารบัญ 8 บท', 'กำลังเขียนบทที่ 3/8', 'ภาพประกอบ 12 ภาพ'] },
  { key: 'present', label: 'Present', body: 'เลือกจำนวนสไลด์และสไตล์ แล้วได้สไลด์พร้อมสคริปต์ผู้พูด แก้ไขรายสไลด์ได้ทันที', rows: ['40 สไลด์ · ธีม Modern Technology', 'สคริปต์ผู้พูดครบทุกสไลด์', 'พร้อมส่งออก PPTX'] },
  { key: 'publish', label: 'Publish', body: 'ส่งออกไฟล์พร้อมใช้ตามประเภทงาน ทั้ง PDF สำหรับพิมพ์ DOCX สำหรับแก้ต่อ EPUB สำหรับร้าน eBook และ PPTX', rows: ['PDF · ขนาด A5', 'DOCX · แก้ไขต่อได้', 'EPUB 3 · Kindle / Apple Books'] },
];

export const ProductPreview = () => {
  const [tab, setTab] = useState(TABS[0].key);
  const active = TABS.find(t => t.key === tab)!;
  return (
    <div>
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`min-h-11 shrink-0 rounded-full px-4 font-ui text-xs font-bold ${
              tab === t.key ? 'bg-gradient-ai text-primary-foreground' : 'border border-border text-muted-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-3 grid gap-3 rounded-3xl border border-border bg-card p-4 md:grid-cols-2 md:p-6">
        <div>
          <h3 className="font-display text-base font-extrabold">{active.label}</h3>
          <p className="mt-2 font-body text-sm leading-7 text-muted-foreground">{active.body}</p>
        </div>
        <div className="rounded-2xl border border-border bg-background-deep p-3">
          <div className="flex gap-1.5">
            {['bg-destructive/60', 'bg-accent/60', 'bg-success/60'].map(c => (
              <span key={c} className={`h-2.5 w-2.5 rounded-full ${c}`} />
            ))}
          </div>
          <ul className="mt-3 flex flex-col gap-2">
            {active.rows.map(r => (
              <li key={r} className="rounded-xl border border-border bg-card px-3 py-2 font-ui text-[11px]">{r}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- use cases */

const USE_CASES = [
  'หนังสือ / eBook', 'คู่มือ / ตำรา', 'Course / Workbook', 'Presentation', 'Report / White Paper',
  'บทความ', 'นิยาย', 'หนังสือเด็ก', 'การ์ตูน / Comic', 'มังงะ', 'บทภาพยนตร์', 'Mind Map', 'Infographic',
];

export const UseCases = () => {
  const [all, setAll] = useState(false);
  const shown = all ? USE_CASES : USE_CASES.slice(0, 8);
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {shown.map(u => (
          <div key={u} className="flex min-h-16 items-center rounded-2xl border border-border bg-card px-3 font-ui text-xs font-bold">
            {u}
          </div>
        ))}
      </div>
      {!all && (
        <button
          type="button"
          onClick={() => setAll(true)}
          className="mt-3 flex min-h-11 items-center justify-center rounded-full border border-border px-5 font-ui text-xs font-bold"
        >
          ดูทั้งหมด ({USE_CASES.length})
        </button>
      )}
    </div>
  );
};

/* --------------------------------------------------------------- visual section */

const VISUALS = [
  { icon: ImageIcon, label: 'Photorealistic', body: 'ภาพเสมือนจริงสำหรับปกและหน้าเปิดบท' },
  { icon: Sparkles, label: 'Technology', body: 'ภาพแนวเทคโนโลยีสำหรับเนื้อหาเชิงระบบ' },
  { icon: Layers, label: 'Business', body: 'ภาพเชิงธุรกิจสำหรับรายงานและข้อเสนอ' },
  { icon: BookOpen, label: 'Educational', body: 'ภาพประกอบเพื่อการเรียนการสอน' },
  { icon: FileText, label: 'Infographic', body: 'สรุปข้อมูลเป็นภาพเข้าใจง่าย' },
  { icon: Brain, label: 'Diagram', body: 'ผังกระบวนการและความสัมพันธ์' },
  { icon: Wand2, label: 'Illustration', body: 'ภาพวาดตามสไตล์ที่ล็อกไว้' },
  { icon: Film, label: 'Manga', body: 'ช่องการ์ตูนที่ตัวละครคงเส้นคงวา' },
];

export const VisualSection = () => (
  <div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {VISUALS.map(v => (
        <article key={v.label} className="rounded-2xl border border-border bg-card p-4">
          <v.icon className="h-5 w-5 text-primary" />
          <h3 className="mt-2 font-display text-xs font-bold uppercase tracking-wide">{v.label}</h3>
          <p className="mt-1 font-ui text-[11px] text-muted-foreground">{v.body}</p>
        </article>
      ))}
    </div>
    <p className="mt-3 font-ui text-[11px] text-muted-foreground">
      Visual Director จะวิเคราะห์ว่าจุดใดของเนื้อหาควรมีภาพประกอบ ภาพที่สร้างเป็นงานตีความเชิงสร้างสรรค์ ไม่ใช่หลักฐานยืนยันข้อเท็จจริง
    </p>
  </div>
);

/* ------------------------------------------------------------ source grounded */

export const SourceGrounded = () => (
  <div className="grid gap-4 lg:grid-cols-2 lg:items-center">
    <div>
      <ul className="flex flex-col gap-2">
        {[
          ['Source Library', 'เก็บลิงก์ ไฟล์ และบันทึกไว้ในคลังเดียว จัดโฟลเดอร์ตามงาน'],
          ['AI Summary', 'สรุปแต่ละแหล่งเป็นประเด็นสำคัญให้อ่านเร็ว'],
          ['Source Chat', 'ถาม-ตอบเฉพาะจากแหล่งข้อมูลที่คุณเลือก'],
          ['Citation', 'ทุกคำตอบแนบชิปอ้างอิงกลับไปยังต้นทาง'],
          ['Source Selection', 'ล็อกว่าให้ใช้เฉพาะแหล่งไหนในการเขียน'],
          ['Knowledge Reuse', 'ความรู้ชุดเดียวใช้สร้างงานได้หลายรูปแบบ'],
        ].map(([t, b]) => (
          <li key={t} className="rounded-2xl border border-border bg-card p-3">
            <p className="font-display text-xs font-bold uppercase tracking-wide">{t}</p>
            <p className="mt-1 font-ui text-[11px] text-muted-foreground">{b}</p>
          </li>
        ))}
      </ul>
      <p className="mt-3 font-ui text-[11px] text-muted-foreground">
        การอ้างอิงช่วยให้ตรวจย้อนกลับได้ แต่ผลลัพธ์จาก AI ควรผ่านการตรวจสอบของคุณก่อนนำไปเผยแพร่เสมอ
      </p>
    </div>
    <div className="rounded-3xl border border-border bg-card p-4">
      <p className="font-ui text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Ask PaperPetal</p>
      <div className="mt-3 rounded-2xl bg-background-deep p-3 font-body text-xs leading-6">
        <p className="text-muted-foreground">คำถาม: ข้อจำกัดหลักของวิธีที่กล่าวในคลิปคืออะไร</p>
        <p className="mt-2">
          วิธีนี้ต้องการข้อมูลย้อนหลังอย่างน้อย 6 เดือน และไม่เหมาะกับสินค้าออกใหม่
          <span className="ml-1 rounded-md border border-primary/40 bg-primary/10 px-1.5 py-0.5 font-ui text-[10px] font-bold text-primary">[1] คลิปสัมมนา 12:40</span>
          <span className="ml-1 rounded-md border border-primary/40 bg-primary/10 px-1.5 py-0.5 font-ui text-[10px] font-bold text-primary">[2] คู่มือ หน้า 7</span>
        </p>
      </div>
      <p className="mt-2 font-ui text-[10px] text-muted-foreground">ภาพจำลองหน้าจอเพื่ออธิบายการทำงานของระบบอ้างอิง</p>
    </div>
  </div>
);

/* --------------------------------------------------------------- presentation */

export const PresentationSection = () => (
  <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
    <div>
      <div className="rounded-2xl border border-border bg-card p-4 font-ui text-xs">
        <p className="font-bold">5 คลิป YouTube + 3 ไฟล์ PDF</p>
        <p className="my-2 text-center text-muted-foreground">↓</p>
        <p className="rounded-xl bg-gradient-ai px-3 py-2 text-center font-display font-extrabold text-primary-foreground">PAPERPETAL</p>
        <p className="my-2 text-center text-muted-foreground">↓</p>
        <p className="font-bold">พรีเซนเทชันสำหรับสอน 40 สไลด์</p>
      </div>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {['กำหนดจำนวนสไลด์', 'เลือก Tone', 'เลือก Style', 'สร้าง Visual', 'Speaker Notes', 'Export PPTX'].map(i => (
          <li key={i} className="rounded-lg border border-border px-2 py-1 font-ui text-[11px] text-muted-foreground">{i}</li>
        ))}
      </ul>
    </div>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {['ปกเรื่อง', 'ปัญหาที่เจอ', 'โอกาสจาก AI', 'Workflow', 'Content Funnel', 'สรุป'].map((s, i) => (
        <div key={s} className="flex aspect-[16/9] flex-col justify-between rounded-xl border border-border bg-gradient-to-br from-primary/20 to-background-deep p-2">
          <span className="font-ui text-[10px] text-muted-foreground">สไลด์ {i + 1}</span>
          <span className="font-display text-[11px] font-bold leading-tight">{s}</span>
        </div>
      ))}
    </div>
  </div>
);

/* ----------------------------------------------------------------------- FAQ */

export const FaqSection = () => (
  <div id="faq" className="flex flex-col gap-2">
    {PUBLIC_FAQS.map(f => (
      <details key={f.q} className="group rounded-2xl border border-border bg-card p-4">
        <summary className="min-h-11 cursor-pointer list-none font-display text-sm font-bold marker:hidden">{f.q}</summary>
        <p className="mt-2 font-body text-xs leading-7 text-muted-foreground md:text-sm">{f.a}</p>
      </details>
    ))}
  </div>
);

/* ------------------------------------------------------------------ final CTA */

export const FinalCta = () => (
  <section className="mx-auto w-full max-w-6xl px-4 py-12">
    <div className="rounded-3xl bg-gradient-ai p-[1.5px]">
      <div className="rounded-3xl bg-background-deep px-5 py-10 text-center md:px-10 md:py-14">
        <h2 className="mx-auto max-w-2xl font-display text-2xl font-extrabold leading-tight md:text-4xl">
          พร้อมเปลี่ยนความรู้ของคุณ
          <br />ให้กลายเป็นผลงานหรือยัง?
        </h2>
        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
          {['YouTube', 'PDF', 'Website', 'ไอเดีย', 'บันทึกของคุณ'].map(s => (
            <span key={s} className="rounded-lg border border-border bg-card px-2 py-1 font-ui text-[11px]">เริ่มจาก {s}</span>
          ))}
        </div>
        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
          <Link to="/register" className="flex min-h-12 items-center justify-center gap-1.5 rounded-full bg-gradient-ai px-6 font-ui text-sm font-bold text-primary-foreground">
            <Sparkles className="h-4 w-4" /> เริ่มสร้างฟรี
          </Link>
          <Link to="/showcase" className="flex min-h-12 items-center justify-center rounded-full border border-border px-6 font-ui text-sm font-bold">
            ดูตัวอย่าง
          </Link>
        </div>
        <p className="mt-3 font-ui text-[11px] text-muted-foreground">
          เริ่มทดลองได้ฟรี ไม่จำเป็นต้องสร้างหนังสือทั้งเล่มในครั้งแรก
        </p>
      </div>
    </div>
  </section>
);

export const MicIcon = Mic;
