export const buildCoverImageUrl = (bookData: any, colorTheme: string): string => {
  const prompt = encodeURIComponent(
    `book cover illustration for "${bookData.title}", ${bookData.coverImagePrompt || bookData.description}, ` +
    `professional digital art, ${colorTheme} color palette, ` +
    `cinematic lighting, ultra detailed, editorial style, no text, no letters, symbolic visual metaphor`
  );
  const seed = Math.floor(Math.random() * 99999);
  return `https://image.pollinations.ai/prompt/${prompt}?width=800&height=1200&nologo=true&seed=${seed}`;
};

export const buildBackCoverImageUrl = (bookData: any): string => {
  const prompt = encodeURIComponent(
    `abstract background for back of book about "${bookData.title}", ` +
    `soft bokeh, complementary colors, minimal, no text`
  );
  const seed = Math.floor(Math.random() * 99999);
  return `https://image.pollinations.ai/prompt/${prompt}?width=800&height=400&nologo=true&seed=${seed}`;
};

export const buildChapterImageUrl = (chapterTitle: string, bookTitle: string, chapterNumber: number): string => {
  const prompt = encodeURIComponent(
    `editorial illustration for book chapter titled "${chapterTitle}" ` +
    `from a book about "${bookTitle}", ` +
    `conceptual art, wide banner format, cinematic, professional, no text, symbolic`
  );
  return `https://image.pollinations.ai/prompt/${prompt}?width=800&height=400&nologo=true&seed=${chapterNumber * 137}`;
};
