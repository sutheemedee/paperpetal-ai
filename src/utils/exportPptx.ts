import PptxGenJS from 'pptxgenjs';

export interface Slide {
  number: number;
  layout: string;
  title?: string;
  subtitle?: string;
  bullets?: string[];
  body?: string;
  citations?: string[];
  notes?: string;
  imageUrl?: string;
}

export interface Deck {
  title: string;
  subtitle?: string;
  slides: Slide[];
}

const YELLOW = '00CFFF';
const BLACK = '111111';
const WHITE = 'FFFFFF';

/** Exports an EDITABLE .pptx — real text boxes, images and notes (never flattened images). */
export const exportToPptx = async (deck: Deck, fileName = 'presentation.pptx') => {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = deck.title;

  for (const s of deck.slides) {
    const slide = pptx.addSlide();
    const isCover = s.layout === 'cover' || s.layout === 'section';
    slide.background = { color: isCover ? BLACK : WHITE };

    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: isCover ? 5.2 : 0, w: 10, h: 0.16, fill: { color: YELLOW },
    });

    slide.addText(s.title || '', {
      x: 0.6, y: isCover ? 2.1 : 0.45, w: 8.8, h: isCover ? 1.4 : 0.9,
      fontSize: isCover ? 40 : 28, bold: true,
      color: isCover ? WHITE : BLACK,
      fontFace: 'Tahoma',
    });

    if (s.subtitle) {
      slide.addText(s.subtitle, {
        x: 0.6, y: isCover ? 3.5 : 1.3, w: 8.8, h: 0.6,
        fontSize: isCover ? 18 : 14, color: isCover ? YELLOW : '555555', fontFace: 'Tahoma',
      });
    }

    const hasImage = !!s.imageUrl;
    const textW = hasImage ? 5.1 : 8.8;

    if (s.bullets?.length) {
      slide.addText(s.bullets.map(b => ({ text: b, options: { bullet: true } })), {
        x: 0.6, y: 2.0, w: textW, h: 2.8, fontSize: 15, color: BLACK, fontFace: 'Tahoma',
      });
    } else if (s.body) {
      slide.addText(s.body, {
        x: 0.6, y: 2.0, w: textW, h: 2.8, fontSize: 15, color: isCover ? WHITE : BLACK, fontFace: 'Tahoma',
      });
    }

    if (hasImage) {
      try {
        slide.addImage({ data: s.imageUrl, x: 5.9, y: 1.6, w: 3.5, h: 3.2 });
      } catch { /* skip broken image */ }
    }

    if (s.citations?.length) {
      slide.addText(s.citations.join('  '), {
        x: 0.6, y: 4.95, w: 8.8, h: 0.3, fontSize: 9, color: '888888', fontFace: 'Tahoma',
      });
    }

    slide.addText(String(s.number), {
      x: 9.2, y: 4.95, w: 0.6, h: 0.3, fontSize: 10, color: '999999', align: 'right', fontFace: 'Tahoma',
    });

    if (s.notes) slide.addNotes(s.notes);
  }

  await pptx.writeFile({ fileName });
};
