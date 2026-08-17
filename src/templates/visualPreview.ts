import { TemplateDefinition } from './types';

export interface TemplatePreviewPage {
  kind: 'cover' | 'toc' | 'content' | 'spread' | 'slide';
  title: string;
  eyebrow: string;
  body: string;
  bullets: string[];
}

export interface VisualTheme {
  id: string;
  name: string;
  description: string;
  accent: string;
  bg: string;
  pattern: string;
}

export interface CoverDesignStyle {
  id: string;
  name: string;
  description: string;
  composition: string;
}

export interface FontOption {
  id: string;
  name: string;
  description: string;
  sample: string;
  stack: string;
}

export const BOOK_THEMES: VisualTheme[] = [
  { id: 'ai-technology', name: 'AI Technology', description: 'น้ำเงิน-ไซแอน เหมาะกับ AI, SaaS, Tech Guide', accent: '#22d3ee', bg: 'from-[#101735] via-[#1f1a57] to-[#07111f]', pattern: 'วงแหวนข้อมูล + เส้นแสง' },
  { id: 'business', name: 'Business', description: 'กรมท่า-ทอง ดูน่าเชื่อถือสำหรับธุรกิจ', accent: '#f5c451', bg: 'from-[#0d1628] via-[#172034] to-[#111827]', pattern: 'ตารางกลยุทธ์ + เส้นกราฟ' },
  { id: 'academic', name: 'Academic', description: 'ขาว-น้ำเงิน อ่านง่ายสำหรับตำรา/งานวิจัย', accent: '#4f7cff', bg: 'from-[#eef4ff] via-[#dbeafe] to-[#f8fafc]', pattern: 'เส้นแบ่งบท + annotation' },
  { id: 'kids', name: 'Kids', description: 'สดใส อบอุ่น เหมาะกับหนังสือเด็ก', accent: '#fb7185', bg: 'from-[#fff7ad] via-[#bae6fd] to-[#fbcfe8]', pattern: 'รูปทรงนุ่ม + ภาพประกอบใหญ่' },
  { id: 'luxury', name: 'Luxury', description: 'ดำ-ม่วง-เงิน สำหรับงานพรีเมียม', accent: '#c084fc', bg: 'from-[#080711] via-[#17122d] to-[#030712]', pattern: 'แสงกระจก + เส้นโลหะ' },
  { id: 'minimal', name: 'Minimal', description: 'สะอาด โปร่ง เหมาะกับ eBook/คู่มือทั่วไป', accent: '#14b8a6', bg: 'from-[#f8fafc] via-[#eef2ff] to-[#ffffff]', pattern: 'พื้นที่ว่าง + grid บาง' },
  { id: 'pastel', name: 'Pastel', description: 'นุ่มละมุน สำหรับคอร์ส/เวิร์กบุ๊ก', accent: '#ec4899', bg: 'from-[#fdf2f8] via-[#ede9fe] to-[#e0f2fe]', pattern: 'เลเยอร์กระดาษ + highlight' },
  { id: 'dark-premium', name: 'Dark Premium', description: 'เข้มแบบ KIVORA สำหรับงานโชว์เคส', accent: '#7c3cff', bg: 'from-[#030712] via-[#0f1733] to-[#070b18]', pattern: 'แผง glass + gradient ribbon' },
];

export const COVER_STYLES: CoverDesignStyle[] = [
  { id: 'minimal', name: 'Minimal', description: 'ชื่อชัด พื้นที่ว่างเยอะ อ่านง่าย', composition: 'title-left' },
  { id: 'modern', name: 'Modern', description: 'เลเยอร์ภาพและกราฟิกแบบเทคโนโลยี', composition: 'hero-grid' },
  { id: 'editorial', name: 'Editorial', description: 'เหมือนนิตยสาร/หนังสือจริง มีลำดับสายตา', composition: 'magazine' },
  { id: 'illustration', name: 'Illustration', description: 'ภาพวาดเป็นตัวนำ เหมาะกับคู่มือและเด็ก', composition: 'illustrated' },
  { id: 'photo', name: 'Photo', description: 'ใช้ภาพหลักเต็มปก ดูเป็นสารคดี/รายงาน', composition: 'photo' },
  { id: 'academic', name: 'Academic', description: 'จริงจัง สะอาด มีหัวข้อและเลขบท', composition: 'paper' },
  { id: 'luxury', name: 'Luxury', description: 'พรีเมียม คอนทราสต์สูง ใช้แสงและเส้นโลหะ', composition: 'luxury' },
  { id: 'kids', name: 'Kids', description: 'ตัวใหญ่ สีสด มีพื้นที่สำหรับภาพตัวละคร', composition: 'playful' },
  { id: 'manga', name: 'Manga', description: 'เส้นสปีด กรอบภาพ และ title impact', composition: 'manga' },
];

