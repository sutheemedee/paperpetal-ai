import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Bot, BrainCircuit, FileSearch, FileText, Image, Layers3, UploadCloud } from 'lucide-react';
import PublicHeader from '@/components/marketing/PublicHeader';
import PublicFooter from '@/components/marketing/PublicFooter';
import Seo, { breadcrumbJsonLd, webPageJsonLd } from '@/components/Seo';

const engines = [
  { icon: BrainCircuit, n: '01', title: 'Knowledge Engine', body: 'รับข้อมูลจากหลายแหล่ง วิเคราะห์ สรุป ค้นหา และเชื่อมโยงความรู้ให้กลายเป็นฐานข้อมูลที่ AI ใช้ต่อได้' },
  { icon: Bot, n: '02', title: 'Ask KIVORA', body: 'ผู้ช่วย AI ที่ตอบโดยอิงบริบทของโปรเจกต์ แหล่งข้อมูล และเป้าหมายของงาน ไม่ใช่แค่แชตทั่วไป' },
  { icon: BookOpen, n: '03', title: 'Writing Engine', body: 'เปลี่ยน outline เป็นบท เนื้อหา ตัวอย่าง และ revision พร้อมควบคุมโทนภาษาและกลุ่มผู้อ่าน' },
  { icon: FileSearch, n: '04', title: 'Research Engine', body: 'จัดโครงสร้างงานวิจัย แหล่งอ้างอิง literature review และ citation area สำหรับงานที่ต้องตรวจสอบได้' },
  { icon: Image, n: '05', title: 'Visual Director', body: 'กำหนดทิศทางภาพ ปก ไดอะแกรม infographic ภาพประกอบ และความหนาแน่นของ visual ให้เข้ากับเนื้อหา' },
  { icon: UploadCloud, n: '06', title: 'Publishing Engine', body: 'เตรียมงานเพื่อส่งออกเป็น PDF, DOCX, EPUB, PPTX และภาพปก โดยรักษาโครงสร้างงานให้ต่อเนื่อง' },
];

const steps = ['SOURCE', 'KNOWLEDGE', 'STRUCTURE', 'CREATE', 'DESIGN', 'REVIEW', 'EXPORT'];

