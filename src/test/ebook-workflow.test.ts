import { describe, expect, it } from 'vitest';
import { flattenBook } from '@/components/studio/bookPages';
import { hydrateBook, isUsableImageUrl, pageKey } from '@/hooks/useIllustrations';

describe('ebook illustration workflow', () => {
  it('does not treat fallback SVG artwork as a completed illustration', () => {
    expect(isUsableImageUrl('')).toBe(false);
    expect(isUsableImageUrl('data:image/svg+xml;charset=utf-8,AI%20image%20fallback')).toBe(false);
    expect(isUsableImageUrl('data:image/png;base64,abc')).toBe(true);
    expect(isUsableImageUrl('https://cdn.example.com/illustration.webp')).toBe(true);
  });

  it('hydrates chapter and page image URLs without dropping existing valid URLs', () => {
    const book = {
      title: 'หนังสือทดสอบ',
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: 'บทแรก',
          imageUrl: 'https://cdn.example.com/existing-chapter.webp',
          pages: [
            { pageNumber: 1, heading: 'หน้าแรก', body: 'เนื้อหา', imageUrl: 'https://cdn.example.com/existing-page.webp' },
            { pageNumber: 2, heading: 'หน้าสอง', body: 'เนื้อหา' },
          ],
        },
      ],
    };

    const hydrated = hydrateBook(
      book,
      { 1: 'data:image/png;base64,newchapter' },
      { [pageKey(1, 2)]: 'data:image/png;base64,newpage' },
    );

    expect(hydrated.chapters[0].imageUrl).toBe('data:image/png;base64,newchapter');
    expect(hydrated.chapters[0].pages[0].imageUrl).toBe('https://cdn.example.com/existing-page.webp');
    expect(hydrated.chapters[0].pages[1].imageUrl).toBe('data:image/png;base64,newpage');
  });

  it('flattens a book into cover, chapter, content, conclusion and back pages', () => {
    const pages = flattenBook({
      title: 'หนังสือทดสอบ',
      chapters: [{ chapterNumber: 1, chapterTitle: 'บทแรก', pages: [{ pageNumber: 1, heading: 'หน้าแรก', body: 'เนื้อหา' }] }],
    });

    expect(pages.map(page => page.kind)).toEqual(['cover', 'chapter', 'content', 'conclusion', 'back']);
    expect(pages[2].id).toBe('pg-1-1');
  });
});
