import { useCallback, useState } from 'react';
import { generateChapterImage, generateSectionImage } from '@/utils/imageGen';

export const pageKey = (chapterNumber: number, pageNumber: number) => `${chapterNumber}-${pageNumber}`;

export interface IllustrationStore {
  chapterImages: Record<number, string>;
  pageImages: Record<string, string>;
  pending: Record<string, boolean>;
  makeChapter: (chapter: any, bookTitle: string) => Promise<void>;
  makePage: (chapter: any, page: any, bookTitle: string) => Promise<void>;
  makeAll: (bookData: any, onProgress?: (done: number, total: number) => void) => Promise<void>;
  reset: () => void;
}

export const useIllustrations = (): IllustrationStore => {
  const [chapterImages, setChapterImages] = useState<Record<number, string>>({});
  const [pageImages, setPageImages] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<Record<string, boolean>>({});

  const mark = (key: string, value: boolean) =>
    setPending(prev => ({ ...prev, [key]: value }));

  const makeChapter = useCallback(async (chapter: any, bookTitle: string) => {
    const key = `ch-${chapter.chapterNumber}`;
    mark(key, true);
    const url = await generateChapterImage(chapter.chapterTitle, bookTitle);
    if (url) setChapterImages(prev => ({ ...prev, [chapter.chapterNumber]: url }));
    mark(key, false);
  }, []);

  const makePage = useCallback(async (chapter: any, page: any, bookTitle: string) => {
    const key = `pg-${pageKey(chapter.chapterNumber, page.pageNumber)}`;
    mark(key, true);
    const url = await generateSectionImage(
      page.heading || chapter.chapterTitle,
      page.body || '',
      bookTitle,
    );
    if (url) setPageImages(prev => ({ ...prev, [pageKey(chapter.chapterNumber, page.pageNumber)]: url }));
    mark(key, false);
  }, []);

  const makeAll = useCallback(
    async (bookData: any, onProgress?: (done: number, total: number) => void) => {
      const chapters = bookData?.chapters || [];
      const jobs: (() => Promise<void>)[] = [];
      for (const chapter of chapters) {
        jobs.push(() => makeChapter(chapter, bookData.title));
        for (const page of chapter.pages || []) {
          if (page.heading) jobs.push(() => makePage(chapter, page, bookData.title));
        }
      }
      let done = 0;
      // small concurrency so the gateway isn't hammered
      const workers = Array.from({ length: 3 }, async () => {
        while (jobs.length) {
          const job = jobs.shift();
          if (!job) break;
          await job();
          done++;
          onProgress?.(done, done + jobs.length);
        }
      });
      await Promise.all(workers);
    },
    [makeChapter, makePage],
  );

  const reset = useCallback(() => {
    setChapterImages({});
    setPageImages({});
    setPending({});
  }, []);

  return { chapterImages, pageImages, pending, makeChapter, makePage, makeAll, reset };
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
    imageUrl: chapterImages[c.chapterNumber] || '',
    pages: (c.pages || []).map((p: any) => ({
      ...p,
      imageUrl: pageImages[pageKey(c.chapterNumber, p.pageNumber)] || '',
    })),
  })),
});
