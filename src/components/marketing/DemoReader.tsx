import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, List, Maximize2, Minimize2, Sparkles, X, ZoomIn, ZoomOut,
} from 'lucide-react';
import DemoBlocks from './DemoBlocks';
import type { DemoContent, DemoPage, DemoProject } from '@/marketing/demoTypes';
import { useDevice } from '@/hooks/use-device';

const ZOOMS = [0.85, 1, 1.15, 1.35, 1.6];

/** One readable page / slide of a demo project. */
const PageCard = ({ page, project, index, total }: { page: DemoPage; project: DemoProject; index: number; total: number }) => {
  const isSlide = page.kind === 'slide';
  return (
    <article
      className={`flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl ${
        isSlide ? 'aspect-auto' : ''
      }`}
    >
      {page.image && (
        <img
          src={page.image}
          alt={`ภาพประกอบ: ${page.title || page.label}`}
          loading="lazy"
          decoding="async"
          className={`w-full object-cover ${isSlide ? 'aspect-[16/9]' : 'aspect-[4/3]'}`}
        />
      )}
      <div className="flex-1 p-5 md:p-7">
        {page.kind === 'cover' ? (
          <>
            <span className="font-ui text-[11px] font-bold uppercase tracking-[0.18em] text-primary">{project.typeLabel}</span>
            <h2 className="mt-2 font-display text-2xl font-extrabold leading-tight md:text-4xl">{page.title}</h2>
            {page.subtitle && <p className="mt-2 font-body text-sm text-muted-foreground md:text-base">{page.subtitle}</p>}
          </>
        ) : (
          <>
            {page.title && <h2 className="font-display text-lg font-extrabold leading-snug md:text-2xl">{page.title}</h2>}
            {page.subtitle && <p className="mt-1 font-body text-sm text-muted-foreground">{page.subtitle}</p>}
          </>
        )}
        <DemoBlocks blocks={page.blocks} />
        {page.notes && (
          <div className="mt-5 rounded-xl border border-dashed border-border bg-background-deep p-3">
            <span className="font-ui text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Speaker notes</span>
            <p className="mt-1 font-body text-xs leading-6 text-foreground/80">{page.notes}</p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-border px-4 py-2 font-ui text-[11px] text-muted-foreground">
        <span>{project.title}</span>
        <span>
          {project.unit === 'slides' ? 'สไลด์' : 'หน้า'} {index + 1} / {total}
        </span>
      </div>
    </article>
  );
};

interface Props {
  project: DemoProject;
  content: DemoContent;
}

/** Interactive demo reader: real page/slide navigation, zoom, fullscreen, TOC, swipe. */
const DemoReader = ({ project, content }: Props) => {
  const { isDesktop } = useDevice();
  const pages = content.pages;
  const [index, setIndex] = useState(0);
  const [zoomStep, setZoomStep] = useState(1);
  const [toc, setToc] = useState(false);
  const [chrome, setChrome] = useState(true);
  const [full, setFull] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);

  const spread = isDesktop && project.unit === 'pages' && zoomStep <= 1 && index > 0;
  const step = spread ? 2 : 1;

  const go = useCallback(
    (delta: number) => setIndex(i => Math.min(pages.length - 1, Math.max(0, i + delta))),
    [pages.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(step);
      if (e.key === 'ArrowLeft') go(-step);
      if (e.key === 'Escape') setToc(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, step]);

  useEffect(() => {
    const onFull = () => setFull(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFull);
    return () => document.removeEventListener('fullscreenchange', onFull);
  }, []);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await shellRef.current?.requestFullscreen?.();
  };

  const visible = useMemo(() => (spread ? pages.slice(index, index + 2) : [pages[index]]), [pages, index, spread]);
  const scale = ZOOMS[zoomStep];

  return (
    <div ref={shellRef} className="relative flex flex-col gap-3 rounded-3xl border border-border bg-background-deep p-3 md:p-4">
      {/* Toolbar */}
      <div className={`flex flex-wrap items-center gap-2 ${chrome ? '' : 'md:flex hidden'}`}>
        <button
          type="button"
          onClick={() => setToc(true)}
          className="flex min-h-11 items-center gap-1.5 rounded-full border border-border px-3 font-ui text-xs font-bold"
        >
          <List className="h-4 w-4" /> สารบัญ
        </button>
        <div className="flex items-center gap-1 rounded-full border border-border px-1">
          <button
            type="button"
            aria-label="ย่อ"
            onClick={() => setZoomStep(z => Math.max(0, z - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="min-w-10 text-center font-ui text-[11px] font-bold">{Math.round(scale * 100)}%</span>
          <button
            type="button"
            aria-label="ขยาย"
            onClick={() => setZoomStep(z => Math.min(ZOOMS.length - 1, z + 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="flex min-h-11 items-center gap-1.5 rounded-full border border-border px-3 font-ui text-xs font-bold"
        >
          {full ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          {full ? 'ออกจากเต็มจอ' : 'เต็มจอ'}
        </button>
        <span className="ml-auto rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 font-ui text-[11px] font-bold text-primary">
          {project.badge}
        </span>
      </div>

      {/* Stage */}
      <div
        className="relative overflow-auto rounded-2xl bg-background/60 p-2 md:p-4"
        onTouchStart={e => {
          touchX.current = e.touches[0].clientX;
        }}
        onTouchEnd={e => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 48) go(dx < 0 ? step : -step);
          else setChrome(c => !c);
          touchX.current = null;
        }}
      >
        <div
          className="mx-auto flex origin-top gap-3"
          style={{ transform: `scale(${scale})`, width: scale > 1 ? `${100 / scale}%` : '100%' }}
        >
          {visible.map((p, i) => (
            <PageCard key={p.label + i} page={p} project={project} index={index + i} total={pages.length} />
          ))}
        </div>
      </div>

      {/* Pager */}
      <div className="sticky bottom-0 flex items-center gap-2 pb-[env(safe-area-inset-bottom)]">
        <button
          type="button"
          onClick={() => go(-step)}
          disabled={index === 0}
          className="flex min-h-12 flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-card font-ui text-xs font-bold disabled:opacity-40 md:flex-none md:px-5"
        >
          <ChevronLeft className="h-4 w-4" /> ก่อนหน้า
        </button>
        <span className="font-ui text-xs font-bold text-muted-foreground md:mx-auto">
          {index + 1} / {pages.length}
        </span>
        <button
          type="button"
          onClick={() => setToc(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card md:hidden"
          aria-label="สารบัญ"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => go(step)}
          disabled={index >= pages.length - 1}
          className="flex min-h-12 flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-ai font-ui text-xs font-bold text-primary-foreground disabled:opacity-40 md:flex-none md:px-5"
        >
          ถัดไป <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* TOC */}
      {toc && (
        <div className="absolute inset-0 z-20 flex flex-col rounded-3xl bg-background/95 p-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold">สารบัญตัวอย่าง</h3>
            <button type="button" onClick={() => setToc(false)} aria-label="ปิดสารบัญ" className="flex h-11 w-11 items-center justify-center rounded-full border border-border">
              <X className="h-4 w-4" />
            </button>
          </div>
          <ol className="mt-3 flex-1 overflow-auto">
            {pages.map((p, i) => (
              <li key={p.label + i}>
                <button
                  type="button"
                  onClick={() => {
                    setIndex(i);
                    setToc(false);
                  }}
                  className={`flex min-h-12 w-full items-center gap-2 rounded-xl px-3 text-left font-ui text-xs ${
                    i === index ? 'bg-secondary font-bold' : 'text-muted-foreground'
                  }`}
                >
                  <span className="w-6 shrink-0 text-right">{i + 1}</span>
                  {p.label}
                </button>
              </li>
            ))}
          </ol>
          <Link
            to="/register"
            className="mt-2 flex min-h-12 items-center justify-center gap-1.5 rounded-full bg-gradient-ai font-ui text-sm font-bold text-primary-foreground"
          >
            <Sparkles className="h-4 w-4" /> สร้างงานแบบนี้
          </Link>
        </div>
      )}
    </div>
  );
};

export default DemoReader;
