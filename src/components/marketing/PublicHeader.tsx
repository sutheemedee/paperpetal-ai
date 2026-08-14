import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Menu, Sparkles, X } from 'lucide-react';
import { PetalMark } from '@/components/brand/Logo';
import { useAuth } from '@/auth/AuthProvider';

const LINKS = [
  { to: '/', label: 'หน้าแรก' },
  { to: '/features', label: 'ความสามารถ' },
  { to: '/showcase', label: 'ตัวอย่างผลงาน' },
  { to: '/pricing', label: 'แพ็กเกจ' },
  { to: '/about', label: 'เกี่ยวกับเรา' },
];

/** Sticky public marketing header. Swaps sign-in CTA for a dashboard CTA when signed in. */
const PublicHeader = () => {
  const { session, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const initial = (profile?.display_name || session?.user?.email || 'P').slice(0, 1).toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-2.5">
        <Link to="/" className="flex shrink-0 items-center gap-2" onClick={() => setOpen(false)}>
          <PetalMark className="h-8 w-8" />
          <span className="font-display text-sm font-bold md:text-base">PaperPetal AI</span>
        </Link>

        <nav className="mx-auto hidden items-center gap-1 lg:flex">
          {LINKS.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `flex min-h-11 items-center rounded-full px-3 text-xs font-ui font-bold transition-colors ${
                  isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          {session ? (
            <>
              <Link
                to="/dashboard"
                className="flex min-h-11 items-center gap-1.5 rounded-full bg-gradient-ai px-4 text-xs font-ui font-bold text-primary-foreground"
              >
                <LayoutDashboard className="h-4 w-4" /> เปิด Dashboard
              </Link>
              <Link
                to="/dashboard"
                aria-label="บัญชีของฉัน"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card font-display text-sm font-bold"
              >
                {initial}
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden min-h-11 items-center rounded-full border border-border px-4 text-xs font-ui font-bold sm:flex"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                to="/register"
                className="flex min-h-11 items-center gap-1.5 rounded-full bg-gradient-ai px-4 text-xs font-ui font-bold text-primary-foreground"
              >
                <Sparkles className="h-4 w-4" /> เริ่มใช้ฟรี
              </Link>
            </>
          )}
          <button
            type="button"
            aria-label={open ? 'ปิดเมนู' : 'เปิดเมนู'}
            aria-expanded={open}
            onClick={() => setOpen(v => !v)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-card px-4 py-2 lg:hidden">
          {LINKS.map(l => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`flex min-h-12 items-center rounded-xl px-3 text-sm font-ui font-bold ${
                pathname === l.to ? 'bg-secondary text-foreground' : 'text-muted-foreground'
              }`}
            >
              {l.label}
            </Link>
          ))}
          {!session && (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="mt-1 flex min-h-12 items-center rounded-xl border border-border px-3 text-sm font-ui font-bold sm:hidden"
            >
              เข้าสู่ระบบ
            </Link>
          )}
        </nav>
      )}
    </header>
  );
};

export default PublicHeader;
