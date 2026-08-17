const KIVORA_LOGO = '/brand/kivora-logo.png';

/** Approved KIVORA folded K mark, cropped from the provided master lockup. */
export const PetalMark = ({ className = 'h-8 w-8' }: { className?: string }) => (
  <span
    className={`inline-flex overflow-hidden rounded-xl bg-[#070A18] ring-1 ring-white/10 ${className}`}
    role="img"
    aria-label="KIVORA"
  >
    <img
      src={KIVORA_LOGO}
      alt=""
      className="h-full max-w-none object-cover"
      style={{ width: '310%', objectPosition: 'left center' }}
      loading="eager"
    />
  </span>
);

export const LogoLockup = ({ compact = false }: { compact?: boolean }) => (
  <span className="flex min-w-0 items-center gap-2">
    <PetalMark className="h-8 w-8 shrink-0" />
    <span className="min-w-0">
      <span className="block truncate font-display text-sm font-bold leading-tight tracking-[0.18em] md:text-base">
        KIVORA
      </span>
      {!compact && (
        <span className="block truncate text-[10px] font-ui uppercase tracking-[0.14em] text-muted-foreground">
          Knowledge Into Creation
        </span>
      )}
    </span>
  </span>
);

/** Full approved KIVORA lockup — splash, login, marketing only. */
export const FullLogo = ({ className = 'w-56' }: { className?: string }) => (
  <img src={KIVORA_LOGO} alt="KIVORA — Knowledge Into Creation" className={className} loading="lazy" />
);
