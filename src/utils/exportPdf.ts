import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { BookSize } from './bookSizes';

const esc = (s: string) =>
  String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

interface PdfOptions {
  coverImageUrl?: string;
  chapterImages?: Record<number, string>;
}

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

  const host = document.createElement('div');
  host.style.cssText = `position:fixed;left:-10000px;top:0;width:${pw}px;`;
  document.body.appendChild(host);

  const makePage = (inner: string, center = false) => {
    const el = document.createElement('div');
    el.style.cssText = `width:${pw}px;height:${ph}px;box-sizing:border-box;background:#fff;color:#111;
      padding:${m.top}px ${m.right}px ${m.bottom}px ${m.left}px;overflow:hidden;
      font-family:'Lora',serif;font-size:${bookSize.fontSize}px;line-height:${bookSize.lineHeight};
      display:flex;flex-direction:column;${center ? 'justify-content:center;align-items:center;text-align:center;' : ''}`;
    el.innerHTML = inner;
    host.appendChild(el);
    return el;
  };

  const pages: HTMLElement[] = [];

  // Cover
  pages.push(
    makePage(
      `${options.coverImageUrl ? `<img src="${options.coverImageUrl}" style="width:100%;height:55%;object-fit:cover;border-radius:8px" />` : ''}
       <h1 style="font-family:'Playfair Display',serif;font-size:${bookSize.fontSize * 2.2}px;margin:24px 0 8px">${esc(bookData.title)}</h1>
       <p style="opacity:.75;margin:0">${esc(bookData.subtitle || '')}</p>
       <p style="margin-top:24px;letter-spacing:.2em;text-transform:uppercase;font-size:${bookSize.fontSize * 0.8}px">${esc(bookData.author || '')}</p>`,
      true,
    ),
  );

  // Table of contents
  pages.push(
    makePage(
      `<h2 style="font-family:'Playfair Display',serif;font-size:${bookSize.fontSize * 1.6}px;margin:0 0 20px">สารบัญ</h2>
       ${(bookData.chapters || [])
         .map(
           (c: any) =>
             `<div style="display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-bottom:1px dotted #ccc"><span>บทที่ ${c.chapterNumber} · ${esc(c.chapterTitle)}</span></div>`,
         )
         .join('')}`,
    ),
  );

  for (const chapter of bookData.chapters || []) {
    const img = options.chapterImages?.[chapter.chapterNumber];
    pages.push(
      makePage(
        `${img ? `<img src="${img}" style="width:100%;height:32%;object-fit:cover;border-radius:8px;margin-bottom:20px" />` : ''}
         <p style="letter-spacing:.25em;text-transform:uppercase;font-size:${bookSize.fontSize * 0.75}px;opacity:.6;margin:0">บทที่ ${chapter.chapterNumber}</p>
         <h2 style="font-family:'Playfair Display',serif;font-size:${bookSize.fontSize * 1.8}px;margin:8px 0 0">${esc(chapter.chapterTitle)}</h2>
         <div style="width:56px;height:3px;background:#FFC400;margin-top:12px"></div>`,
      ),
    );

    for (const page of chapter.pages || []) {
      pages.push(
        makePage(
          `${page.heading ? `<h3 style="font-family:'Playfair Display',serif;font-size:${bookSize.fontSize * 1.25}px;margin:0 0 10px">${esc(page.heading)}</h3>` : ''}
           ${page.imageUrl ? `<img src="${page.imageUrl}" style="width:100%;height:26%;object-fit:cover;border-radius:8px;margin-bottom:14px" />` : ''}
           <div style="white-space:pre-line;flex:1">${esc(page.body)}</div>
           <div style="text-align:center;opacity:.5;font-size:${bookSize.fontSize * 0.75}px">— ${page.pageNumber} —</div>`,
        ),
      );
    }
  }

  pages.push(
    makePage(
      `<h2 style="font-family:'Playfair Display',serif;font-size:${bookSize.fontSize * 1.6}px;margin:0 0 16px">สรุป</h2>
       <div style="white-space:pre-line">${esc(bookData.conclusion || '')}</div>`,
    ),
  );

  const pdf = new jsPDF({ unit: 'mm', format: [wMm, hMm], orientation: wMm > hMm ? 'landscape' : 'portrait' });

  try {
    for (let i = 0; i < pages.length; i++) {
      onProgress?.(Math.round(((i + 1) / pages.length) * 100), `กำลังเรนเดอร์หน้า ${i + 1}/${pages.length}`);
      const canvas = await html2canvas(pages[i], { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const data = canvas.toDataURL('image/jpeg', 0.92);
      if (i > 0) pdf.addPage([wMm, hMm], wMm > hMm ? 'landscape' : 'portrait');
      pdf.addImage(data, 'JPEG', 0, 0, wMm, hMm);
    }
    pdf.save(`${bookData.title || 'ebook'}.pdf`);
  } finally {
    host.remove();
  }
};