export const FONT_LIBRARY: FontOption[] = [
  { id: 'noto-sans-thai', name: 'Noto Sans Thai', description: 'ทันสมัย อ่านง่าย ใช้ได้ทุกหน้า', sample: 'ความรู้กลายเป็นผลงาน', stack: '"Noto Sans Thai", Sora, sans-serif' },
  { id: 'noto-serif-thai', name: 'Noto Serif Thai', description: 'เหมาะกับหนังสือ วิชาการ และบทความยาว', sample: 'บทที่ 1 จุดเริ่มต้นของความคิด', stack: '"Noto Serif Thai", serif' },
  { id: 'sarabun', name: 'Sarabun', description: 'เอกสาร งานวิจัย คู่มือราชการ/องค์กร', sample: 'คู่มือปฏิบัติงานฉบับสมบูรณ์', stack: 'Sarabun, "Noto Sans Thai", sans-serif' },
  { id: 'prompt', name: 'Prompt', description: 'Modern UI และหัวข้อที่ดูร่วมสมัย', sample: 'สร้างงานจากความรู้ของคุณ', stack: 'Prompt, "Noto Sans Thai", sans-serif' },
  { id: 'kanit', name: 'Kanit', description: 'หัวข้อ ปก และงานนำเสนอที่ต้องการแรงส่ง', sample: 'AI Publishing Platform', stack: 'Kanit, "Noto Sans Thai", sans-serif' },
  { id: 'mitr', name: 'Mitr', description: 'เป็นมิตร เหมาะกับเด็ก คอร์ส และคอนเทนต์เบา', sample: 'เรียนรู้สนุก เข้าใจง่าย', stack: 'Mitr, "Noto Sans Thai", sans-serif' },
  { id: 'ibm-plex-sans-thai', name: 'IBM Plex Sans Thai', description: 'Professional เหมาะกับ SaaS/คู่มือองค์กร', sample: 'ระบบความรู้สำหรับทีมทำงาน', stack: '"IBM Plex Sans Thai", "Noto Sans Thai", sans-serif' },
];

const byContent: Record<string, Partial<{ theme: string; style: string; font: string }>> = {
  presentation: { theme: 'dark-premium', style: 'modern', font: 'kanit' },
  manual: { theme: 'academic', style: 'academic', font: 'sarabun' },
  report: { theme: 'academic', style: 'editorial', font: 'noto-serif-thai' },
  research: { theme: 'academic', style: 'academic', font: 'noto-serif-thai' },
  children: { theme: 'kids', style: 'kids', font: 'mitr' },
  manga: { theme: 'dark-premium', style: 'manga', font: 'kanit' },
  comic: { theme: 'kids', style: 'illustration', font: 'mitr' },
  business: { theme: 'business', style: 'editorial', font: 'ibm-plex-sans-thai' },
  marketing: { theme: 'pastel', style: 'modern', font: 'prompt' },
};

export const designDefaultsFor = (template?: TemplateDefinition | null) => {
  const category = template ? byContent[template.category] : undefined;
  const content = template ? byContent[template.contentType] : undefined;
  return {
    themeId: category?.theme ?? content?.theme ?? 'ai-technology',
    styleId: category?.style ?? content?.style ?? 'modern',
    fontId: category?.font ?? content?.font ?? 'noto-sans-thai',
  };
};

export const previewPagesFor = (template: TemplateDefinition): TemplatePreviewPage[] => {
  const isDeck = template.contentType === 'presentation';
  const chapter = template.structureDNA.sections[2]?.label ?? 'บทหลัก';
  return [
    {
      kind: isDeck ? 'slide' : 'cover',
      eyebrow: template.name,
      title: isDeck ? 'Opening Slide' : 'หน้าปกจริง',
      body: isDeck ? 'สไลด์เปิดเรื่องพร้อม headline, subtitle และ visual direction' : 'ปกตั้งต้นที่ใช้ธีมสี ฟอนต์ และสไตล์ของเทมเพลตนี้',
      bullets: [template.visualDNA.coverStyle, template.visualDNA.palette, template.targetAudience],
    },
    {
      kind: 'toc',
      eyebrow: 'Structure',
      title: isDeck ? 'แผนลำดับสไลด์' : 'ตัวอย่างสารบัญ',
      body: 'แสดงโครงสร้างก่อนสร้างจริง เพื่อให้ผู้ใช้เห็นว่าจะได้งานแนวไหน',
      bullets: template.structureDNA.sections.slice(0, 5).map(s => `${s.label} ${s.share}%`),
    },
    {
      kind: 'content',
      eyebrow: chapter,
      title: isDeck ? 'Key Slide Example' : 'หน้าบทความตัวอย่าง',
      body: template.description,
      bullets: [template.writingDNA.tone, `ระดับเนื้อหา ${template.writingDNA.technicalLevel}`, template.sourceStrategy.note],
    },
    {
      kind: 'spread',
      eyebrow: 'Output',
      title: isDeck ? 'สไลด์สรุป/Action' : 'ตัวอย่างหน้าคู่',
      body: 'จำลองภาพรวมของเนื้อหาพร้อม callout, checklist หรือภาพประกอบตามประเภทงาน',
      bullets: template.coverPreview.slice(0, 4),
    },
  ];
};

export const themeById = (id: string) => BOOK_THEMES.find(t => t.id === id) ?? BOOK_THEMES[0];
export const styleById = (id: string) => COVER_STYLES.find(s => s.id === id) ?? COVER_STYLES[1];
export const fontById = (id: string) => FONT_LIBRARY.find(f => f.id === id) ?? FONT_LIBRARY[0];
