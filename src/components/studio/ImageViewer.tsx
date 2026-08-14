import * as React from 'react';
import { ChevronLeft, ChevronRight, Download, RefreshCw, X } from 'lucide-react';
import ZoomPanCanvas from './ZoomPanCanvas';

export interface ViewerImage {
  url: string;
  caption?: string;
}

interface ImageViewerProps {
  images: ViewerImage[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
  onRegenerate?: (i: number) => void;
  actions?: { label: string; onClick: (i: number) => void }[];
}

/** Full-screen generated-image viewer: pinch zoom, pan, prev/next, regenerate, reuse. */
const ImageViewer = ({ images, index, onIndexChange, onClose, onRegenerate, actions }: ImageViewerProps) => {
  const img = images[index];
  const [size, setSize] = React.useState({ w: 1024, h: 1024 });

  React.useEffect(() => {
    if (!img) return;
    const el = new Image();
    el.onload = () => setSize({ w: el.naturalWidth || 1024, h: el.naturalHeight || 1024 });
    el.src = img.url;
  }, [img?.url]);

  if (!img) return null;

  const chip =
    'flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-background px-4 text-xs font-ui font-semibold';

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-background">
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <button onClick={onClose} aria-label="ปิด" className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card">
          <X className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1 truncate text-xs font-ui font-semibold">{img.caption || 'ภาพที่สร้างด้วย AI'}</div>
        <span className="shrink-0 text-xs font-ui text-muted-foreground">{index + 1}/{images.length}</span>
      </div>

      <ZoomPanCanvas
        contentWidth={size.w}
        contentHeight={size.h}
        label={img.caption}
        onPrev={index > 0 ? () => onIndexChange(index - 1) : undefined}
        onNext={index < images.length - 1 ? () => onIndexChange(index + 1) : undefined}
      >
        <img src={img.url} alt={img.caption || 'ภาพประกอบ'} className="h-full w-full object-contain" draggable={false} />
      </ZoomPanCanvas>

      <div className="flex shrink-0 flex-wrap gap-2 border-t border-border px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <button onClick={() => onIndexChange(Math.max(0, index - 1))} className={chip} disabled={index === 0}>
          <ChevronLeft className="h-4 w-4" /> ก่อนหน้า
        </button>
        <button
          onClick={() => onIndexChange(Math.min(images.length - 1, index + 1))}
          className={chip}
          disabled={index >= images.length - 1}
        >
          ถัดไป <ChevronRight className="h-4 w-4" />
        </button>
        {onRegenerate && (
          <button onClick={() => onRegenerate(index)} className={chip}>
            <RefreshCw className="h-4 w-4" /> สร้างใหม่
          </button>
        )}
        <a href={img.url} download className={chip}>
          <Download className="h-4 w-4" /> บันทึก
        </a>
        {actions?.map(a => (
          <button key={a.label} onClick={() => a.onClick(index)} className={`${chip} bg-primary text-primary-foreground`}>
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImageViewer;
