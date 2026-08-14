import { Link } from 'react-router-dom';
import { BookOpen, FileDown, Layers, MessageCircle, NotebookPen, Presentation, Sparkles } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { useKnowledge } from '@/knowledge/store';

const CREATE_OPTIONS = [
  { label: 'หนังสือ / eBook', to: '/book' },
  { label: 'คู่มือ / Manual', to: '/book' },
  { label: 'คอร์ส / Workbook', to: '/book' },
  { label: 'บทความ / รายงาน', to: '/book' },
  { label: 'พรีเซนเทชัน', to: '/present' },
  { label: 'สรุป / Study Guide', to: '/chat' },
];

const Home = () => {
  const { sources, notes, activeSources, projectName } = useKnowledge();

  const tiles = [
    { title: 'KNOWLEDGE', value: `${sources.length} แหล่งข้อมูล`, to: '/knowledge', icon: Layers },
    { title: 'AI CHAT', value: 'ถามจากแหล่งข้อมูล', to: '/chat', icon: MessageCircle },
    { title: 'BOOK', value: 'หนังสือ & คู่มือ', to: '/book', icon: BookOpen },
    { title: 'PRESENTATION', value: 'สไลด์ & PPTX', to: '/present', icon: Presentation },
    { title: 'NOTES', value: `${notes.length} โน้ต`, to: '/chat', icon: NotebookPen },
    { title: 'EXPORTS', value: 'Word · PDF · EPUB · PPTX', to: '/book', icon: FileDown },
  ];

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 p-4 md:p-6">
        <section className="rounded-3xl border border-border bg-card p-5 md:p-7">
          <div className="flex items-center gap-2 text-xs font-ui font-bold uppercase tracking-wide text-muted-foreground">
            <Sparkles className="h-4 w-4" /> PaperPetal AI
          </div>
          <h1 className="mt-1 font-heading text-2xl font-bold leading-tight md:text-4xl">
            AI Knowledge, Book & Presentation Studio
          </h1>
          <p className="mt-2 text-sm font-body text-muted-foreground md:text-base">
            แหล่งข้อมูลของคุณ → ความรู้ของคุณ → หนังสือของคุณ → พรีเซนเทชันของคุณ
          </p>
          <p className="mt-1 text-xs font-ui text-muted-foreground md:text-sm">
            โปรเจกต์: {projectName} · ใช้งาน {activeSources.length}/{sources.length} แหล่ง
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Link to="/knowledge" className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-ui font-bold text-primary-foreground">
              เพิ่มแหล่งข้อมูล
            </Link>
            <Link to="/chat" className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-border bg-background px-5 text-sm font-ui font-bold">
              ถาม PaperPetal
            </Link>
            <Link to="/book" className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-border bg-background px-5 text-sm font-ui font-bold">
              สร้างหนังสือ
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map(t => (
            <Link
              key={t.title}
              to={t.to}
              className="flex min-h-[88px] flex-col justify-center rounded-2xl border border-border bg-background p-4 transition-colors hover:bg-card"
            >
              <t.icon className="h-5 w-5 text-primary" />
              <div className="mt-2 text-xs font-ui font-bold tracking-wide text-muted-foreground">{t.title}</div>
              <div className="font-heading text-base font-bold">{t.value}</div>
            </Link>
          ))}
        </section>

        <section>
          <h2 className="mb-2 font-heading text-lg font-bold">+ CREATE — อยากสร้างอะไร?</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {CREATE_OPTIONS.map(o => (
              <Link
                key={o.label}
                to={o.to}
                className="flex min-h-12 items-center rounded-2xl border border-border bg-card px-4 text-sm font-ui font-semibold hover:bg-accent"
              >
                {o.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
};

export default Home;
