import { Link } from 'react-router-dom';
import { Flower2, Sparkles } from 'lucide-react';
import { DesktopNav, MobileNav } from '@/components/studio/nav';

const AppShell = ({ children, title }: { children: React.ReactNode; title?: string }) => {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-border bg-background/95 px-3 py-2 backdrop-blur md:px-4">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <Flower2 className="h-5 w-5 shrink-0 text-primary" />
          <span className="truncate font-heading text-sm font-bold md:text-base">
            {title || 'PaperPetal AI'}
          </span>
        </Link>
        <DesktopNav />
        <Link
          to="/knowledge"
          className="flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-ui font-semibold md:hidden"
        >
          <Sparkles className="h-4 w-4" />
          Sources
        </Link>
      </header>

      <main className="w-full flex-1 overflow-x-hidden pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </main>

      <MobileNav />
    </div>
  );
};

export default AppShell;
