import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Home, Layers, MessageCircle, Presentation, Sparkles } from 'lucide-react';

const NAV = [
  { to: '/', label: 'หน้าแรก', icon: Home },
  { to: '/knowledge', label: 'Knowledge', icon: Layers },
  { to: '/chat', label: 'AI Chat', icon: MessageCircle },
  { to: '/book', label: 'Write', icon: BookOpen },
  { to: '/present', label: 'Present', icon: Presentation },
];

const AppShell = ({ children, title }: { children: React.ReactNode; title?: string }) => {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="text-xl">🌸</span>
          <span className="truncate font-heading text-sm font-bold md:text-base">
            {title || 'PaperPetal AI'}
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map(n => (
            <Link
              key={n.to}
              to={n.to}
              className={`flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-ui font-semibold transition-colors ${
                pathname === n.to ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
              }`}
            >
              <n.icon className="h-3.5 w-3.5" />
              {n.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/knowledge"
          className="flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-ui font-semibold md:hidden"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Sources
        </Link>
      </header>

      <main className="flex-1 pb-20 md:pb-0">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-5 border-t border-border bg-background/95 backdrop-blur md:hidden">
        {NAV.map(n => (
          <Link
            key={n.to}
            to={n.to}
            className={`flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-ui ${
              pathname === n.to ? 'text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            <span
              className={`flex h-7 w-9 items-center justify-center rounded-full ${
                pathname === n.to ? 'bg-primary' : ''
              }`}
            >
              <n.icon className="h-4 w-4" />
            </span>
            {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default AppShell;