const Features = () => (
  <div className="min-h-[100dvh] bg-[#070A18] text-white">
    <Seo
      path="/features"
      title="ความสามารถของ KIVORA | AI Knowledge Engine"
      description="ดูว่า KIVORA เปลี่ยนแหล่งข้อมูลต้นทางให้เป็นหนังสือ สไลด์ รายงาน และผลงานพร้อมเผยแพร่ได้อย่างไร"
      jsonLd={[
        breadcrumbJsonLd([{ name: 'หน้าแรก', path: '/' }, { name: 'ความสามารถ', path: '/features' }]),
        webPageJsonLd({
          name: 'ความสามารถของ KIVORA',
          description: 'KIVORA รวม Knowledge Engine, AI Director, Writing, Research, Visual และ Publishing Engine เพื่อเปลี่ยน Source ให้เป็นผลงานพร้อมเผยแพร่',
          path: '/features',
          about: ['Knowledge Engine', 'AI Writing', 'Research Engine', 'Visual Director', 'Publishing Engine'],
        }),
      ]}
    />
    <PublicHeader />
    <main>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-[0.9fr_1.1fr] md:items-center md:py-16">
        <div>
          <p className="text-xs font-ui font-bold uppercase tracking-[0.16em] text-cyan-300">Product Capabilities</p>
          <h1 className="thai-heading-safe mt-3 max-w-3xl font-heading text-4xl font-extrabold md:text-5xl">
            ความสามารถของ KIVORA
          </h1>
          <p className="thai-safe mt-4 max-w-2xl text-base text-slate-300 md:text-lg">
            AI Workspace ที่เปลี่ยนข้อมูลต้นทางให้กลายเป็นผลงานพร้อมเผยแพร่ ตั้งแต่เข้าใจแหล่งข้อมูล วางโครงสร้าง เขียน สร้างภาพ อ้างอิง ไปจนถึงส่งออกไฟล์
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to="/create-with-kivora" className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-ai px-5 text-sm font-ui font-bold text-primary-foreground">
              ดูสิ่งที่สร้างได้ <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/showcase" className="flex min-h-12 items-center justify-center rounded-xl border border-white/10 px-5 text-sm font-ui font-bold">
              ดูตัวอย่างผลงาน
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#10172B] p-4 md:p-5">
          <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1.1fr] md:items-center">
            <div className="grid gap-2">
              {['YouTube', 'PDF', 'Website', 'Document', 'Notes'].map(item => (
                <div key={item} className="flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm font-ui text-slate-200">
                  <FileText className="h-4 w-4 text-cyan-300" /> {item}
                </div>
              ))}
            </div>
            <ArrowRight className="hidden h-5 w-5 text-slate-500 md:block" />
            <div className="rounded-2xl border border-violet-400/30 bg-violet-400/10 p-5 text-center">
              <BrainCircuit className="mx-auto h-9 w-9 text-violet-200" />
              <p className="mt-3 text-xs font-ui font-bold uppercase tracking-[0.14em] text-violet-100">KIVORA</p>
              <h2 className="thai-heading-safe mt-1 font-heading text-xl font-extrabold">Knowledge Engine</h2>
            </div>
            <ArrowRight className="hidden h-5 w-5 text-slate-500 md:block" />
            <div className="grid grid-cols-2 gap-2">
              {['Understand', 'Structure', 'Write', 'Visualize', 'Cite', 'Publish'].map(item => (
                <div key={item} className="min-h-12 rounded-xl border border-white/10 bg-[#070A18] px-3 py-2 text-xs font-ui font-bold text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#090E1D]">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <h2 className="thai-heading-safe font-heading text-2xl font-extrabold md:text-4xl">Core Engines</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {engines.map(engine => (
              <article key={engine.title} className="rounded-2xl border border-white/10 bg-[#10172B] p-5">
                <div className="flex items-start justify-between gap-4">
                  <span className="font-display text-3xl font-extrabold text-white/12">{engine.n}</span>
                  <engine.icon className="h-6 w-6 text-cyan-300" />
                </div>
                <h3 className="thai-heading-safe mt-5 font-heading text-lg font-extrabold">{engine.title}</h3>
                <p className="thai-safe mt-2 text-sm text-slate-400">{engine.body}</p>
                <div className="mt-4 rounded-xl border border-white/10 bg-[#070A18] p-3">
                  <div className="flex gap-2">
                    <span className="h-2 flex-1 rounded bg-violet-300/50" />
                    <span className="h-2 flex-1 rounded bg-cyan-300/50" />
                    <span className="h-2 flex-1 rounded bg-pink-300/50" />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <span className="min-h-10 rounded bg-white/8" />
                    <span className="min-h-10 rounded bg-white/8" />
                    <span className="min-h-10 rounded bg-white/8" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="thai-heading-safe text-center font-heading text-2xl font-extrabold md:text-4xl">From Source To Publish</h2>
        <div className="mt-7 grid gap-2 md:grid-cols-7">
          {steps.map((step, i) => (
            <div key={step} className="relative rounded-xl border border-white/10 bg-[#10172B] p-4 text-center">
              <span className="text-[10px] font-ui font-bold text-slate-500">0{i + 1}</span>
              <p className="mt-1 text-xs font-ui font-bold text-slate-100">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#090E1D]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
          <div>
            <p className="text-xs font-ui font-bold uppercase tracking-[0.16em] text-violet-300">AI Director</p>
            <h2 className="thai-heading-safe mt-3 max-w-[18ch] font-heading text-[1.75rem] font-extrabold md:text-[2.15rem] lg:text-[2.35rem]">ผู้ช่วยที่เข้าใจงานทั้งชิ้น<br className="hidden sm:block" /> ไม่ใช่แค่ข้อความล่าสุด</h2>
            <p className="thai-safe mt-4 max-w-[62ch] text-sm text-slate-400 md:text-[0.95rem]">
              AI Director มองเห็นโครงเรื่อง แหล่งข้อมูล สไตล์ภาพ และเป้าหมายการส่งออก จึงช่วยปรับบท ขยายหัวข้อ เพิ่มตัวอย่าง หรือเสนอภาพประกอบได้ตรงบริบท
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#10172B] p-4">
            <div className="grid gap-4 md:grid-cols-[1fr_240px]">
              <div className="min-h-[260px] rounded-xl bg-[#070A18] p-5">
                <p className="text-xs font-ui text-cyan-300">CHAPTER 1</p>
                <h3 className="thai-heading-safe mt-3 font-heading text-3xl font-extrabold">The Dawn of Intelligent Era</h3>
                <div className="mt-5 min-h-28 rounded-xl bg-gradient-to-br from-[#2D7CFF]/40 via-[#7C3AED]/30 to-[#00CFFF]/25" />
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-ui font-bold">AI Assistant</p>
                {['เพิ่มข้อมูลอ้างอิง', 'ขยายส่วนนี้', 'เพิ่มตัวอย่าง'].map(item => (
                  <div key={item} className="mt-3 rounded-xl border border-white/10 bg-[#070A18] p-3 text-xs text-slate-300">{item}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
    <PublicFooter />
  </div>
);

export default Features;
