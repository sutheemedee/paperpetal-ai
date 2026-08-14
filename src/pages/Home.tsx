import { Link, Navigate } from 'react-router-dom';
import {
  ArrowRight, BookOpen, Check, FileDown, Layers, MessageCircle, Presentation, ShieldCheck, Sparkles, Wand2,
} from 'lucide-react';
import { FullLogo, PetalMark } from '@/components/brand/Logo';
import { useAuth } from '@/auth/AuthProvider';
import { FALLBACK_PLANS, PLAN_HIGHLIGHTS } from '@/lib/plans';

const FEATURES = [
  { icon: Layers, title: 'Knowledge Engine', body: 'รวม YouTube, PDF, เว็บ และเอกสารของคุณให้เป็นคลังความรู้ที่ AI อ้างอิงได้' },
  { icon: MessageCircle, title: 'Ask PaperPetal', body: 'ถาม-ตอบจากแหล่งข้อมูลจริง พร้อมอ้างอิงกลับไปยังต้นทาง' },
  { icon: BookOpen, title: 'Book & Manga Studio', body: 'เขียน จัดหน้า และวาดภาพประกอบด้วย AI ตั้งแต่ปกจนถึงหน้าสุดท้าย' },
  { icon: Presentation, title: 'Presentation Studio', body: 'เปลี่ยนความรู้เป็นสไลด์พร้อมสคริปต์ผู้พูด ส่งออกเป็น PPTX แก้ไขได้' },
  { icon: FileDown, title: 'Multi-format Export', body: 'PDF พร้อมพิมพ์ · DOCX · EPUB 3 · PPTX · ปก PNG ความละเอียดสูง' },
  { icon: Wand2, title: 'Visual DNA', body: 'ล็อกสไตล์ภาพและตัวละครให้คงเส้นคงวาทั้งเล่ม' },
];

const Home = () => {
  const { session, loading } = useAuth();
  if (session && !loading) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-border bg-background/90 px-4 py-2.5 backdrop-blur">
        <Link to="/" className="flex items-center gap-2">
          <PetalMark className="h-8 w-8" />
          <span className="font-display text-sm font-bold md:text-base">PaperPetal AI</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/pricing" className="hidden min-h-11 items-center px-3 text-xs font-ui font-bold text-muted-foreground sm:flex">
            ราคา
          </Link>
          <Link to="/auth/sign-in" className="flex min-h-11 items-center rounded-full border border-border px-4 text-xs font-ui font-bold">
            เข้าสู่ระบบ
          </Link>
          <Link to="/auth/sign-up" className="flex min-h-11 items-center rounded-full bg-gradient-ai px-4 text-xs font-ui font-bold text-primary-foreground">
            เริ่มใช้ฟรี
          </Link>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-16">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] font-ui font-bold uppercase tracking-[0.14em] text-primary">
              <Sparkles className="h-3.5 w-3.5" /> AI Knowledge & Publishing Studio
            </span>
            <h1 className="mt-4 font-display text-3xl font-extrabold leading-[1.1] md:text-5xl">
              <span className="text-gradient-ai">CREATE FROM KNOWLEDGE.</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm font-body text-muted-foreground md:text-base">
              แหล่งข้อมูลของคุณ → ความรู้ของคุณ → หนังสือของคุณ → พรีเซนเทชันของคุณ
              ครบในที่เดียวด้วย AI ที่อ้างอิงข้อมูลจริงของคุณ
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Link to="/auth/sign-up" className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-ai px-6 text-sm font-ui font-bold text-primary-foreground">
                เริ่มใช้ฟรี <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/pricing" className="flex min-h-12 items-center justify-center rounded-full border border-border px-6 text-sm font-ui font-bold">
                ดูราคาและแผน
              </Link>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-[11px] font-ui text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-success" /> ไม่ต้องใช้บัตรเครดิต · งานของคุณเป็นของคุณ 100%
            </p>
          </div>
          <div className="mx-auto w-full max-w-sm">
            <FullLogo className="w-full rounded-3xl border border-border" />
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-10">
          <h2 className="font-display text-xl font-extrabold md:text-3xl">ทุกอย่างที่คุณต้องใช้ในการตีพิมพ์</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(f => (
              <div key={f.title} className="rounded-2xl border border-border bg-card p-4">
                <f.icon className="h-5 w-5 text-primary" />
                <h3 className="mt-2 font-display text-sm font-bold">{f.title}</h3>
                <p className="mt-1 text-xs font-ui text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing teaser */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-10">
          <h2 className="font-display text-xl font-extrabold md:text-3xl">แผนที่โตไปกับงานของคุณ</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {FALLBACK_PLANS.map(p => (
              <div key={p.code} className={`rounded-2xl p-[1px] ${p.badge === 'MOST POPULAR' ? 'bg-gradient-ai' : 'bg-border'}`}>
                <div className="flex h-full flex-col rounded-2xl bg-card p-4">
                  <span className="font-display text-sm font-bold uppercase">{p.name}</span>
                  <span className="mt-1 font-display text-2xl font-extrabold">
                    ฿{p.price_thb.toLocaleString()}
                    {p.price_thb > 0 && <span className="text-xs font-ui text-muted-foreground"> / เดือน</span>}
                  </span>
                  <ul className="mt-3 flex flex-1 flex-col gap-1">
                    {PLAN_HIGHLIGHTS[p.code].slice(0, 4).map(h => (
                      <li key={h} className="flex items-start gap-1.5 text-[11px] font-ui text-muted-foreground">
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-success" /> {h}
                      </li>
                    ))}
                  </ul>
                  <Link to="/auth/sign-up" className="mt-3 flex min-h-11 items-center justify-center rounded-full border border-border text-xs font-ui font-bold">
                    เริ่มต้น
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-4xl px-4 pb-16 text-center">
          <h2 className="font-display text-xl font-extrabold md:text-3xl">พร้อมเปลี่ยนความรู้ของคุณเป็นผลงาน?</h2>
          <Link to="/auth/sign-up" className="mx-auto mt-4 flex min-h-12 w-full max-w-xs items-center justify-center gap-2 rounded-full bg-gradient-ai text-sm font-ui font-bold text-primary-foreground">
            สร้างบัญชีฟรี <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>

      <footer className="border-t border-border px-4 py-6 text-center text-[11px] font-ui text-muted-foreground">
        PaperPetal AI · AI Knowledge, Book & Presentation Studio
      </footer>
    </div>
  );
};

export default Home;
