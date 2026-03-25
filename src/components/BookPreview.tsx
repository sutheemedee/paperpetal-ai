import { useState } from 'react';
import BookImage from './BookImage';
import { buildChapterImageUrl } from '@/utils/imageGen';
import type { BookSize } from '@/utils/bookSizes';

interface BookPreviewProps {
  bookData: any;
  bookSize: BookSize;
}

const BookPreview = ({ bookData, bookSize }: BookPreviewProps) => {
  const scale = 0.65;
  const pw = bookSize.pageWidth || 559;
  const ph = bookSize.pageHeight || 794;
  const m = bookSize.margins;
  const [chapterSeeds, setChapterSeeds] = useState<Record<number, number>>({});

  const getChapterImageUrl = (chapter: any) => {
    const seed = chapterSeeds[chapter.chapterNumber];
    if (seed !== undefined) {
      const prompt = encodeURIComponent(
        `editorial illustration for book chapter titled "${chapter.chapterTitle}" from a book about "${bookData.title}", conceptual art, wide banner, cinematic, no text`
      );
      return `https://image.pollinations.ai/prompt/${prompt}?width=800&height=400&nologo=true&seed=${seed}`;
    }
    return buildChapterImageUrl(chapter.chapterTitle, bookData.title, chapter.chapterNumber);
  };

  return (
    <div className="flex flex-col gap-6 items-center">
      {bookData.chapters.map((chapter: any) => (
        <div key={chapter.chapterNumber}>
          {/* Chapter Opening Page */}
          <div
            className="bg-background rounded-xl border border-border shadow-sm overflow-hidden mb-4"
            style={{
              width: pw * scale,
              minHeight: ph * scale * 0.6,
              padding: `${m.top * scale}px ${m.right * scale}px ${m.bottom * scale}px ${m.left * scale}px`,
            }}
          >
            <BookImage
              src={getChapterImageUrl(chapter)}
              width="100%"
              height={200 * scale}
              alt={chapter.chapterTitle}
              onRegenerate={() => {
                setChapterSeeds(prev => ({
                  ...prev,
                  [chapter.chapterNumber]: Math.floor(Math.random() * 99999),
                }));
              }}
            />
            <p className="text-xs font-ui text-muted-foreground mt-3 tracking-widest uppercase">
              บทที่ {chapter.chapterNumber}
            </p>
            <h3 className="text-lg font-heading font-bold text-foreground mt-1">
              {chapter.chapterTitle}
            </h3>
            <div className="w-12 h-0.5 bg-primary mt-2" />
          </div>

          {/* Chapter Pages */}
          {chapter.pages.map((page: any) => (
            <div
              key={page.pageNumber}
              className="bg-background rounded-xl border border-border shadow-sm overflow-hidden mb-4"
              style={{
                width: pw * scale,
                minHeight: ph * scale * 0.5,
                padding: `${m.top * scale}px ${m.right * scale}px ${m.bottom * scale}px ${m.left * scale}px`,
              }}
            >
              {page.heading && (
                <h4
                  className="font-heading font-bold text-foreground mb-2"
                  style={{ fontSize: bookSize.fontSize * scale * 1.2 }}
                >
                  {page.heading}
                </h4>
              )}
              <p
                className="font-body text-foreground/90 whitespace-pre-line"
                style={{
                  fontSize: bookSize.fontSize * scale,
                  lineHeight: bookSize.lineHeight,
                }}
              >
                {page.body}
              </p>
              <div className="text-center text-[10px] text-muted-foreground font-ui mt-4">
                — {page.pageNumber} —
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Conclusion */}
      <div
        className="bg-background rounded-xl border border-border shadow-sm overflow-hidden"
        style={{
          width: pw * scale,
          minHeight: ph * scale * 0.3,
          padding: `${m.top * scale}px ${m.right * scale}px ${m.bottom * scale}px ${m.left * scale}px`,
        }}
      >
        <h3 className="text-lg font-heading font-bold text-foreground mb-3">สรุป</h3>
        <p
          className="font-body text-foreground/90 whitespace-pre-line"
          style={{ fontSize: bookSize.fontSize * scale, lineHeight: bookSize.lineHeight }}
        >
          {bookData.conclusion}
        </p>
      </div>
    </div>
  );
};

export default BookPreview;
