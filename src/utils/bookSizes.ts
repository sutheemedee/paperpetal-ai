export interface BookSize {
  id: string;
  label: string;
  desc: string;
  width: number | null;
  height: number | null;
  unit: string;
  pageWidth: number | null;
  pageHeight: number | null;
  margins: { top: number; bottom: number; left: number; right: number };
  fontSize: number;
  lineHeight: number;
}

export const BOOK_SIZES: BookSize[] = [
  {
    id: 'a4', label: 'A4', desc: 'รายงาน / วิชาการ',
    width: 210, height: 297, unit: 'mm',
    pageWidth: 794, pageHeight: 1123,
    margins: { top: 72, bottom: 72, left: 80, right: 80 },
    fontSize: 14, lineHeight: 1.8,
  },
  {
    id: 'a5', label: 'A5', desc: 'หนังสือทั่วไป',
    width: 148, height: 210, unit: 'mm',
    pageWidth: 559, pageHeight: 794,
    margins: { top: 56, bottom: 56, left: 64, right: 64 },
    fontSize: 13, lineHeight: 1.75,
  },
  {
    id: 'b5', label: 'B5', desc: 'ตำราเรียน',
    width: 176, height: 250, unit: 'mm',
    pageWidth: 665, pageHeight: 945,
    margins: { top: 64, bottom: 64, left: 72, right: 72 },
    fontSize: 13, lineHeight: 1.75,
  },
  {
    id: 'pocket', label: 'Pocket Book', desc: '12.7 × 19 cm',
    width: 127, height: 190, unit: 'mm',
    pageWidth: 480, pageHeight: 718,
    margins: { top: 48, bottom: 48, left: 56, right: 56 },
    fontSize: 12, lineHeight: 1.7,
  },
  {
    id: 'square', label: 'Square', desc: 'โซเชียล / คอฟฟี่',
    width: 210, height: 210, unit: 'mm',
    pageWidth: 794, pageHeight: 794,
    margins: { top: 64, bottom: 64, left: 72, right: 72 },
    fontSize: 14, lineHeight: 1.8,
  },
  {
    id: 'us_trade', label: 'US Trade', desc: '15.2 × 22.9 cm',
    width: 152, height: 229, unit: 'mm',
    pageWidth: 574, pageHeight: 866,
    margins: { top: 60, bottom: 60, left: 68, right: 68 },
    fontSize: 13, lineHeight: 1.75,
  },
  {
    id: 'comic', label: 'Comic / Manga', desc: '18.2 × 25.7 cm',
    width: 182, height: 257, unit: 'mm',
    pageWidth: 688, pageHeight: 971,
    margins: { top: 48, bottom: 48, left: 48, right: 48 },
    fontSize: 12, lineHeight: 1.65,
  },
  {
    id: 'custom', label: 'กำหนดเอง', desc: 'ระบุ W × H mm',
    width: null, height: null, unit: 'mm',
    pageWidth: null, pageHeight: null,
    margins: { top: 60, bottom: 60, left: 72, right: 72 },
    fontSize: 13, lineHeight: 1.75,
  },
];
