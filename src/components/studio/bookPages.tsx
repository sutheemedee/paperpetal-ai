import { ImagePlus, Loader2, RefreshCw } from 'lucide-react';
import { pageKey, type IllustrationStore } from '@/hooks/useIllustrations';
import type { BookSize } from '@/utils/bookSizes';

export interface FlatPage {
  id: string;
  kind: 'cover' | 'chapter' | 'content' | 'conclusion' | 'back';
  label: string;
  chapterNumber?: number;
  pageNumber?: number;
  chapter?: any;
  page?: any;
}

/** Flatten a generated book into a linear page list for the paged canvas + navigator. */
export const flattenBook = (bookData: any): FlatPage[] => {
  const out: FlatPage[] = [{ id: 'cover', kind: 'cover', label: 'ปกหน้า' }];
  for (const chapter of bookData?.chapters || []) {
    out.push({
      id: `ch-${chapter.chapterNumber}`,
      kind: 'chapter',
      label: `บทที่ ${chapter.chapterNumber} · ${chapter.chapterTitle}`,
      chapterNumber: chapter.chapterNumber,
      chapter,
    });
    for (const page of chapter.pages || []) {
      out.push({
        id: `pg-${chapter.chapterNumber}-${page.pageNumber}`,
        kind: 'content',
        label: page.heading || `หน้า ${page.pageNumber}`,
        chapterNumber: chapter.chapterNumber,
        pageNumber: page.pageNumber,
        chapter,
        page,
      });
    }
  }
  out.push({ id: 'conclusion', kind: 'conclusion', label: 'สรุป' });
  out.push({ id: 'back', kind: 'back', label: 'ปกหลัง' });
  return out;
};

interface PageCanvasProps {
  entry: FlatPage;
  bookData: any;
  bookSize: BookSize;
  illustrations: IllustrationStore;
  coverImageUrl?: string;
  backCoverImageUrl?: string;
  onOpenImage?: (url: string, caption: string) => void;
}

/** One book page rendered at its real page size — aspect ratio is never distorted. */
const BookPageCanvas = ({
  entry,
  bookData,
  bookSize,
  illustrations,
  coverImageUrl,
  backCoverImageUrl,
  onOpenImage,
}: PageCanvasProps) => {
  const w = bookSize.pageWidth || 559;
  const h = bookSize.pageHeight || 794;
  const m = bookSize.margins;
  const { chapterImages, pageImages, pending, makeChapter, makePage } = illustrations;

  const shell = 'relative overflow-hidden bg-background shadow-[var(--shadow-card)]';
  const style = { width: w, height: h, padding: `${m.top}px ${m.right}px ${m.bottom}px ${m.left}px` };

  if (entry.kind === 'cover' || entry.kind === 'back') {
    const url = entry.kind === 'cover' ? coverImageUrl : backCoverImageUrl;
    return (
      <div className={shell} style={{ width: w, height: h }}>
        {url ? (
          <img
            src={url}
            alt={entry.label}
            onClick={() => onOpenImage?.(url, entry.label)}
            className="h-full w-full cursor-zoom-in object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary text-sm font-ui text-muted-foreground">
            กำลังสร้างภาพปก...
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-8">
          <p className="font-ui text-sm uppercase tracking-[0.25em] text-[#00CFFF]">{bookData.author}</p>
          <h2 className="mt-2 font-heading text-3xl font-bold text-white">
            {entry.kind === 'cover' ? bookData.title : 'ปกหลัง'}
          </h2>
          <p className="mt-2 font-body text-base text-white/85">
            {entry.kind === 'cover' ? bookData.subtitle : bookData.backCoverText}
          </p>
        </div>
      </div>
    );
  }

  if (entry.kind === 'conclusion') {
    return (
      <div className={shell} style={style}>
        <h3 className="mb-4 font-heading text-2xl font-bold">สรุป</h3>
        <p
          className="whitespace-pre-line font-body text-foreground/90"
          style={{ fontSize: bookSize.fontSize * 1.15, lineHeight: bookSize.lineHeight }}
        >
          {bookData.conclusion}
        </p>
      </div>
    );
  }

  if (entry.kind === 'chapter') {
    const chapter = entry.chapter;
    const img = chapterImages[chapter.chapterNumber];
    const busy = pending[`ch-${chapter.chapterNumber}`];
    return (
      <div className={shell} style={style}>
        {img ? (
          <div className="relative overflow-hidden rounded-xl">
            <img
              src={img}
              alt={chapter.chapterTitle}
              loading="lazy"
              onClick={() => onOpenImage?.(img, chapter.chapterTitle)}
              className="h-56 w-full cursor-zoom-in object-cover"
            />
            <button
              onClick={() => makeChapter(chapter, bookData.title)}
              disabled={busy}
              className="absolute right-3 top-3 flex min-h-11 items-center gap-1.5 rounded-full bg-background/95 px-4 text-sm font-ui shadow-sm backdrop-blur"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              สร้างใหม่
            </button>
          </div>
        ) : (
          <button
            onClick={() => makeChapter(chapter, bookData.title)}
            disabled={busy}
            className="flex h-48 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-secondary text-base font-ui text-muted-foreground"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
            {busy ? 'AI กำลังวาดภาพ...' : 'ให้ AI วาดภาพเปิดบท'}
          </button>
        )}
        <p className="mt-8 font-ui text-sm uppercase tracking-[0.3em] text-muted-foreground">
          บทที่ {chapter.chapterNumber}
        </p>
        <h3 className="mt-2 font-heading text-3xl font-bold leading-tight">{chapter.chapterTitle}</h3>
        <div className="mt-4 h-1 w-16 bg-primary" />
      </div>
    );
  }

  const chapter = entry.chapter;
  const page = entry.page;
  const key = pageKey(chapter.chapterNumber, page.pageNumber);
  const img = pageImages[key];
  const busy = pending[`pg-${key}`];

  return (
    <div className={shell} style={style}>
      {page.heading && (
        <h4 className="mb-3 font-heading font-bold" style={{ fontSize: bookSize.fontSize * 1.6 }}>
          {page.heading}
        </h4>
      )}
      {img && (
        <div className="relative mb-4 overflow-hidden rounded-xl">
          <img
            src={img}
            alt={page.heading || 'ภาพประกอบ'}
            loading="lazy"
            onClick={() => onOpenImage?.(img, page.heading || 'ภาพประกอบ')}
            className="h-52 w-full cursor-zoom-in object-cover"
          />
          <button
            onClick={() => makePage(chapter, page, bookData.title)}
            disabled={busy}
            aria-label="สร้างภาพใหม่"
            className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-background/95 shadow-sm backdrop-blur"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </button>
        </div>
      )}
      <p
        className="whitespace-pre-line font-body text-foreground/90"
        style={{ fontSize: bookSize.fontSize * 1.15, lineHeight: bookSize.lineHeight }}
      >
        {page.body}
      </p>
      <div className="absolute inset-x-0 bottom-4 flex items-center justify-between px-8">
        {!img ? (
          <button
            onClick={() => makePage(chapter, page, bookData.title)}
            disabled={busy}
            className="flex min-h-11 items-center gap-2 rounded-full border border-border bg-secondary px-4 text-sm font-ui"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            {busy ? 'AI กำลังวาด...' : 'เพิ่มภาพประกอบ AI'}
          </button>
        ) : (
          <span />
        )}
        <span className="font-ui text-xs text-muted-foreground">— {page.pageNumber} —</span>
      </div>
    </div>
  );
};

export default BookPageCanvas;
