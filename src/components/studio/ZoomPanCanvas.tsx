import * as React from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Minus, Plus, Scan, StretchHorizontal } from 'lucide-react';

const MIN_ZOOM = 0.15;
const MAX_ZOOM = 6;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

interface ZoomPanCanvasProps {
  /** intrinsic content size in px (real aspect ratio is always preserved) */
  contentWidth: number;
  contentHeight: number;
  children: React.ReactNode;
  onPrev?: () => void;
  onNext?: () => void;
  label?: string;
  className?: string;
  toolbarExtra?: React.ReactNode;
}

/**
 * Responsive canvas viewport: fit-width / fit-page, wheel + pinch zoom anchored at
 * the pointer, drag/touch pan, swipe to change page, and full-screen mode.
 */
const ZoomPanCanvas = ({
  contentWidth,
  contentHeight,
  children,
  onPrev,
  onNext,
  label,
  className,
  toolbarExtra,
}: ZoomPanCanvasProps) => {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const viewRef = React.useRef<HTMLDivElement>(null);
  const [box, setBox] = React.useState({ w: 0, h: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const [full, setFull] = React.useState(false);

  const fitWidthZoom = box.w ? (box.w - 24) / contentWidth : 1;
  const fitPageZoom = box.w && box.h ? Math.min((box.w - 24) / contentWidth, (box.h - 24) / contentHeight) : 1;

  const center = React.useCallback(
    (z: number) => {
      setZoom(z);
      setOffset({
        x: Math.max((box.w - contentWidth * z) / 2, 0),
        y: Math.max((box.h - contentHeight * z) / 2, 0),
      });
    },
    [box.w, box.h, contentWidth, contentHeight],
  );

  // measure viewport
  React.useEffect(() => {
    const el = viewRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const r = entries[0].contentRect;
      setBox({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // auto fit when the viewport or the content size changes
  const fitKey = `${box.w}x${box.h}:${contentWidth}x${contentHeight}`;
  const lastFit = React.useRef('');
  React.useEffect(() => {
    if (!box.w || lastFit.current === fitKey) return;
    lastFit.current = fitKey;
    center(Math.min(fitWidthZoom, 1.6));
  }, [fitKey, box.w, fitWidthZoom, center]);

  const stateRef = React.useRef({ zoom, offset, box });
  stateRef.current = { zoom, offset, box };

  const zoomAt = React.useCallback((next: number, px: number, py: number) => {
    const { zoom: z, offset: o } = stateRef.current;
    const nz = clamp(next, MIN_ZOOM, MAX_ZOOM);
    const k = nz / z;
    setZoom(nz);
    setOffset({ x: px - (px - o.x) * k, y: py - (py - o.y) * k });
  }, []);

  // native non-passive wheel listener (React onWheel is passive)
  const wheelRef = React.useRef<(e: WheelEvent) => void>(() => {});
  wheelRef.current = (e: WheelEvent) => {
    const el = viewRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
    zoomAt(
      stateRef.current.zoom * Math.exp(-dy * 0.0015),
      e.clientX - rect.left,
      e.clientY - rect.top,
    );
  };

  React.useEffect(() => {
    const el = viewRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      wheelRef.current(e);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // pointer pan + two-finger pinch + swipe paging
  const pointers = React.useRef<Map<number, { x: number; y: number }>>(new Map());
  const gesture = React.useRef<{ dist: number; mid: { x: number; y: number } } | null>(null);
  const drag = React.useRef<{ x: number; y: number; ox: number; oy: number; t: number; moved: number } | null>(null);

  const localPoint = (clientX: number, clientY: number) => {
    const rect = viewRef.current?.getBoundingClientRect();
    return { x: clientX - (rect?.left || 0), y: clientY - (rect?.top || 0) };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current = {
        dist: Math.hypot(a.x - b.x, a.y - b.y),
        mid: localPoint((a.x + b.x) / 2, (a.y + b.y) / 2),
      };
      drag.current = null;
    } else {
      drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y, t: Date.now(), moved: 0 };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size >= 2 && gesture.current) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const mid = localPoint((a.x + b.x) / 2, (a.y + b.y) / 2);
      if (gesture.current.dist > 0) {
        zoomAt(stateRef.current.zoom * (dist / gesture.current.dist), mid.x, mid.y);
      }
      gesture.current = { dist, mid };
      return;
    }

    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    d.moved = Math.max(d.moved, Math.hypot(dx, dy));
    setOffset({ x: d.ox + dx, y: d.oy + dy });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) gesture.current = null;
    const d = drag.current;
    drag.current = null;
    if (!d) return;

    // swipe to page when the content is not zoomed in beyond fit
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    const quick = Date.now() - d.t < 600;
    const zoomedOut = stateRef.current.zoom <= fitWidthZoom * 1.05;
    if (quick && zoomedOut && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) onNext?.();
      else onPrev?.();
      center(stateRef.current.zoom);
    }
  };

  const btn =
    'flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background/95 text-foreground shadow-sm transition-colors hover:bg-accent disabled:opacity-40';

  return (
    <div
      ref={wrapRef}
      className={`relative flex min-h-0 flex-1 flex-col ${
        full ? 'fixed inset-0 z-50 bg-background' : ''
      } ${className || ''}`}
    >
      <div
        ref={viewRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative min-h-[42vh] flex-1 touch-none select-none overflow-hidden bg-secondary/60"
        style={{ cursor: zoom > fitWidthZoom ? 'grab' : 'default' }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: contentWidth,
            height: contentHeight,
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {children}
        </div>
      </div>

      {/* contextual canvas toolbar — touch sized, always reachable */}
      <div className="flex flex-wrap items-center gap-2 border-t border-border bg-background/95 px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur">
        <button onClick={() => onPrev?.()} disabled={!onPrev} aria-label="หน้าก่อนหน้า" className={btn}>
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button onClick={() => onNext?.()} disabled={!onNext} aria-label="หน้าถัดไป" className={btn}>
          <ChevronRight className="h-5 w-5" />
        </button>
        {label && (
          <span className="min-w-0 flex-1 truncate px-1 text-center text-xs font-ui font-semibold text-muted-foreground">
            {label}
          </span>
        )}
        <button
          onClick={() => zoomAt(zoom / 1.25, box.w / 2, box.h / 2)}
          aria-label="ย่อ"
          className={btn}
        >
          <Minus className="h-5 w-5" />
        </button>
        <button
          onClick={() => zoomAt(zoom * 1.25, box.w / 2, box.h / 2)}
          aria-label="ขยาย"
          className={btn}
        >
          <Plus className="h-5 w-5" />
        </button>
        <button onClick={() => center(fitWidthZoom)} aria-label="พอดีความกว้าง" className={btn}>
          <StretchHorizontal className="h-5 w-5" />
        </button>
        <button onClick={() => center(fitPageZoom)} aria-label="พอดีหน้า" className={btn}>
          <Scan className="h-5 w-5" />
        </button>
        <button onClick={() => setFull(f => !f)} aria-label="เต็มหน้าจอ" className={btn}>
          {full ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
        </button>
        {toolbarExtra}
      </div>
    </div>
  );
};

export default ZoomPanCanvas;
