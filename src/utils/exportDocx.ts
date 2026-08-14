import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  ImageRun, AlignmentType,
} from 'docx';
import { saveAs } from 'file-saver';
import type { BookSize } from './bookSizes';

const mmToTwip = (mm: number) => Math.round(mm * 56.693);

const fetchImageAsBuffer = async (url: string): Promise<ArrayBuffer | null> => {
  try {
    if (url.startsWith('data:')) {
      const base64 = url.split(',')[1];
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes.buffer;
    }
    const res = await fetch(url);
    const blob = await res.blob();
    return await blob.arrayBuffer();
  } catch {
    return null;
  }
};

export const exportToDocx = async (bookData: any, bookSize: BookSize, coverImageUrl: string) => {
  const children: any[] = [];

  // Cover page
  const coverImgBuf = await fetchImageAsBuffer(coverImageUrl);
  if (coverImgBuf) {
    children.push(new Paragraph({
      children: [new ImageRun({
        type: 'png',
        data: coverImgBuf,
        transformation: { width: 400, height: 560 },
        altText: { title: 'Cover', description: 'Book cover image', name: 'cover' },
      })],
      alignment: AlignmentType.CENTER,
    }));
  }

  children.push(new Paragraph({
    children: [new TextRun({ text: bookData.title, bold: true, size: 48, font: 'Arial' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 400, after: 200 },
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: bookData.subtitle, size: 28, font: 'Arial' })],
    alignment: AlignmentType.CENTER,
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: bookData.author, size: 24, font: 'Arial' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 200 },
  }));

  // Chapters
  for (const chapter of bookData.chapters) {
    children.push(new Paragraph({ text: '', pageBreakBefore: true, children: [] }));

    children.push(new Paragraph({
      children: [new TextRun({ text: `บทที่ ${chapter.chapterNumber}: ${chapter.chapterTitle}`, bold: true, size: 36, font: 'Arial' })],
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 300 },
    }));

    // Chapter illustration (already generated in the app)
    const chImgUrl = chapter.imageUrl;
    if (chImgUrl) {
      const chImgBuf = await fetchImageAsBuffer(chImgUrl);
      if (chImgBuf) {
        children.push(new Paragraph({
          children: [new ImageRun({
            type: 'png',
            data: chImgBuf,
            transformation: { width: 500, height: 250 },
            altText: { title: chapter.chapterTitle, description: `Chapter ${chapter.chapterNumber} image`, name: `ch${chapter.chapterNumber}` },
          })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
        }));
      }
    }

    for (const page of chapter.pages) {
      if (page.heading) {
        children.push(new Paragraph({
          children: [new TextRun({ text: page.heading, bold: true, size: 28, font: 'Arial' })],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }));
      }
      if (page.imageUrl) {
        const pgBuf = await fetchImageAsBuffer(page.imageUrl);
        if (pgBuf) {
          children.push(new Paragraph({
            children: [new ImageRun({
              type: 'png',
              data: pgBuf,
              transformation: { width: 440, height: 220 },
              altText: { title: page.heading || 'illustration', description: 'Section illustration', name: `pg${page.pageNumber}` },
            })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }));
        }
      }
      children.push(new Paragraph({
        children: [new TextRun({ text: page.body, size: (bookSize.fontSize || 13) * 2, font: 'Arial' })],
        spacing: { after: 200, line: 360 },
      }));
    }
  }

  // Conclusion
  children.push(new Paragraph({ text: '', pageBreakBefore: true, children: [] }));
  children.push(new Paragraph({
    children: [new TextRun({ text: 'สรุป', bold: true, size: 36, font: 'Arial' })],
    heading: HeadingLevel.HEADING_1,
    spacing: { after: 300 },
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: bookData.conclusion, size: 26, font: 'Arial' })],
    spacing: { line: 360 },
  }));

  const w = bookSize.width || 148;
  const h = bookSize.height || 210;

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: {
            width: mmToTwip(w),
            height: mmToTwip(h),
          },
          margin: {
            top: mmToTwip(20),
            bottom: mmToTwip(20),
            left: mmToTwip(22),
            right: mmToTwip(22),
          },
        },
      },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${bookData.title}.docx`);
};
