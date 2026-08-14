import * as React from 'react';
import { Link } from 'react-router-dom';
import { Flower2, PanelLeft, Sliders } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useDevice } from '@/hooks/use-device';
import { DesktopNav, MobileNav } from './nav';

interface PanelSpec {
  label: string;
  content: React.ReactNode;
}

interface StudioLayoutProps {
  title: string;
  subtitle?: string;
  /** Navigator: sources / chapters / slides */
  left?: PanelSpec;
  /** AI Director / properties */
  right?: PanelSpec;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Three-pane studio shell that recomposes per device:
 * desktop = left navigator + large canvas + AI Director,
 * tablet  = collapsible navigator + canvas + AI drawer,
 * mobile  = single canvas workspace + drawer/bottom-sheet panels.
 */
const StudioLayout = ({ title, subtitle, left, right, headerActions, children }: StudioLayoutProps) => {
  const { isMobile, isTablet, isDesktop, isCompactLandscape } = useDevice();
  const [leftOpen, setLeftOpen] = React.useState(false);
  const [rightOpen, setRightOpen] = React.useState(false);
  const [leftPinned, setLeftPinned] = React.useState(true);

  const showLeftInline = isDesktop && leftPinned && !!left;
  const showRightInline = isDesktop && !!right;

  const iconBtn =
    'flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-accent';

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background">
      <header className="flex shrink-0 items-center gap-2 border-b border-border bg-background/95 px-3 py-2 backdrop-blur md:px-4">
        {left && (
          <button
            onClick={() => (isDesktop ? setLeftPinned(p => !p) : setLeftOpen(true))}
            aria-label={left.label}
            className={`${iconBtn} ${isDesktop && leftPinned ? 'bg-accent' : ''}`}
          >
            <PanelLeft className="h-5 w-5" />
          </button>
        )}
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <Flower2 className="h-5 w-5 shrink-0 text-primary" />
          <span className="min-w-0">
            <span className="block truncate font-heading text-sm font-bold md:text-base">{title}</span>
            {subtitle && !isCompactLandscape && (
              <span className="block truncate text-[11px] font-ui text-muted-foreground md:text-xs">{subtitle}</span>
            )}
          </span>
        </Link>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {isDesktop && <DesktopNav />}
          {headerActions}
          {right && !showRightInline && (
            <button onClick={() => setRightOpen(true)} aria-label={right.label} className={iconBtn}>
              <Sliders className="h-5 w-5" />
            </button>
          )}
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {showLeftInline && (
          <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-border bg-secondary/60 p-3 xl:w-72 lg:block">
            <h2 className="mb-2 px-1 text-[11px] font-ui font-bold uppercase tracking-wide text-muted-foreground">
              {left!.label}
            </h2>
            {left!.content}
          </aside>
        )}

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">{children}</main>

        {showRightInline && (
          <aside className="hidden w-80 shrink-0 overflow-y-auto border-l border-border bg-secondary/60 p-4 xl:block">
            <h2 className="mb-2 text-[11px] font-ui font-bold uppercase tracking-wide text-muted-foreground">
              {right!.label}
            </h2>
            {right!.content}
          </aside>
        )}
      </div>

      {isMobile && <div className="h-[56px] shrink-0 pb-[env(safe-area-inset-bottom)]" />}
      {isMobile && <MobileNav />}

      {/* Navigator drawer (mobile + tablet) */}
      {left && (
        <Sheet open={leftOpen} onOpenChange={setLeftOpen}>
          <SheetContent side="left" className="w-[86vw] max-w-sm overflow-y-auto bg-background p-4">
            <SheetHeader className="text-left">
              <SheetTitle className="font-heading text-base">{left.label}</SheetTitle>
            </SheetHeader>
            <div className="mt-3">{left.content}</div>
          </SheetContent>
        </Sheet>
      )}

      {/* AI Director bottom sheet (mobile) / side drawer (tablet) */}
      {right && (
        <Sheet open={rightOpen} onOpenChange={setRightOpen}>
          <SheetContent
            side={isTablet ? 'right' : 'bottom'}
            className={
              isTablet
                ? 'w-[420px] max-w-[90vw] overflow-y-auto bg-background p-4'
                : 'max-h-[88dvh] overflow-y-auto rounded-t-3xl bg-background px-4 pb-[max(1rem,env(safe-area-inset-bottom))]'
            }
          >
            <SheetHeader className="text-left">
              <SheetTitle className="font-heading text-base">{right.label}</SheetTitle>
            </SheetHeader>
            <div className="mt-3">{right.content}</div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};

export default StudioLayout;
