import { ReactNode } from 'react';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

/** Shell for every public (pre-authentication) marketing page. */
const MarketingLayout = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-[100dvh] flex-col overflow-x-hidden bg-background">
    <PublicHeader />
    <main className="flex-1">{children}</main>
    <PublicFooter />
  </div>
);

export default MarketingLayout;
