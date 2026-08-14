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
    { title: 'WRITE', value: 'หนังสือ & คู่มือ', to: '/book', icon: BookOpen },
    { title: 'PRESENT', value: 'สไลด์ & PPTX', to: '/present', icon: Presentation },
    { title: 'NOTES', value: `${notes.length} โน้ต`, to: '/chat', icon: NotebookPen },
    { title: 'EXPORTS', value: 'Word · PDF · EPUB · PPTX', to: '/book', icon: FileDown },
  ];

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 p-4">
        <section className="rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-[11px] font-ui font-bold uppercase tracking-wide text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" /> PaperPetal AI
          </div>
          <h1 className="mt-1 font-heading text-2xl font-bold leading-tight md:text-3xl">
            AI Knowledge, Book & Presentation Studio
          </h1>
          <p className="mt-2 text-sm font-body text-muted-foreground">
            แหล่งข้อมูลของคุณ → ความรู้ของคุณ → หนังสือของคุณ → พรีเซนเทชันของคุณ
          </p>
          <p className="mt-1 text-xs font-ui text-muted-foreground">
            โปรเจกต์: {projectName} · ใช้งาน {activeSources.length}/{sources.length} แหล่ง
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/knowledge" className="flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-ui font-bold text-primary-foreground">
              เพิ่มแหล่งข้อมูล
            </Link>
            <Link to="/chat" className="flex min-h-11 items-center gap-2 rounded-full border border-border bg-background px-5 text-sm font-ui font-bold">
              ถาม PaperPetal
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {tiles.map(t => (
            <Link key={t.title} to={t.to} className="rounded-2xl border border-border bg-background p-4 transition-colors hover:bg-card">
              <t.icon className="h-5 w-5 text-primary" />
              <div className="mt-2 text-[11px] font-ui font-bold tracking-wide text-muted-foreground">{t.title}</div>
              <div className="font-heading text-sm font-bold">{t.value}</div>
            </Link>
          ))}
        </section>

        <section>
          <h2 className="mb-2 font-heading text-base font-bold">+ CREATE — อยากสร้างอะไร?</h2>
          <div className="flex flex-wrap gap-2">
            {CREATE_OPTIONS.map(o => (
              <Link
                key={o.label}
                to={o.to}
                className="min-h-10 rounded-full border border-border bg-card px-4 py-2.5 text-xs font-ui font-semibold hover:bg-accent"
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
