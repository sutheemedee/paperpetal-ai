export interface StyleProfile {
  tone: string;
  complexity: string;
  language: string;
  sentenceStyle: string;
  characteristics: string[];
  vocabularyLevel: string;
  writingPersona: string;
  styleInstructions: string;
}

import { supabase } from '@/integrations/supabase/client';
import { edgeErrorMessage } from './fnError';

/** หนังสือที่ขอเกินจำนวนนี้จะเขียนทีละบท เพื่อให้ได้จำนวนหน้าครบตามที่ขอ */
export const CHAPTER_MODE_THRESHOLD = 12;
const CONCURRENCY = 3;

export type BookProgress = (info: { done: number; total: number; stage: 'outline' | 'chapters' }) => void;

const invoke = async (body: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke('generate-book', { body });
  if (error) throw new Error(await edgeErrorMessage(error, 'สร้างหนังสือไม่สำเร็จ กรุณาลองใหม่'));
  if (data?.error) throw new Error(data.error);
  return data;
};

const writeChapter = async (base: Record<string, unknown>, chapter: any, bookTitle: string, bookOutline: string) => {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const data = await invoke({ ...base, mode: 'chapter', chapter, bookTitle, bookOutline });
      return data.pages as Array<{ heading: string; body: string }>;
    } catch (e) {
      if (attempt === 1) throw e;
    }
  }
  return [];
};

export const generateBook = async (
  title: string,
  pageCount: number,
  language: string,
  styleProfile: StyleProfile | null,
  sources: any[] = [],
  sourceMode: string = 'source_ai',
  onProgress?: BookProgress,
): Promise<any> => {
  const base = { title, pageCount, language, styleProfile, sources, sourceMode };

  if (pageCount <= CHAPTER_MODE_THRESHOLD) {
    try {
      return await invoke(base);
    } catch (e) {
      console.error('Generate book error:', e);
      throw e;
    }
  }

  onProgress?.({ done: 0, total: 1, stage: 'outline' });
  const outline = await invoke({ ...base, mode: 'outline' });
  // Fallback draft (AI unavailable) already contains full pages
  if (outline?.fallback || !Array.isArray(outline?.chapters)) return outline;

  const chapters: any[] = outline.chapters;
  const outlineText = chapters.map((c: any) => `${c.chapterNumber}. ${c.chapterTitle}`).join(' | ');
  let done = 0;
  let failedChapters = 0;
  onProgress?.({ done, total: chapters.length, stage: 'chapters' });

  const results: Array<Array<{ heading: string; body: string }>> = new Array(chapters.length);
  let cursor = 0;
  const worker = async () => {
    while (cursor < chapters.length) {
      const i = cursor++;
      const ch = chapters[i];
      try {
        results[i] = await writeChapter(base, ch, outline.title || title, outlineText);
      } catch {
        failedChapters += 1;
        results[i] = (ch.pagePlan || []).map((p: any) => ({
          heading: p.heading,
          body: `${p.summary || ''}\n\n(บทนี้ยังเขียนไม่สำเร็จ กรุณากด "สร้างใหม่" หรือแก้ไขเนื้อหาเอง)`,
        }));
      }
      done += 1;
      onProgress?.({ done, total: chapters.length, stage: 'chapters' });
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, chapters.length) }, worker));

  let pageNumber = 0;
  const { chapters: _omit, ...meta } = outline;
  return {
    ...meta,
    partial: failedChapters > 0,
    failedChapters,
    chapters: chapters.map((ch: any, i: number) => {
      const { pagePlan: _plan, ...rest } = ch;
      return {
        ...rest,
        chapterNumber: ch.chapterNumber ?? i + 1,
        pages: (results[i] || []).map(p => ({ pageNumber: ++pageNumber, heading: p.heading, body: p.body })),
      };
    }),
  };
};
