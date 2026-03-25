import { useState } from 'react';

interface BookImageProps {
  src: string;
  width: string | number;
  height: string | number;
  alt: string;
  className?: string;
  onRegenerate?: () => void;
}

const BookImage = ({ src, width, height, alt, className, onRegenerate }: BookImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleRegenerate = () => {
    setLoaded(false);
    setError(false);
    onRegenerate?.();
  };

  return (
    <div className={`relative overflow-hidden rounded-lg ${className || ''}`} style={{ width, height }}>
      {!loaded && !error && (
        <div className="shimmer-bg absolute inset-0 flex items-center justify-center rounded-lg">
          <span className="text-xs text-muted-foreground font-ui">กำลังสร้างภาพ...</span>
        </div>
      )}
      {error && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded-lg"
          style={{ background: 'linear-gradient(135deg, hsl(48 100% 50%), hsl(43 100% 82%))' }}
        >
          <span className="text-xs text-primary-foreground font-ui">ไม่สามารถโหลดภาพได้</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
        crossOrigin="anonymous"
      />
      {loaded && onRegenerate && (
        <button
          onClick={handleRegenerate}
          className="absolute top-2 right-2 rounded-md border border-border bg-background/90 px-2 py-1 text-[11px] font-ui cursor-pointer hover:bg-card transition-colors"
        >
          🔄 สร้างใหม่
        </button>
      )}
    </div>
  );
};

export default BookImage;
