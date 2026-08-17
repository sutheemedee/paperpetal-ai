import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Menu, Search, Sparkles, X } from 'lucide-react';
import { PetalMark } from '@/components/brand/Logo';
import { useAuth } from '@/auth/AuthProvider';

const LINKS = [
  { to: '/', label: 'หน้าแรก' },
  { to: '/features', label: 'ความสามารถ' },
  { to: '/create-with-kivora', label: 'สร้างอะไรได้บ้าง' },
  { to: '/templates', label: 'เทมเพลต' },
  { to: '/showcase', label: 'ตัวอย่างผลงาน' },
  { to: '/pricing', label: 'ราคา' },
];

/** Sticky public marketing header. Swaps sign-in CTA for a dashboard CTA when signed in. */
const PublicHeader = () => {
  const { session, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const initial = (profile?.display_name || session?.user?.email || 'P').slice(0, 1).toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070A18]/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center gap-3 px-4 py-2.5">
        <Link to="/" className="flex shrink-0 items-center gap-2" onClick={() => setOpen(false)}>
          <PetalMark className="h-8 w-8" />
          <span className="min-w-0">
            <span className="block truncate font-display text-sm font-bold tracking-[0.18em] md:text-base">KIVORA</span>
            <span className="hidden truncate text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:block">Knowledge Into Creation</span>
          </span>
        </Link>

        <nav className="mx-auto hidden items-center gap-5 xl:flex">
          {LINKS.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `relative flex min-h-11 items-center text-xs font-ui font-bold transition-colors ${
                  isActive ? 'text-foreground after:absolute after:bottom-1.5 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-gradient-ai' : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Link
            to="/showcase"
            aria-label="ค้นหาตัวอย่างผลงาน"
            className="hidden h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-muted-foreground hover:text-foreground md:flex"
          >
            <Search className="h-4 w-4" />
          </Link>
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
                to="/auth/sign-in"
                className="hidden min-h-11 items-center rounded-full border border-border px-4 text-xs font-ui font-bold sm:flex"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                to="/auth/sign-up"
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
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border xl:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-card px-4 py-2 xl:hidden">
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
              to="/auth/sign-in"
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
