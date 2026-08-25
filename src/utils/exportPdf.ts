import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { BookSize } from './bookSizes';
import type { CoverDesignStyle, FontOption, VisualTheme } from '@/templates/visualPreview';

const esc = (s: unknown) =>
  String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const escAttr = (s: unknown) => esc(s).replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const paragraphs = (s: unknown) =>
  String(s || '')
    .split(/\n{1,}/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p style="margin:0 0 10px">${esc(p)}</p>`)
    .join('');

interface PdfOptions {
  coverImageUrl?: string;
  chapterImages?: Record<number, string>;
  theme?: VisualTheme;
  font?: FontOption;
  coverStyle?: CoverDesignStyle;
}

const paletteFor = (theme?: VisualTheme) => {
  const palettes: Record<string, { paper: string; ink: string; muted: string; accent: string; cover: string }> = {
    'ai-technology': { paper: '#f7fbff', ink: '#0f172a', muted: '#496178', accent: '#0891b2', cover: '#0b1638' },
    business: { paper: '#fbfaf6', ink: '#172033', muted: '#5c6370', accent: '#b7791f', cover: '#101827' },
    academic: { paper: '#ffffff', ink: '#18243b', muted: '#52627a', accent: '#3b64c4', cover: '#16325c' },
    kids: { paper: '#fffdf7', ink: '#35251e', muted: '#75655b', accent: '#e45779', cover: '#7d345f' },
    luxury: { paper: '#fcfbff', ink: '#191326', muted: '#675d79', accent: '#8b5cf6', cover: '#160e2a' },
    minimal: { paper: '#ffffff', ink: '#193236', muted: '#617477', accent: '#0f9f8d', cover: '#123d3b' },
    pastel: { paper: '#fffaff', ink: '#34233f', muted: '#75647e', accent: '#d94695', cover: '#522c65' },
    'dark-premium': { paper: '#f9f8ff', ink: '#16142b', muted: '#5c5874', accent: '#6d42e8', cover: '#0b0920' },
  };
  return palettes[theme?.id || 'ai-technology'] || palettes['ai-technology'];
};

const waitForImages = async (root: HTMLElement) => {
  const images = Array.from(root.querySelectorAll('img'));
  await Promise.all(
    images.map(async image => {
      image.crossOrigin = 'anonymous';
      if (image.complete && image.naturalWidth > 0) {
        await image.decode?.().catch(() => undefined);
        return;
      }
      await new Promise<void>(resolve => {
        image.addEventListener('load', () => resolve(), { once: true });
        image.addEventListener('error', () => resolve(), { once: true });
      });
    }),
  );
};

/**
 * Renders each book page as an offscreen HTML node, rasterises it with html2canvas
 * (so Thai typography is preserved) and stitches everything into a PDF.
 */
export const exportToPdf = async (
  bookData: any,
  bookSize: BookSize,
  options: PdfOptions = {},
  onProgress?: (pct: number, label: string) => void,
) => {
  const wMm = bookSize.width || 148;
  const hMm = bookSize.height || 210;
  const pw = bookSize.pageWidth || 559;
  const ph = bookSize.pageHeight || 794;
  const m = bookSize.margins;
  const palette = paletteFor(options.theme);
  const fontStack = options.font?.stack || '"Noto Sans Thai", Arial, sans-serif';
  const headingStack = options.font?.stack || '"Noto Serif Thai", Georgia, serif';
  const coverImageHeight = options.coverStyle?.id === 'minimal' ? 38 : options.coverStyle?.id === 'photo' ? 62 : 52;

  const host = document.createElement('div');
  host.style.cssText = `position:fixed;left:-10000px;top:0;width:${pw}px;pointer-events:none;`;
  document.body.appendChild(host);

  const makePage = (inner: string, center = false, background = palette.paper) => {
    const el = document.createElement('div');
    el.style.cssText = `width:${pw}px;height:${ph}px;box-sizing:border-box;background:${background};color:${palette.ink};
      padding:${m.top}px ${m.right}px ${m.bottom}px ${m.left}px;overflow:hidden;
      font-family:${fontStack};font-size:${bookSize.fontSize}px;line-height:${bookSize.lineHeight};
      display:flex;flex-direction:column;${center ? 'justify-content:center;align-items:center;text-align:center;' : ''}`;
    el.innerHTML = inner;
    host.appendChild(el);
    return el;
  };

  const pages: HTMLElement[] = [];
  const image = (url: string | undefined, style: string, alt: string) =>
    url ? `<img src="${escAttr(url)}" alt="${escAttr(alt)}" style="${style}" />` : '';
  const eyebrow = (text: string) =>
    `<p style="letter-spacing:.23em;text-transform:uppercase;font-size:${Math.max(bookSize.fontSize * 0.72, 9)}px;color:${palette.accent};margin:0 0 10px;font-weight:700">${esc(text)}</p>`;
  const heading = (text: string, size: number) =>
    `<h2 style="font-family:${headingStack};font-size:${size}px;line-height:1.24;margin:0;color:${palette.ink}">${esc(text)}</h2>`;

  pages.push(
    makePage(
      `<div style="width:100%;height:${coverImageHeight}%;overflow:hidden;border-radius:14px;background:${palette.cover}">${image(options.coverImageUrl, 'width:100%;height:100%;object-fit:cover', 'หน้าปก')}</div>
       <div style="width:100%;margin-top:26px;border-left:4px solid ${palette.accent};padding-left:18px;text-align:left">
         ${eyebrow(options.theme?.name || 'KIVORA E-BOOK')}
         <h1 style="font-family:${headingStack};font-size:${bookSize.fontSize * 2.05}px;line-height:1.16;margin:0;color:${palette.ink}">${esc(bookData.title)}</h1>
         <p style="color:${palette.muted};font-size:${bookSize.fontSize * 1.05}px;line-height:1.5;margin:12px 0 0">${esc(bookData.subtitle || '')}</p>
         <p style="color:${palette.muted};margin:20px 0 0;letter-spacing:.12em;text-transform:uppercase;font-size:${Math.max(bookSize.fontSize * 0.78, 10)}px">${esc(bookData.author || '')}</p>
       </div>`,
      true,
      palette.paper,
    ),
  );

  pages.push(
    makePage(
      `${eyebrow('สารบัญ')}${heading('สารบัญ', bookSize.fontSize * 1.75)}
       <div style="margin-top:22px;display:flex;flex-direction:column;gap:2px">
       ${(bookData.chapters || [])
         .map(
           (c: any) =>
             `<div style="display:flex;align-items:baseline;gap:10px;padding:9px 0;border-bottom:1px dotted #cbd5e1"><span style="color:${palette.accent};font-weight:700;min-width:58px">บทที่ ${esc(c.chapterNumber)}</span><span style="color:${palette.ink}">${esc(c.chapterTitle)}</span></div>`,
         )
         .join('')}
       </div>`,
    ),
  );

  for (const chapter of bookData.chapters || []) {
    const img = options.chapterImages?.[chapter.chapterNumber] || chapter.imageUrl;
    pages.push(
      makePage(
        `${image(img, `width:100%;height:32%;object-fit:cover;border-radius:14px;margin-bottom:24px;background:${palette.cover}`, chapter.chapterTitle)}
         ${eyebrow(`บทที่ ${chapter.chapterNumber}`)}
         ${heading(chapter.chapterTitle, bookSize.fontSize * 1.82)}
         <div style="width:58px;height:4px;background:${palette.accent};margin-top:16px;border-radius:4px"></div>`,
    ),
    );

    for (const page of chapter.pages || []) {
      pages.push(
        makePage(
          `${page.heading ? `<h3 style="font-family:${headingStack};font-size:${bookSize.fontSize * 1.28}px;line-height:1.3;margin:0 0 12px;color:${palette.ink}">${esc(page.heading)}</h3>` : ''}
           ${image(page.imageUrl, `width:100%;height:22%;object-fit:cover;border-radius:12px;margin-bottom:16px;background:${palette.cover}`, page.heading || 'ภาพประกอบ')}
           <div style="flex:1;overflow:hidden;color:${palette.ink};font-size:${Math.max(bookSize.fontSize * 1.02, 11)}px;line-height:${Math.max(bookSize.lineHeight, 1.62)}">${paragraphs(page.body)}</div>
           <div style="display:flex;align-items:center;justify-content:space-between;margin-top:12px;color:${palette.muted};font-size:${Math.max(bookSize.fontSize * 0.72, 9)}px"><span>${esc(bookData.title)}</span><span>— ${esc(page.pageNumber)} —</span></div>`,
        ),
      );
    }
  }

  pages.push(
    makePage(
      `${eyebrow('บทส่งท้าย')}${heading('สรุป', bookSize.fontSize * 1.75)}
       <div style="margin-top:22px;flex:1;overflow:hidden;color:${palette.ink};font-size:${Math.max(bookSize.fontSize * 1.04, 11)}px;line-height:${Math.max(bookSize.lineHeight, 1.65)}">${paragraphs(bookData.conclusion)}</div>`,
    ),
  );

  const pdf = new jsPDF({ unit: 'mm', format: [wMm, hMm], orientation: wMm > hMm ? 'landscape' : 'portrait' });

  try {
    for (let i = 0; i < pages.length; i++) {
      onProgress?.(Math.round(((i + 1) / pages.length) * 100), `กำลังเรนเดอร์หน้า ${i + 1}/${pages.length}`);
      await waitForImages(pages[i]);
      const canvas = await html2canvas(pages[i], {
        scale: Math.min(2, window.devicePixelRatio || 2),
        useCORS: true,
        allowTaint: false,
        backgroundColor: palette.paper,
      });
      const data = canvas.toDataURL('image/jpeg', 0.94);
      if (i > 0) pdf.addPage([wMm, hMm], wMm > hMm ? 'landscape' : 'portrait');
      pdf.addImage(data, 'JPEG', 0, 0, wMm, hMm, undefined, 'FAST');
    }
    pdf.save(`${bookData.title || 'ebook'}.pdf`);
  } finally {
    host.remove();
  }
};
