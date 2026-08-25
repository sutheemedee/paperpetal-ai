import { supabase } from '@/integrations/supabase/client';
import { edgeErrorMessage } from './fnError';

/** ข้อความผิดพลาดล่าสุดจากการสร้างภาพ เพื่อให้ UI แจ้งสาเหตุที่แท้จริงได้ */
export let lastImageError = '';

export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-image', {
      body: { prompt },
    });

    if (error) {
      lastImageError = await edgeErrorMessage(error, 'สร้างภาพประกอบไม่สำเร็จ');
      console.error('Image generation error:', lastImageError);
      return '';
    }

    if (data?.error || data?.fallback || !data?.imageUrl) {
      lastImageError = String(
        data?.detail || data?.error || 'AI image provider ยังไม่พร้อมใช้งาน กรุณาตั้งค่า provider ใน Admin',
      );
      console.error('Image generation error:', lastImageError);
      return '';
    }

    lastImageError = '';
    return String(data.imageUrl);
  } catch (err: unknown) {
    lastImageError = err instanceof Error ? err.message : 'สร้างภาพประกอบไม่สำเร็จ';
    console.error('Image generation failed:', err);
    return '';
  }
};

const cleanPrompt = (value: unknown, fallback: string) => String(value || fallback).replace(/\s+/g, ' ').trim().slice(0, 900);

export const generateCoverImage = async (bookData: any, colorTheme: string): Promise<string> => {
  const prompt = cleanPrompt(
    bookData.coverImagePrompt,
    `Premium modern book cover illustration for "${bookData.title}", ${bookData.description || 'editorial knowledge book'}, symbolic visual metaphor, ${colorTheme} color palette, cinematic lighting, ultra detailed, no text, no letters`,
  );
  return generateImage(`${prompt}. Use a polished vertical book-cover composition with a clear focal point, generous negative space, and no typography.`);
};

export const generateBackCoverImage = async (bookData: any): Promise<string> => {
  const prompt = `Elegant back-cover background for a book titled "${cleanPrompt(bookData.title, 'E-Book')}", ${cleanPrompt(bookData.description, 'modern knowledge and practical ideas')}. Subtle editorial texture, complementary colors, quiet visual hierarchy, print-ready, no text, no letters.`;
  return generateImage(prompt);
};

export const generateChapterImage = async (
  chapterTitle: string,
  bookTitle: string,
  imagePrompt?: string,
): Promise<string> => {
  const prompt = cleanPrompt(
    imagePrompt,
    `Editorial illustration for chapter "${chapterTitle}" from a book about "${bookTitle}", conceptual art, cinematic lighting, professional publishing quality, symbolic visual metaphor, no text`,
  );
  return generateImage(`${prompt}. Use a wide horizontal chapter-opener composition with a strong focal subject and a calm area for the chapter title.`);
};

export const generateSectionImage = async (
  heading: string,
  body: string,
  bookTitle: string,
  imagePrompt?: string,
): Promise<string> => {
  const excerpt = cleanPrompt(body, '').slice(0, 360);
  const prompt = cleanPrompt(
    imagePrompt,
    `Editorial illustration for the section "${heading}" from a book about "${bookTitle}". Section context: ${excerpt}. Conceptual editorial art, soft cinematic lighting, clean composition, symbolic visual metaphor, no text, no letters`,
  );
  return generateImage(`${prompt}. Use a landscape composition that remains legible when placed beside body copy; avoid faces, logos, captions, and embedded typography.`);
};
