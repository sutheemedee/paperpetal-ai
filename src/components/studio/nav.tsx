import { useAuth } from '@/auth/AuthProvider';
import { Link, useLocation } from 'react-router-dom';
import {
  BookOpen,
  CreditCard,
  FileDown,
  Images,
  LayoutDashboard,
  Layers,
  MessageCircle,
  Plus,
  LayoutTemplate,
  Presentation,
  Settings,
  Sparkles,
} from 'lucide-react';

/** Mobile bottom navigation entries — Home, Sources, Create, Chat, Projects. */
export const NAV = [
  { to: '/dashboard', label: 'หน้าหลัก', short: 'Home', icon: LayoutDashboard },
  { to: '/knowledge', label: 'แหล่งข้อมูล', short: 'Sources', icon: Layers },
  { to: '/create', label: 'สร้าง', short: 'Create', icon: Plus, primary: true },
  { to: '/chat', label: 'AI Chat', short: 'Chat', icon: MessageCircle },
  { to: '/projects', label: 'โปรเจกต์', short: 'Projects', icon: Presentation },
];

/** Full desktop sidebar map, grouped. */
export const SIDEBAR_GROUPS: {
  label: string;
  items: { to: string; label: string; icon: typeof LayoutDashboard }[];
}[] = [
  {
    label: 'Workspace',
    items: [
      { to: '/dashboard', label: 'แดชบอร์ด', icon: LayoutDashboard },
      { to: '/knowledge', label: 'แหล่งข้อมูล', icon: Layers },
      { to: '/chat', label: 'AI Chat', icon: MessageCircle },
    ],
  },
  {
    label: 'Create',
    items: [
      { to: '/create', label: 'สร้างงานใหม่', icon: Plus },
      { to: '/templates', label: 'เทมเพลต', icon: LayoutTemplate },
      { to: '/book', label: 'เขียนหนังสือ', icon: BookOpen },
      { to: '/present', label: 'พรีเซนต์', icon: Presentation },
      { to: '/projects', label: 'โปรเจกต์', icon: Images },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/pricing', label: 'แผน & ราคา', icon: Sparkles },
      { to: '/billing', label: 'บิล & ใบแจ้งหนี้', icon: CreditCard },
      { to: '/projects', label: 'ศูนย์ส่งออก', icon: FileDown },
    ],
  },
];

const isActivePath = (pathname: string, to: string) =>
  pathname === to || (to !== '/dashboard' && pathname.startsWith(`${to}/`));

export const DesktopNav = () => {
  const { pathname } = useLocation();
  return (
    <nav className="hidden items-center gap-1 md:flex lg:hidden">
      {NAV.map(n => {
        const active = isActivePath(pathname, n.to);
        return (
          <Link
            key={n.to}
            to={n.to}
            className={`press flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-ui font-semibold transition-colors ${
              active
                ? 'bg-surface-hover text-foreground shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.35)]'
                : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
            }`}
          >
            <n.icon className="h-4 w-4" />
            <span className="sr-only">{n.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

/** Persistent desktop sidebar — 248px, sidebar surface, subtle brand selection. */
export const SidebarNav = () => {
  const { account, isAdmin } = useAuth();
  const { pathname } = useLocation();
  return (
    <nav className="flex flex-col gap-5 p-3">
      {SIDEBAR_GROUPS.map(group => (
        <div key={group.label} className="flex flex-col gap-1">
          <p className="px-3 pb-1 text-[10px] font-ui font-bold uppercase tracking-[0.16em] text-muted-foreground">
            {group.label}
          </p>
          {group.items.map(item => {
            const active = isActivePath(pathname, item.to);
            return (
              <Link
                key={`${group.label}-${item.to}`}
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={`press relative flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm font-ui font-semibold transition-colors ${
                  active
                    ? 'bg-gradient-subtle text-foreground'
                    : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-paperpetal" />
                )}
                <item.icon className={`h-[18px] w-[18px] ${active ? 'text-primary' : ''}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
      {!(isAdmin || account?.planCode === 'unlimited') && (
      <Link
        to="/pricing"
        className="press mx-1 mt-1 rounded-xl border border-border bg-gradient-subtle p-3 text-xs font-ui text-secondary-foreground hover:border-strong"
      >
        <span className="flex items-center gap-1.5 font-bold text-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> อัปเกรดแผน
        </span>
        <span className="mt-1 block text-muted-foreground">ปลดล็อกโควต้า AI และการส่งออกทุกรูปแบบ</span>
      </Link>
      )}
      <Link
        to="/billing"
        className="press mx-1 flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm font-ui font-semibold text-muted-foreground hover:bg-surface-hover hover:text-foreground"
      >
        <Settings className="h-[18px] w-[18px]" /> ตั้งค่าบัญชี
      </Link>
    </nav>
  );
};

/** Bottom navigation for phones — 44px+ targets, safe-area aware, gradient Create. */
export const MobileNav = () => {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-border bg-sidebar/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      {NAV.map(n => {
        const active = isActivePath(pathname, n.to);
        if (n.primary) {
          return (
            <Link
              key={n.to}
              to={n.to}
              aria-current={active ? 'page' : undefined}
              className="flex min-h-[56px] flex-col items-center justify-center gap-1 text-[11px] font-ui font-semibold text-muted-foreground"
            >
              <span className="press flex h-9 w-11 items-center justify-center rounded-2xl bg-gradient-paperpetal text-primary-foreground shadow-[var(--shadow-glow)]">
                <n.icon className="h-5 w-5" />
              </span>
              <span className={active ? 'text-foreground' : ''}>{n.label}</span>
            </Link>
          );
        }
        return (
          <Link
            key={n.to}
            to={n.to}
            aria-current={active ? 'page' : undefined}
            className={`press flex min-h-[56px] flex-col items-center justify-center gap-1 text-[11px] font-ui font-semibold ${
              active ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            <span
              className={`flex h-8 w-11 items-center justify-center rounded-xl transition-colors ${
                active ? 'bg-surface-hover text-primary shadow-[0_0_18px_-6px_hsl(var(--primary)/0.8)]' : ''
              }`}
            >
              <n.icon className="h-[18px] w-[18px]" />
            </span>
            <span>{n.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
