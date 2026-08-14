import fullLogo from '@/assets/paperpetal-logo.png.asset.json';

/** Simplified petal-page mark. Legible from 16px to app-icon size. */
export const PetalMark = ({ className = 'h-8 w-8' }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className} role="img" aria-label="PaperPetal AI">
    <defs>
      <linearGradient id="petal-mark" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#3B82F6" />
        <stop offset="0.45" stopColor="#7C5CFF" />
        <stop offset="0.8" stopColor="#FF69B0" />
        <stop offset="1" stopColor="#FFB020" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="hsl(var(--surface-elevated))" />
    <path d="M20 14h13a11 11 0 0 1 0 22h-6v14h-7V14zm7 7v8h6a4 4 0 0 0 0-8h-6z" fill="url(#petal-mark)" />
    <path d="M42 30c6-1 10-5 11-11 1 7-2 13-8 15-2 .7-3.4.2-4-1-.5-1.1 0-2.6 1-3z" fill="url(#petal-mark)" />
  </svg>
);

export const LogoLockup = ({ compact = false }: { compact?: boolean }) => (
  <span className="flex min-w-0 items-center gap-2">
    <PetalMark className="h-8 w-8 shrink-0" />
    <span className="min-w-0">
      <span className="block truncate font-display text-sm font-bold leading-tight md:text-base">PaperPetal AI</span>
      {!compact && (
        <span className="block truncate text-[10px] font-ui uppercase tracking-[0.14em] text-muted-foreground">
          Knowledge · Book · Presentation
        </span>
      )}
    </span>
  </span>
);

/** Full illustrated brand artwork — splash, login, marketing only. */
export const FullLogo = ({ className = 'w-56' }: { className?: string }) => (
  <img src={fullLogo.url} alt="PaperPetal AI — AI Knowledge & Publishing Studio" className={className} loading="lazy" />
);
