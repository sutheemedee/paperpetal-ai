import { useState, useEffect } from 'react';

interface BookImageProps {
  src?: string;
  generateFn?: () => Promise<string>;
  width: string | number;
  height: string | number;
  alt: string;
  className?: string;
  onRegenerate?: () => void;
}

const BookImage = ({ src, generateFn, width, height, alt, className, onRegenerate }: BookImageProps) => {
  const [imageUrl, setImageUrl] = useState(src || '');
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (src) {
      setImageUrl(src);
      return;
    }
    if (generateFn && !imageUrl) {
      setGenerating(true);
      generateFn().then(url => {
        if (url) {
          setImageUrl(url);
        } else {
          setError(true);
        }
        setGenerating(false);
      });
    }
  }, [src, generateFn]);

  const handleRegenerate = () => {
    setLoaded(false);
    setError(false);
    setImageUrl('');
    if (generateFn) {
      setGenerating(true);
      generateFn().then(url => {
        if (url) {
          setImageUrl(url);
        } else {
          setError(true);
        }
        setGenerating(false);
      });
    }
    onRegenerate?.();
  };

  return (
    <div className={`relative overflow-hidden rounded-lg ${className || ''}`} style={{ width, height }}>
      {(!loaded || generating) && !error && (
        <div className="shimmer-bg absolute inset-0 flex items-center justify-center rounded-lg">
          <span className="text-xs text-muted-foreground font-ui">
            {generating ? 'กำลังสร้างภาพ AI...' : 'กำลังโหลดภาพ...'}
          </span>
        </div>
      )}
      {error && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-lg gap-2"
          style={{ background: 'linear-gradient(135deg, hsl(48 100% 50%), hsl(43 100% 82%))' }}
        >
          <span className="text-xs text-primary-foreground font-ui">ไม่สามารถสร้างภาพได้</span>
          {(generateFn || onRegenerate) && (
            <button
              onClick={handleRegenerate}
              className="rounded-md border border-border bg-background/90 px-2 py-1 text-[11px] font-ui cursor-pointer hover:bg-card transition-colors"
            >
              🔄 ลองใหม่
            </button>
          )}
        </div>
      )}
      {imageUrl && (
        <img
          src={imageUrl}
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
        />
      )}
      {loaded && !generating && (generateFn || onRegenerate) && (
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
