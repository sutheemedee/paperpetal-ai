import { Link } from 'react-router-dom';
import { Search, Sparkles } from 'lucide-react';
import { DesktopNav, MobileNav, SidebarNav } from '@/components/studio/nav';
import AccountMenu from '@/components/account/AccountMenu';
import { PetalMark } from '@/components/brand/Logo';
import QuotaAlertBanner from '@/components/account/QuotaAlertBanner';
import { useEntitlements } from '@/auth/useEntitlements';
import { useAuth } from '@/auth/AuthProvider';

const UsageChip = () => {
  const { usage } = useEntitlements();
  const { used, limit, ratio } = usage('aiPages');
  const pct = Math.min(100, Math.round(ratio * 100));
  return (
    <Link
      to="/billing"
      className="hidden min-h-10 flex-col justify-center rounded-xl border border-border bg-elevated px-3 py-1.5 hover:border-strong lg:flex"
      title="โควต้า AI Pages เดือนนี้"
    >
      <span className="text-[10px] font-ui font-bold uppercase tracking-[0.14em] text-muted-foreground">AI Pages</span>
      <span className="flex items-center gap-2">
        <span className="text-xs font-ui font-bold tabular-nums">
          {used.toLocaleString()}
          <span className="text-muted-foreground"> / {limit === null ? 'Fair Use' : limit.toLocaleString()}</span>
        </span>
        <span className="h-1.5 w-12 overflow-hidden rounded-full bg-surface-hover">
          <span className="block h-full rounded-full bg-gradient-paperpetal" style={{ width: `${pct}%` }} />
        </span>
      </span>
    </Link>
  );
};

const AppShell = ({ children, title }: { children: React.ReactNode; title?: string }) => {
  const { user, account } = useAuth();

  return (
    <div className="flex min-h-[100dvh] bg-background">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-[100dvh] w-[248px] shrink-0 flex-col overflow-y-auto border-r border-border bg-sidebar lg:flex">
        <Link to="/dashboard" className="flex min-h-16 items-center gap-2 px-4">
          <PetalMark className="h-8 w-8 shrink-0" />
          <span className="min-w-0">
            <span className="block truncate font-display text-sm font-bold">PaperPetal AI</span>
            <span className="block truncate text-[10px] font-ui uppercase tracking-[0.14em] text-muted-foreground">
              {account?.planName ?? 'Knowledge Studio'}
            </span>
          </span>
        </Link>
        <SidebarNav />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top command bar — 64px desktop */}
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-2 border-b border-border bg-background/90 px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur md:px-4">
          <Link to="/dashboard" className="flex min-w-0 items-center gap-2 lg:hidden">
            <PetalMark className="h-8 w-8 shrink-0" />
            <span className="truncate font-display text-sm font-bold md:text-base">{title || 'PaperPetal AI'}</span>
          </Link>
          <span className="hidden min-w-0 truncate font-display text-base font-bold lg:block">
            {title || 'PaperPetal AI'}
          </span>

          <div className="flex items-center gap-2">
            <DesktopNav />
            <Link
              to="/knowledge"
              aria-label="ค้นหาแหล่งข้อมูล"
              className="press hidden h-10 w-10 items-center justify-center rounded-xl border border-border bg-elevated text-muted-foreground hover:text-foreground md:flex"
            >
              <Search className="h-4 w-4" />
            </Link>
            {user && <UsageChip />}
            {user && account?.planCode !== 'unlimited' && (
              <Link
                to="/pricing"
                className="press hidden min-h-10 items-center gap-1.5 rounded-xl bg-gradient-paperpetal px-3 text-xs font-ui font-bold text-primary-foreground shadow-[var(--shadow-glow)] sm:flex"
              >
                <Sparkles className="h-3.5 w-3.5" /> อัปเกรด
              </Link>
            )}
            <AccountMenu />
          </div>
        </header>

        <main className="w-full flex-1 overflow-x-hidden pb-[calc(72px+env(safe-area-inset-bottom))] md:pb-0">
          <div className="px-4 pt-3 empty:hidden">
            <QuotaAlertBanner />
          </div>
          {children}
        </main>
      </div>

      <MobileNav />
    </div>
  );
};

export default AppShell;
