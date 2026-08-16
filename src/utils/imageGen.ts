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

    if (data?.error) {
      lastImageError = String(data.error);
      console.error('Image generation error:', lastImageError);
      return '';
    }

    lastImageError = '';
    return data?.imageUrl || '';
  } catch (err: any) {
    lastImageError = err?.message || 'สร้างภาพประกอบไม่สำเร็จ';
    console.error('Image generation failed:', err);
    return '';
  }
};

export const generateCoverImage = async (bookData: any, colorTheme: string): Promise<string> => {
  const prompt = `Generate a book cover illustration for "${bookData.title}", ${bookData.coverImagePrompt || bookData.description}, professional digital art, ${colorTheme} color palette, cinematic lighting, ultra detailed, editorial style, no text, no letters, symbolic visual metaphor`;
  return generateImage(prompt);
};

export const generateBackCoverImage = async (bookData: any): Promise<string> => {
  const prompt = `Generate an abstract background for back of book about "${bookData.title}", soft bokeh, complementary colors, minimal, no text`;
  return generateImage(prompt);
};

export const generateChapterImage = async (chapterTitle: string, bookTitle: string): Promise<string> => {
  const prompt = `Generate an editorial illustration for book chapter titled "${chapterTitle}" from a book about "${bookTitle}", conceptual art, wide banner format, cinematic, professional, no text, symbolic`;
  return generateImage(prompt);
};

export const generateSectionImage = async (
  heading: string,
  body: string,
  bookTitle: string,
): Promise<string> => {
  const excerpt = (body || '').slice(0, 240);
  const prompt = `Generate an editorial illustration for a book section titled "${heading}" from a book about "${bookTitle}". Section context: ${excerpt}. Conceptual editorial art, soft cinematic lighting, clean composition, wide format, no text, no letters, symbolic visual metaphor`;
  return generateImage(prompt);
};
