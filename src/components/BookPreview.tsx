import { useState, useCallback } from 'react';
import BookImage from './BookImage';
import { generateChapterImage } from '@/utils/imageGen';
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
  const [regenerateKeys, setRegenerateKeys] = useState<Record<number, number>>({});

  const getChapterImageFn = useCallback((chapter: any) => {
    return () => generateChapterImage(chapter.chapterTitle, bookData.title);
  }, [bookData.title]);

  return (
    <div className="flex flex-col gap-6 items-center">
      {bookData.chapters.map((chapter: any) => (
        <div key={`${chapter.chapterNumber}-${regenerateKeys[chapter.chapterNumber] || 0}`}>
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
              generateFn={getChapterImageFn(chapter)}
              width="100%"
              height={200 * scale}
              alt={chapter.chapterTitle}
              onRegenerate={() => {
                setRegenerateKeys(prev => ({
                  ...prev,
                  [chapter.chapterNumber]: (prev[chapter.chapterNumber] || 0) + 1,
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
