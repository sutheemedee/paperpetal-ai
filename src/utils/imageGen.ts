import { supabase } from '@/integrations/supabase/client';

const generateImage = async (prompt: string): Promise<string> => {
  const { data, error } = await supabase.functions.invoke('generate-image', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: undefined,
  });

  // Use POST with body instead since GET with query params is tricky via invoke
  const res = await supabase.functions.invoke('generate-image', {
    body: { prompt },
  });

  if (res.error) {
    console.error('Image generation error:', res.error);
    return '';
  }

  return res.data?.imageUrl || '';
};

export const buildCoverImagePrompt = (bookData: any, colorTheme: string): string => {
  return `Generate a book cover illustration for "${bookData.title}", ${bookData.coverImagePrompt || bookData.description}, professional digital art, ${colorTheme} color palette, cinematic lighting, ultra detailed, editorial style, no text, no letters, symbolic visual metaphor`;
};

export const buildBackCoverImagePrompt = (bookData: any): string => {
  return `Generate an abstract background for back of book about "${bookData.title}", soft bokeh, complementary colors, minimal, no text`;
};

export const buildChapterImagePrompt = (chapterTitle: string, bookTitle: string): string => {
  return `Generate an editorial illustration for book chapter titled "${chapterTitle}" from a book about "${bookTitle}", conceptual art, wide banner format, cinematic, professional, no text, symbolic`;
};

export const generateCoverImage = async (bookData: any, colorTheme: string): Promise<string> => {
  return generateImage(buildCoverImagePrompt(bookData, colorTheme));
};

export const generateBackCoverImage = async (bookData: any): Promise<string> => {
  return generateImage(buildBackCoverImagePrompt(bookData));
};

export const generateChapterImage = async (chapterTitle: string, bookTitle: string): Promise<string> => {
  return generateImage(buildChapterImagePrompt(chapterTitle, bookTitle));
};
