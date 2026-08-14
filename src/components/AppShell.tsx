import { Link } from 'react-router-dom';
import { DesktopNav, MobileNav } from '@/components/studio/nav';
import AccountMenu from '@/components/account/AccountMenu';
import { PetalMark } from '@/components/brand/Logo';

const AppShell = ({ children, title }: { children: React.ReactNode; title?: string }) => {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-border bg-background/95 px-3 py-2 backdrop-blur md:px-4">
        <Link to="/dashboard" className="flex min-w-0 items-center gap-2">
          <PetalMark className="h-8 w-8 shrink-0" />
          <span className="truncate font-display text-sm font-bold md:text-base">
            {title || 'PaperPetal AI'}
          </span>
        </Link>
        <DesktopNav />
        <AccountMenu />
      </header>

      <main className="w-full flex-1 overflow-x-hidden pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </main>

      <MobileNav />
    </div>
  );
};

export default AppShell;
