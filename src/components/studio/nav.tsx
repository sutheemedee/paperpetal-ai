import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Home, Layers, MessageCircle, Presentation } from 'lucide-react';

export const NAV = [
  { to: '/', label: 'หน้าแรก', short: 'Home', icon: Home },
  { to: '/knowledge', label: 'แหล่งข้อมูล', short: 'Sources', icon: Layers },
  { to: '/book', label: 'สร้าง', short: 'Create', icon: BookOpen, primary: true },
  { to: '/chat', label: 'AI Chat', short: 'Chat', icon: MessageCircle },
  { to: '/present', label: 'พรีเซนต์', short: 'Present', icon: Presentation },
];

export const DesktopNav = () => {
  const { pathname } = useLocation();
  return (
    <nav className="hidden items-center gap-1 md:flex">
      {NAV.map(n => (
        <Link
          key={n.to}
          to={n.to}
          className={`flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-ui font-semibold transition-colors ${
            pathname === n.to ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
          }`}
        >
          <n.icon className="h-4 w-4" />
          <span className="hidden lg:inline">{n.label}</span>
        </Link>
      ))}
    </nav>
  );
};

/** Bottom navigation for phones — 44px+ targets and safe-area aware. */
export const MobileNav = () => {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      {NAV.map(n => {
        const active = pathname === n.to;
        return (
          <Link
            key={n.to}
            to={n.to}
            aria-current={active ? 'page' : undefined}
            className="flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[11px] font-ui font-semibold text-muted-foreground"
          >
            <span
              className={`flex h-8 w-11 items-center justify-center rounded-full transition-colors ${
                active
                  ? 'bg-primary text-primary-foreground'
                  : n.primary
                    ? 'border border-primary text-foreground'
                    : ''
              }`}
            >
              <n.icon className="h-[18px] w-[18px]" />
            </span>
            <span className={active ? 'text-foreground' : ''}>{n.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
