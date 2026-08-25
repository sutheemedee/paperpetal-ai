import { useCallback, useState } from 'react';
import { generateChapterImage, generateSectionImage, lastImageError } from '@/utils/imageGen';

export const pageKey = (chapterNumber: number, pageNumber: number) => `${chapterNumber}-${pageNumber}`;

export const isUsableImageUrl = (value: unknown) => {
  const url = String(value || '');
  return Boolean(url) && !/^data:image\/svg\+xml/i.test(url) && !url.includes('AI image fallback');
};

export interface IllustrationStore {
  chapterImages: Record<number, string>;
  pageImages: Record<string, string>;
  pending: Record<string, boolean>;
  errors: Record<string, string>;
  makeChapter: (chapter: any, bookTitle: string) => Promise<boolean>;
  makePage: (chapter: any, page: any, bookTitle: string) => Promise<boolean>;
  makeAll: (bookData: any, onProgress?: (done: number, total: number) => void) => Promise<{ done: number; succeeded: number; failed: number; total: number }>;
  reset: () => void;
}

export const useIllustrations = (): IllustrationStore => {
  const [chapterImages, setChapterImages] = useState<Record<number, string>>({});
  const [pageImages, setPageImages] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mark = useCallback((key: string, value: boolean) => {
    setPending(prev => ({ ...prev, [key]: value }));
  }, []);

  const recordError = useCallback((key: string, fallback: string) => {
    setErrors(prev => ({ ...prev, [key]: lastImageError || fallback }));
  }, []);

  const clearError = useCallback((key: string) => {
    setErrors(prev => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const makeChapter = useCallback(
    async (chapter: any, bookTitle: string) => {
      const key = `ch-${chapter.chapterNumber}`;
      mark(key, true);
      clearError(key);
      try {
        const url = await generateChapterImage(chapter.chapterTitle, bookTitle, chapter.chapterImagePrompt);
        if (!url) {
          recordError(key, 'สร้างภาพเปิดบทไม่สำเร็จ กรุณาตรวจสอบ AI API Provider ใน Admin');
          return false;
        }
        setChapterImages(prev => ({ ...prev, [chapter.chapterNumber]: url }));
        return true;
      } catch (error) {
        recordError(key, error instanceof Error ? error.message : 'สร้างภาพเปิดบทไม่สำเร็จ');
        return false;
      } finally {
        mark(key, false);
      }
    },
    [clearError, mark, recordError],
  );

  const makePage = useCallback(
    async (chapter: any, page: any, bookTitle: string) => {
      const imageKey = pageKey(chapter.chapterNumber, page.pageNumber);
      const key = `pg-${imageKey}`;
      mark(key, true);
      clearError(key);
      try {
        const url = await generateSectionImage(
          page.heading || chapter.chapterTitle,
          page.body || '',
          bookTitle,
          page.imagePrompt,
        );
        if (!url) {
          recordError(key, 'สร้างภาพประกอบหน้าไม่สำเร็จ กรุณาตรวจสอบ AI API Provider ใน Admin');
          return false;
        }
        setPageImages(prev => ({ ...prev, [imageKey]: url }));
        return true;
      } catch (error) {
        recordError(key, error instanceof Error ? error.message : 'สร้างภาพประกอบหน้าไม่สำเร็จ');
        return false;
      } finally {
        mark(key, false);
      }
    },
    [clearError, mark, recordError],
  );

  const makeAll = useCallback(
    async (bookData: any, onProgress?: (done: number, total: number) => void) => {
      const chapters = bookData?.chapters || [];
      const jobs: (() => Promise<boolean>)[] = [];
      for (const chapter of chapters) {
        if (!chapterImages[chapter.chapterNumber] && !isUsableImageUrl(chapter.imageUrl)) jobs.push(() => makeChapter(chapter, bookData.title));
        for (const page of chapter.pages || []) {
          if (!pageImages[pageKey(chapter.chapterNumber, page.pageNumber)] && !isUsableImageUrl(page.imageUrl)) jobs.push(() => makePage(chapter, page, bookData.title));
        }
      }

      const total = jobs.length;
      let nextJob = 0;
      let done = 0;
      let succeeded = 0;
      let failed = 0;
      onProgress?.(0, total);
      const workers = Array.from({ length: Math.min(3, Math.max(total, 1)) }, async () => {
        while (true) {
          const jobIndex = nextJob++;
          if (jobIndex >= total) return;
          const ok = await jobs[jobIndex]();
          done += 1;
          if (ok) succeeded += 1;
          else failed += 1;
          onProgress?.(done, total);
        }
      });
      await Promise.all(workers);
      return { done, succeeded, failed, total };
    },
    [chapterImages, makeChapter, makePage, pageImages],
  );

  const reset = useCallback(() => {
    setChapterImages({});
    setPageImages({});
    setPending({});
    setErrors({});
  }, []);

  return { chapterImages, pageImages, pending, errors, makeChapter, makePage, makeAll, reset };
};

/** Merges generated illustrations into the book object so exporters can read them. */
export const hydrateBook = (
  bookData: any,
  chapterImages: Record<number, string>,
  pageImages: Record<string, string>,
) => ({
  ...bookData,
  chapters: (bookData?.chapters || []).map((c: any) => ({
    ...c,
    imageUrl: chapterImages[c.chapterNumber] || (isUsableImageUrl(c.imageUrl) ? c.imageUrl : ''),
    pages: (c.pages || []).map((p: any) => ({
      ...p,
      imageUrl: pageImages[pageKey(c.chapterNumber, p.pageNumber)] || (isUsableImageUrl(p.imageUrl) ? p.imageUrl : ''),
    })),
  })),
});
