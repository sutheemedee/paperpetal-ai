import { Link } from 'react-router-dom';
import { PetalMark } from '@/components/brand/Logo';

const COLUMNS: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: 'PRODUCT',
    links: [
      { label: 'ความสามารถ', to: '/features' },
      { label: 'เทมเพลต', to: '/templates' },
      { label: 'ตัวอย่างผลงาน', to: '/showcase' },
      { label: 'ราคา', to: '/pricing' },
    ],
  },
  {
    title: 'RESOURCES',
    links: [
      { label: 'หนังสือ / eBook', to: '/showcase?category=book' },
      { label: 'Research', to: '/showcase?category=academic' },
      { label: 'Presentation', to: '/showcase?category=presentation' },
      { label: 'Manga / Comic', to: '/showcase?category=manga' },
      { label: 'Kids', to: '/showcase?category=kids' },
    ],
  },
  {
    title: 'LEGAL',
    links: [
      { label: 'นโยบายความเป็นส่วนตัว', to: '/privacy' },
      { label: 'เงื่อนไขการใช้บริการ', to: '/terms' },
      { label: 'AI Policy', to: '/ai-policy' },
    ],
  },
  {
    title: 'CONTACT',
    links: [
      { label: 'เกี่ยวกับเรา', to: '/about' },
      { label: 'ติดต่อ / ฝ่ายสนับสนุน', to: '/contact' },
      { label: 'Help', to: '/help' },
    ],
  },
];

const PublicFooter = () => (
  <footer className="border-t border-border bg-card/40">
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 md:grid-cols-[1.4fr_repeat(4,1fr)]">
      <div>
        <div className="flex items-center gap-2">
          <PetalMark className="h-8 w-8" />
          <span className="font-display text-sm font-bold">KIVORA</span>
        </div>
        <p className="mt-2 max-w-xs text-xs font-ui text-muted-foreground">
          AI Knowledge, Book &amp; Presentation Studio — เปลี่ยนแหล่งข้อมูลของคุณให้เป็นผลงานที่พร้อมเผยแพร่
        </p>
      </div>
      {COLUMNS.map(col => (
        <nav key={col.title} aria-label={col.title}>
          <h2 className="font-ui text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{col.title}</h2>
          <ul className="mt-2 flex flex-col">
            {col.links.map(l => (
              <li key={l.label}>
                <Link to={l.to} className="flex min-h-9 items-center text-xs font-ui text-foreground/80 hover:text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ))}
    </div>
    <div className="border-t border-border px-4 py-4 text-center text-[11px] font-ui text-muted-foreground">
      © {new Date().getFullYear()} KIVORA · ตัวอย่างผลงานทั้งหมดในเว็บไซต์นี้เป็นโปรเจกต์สาธิตที่สร้างด้วย AI
    </div>
  </footer>
);

export default PublicFooter;
