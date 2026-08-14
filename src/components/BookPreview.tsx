import { ImagePlus, Loader2, RefreshCw } from 'lucide-react';
import { pageKey, type IllustrationStore } from '@/hooks/useIllustrations';
import type { BookSize } from '@/utils/bookSizes';

interface BookPreviewProps {
  bookData: any;
  bookSize: BookSize;
  illustrations: IllustrationStore;
  scale?: number;
}

const BookPreview = ({ bookData, bookSize, illustrations, scale = 0.65 }: BookPreviewProps) => {
  const pw = bookSize.pageWidth || 559;
  const m = bookSize.margins;
  const { chapterImages, pageImages, pending, makeChapter, makePage } = illustrations;

  const pagePadding = `${m.top * scale}px ${m.right * scale}px ${m.bottom * scale}px ${m.left * scale}px`;

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {bookData.chapters.map((chapter: any) => {
        const chImg = chapterImages[chapter.chapterNumber];
        const chBusy = pending[`ch-${chapter.chapterNumber}`];
        return (
          <div key={chapter.chapterNumber} className="flex w-full flex-col items-center gap-4">
            {/* Chapter opening page */}
            <article
              className="w-full max-w-full animate-fade-in overflow-hidden rounded-2xl border border-border bg-background shadow-[var(--shadow-soft)]"
              style={{ width: pw * scale, padding: pagePadding }}
            >
              {chImg ? (
                <div className="relative overflow-hidden rounded-xl">
                  <img src={chImg} alt={chapter.chapterTitle} className="h-32 w-full object-cover sm:h-40" loading="lazy" />
                  <button
                    onClick={() => makeChapter(chapter, bookData.title)}
                    disabled={chBusy}
                    className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-ui shadow-sm backdrop-blur transition-colors hover:bg-card disabled:opacity-60"
                  >
                    {chBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                    สร้างใหม่
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => makeChapter(chapter, bookData.title)}
                  disabled={chBusy}
                  className="flex h-24 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-secondary text-xs font-ui text-muted-foreground transition-colors hover:bg-accent sm:h-32"
                >
                  {chBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                  {chBusy ? 'AI กำลังวาดภาพ...' : 'ให้ AI วาดภาพเปิดบท'}
                </button>
              )}
              <p className="mt-3 text-[11px] font-ui uppercase tracking-[0.2em] text-muted-foreground">
                บทที่ {chapter.chapterNumber}
              </p>
              <h3 className="mt-1 font-heading text-lg font-bold text-foreground sm:text-xl">{chapter.chapterTitle}</h3>
              <div className="mt-2 h-0.5 w-12 bg-primary" />
            </article>

            {/* Chapter content pages */}
            {chapter.pages.map((page: any) => {
              const key = pageKey(chapter.chapterNumber, page.pageNumber);
              const img = pageImages[key];
              const busy = pending[`pg-${key}`];
              return (
                <article
                  key={page.pageNumber}
                  className="w-full max-w-full overflow-hidden rounded-2xl border border-border bg-background shadow-[var(--shadow-soft)]"
                  style={{ width: pw * scale, padding: pagePadding }}
                >
                  {page.heading && (
                    <h4
                      className="mb-2 font-heading font-bold text-foreground"
                      style={{ fontSize: Math.max(14, bookSize.fontSize * scale * 1.25) }}
                    >
                      {page.heading}
                    </h4>
                  )}

                  {img && (
                    <div className="relative mb-3 overflow-hidden rounded-xl">
                      <img src={img} alt={page.heading || 'ภาพประกอบ'} className="h-28 w-full object-cover sm:h-36" loading="lazy" />
                      <button
                        onClick={() => makePage(chapter, page, bookData.title)}
                        disabled={busy}
                        className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-ui shadow-sm backdrop-blur hover:bg-card disabled:opacity-60"
                      >
                        {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                      </button>
                    </div>
                  )}

                  <p
                    className="whitespace-pre-line font-body text-foreground/90"
                    style={{
                      fontSize: Math.max(13, bookSize.fontSize * scale),
                      lineHeight: bookSize.lineHeight,
                    }}
                  >
                    {page.body}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    {!img ? (
                      <button
                        onClick={() => makePage(chapter, page, bookData.title)}
                        disabled={busy}
                        className="flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-[11px] font-ui text-foreground transition-colors hover:bg-accent disabled:opacity-60"
                      >
                        {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <ImagePlus className="h-3 w-3" />}
                        {busy ? 'AI กำลังวาด...' : 'เพิ่มภาพประกอบ AI'}
                      </button>
                    ) : (
                      <span />
                    )}
                    <span className="text-[10px] font-ui text-muted-foreground">— {page.pageNumber} —</span>
                  </div>
                </article>
              );
            })}
          </div>
        );
      })}

      {/* Conclusion */}
      <article
        className="w-full max-w-full overflow-hidden rounded-2xl border border-border bg-background shadow-[var(--shadow-soft)]"
        style={{ width: pw * scale, padding: pagePadding }}
      >
        <h3 className="mb-3 font-heading text-lg font-bold text-foreground">สรุป</h3>
        <p
          className="whitespace-pre-line font-body text-foreground/90"
          style={{ fontSize: Math.max(13, bookSize.fontSize * scale), lineHeight: bookSize.lineHeight }}
        >
          {bookData.conclusion}
        </p>
      </article>
    </div>
  );
};

export default BookPreview;
