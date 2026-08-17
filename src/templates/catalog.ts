import {
  ExportFormatName,
  PlanCodeName,
  StructureDNA,
  TemplateCategory,
  TemplateContentType,
  TemplateDefinition,
  VisualDNA,
  WritingDNA,
} from './types';

/* ------------------------------------------------------------------ */
/* DNA presets per content type — templates override only what differs */
/* ------------------------------------------------------------------ */

const W = (o: Partial<WritingDNA> = {}): WritingDNA => ({
  tone: 'เป็นมิตร ชัดเจน มืออาชีพ',
  sentenceComplexity: 'medium',
  paragraphLength: 'medium',
  explanationDepth: 'balanced',
  exampleFrequency: 'medium',
  technicalLevel: 'intermediate',
  storytellingLevel: 'medium',
  ctaStyle: 'soft',
  citationDensity: 'light',
  ...o,
});

const V = (o: Partial<VisualDNA> = {}): VisualDNA => ({
  palette: 'Midnight Prism (น้ำเงินเข้ม + ม่วง + ชมพู)',
  typography: 'Sora + Noto Sans Thai',
  coverStyle: 'Modern',
  chapterStyle: 'ตัวเลขใหญ่ + เส้นไล่เฉดสี',
  imageStyle: 'ภาพประกอบดิจิทัลโทนสว่าง',
  diagramStyle: 'ไดอะแกรมเส้นเรียบ',
  imageDensity: 'medium',
  ...o,
});

const S = (sections: [string, number][], engines?: string[], chapterLabel?: string): StructureDNA => ({
  sections: sections.map(([label, share]) => ({ label, share })),
  engines,
  chapterLabel,
});

const BOOK_STRUCTURE = S(
  [
    ['ปก', 2],
    ['คำนำ / บทเกริ่น', 5],
    ['บทหลัก', 76],
    ['บทสรุป', 8],
    ['ภาคผนวก / อ้างอิง', 9],
  ],
  undefined,
  'บทที่',
);

const EXPORTS: Record<TemplateContentType, ExportFormatName[]> = {
  book: ['pdf', 'docx', 'epub'],
  manual: ['pdf', 'docx'],
  course: ['pdf', 'docx'],
  presentation: ['pptx', 'pdf'],
  report: ['pdf', 'docx'],
  novel: ['pdf', 'docx', 'epub'],
  children: ['pdf', 'epub', 'images'],
  manga: ['pdf', 'images'],
  screenplay: ['pdf', 'docx'],
  article: ['pdf', 'docx'],
};

const THUMBS = [
  'from-primary/40 via-secondary/30 to-transparent',
  'from-secondary/40 via-primary/25 to-transparent',
  'from-highlight/35 via-primary/25 to-transparent',
  'from-primary/30 via-highlight/25 to-transparent',
];

interface Seed {
  id: string;
  name: string;
  category: TemplateCategory;
  contentType: TemplateContentType;
  description: string;
  audience: string;
  pages: number;
  chapters: number;
  tags: string[];
  difficulty?: TemplateDefinition['difficulty'];
  plan?: PlanCodeName;
  lock?: TemplateDefinition['sourceStrategy']['lock'];
  writing?: Partial<WritingDNA>;
  visual?: Partial<VisualDNA>;
  structure?: StructureDNA;
  engines?: string[];
  popular?: boolean;
  isNew?: boolean;
  featured?: boolean;
  prompt?: string;
  images?: string;
}

let seq = 0;

const mk = (s: Seed): TemplateDefinition => {
  const plan: PlanCodeName = s.plan ?? 'free';
  const lock = s.lock ?? 'medium';
  const structure = s.structure ?? BOOK_STRUCTURE;
  const thumb = THUMBS[seq++ % THUMBS.length];
  return {
    id: s.id,
    name: s.name,
    category: s.category,
    tags: s.tags,
    description: s.description,
    thumbnail: thumb,
    coverPreview: ['ปก', 'สารบัญ', 'ตัวอย่างหน้าเนื้อหา', 'หน้าอ้างอิง'],
    contentType: s.contentType,
    targetAudience: s.audience,
    defaultPageCount: s.pages,
    defaultChapterCount: s.chapters,
    difficulty: s.difficulty ?? 'beginner',
    writingDNA: W(s.writing),
    structureDNA: s.engines ? { ...structure, engines: s.engines } : structure,
    layoutDNA: {
      pageSize: s.contentType === 'presentation' ? '16:9' : 'A4',
      columns: 1,
      density: s.contentType === 'presentation' ? 'airy' : 'balanced',
      calloutStyle: 'กล่องไฮไลต์ขอบไล่เฉด',
      tableStyle: 'ตารางเส้นบาง หัวตารางไล่เฉด',
    },
    visualDNA: V(s.visual),
    sourceStrategy: {
      lock,
      recommendedSources: lock === 'high' ? 5 : lock === 'medium' ? 3 : 1,
      note:
        lock === 'high'
          ? 'ต้องมีแหล่งข้อมูลจริง เนื้อหาทุกส่วนอ้างอิงจากแหล่งที่เลือก'
          : lock === 'creative'
            ? 'ใช้แหล่งข้อมูลเป็นแรงบันดาลใจ AI สร้างสรรค์ได้อิสระ'
            : 'ผสมความรู้ AI กับแหล่งข้อมูลของคุณ',
    },
    imageStrategy: s.images ?? 'ภาพประกอบต้นบทและภาพอธิบายแนวคิดสำคัญ',
    citationStrategy:
      lock === 'high' ? 'อ้างอิงทุกข้อเท็จจริงพร้อมรายการอ้างอิงท้ายเล่ม' : lock === 'creative' ? 'ไม่ต้องอ้างอิง' : 'อ้างอิงเฉพาะข้อมูลเชิงตัวเลข/ข้อเท็จจริง',
    promptStrategy:
      s.prompt ??
      `วางโครงตาม ${structure.sections.map(x => x.label).join(' → ')} แล้วเขียนตาม Writing DNA ของเทมเพลต`,
    exportPreset: EXPORTS[s.contentType],
    requiredInputs: ['หัวข้อ', 'กลุ่มผู้อ่าน', 'ภาษา'],
    optionalInputs: ['แหล่งข้อมูล', 'จำนวนหน้า', 'สไตล์ภาพ', 'โทนการเขียน'],
    recommendedPlan: plan === 'free' ? 'free' : plan,
    minimumPlan: plan,
    isPremium: plan !== 'free',
    popular: s.popular,
    isNew: s.isNew,
    featured: s.featured,
    published: true,
    version: '1.0.0',
    marketplace: { enabled: false, moderationStatus: 'draft', downloads: 0, rating: 0 },
  };
};

/* ------------------------- 9. BOOK TEMPLATES ------------------------ */

const books: Seed[] = [
  { id: 'ai-tech-guide', name: 'AI / Technology Guide', category: 'book', contentType: 'book', description: 'คู่มือเทคโนโลยี/AI ฉบับอ่านเข้าใจง่าย พร้อมตัวอย่างการใช้งานจริง', audience: 'คนทำงานที่อยากใช้ AI', pages: 80, chapters: 8, tags: ['ai', 'เทคโนโลยี', 'guide'], popular: true, featured: true },
  { id: 'business-book', name: 'Business Book', category: 'book', contentType: 'book', description: 'หนังสือธุรกิจโครงสร้างแน่น มีเคสและกรอบคิดใช้ได้จริง', audience: 'เจ้าของธุรกิจ / ผู้บริหาร', pages: 120, chapters: 10, tags: ['ธุรกิจ', 'business'], difficulty: 'intermediate', plan: 'creator', popular: true },
  { id: 'marketing-book', name: 'Marketing Book', category: 'book', contentType: 'book', description: 'หนังสือการตลาดพร้อมเฟรมเวิร์ก แคมเปญตัวอย่าง และเช็กลิสต์', audience: 'นักการตลาด / เจ้าของแบรนด์', pages: 100, chapters: 9, tags: ['การตลาด', 'marketing'], plan: 'starter' },
  { id: 'howto-ebook', name: 'How-To eBook', category: 'ebook', contentType: 'book', description: 'eBook สอนทำทีละขั้น จบใน 1 นั่งอ่าน', audience: 'ผู้เริ่มต้นทุกสาย', pages: 30, chapters: 6, tags: ['how-to', 'ebook'], popular: true },
  { id: 'lead-magnet', name: 'Lead Magnet eBook', category: 'marketing', contentType: 'book', description: 'eBook แจกฟรีเพื่อเก็บรายชื่อลูกค้า มี CTA ชัดเจน', audience: 'ธุรกิจที่ทำ Content Marketing', pages: 20, chapters: 5, tags: ['lead', 'ขายของ', 'marketing'], writing: { ctaStyle: 'direct', paragraphLength: 'short' } },
  { id: 'pro-handbook', name: 'Professional Handbook', category: 'book', contentType: 'book', description: 'คู่มือวิชาชีพ อ้างอิงได้ เปิดอ่านเฉพาะหัวข้อได้', audience: 'มืออาชีพในสายงาน', pages: 140, chapters: 12, tags: ['handbook', 'อาชีพ'], difficulty: 'advanced', plan: 'creator', lock: 'high' },
  { id: 'personal-branding', name: 'Personal Branding Book', category: 'book', contentType: 'book', description: 'สร้างแบรนด์บุคคลผ่านเรื่องเล่าและกลยุทธ์คอนเทนต์', audience: 'ครีเอเตอร์ / ที่ปรึกษา', pages: 70, chapters: 8, tags: ['branding', 'ครีเอเตอร์'], writing: { storytellingLevel: 'high' } },
  { id: 'beginner-guide', name: 'Beginner Guide', category: 'ebook', contentType: 'book', description: 'ปูพื้นฐานตั้งแต่ศูนย์ ศัพท์ง่าย ภาพประกอบเยอะ', audience: 'มือใหม่', pages: 40, chapters: 7, tags: ['beginner', 'พื้นฐาน'], writing: { technicalLevel: 'beginner', sentenceComplexity: 'simple' }, popular: true },
  { id: 'advanced-guide', name: 'Advanced Guide', category: 'book', contentType: 'book', description: 'เจาะลึกระดับสูง พร้อมข้อควรระวังและเทคนิคขั้นสูง', audience: 'ผู้มีประสบการณ์', pages: 120, chapters: 10, tags: ['advanced'], difficulty: 'advanced', plan: 'creator', writing: { technicalLevel: 'advanced', explanationDepth: 'deep' } },
  { id: 'case-study-book', name: 'Case Study Book', category: 'business', contentType: 'book', description: 'รวมกรณีศึกษา วิเคราะห์บทเรียนแบบมีโครงสร้างเดียวกันทุกเคส', audience: 'ทีมกลยุทธ์ / นักเรียนธุรกิจ', pages: 90, chapters: 9, tags: ['case study', 'ธุรกิจ'], lock: 'high', plan: 'starter' },
  { id: 'reference-book', name: 'Reference Book', category: 'book', contentType: 'book', description: 'หนังสืออ้างอิง จัดหมวดคำ/หัวข้อ ค้นหาง่าย', audience: 'ผู้ใช้งานแบบเปิดหา', pages: 150, chapters: 14, tags: ['reference'], lock: 'high', plan: 'creator', difficulty: 'intermediate' },
  { id: 'biography', name: 'Biography', category: 'book', contentType: 'book', description: 'ชีวประวัติเล่าตามไทม์ไลน์ ผสมบทสัมภาษณ์และบริบทยุคสมัย', audience: 'ผู้อ่านทั่วไป', pages: 110, chapters: 10, tags: ['ชีวประวัติ'], writing: { storytellingLevel: 'high' }, plan: 'starter' },
];

/* ------------------- 10. MANUAL / TEXTBOOK TEMPLATES ---------------- */

const MANUAL_STRUCTURE = S(
  [
    ['ปก + ข้อมูลเวอร์ชัน', 3],
    ['ภาพรวมและข้อกำหนดเบื้องต้น', 8],
    ['ขั้นตอนการใช้งานหลัก', 62],
    ['การแก้ปัญหา (Troubleshooting)', 12],
    ['FAQ + อภิธานศัพท์', 9],
    ['อ้างอิง', 6],
  ],
  undefined,
  'ส่วนที่',
);

const manuals: Seed[] = [
  { id: 'ai-software-manual', name: 'AI Software Manual', category: 'manual', contentType: 'manual', description: 'คู่มือใช้งานซอฟต์แวร์ AI ทีละขั้น พร้อมภาพหน้าจอและ Troubleshooting', audience: 'ผู้ใช้งานซอฟต์แวร์', pages: 60, chapters: 8, tags: ['ai', 'คู่มือ', 'manual'], structure: MANUAL_STRUCTURE, lock: 'high', popular: true, featured: true },
  { id: 'technology-manual', name: 'Technology Manual', category: 'manual', contentType: 'manual', description: 'คู่มือเทคโนโลยีเชิงลึกสำหรับทีมเทคนิค', audience: 'ทีมเทคนิค', pages: 90, chapters: 10, tags: ['เทคโนโลยี', 'manual'], structure: MANUAL_STRUCTURE, lock: 'high', plan: 'creator', difficulty: 'advanced' },
  { id: 'product-user-guide', name: 'Product User Guide', category: 'manual', contentType: 'manual', description: 'คู่มือผู้ใช้สินค้า เข้าใจง่าย ใช้ได้ทั้งพิมพ์และดิจิทัล', audience: 'ลูกค้าผู้ใช้สินค้า', pages: 40, chapters: 7, tags: ['product', 'คู่มือ'], structure: MANUAL_STRUCTURE },
  { id: 'step-by-step-guide', name: 'Step-by-Step Guide', category: 'manual', contentType: 'manual', description: 'ทุกบทคือหนึ่งขั้นตอน มีเช็กลิสต์ปิดท้าย', audience: 'ผู้เริ่มต้น', pages: 30, chapters: 6, tags: ['step', 'คู่มือ'], structure: MANUAL_STRUCTURE, popular: true },
  { id: 'training-manual', name: 'Training Manual', category: 'education', contentType: 'manual', description: 'คู่มือฝึกอบรมพร้อมแบบฝึกหัดและแบบประเมิน', audience: 'ฝ่ายฝึกอบรม', pages: 70, chapters: 9, tags: ['training', 'อบรม'], structure: MANUAL_STRUCTURE, plan: 'starter' },
  { id: 'textbook', name: 'Textbook', category: 'education', contentType: 'manual', description: 'ตำราเรียนมีจุดประสงค์การเรียนรู้ สรุปบท และแบบฝึกหัด', audience: 'นักเรียน / นักศึกษา', pages: 160, chapters: 12, tags: ['ตำรา', 'ครู', 'การศึกษา'], structure: MANUAL_STRUCTURE, plan: 'creator', lock: 'high', difficulty: 'intermediate' },
  { id: 'teacher-guide', name: 'Teacher Guide', category: 'education', contentType: 'manual', description: 'คู่มือครู มีแผนการสอน เวลา และกิจกรรมในห้องเรียน', audience: 'ครู / วิทยากร', pages: 60, chapters: 8, tags: ['ครู', 'แผนการสอน'], structure: MANUAL_STRUCTURE, plan: 'starter' },
  { id: 'student-handbook', name: 'Student Handbook', category: 'education', contentType: 'manual', description: 'คู่มือนักเรียน สรุปกระชับ อ่านทบทวนได้เร็ว', audience: 'นักเรียน', pages: 45, chapters: 8, tags: ['นักเรียน'], structure: MANUAL_STRUCTURE },
  { id: 'sop-manual', name: 'SOP Manual', category: 'manual', contentType: 'manual', description: 'มาตรฐานการปฏิบัติงาน ระบุผู้รับผิดชอบและเกณฑ์ตรวจสอบ', audience: 'องค์กร / ทีมปฏิบัติการ', pages: 55, chapters: 9, tags: ['sop', 'องค์กร'], structure: MANUAL_STRUCTURE, lock: 'high', plan: 'starter' },
  { id: 'technical-doc', name: 'Technical Documentation', category: 'manual', contentType: 'manual', description: 'เอกสารเทคนิค API/ระบบ พร้อมตัวอย่างโค้ดและข้อจำกัด', audience: 'นักพัฒนา', pages: 80, chapters: 10, tags: ['dev', 'api'], structure: MANUAL_STRUCTURE, lock: 'high', plan: 'creator', difficulty: 'advanced' },
  { id: 'reference-manual', name: 'Reference Manual', category: 'manual', contentType: 'manual', description: 'คู่มืออ้างอิงแบบเปิดหา หัวข้อสั้น จบในตัว', audience: 'ผู้ใช้ระดับกลาง–สูง', pages: 100, chapters: 12, tags: ['reference'], structure: MANUAL_STRUCTURE, lock: 'high', plan: 'starter', difficulty: 'intermediate' },
];

/* ---------------------- 11. COURSE TEMPLATES ------------------------ */

const COURSE_STRUCTURE = S(
  [
    ['ปก + ภาพรวมคอร์ส', 4],
    ['จุดประสงค์การเรียนรู้', 5],
    ['บทเรียน + ตัวอย่าง', 55],
    ['แบบฝึกหัด / Workshop', 20],
    ['แบบทดสอบ (Quiz)', 8],
    ['สรุป + แผนต่อยอด', 8],
  ],
  ['Learning Objectives Engine', 'Exercise Builder', 'Quiz Generator'],
  'บทเรียนที่',
);

const courses: Seed[] = [
  { id: 'online-course-book', name: 'Online Course Book', category: 'course', contentType: 'course', description: 'หนังสือประกอบคอร์สออนไลน์ เรียนตามได้ทีละบท', audience: 'ผู้สอนออนไลน์', pages: 80, chapters: 10, tags: ['คอร์ส', 'online'], structure: COURSE_STRUCTURE, popular: true, featured: true },
  { id: 'workshop-workbook', name: 'Workshop Workbook', category: 'course', contentType: 'course', description: 'สมุดกิจกรรมเวิร์กช็อป มีที่ว่างให้เขียนและเช็กลิสต์', audience: 'ผู้เข้าอบรม', pages: 35, chapters: 6, tags: ['workshop', 'workbook'], structure: COURSE_STRUCTURE },
  { id: 'instructor-manual', name: 'Instructor Manual', category: 'course', contentType: 'course', description: 'คู่มือผู้สอน มีสคริปต์ เวลา และคำถามชวนคิด', audience: 'วิทยากร', pages: 60, chapters: 9, tags: ['วิทยากร'], structure: COURSE_STRUCTURE, plan: 'starter' },
  { id: 'student-workbook', name: 'Student Workbook', category: 'course', contentType: 'course', description: 'สมุดงานผู้เรียน เน้นฝึกทำมากกว่าอ่าน', audience: 'ผู้เรียน', pages: 40, chapters: 8, tags: ['workbook'], structure: COURSE_STRUCTURE },
  { id: '30-day-program', name: '30-Day Learning Program', category: 'course', contentType: 'course', description: 'โปรแกรมเรียน 30 วัน วันละบทเรียนสั้น + ภารกิจ', audience: 'ผู้เรียนด้วยตนเอง', pages: 70, chapters: 30, tags: ['30 วัน', 'challenge'], structure: COURSE_STRUCTURE, plan: 'starter', popular: true },
  { id: '7-day-challenge', name: '7-Day Challenge', category: 'course', contentType: 'course', description: 'ชาเลนจ์ 7 วัน กระชับ ลงมือทำทันที', audience: 'ผู้เรียนที่มีเวลาน้อย', pages: 25, chapters: 7, tags: ['challenge'], structure: COURSE_STRUCTURE },
  { id: 'certification-course', name: 'Certification Course', category: 'course', contentType: 'course', description: 'คอร์สมีเกณฑ์วัดผลและข้อสอบท้ายโมดูล', audience: 'องค์กร / สถาบัน', pages: 120, chapters: 12, tags: ['certificate'], structure: COURSE_STRUCTURE, plan: 'creator', difficulty: 'advanced' },
  { id: 'corporate-training', name: 'Corporate Training', category: 'course', contentType: 'course', description: 'หลักสูตรอบรมองค์กร มีเคสภายในและ KPI การเรียนรู้', audience: 'HR / L&D', pages: 90, chapters: 10, tags: ['องค์กร', 'hr'], structure: COURSE_STRUCTURE, plan: 'creator', lock: 'high' },
  { id: 'ai-training-course', name: 'AI Training Course', category: 'course', contentType: 'course', description: 'หลักสูตรสอนใช้ AI ตั้งแต่พื้นฐานถึงใช้งานจริงในงาน', audience: 'พนักงาน / นักเรียน', pages: 100, chapters: 10, tags: ['ai', 'อบรม', 'ครู'], structure: COURSE_STRUCTURE, plan: 'starter', popular: true, isNew: true },
];

/* ------------------- 12. PRESENTATION TEMPLATES --------------------- */

const DECK_STRUCTURE = S(
  [
    ['สไลด์เปิด', 5],
    ['ปัญหา / บริบท', 15],
    ['เนื้อหาหลัก', 50],
    ['ตัวอย่าง / ข้อมูลสนับสนุน', 20],
    ['สรุป + Call to Action', 10],
  ],
  undefined,
  'ส่วนที่',
);

const deck = (id: string, name: string, description: string, audience: string, slides: number, tags: string[], extra: Partial<Seed> = {}): Seed => ({
  id, name, category: 'presentation', contentType: 'presentation', description, audience,
  pages: slides, chapters: Math.max(3, Math.round(slides / 5)), tags, structure: DECK_STRUCTURE,
  visual: { imageDensity: 'high', coverStyle: 'Bold' }, ...extra,
});

const decks: Seed[] = [
  deck('teaching-deck', 'Teaching Presentation', 'สไลด์สอนที่มีจุดประสงค์ กิจกรรม และคำถามท้ายบท', 'ครู / วิทยากร', 20, ['ครู', 'สอน'], { popular: true, featured: true }),
  deck('technology-deck', 'Technology Presentation', 'อธิบายเทคโนโลยีด้วยไดอะแกรมและตัวอย่างจริง', 'ทีมเทค / ลูกค้า', 20, ['เทคโนโลยี', 'ai']),
  deck('business-deck', 'Business Presentation', 'สไลด์ธุรกิจ โครงสร้างชัด ตัวเลขเด่น', 'ผู้บริหาร', 20, ['ธุรกิจ'], { plan: 'starter' }),
  deck('pitch-deck', 'Pitch Deck', 'เล่าปัญหา–ทางแก้–ตลาด–ทีม–ตัวเลข ใน 12–15 สไลด์', 'นักลงทุน', 15, ['pitch', 'startup'], { plan: 'creator', difficulty: 'intermediate', popular: true }),
  deck('sales-deck', 'Sales Deck', 'สไลด์ปิดการขาย เน้นคุณค่าและข้อเสนอ', 'ลูกค้าองค์กร', 20, ['ขายของ', 'sales'], { plan: 'starter', writing: { ctaStyle: 'direct' } }),
  deck('marketing-strategy-deck', 'Marketing Strategy', 'กลยุทธ์การตลาดพร้อมแผนช่องทางและงบประมาณ', 'ทีมการตลาด', 30, ['การตลาด'], { plan: 'starter' }),
  deck('research-deck', 'Research Presentation', 'นำเสนองานวิจัย มีระเบียบวิธีและผลลัพธ์', 'นักวิจัย / อาจารย์', 30, ['วิจัย'], { lock: 'high' }),
  deck('workshop-deck', 'Workshop', 'สไลด์เวิร์กช็อป สลับสอน–ลงมือทำ', 'ผู้เข้าร่วม', 30, ['workshop']),
  deck('conference-deck', 'Conference', 'สไลด์เวทีใหญ่ ข้อความน้อย ภาพเด่น', 'ผู้ฟังงานสัมมนา', 20, ['conference'], { plan: 'starter' }),
  deck('keynote-deck', 'Keynote', 'คีย์โน้ตเล่าเรื่องทรงพลัง ปิดด้วยข้อความจดจำ', 'ผู้ฟังทั่วไป', 20, ['keynote'], { plan: 'creator', writing: { storytellingLevel: 'high' } }),
  deck('company-profile-deck', 'Company Profile', 'แนะนำองค์กร บริการ ผลงาน และทีม', 'ลูกค้า / พาร์ตเนอร์', 20, ['องค์กร']),
  deck('product-deck', 'Product Presentation', 'เปิดตัวสินค้า จุดเด่น ราคา และการใช้งาน', 'ลูกค้า', 20, ['product']),
  deck('investor-deck', 'Investor Deck', 'ดีลเชิงตัวเลข ตลาด และแผนเติบโต', 'นักลงทุน VC', 20, ['investor'], { plan: 'creator', lock: 'high', difficulty: 'advanced' }),
];

/* ------------------ 13. BUSINESS / MARKETING ------------------------ */

const business: Seed[] = [
  { id: 'marketing-strategy', name: 'Marketing Strategy', category: 'marketing', contentType: 'report', description: 'เอกสารกลยุทธ์การตลาด ครบตั้งแต่ insight ถึงแผนปฏิบัติ', audience: 'ทีมการตลาด', pages: 40, chapters: 8, tags: ['การตลาด'], plan: 'starter' },
  { id: 'business-plan', name: 'Business Plan', category: 'business', contentType: 'report', description: 'แผนธุรกิจพร้อมประมาณการและความเสี่ยง', audience: 'ผู้ก่อตั้ง / ธนาคาร', pages: 50, chapters: 9, tags: ['ธุรกิจ', 'แผน'], plan: 'creator', lock: 'high' },
  { id: 'brand-strategy', name: 'Brand Strategy', category: 'marketing', contentType: 'report', description: 'วางตัวตนแบรนด์ เสียง และแนวทางสื่อสาร', audience: 'แบรนด์ / เอเจนซี', pages: 35, chapters: 7, tags: ['branding'], plan: 'starter' },
  { id: 'social-media-plan', name: 'Social Media Plan', category: 'marketing', contentType: 'report', description: 'แผนคอนเทนต์รายเดือน พร้อมปฏิทินและ KPI', audience: 'แอดมินเพจ / ครีเอเตอร์', pages: 30, chapters: 6, tags: ['social', 'คอนเทนต์'] },
  { id: 'content-strategy', name: 'Content Strategy', category: 'marketing', contentType: 'report', description: 'กลยุทธ์คอนเทนต์ตาม funnel และกลุ่มเป้าหมาย', audience: 'ทีมคอนเทนต์', pages: 35, chapters: 7, tags: ['คอนเทนต์'], plan: 'starter' },
  { id: 'product-launch', name: 'Product Launch', category: 'business', contentType: 'report', description: 'แผนเปิดตัวสินค้า ไทม์ไลน์ และช่องทาง', audience: 'ทีมผลิตภัณฑ์', pages: 30, chapters: 6, tags: ['launch'], plan: 'starter' },
  { id: 'sales-playbook', name: 'Sales Playbook', category: 'business', contentType: 'manual', description: 'คู่มือขาย สคริปต์ การรับมือข้อโต้แย้ง', audience: 'ทีมขาย', pages: 45, chapters: 8, tags: ['ขายของ', 'sales'], structure: MANUAL_STRUCTURE, plan: 'creator' },
  { id: 'company-profile', name: 'Company Profile', category: 'business', contentType: 'book', description: 'โปรไฟล์องค์กรฉบับพิมพ์/ดิจิทัล', audience: 'ลูกค้า / พาร์ตเนอร์', pages: 24, chapters: 6, tags: ['องค์กร'] },
  { id: 'proposal', name: 'Proposal', category: 'business', contentType: 'report', description: 'ข้อเสนอโครงการ ขอบเขตงาน ราคา และไทม์ไลน์', audience: 'ลูกค้าองค์กร', pages: 20, chapters: 6, tags: ['proposal'], writing: { ctaStyle: 'direct' } },
  { id: 'white-paper', name: 'White Paper', category: 'business', contentType: 'report', description: 'เอกสารเชิงลึกอ้างอิงข้อมูล สร้างความน่าเชื่อถือ', audience: 'ผู้ตัดสินใจ B2B', pages: 25, chapters: 6, tags: ['white paper'], lock: 'high', plan: 'creator', difficulty: 'intermediate' },
  { id: 'case-study-doc', name: 'Case Study', category: 'business', contentType: 'report', description: 'กรณีศึกษาลูกค้า ปัญหา–วิธีแก้–ผลลัพธ์', audience: 'ทีมขาย / ลูกค้า', pages: 12, chapters: 4, tags: ['case study'], lock: 'high' },
  { id: 'leadgen-guide', name: 'Lead Generation Guide', category: 'marketing', contentType: 'book', description: 'คู่มือสร้างลูกค้าใหม่ พร้อมเทมเพลตข้อความ', audience: 'ธุรกิจ SME', pages: 30, chapters: 7, tags: ['lead', 'ขายของ'], plan: 'starter' },
];

/* --------------------- 14. REPORT / RESEARCH ------------------------ */

const REPORT_STRUCTURE = S(
  [
    ['ปก + บทสรุปผู้บริหาร', 8],
    ['บทนำและขอบเขต', 10],
    ['ระเบียบวิธี / แหล่งข้อมูล', 10],
    ['ผลการวิเคราะห์', 45],
    ['ข้อเสนอแนะ', 15],
    ['บรรณานุกรม', 12],
  ],
  ['Source Lock', 'Citation Engine'],
  'หัวข้อที่',
);

const reportSeed = (id: string, name: string, description: string, audience: string, pages: number, tags: string[], extra: Partial<Seed> = {}): Seed => ({
  id, name, category: 'report', contentType: 'report', description, audience, pages,
  chapters: Math.max(5, Math.round(pages / 6)), tags, structure: REPORT_STRUCTURE, lock: 'high',
  writing: { citationDensity: 'heavy', tone: 'เป็นทางการ กระชับ อิงข้อมูล', storytellingLevel: 'low' },
  difficulty: 'intermediate', ...extra,
});

const reports: Seed[] = [
  reportSeed('research-report', 'Research Report', 'รายงานวิจัยเต็มรูปแบบ อ้างอิงทุกข้อค้นพบ', 'นักวิจัย / อาจารย์', 45, ['วิจัย'], { plan: 'creator', popular: true }),
  reportSeed('industry-report', 'Industry Report', 'รายงานอุตสาหกรรม ภาพรวมตลาดและผู้เล่น', 'นักวิเคราะห์', 40, ['อุตสาหกรรม'], { plan: 'creator' }),
  reportSeed('executive-report', 'Executive Report', 'สรุปสำหรับผู้บริหาร อ่านจบใน 15 นาที', 'ผู้บริหาร', 20, ['executive'], { plan: 'starter' }),
  reportSeed('technical-report', 'Technical Report', 'รายงานเทคนิค ผลทดสอบ และข้อจำกัด', 'ทีมเทคนิค', 35, ['เทคนิค'], { difficulty: 'advanced', plan: 'creator' }),
  reportSeed('market-analysis', 'Market Analysis', 'วิเคราะห์ตลาด ขนาด แนวโน้ม และโอกาส', 'ทีมกลยุทธ์', 30, ['ตลาด'], { plan: 'starter' }),
  reportSeed('competitor-analysis', 'Competitor Analysis', 'เทียบคู่แข่งเชิงกลยุทธ์และจุดต่าง', 'ทีมกลยุทธ์', 25, ['คู่แข่ง'], { plan: 'starter' }),
  reportSeed('trend-report', 'Trend Report', 'รายงานเทรนด์พร้อมสัญญาณและผลกระทบ', 'ผู้บริหาร / นักการตลาด', 25, ['เทรนด์'], { isNew: true }),
  reportSeed('research-case-study', 'Case Study (Research)', 'กรณีศึกษาเชิงวิชาการ', 'นักศึกษา / นักวิจัย', 18, ['case study']),
  reportSeed('research-white-paper', 'White Paper (Research)', 'ไวต์เปเปอร์อิงงานวิจัย', 'ผู้ตัดสินใจ', 22, ['white paper'], { plan: 'creator' }),
  reportSeed('academic-overview', 'Academic Overview', 'ปริทัศน์วรรณกรรมสรุปองค์ความรู้', 'นักศึกษา', 30, ['วิชาการ']),
];

/* ----------------------------- 15. NOVEL ---------------------------- */

const NOVEL_ENGINES = ['Story Architect', 'Character Bible', 'World Bible', 'Plot Engine', 'Timeline', 'Continuity QA'];
const NOVEL_STRUCTURE = S(
  [
    ['ปก + หน้าเปิดเรื่อง', 3],
    ['องก์ 1 — ปูเรื่อง', 25],
    ['องก์ 2 — พัฒนา/ขัดแย้ง', 45],
    ['องก์ 3 — จุดพีคและคลี่คลาย', 22],
    ['ท้ายเล่ม', 5],
  ],
  NOVEL_ENGINES,
  'บทที่',
);

const novelSeed = (id: string, name: string, description: string, tags: string[], extra: Partial<Seed> = {}): Seed => ({
  id, name, category: 'novel', contentType: 'novel', description, audience: 'นักอ่านนิยาย',
  pages: 150, chapters: 20, tags, structure: NOVEL_STRUCTURE, lock: 'creative',
  writing: { storytellingLevel: 'high', citationDensity: 'none', exampleFrequency: 'low', tone: 'เล่าเรื่องมีชั้นเชิง' },
  visual: { imageDensity: 'low', coverStyle: 'Elegant' }, ...extra,
});

const novels: Seed[] = [
  novelSeed('novel-romance', 'Romance', 'นิยายรัก เน้นความสัมพันธ์และอารมณ์ตัวละคร', ['โรแมนซ์'], { popular: true }),
  novelSeed('novel-fantasy', 'Fantasy', 'โลกแฟนตาซี มีระบบเวทมนตร์และแผนที่โลก', ['แฟนตาซี'], { plan: 'starter' }),
  novelSeed('novel-scifi', 'Sci-Fi', 'ไซไฟ แนวคิดเทคโนโลยีล้ำยุค', ['ไซไฟ'], { plan: 'starter' }),
  novelSeed('novel-mystery', 'Mystery', 'ปริศนาซ่อนเงื่อน มีเบาะแสวางเป็นระบบ', ['ปริศนา']),
  novelSeed('novel-thriller', 'Thriller', 'ระทึกขวัญ จังหวะเร็ว ตัดฉากกระชับ', ['ระทึกขวัญ'], { plan: 'starter' }),
  novelSeed('novel-horror', 'Horror', 'สยองขวัญ สร้างบรรยากาศและจังหวะหลอน', ['สยองขวัญ'], { plan: 'starter' }),
  novelSeed('novel-adventure', 'Adventure', 'ผจญภัย เดินทาง และภารกิจ', ['ผจญภัย']),
  novelSeed('novel-historical', 'Historical Fiction', 'นิยายอิงประวัติศาสตร์ ตรวจสอบบริบทยุคสมัย', ['ประวัติศาสตร์'], { plan: 'creator', lock: 'medium' }),
  novelSeed('novel-drama', 'Drama', 'ดราม่าชีวิต เน้นปมภายใน', ['ดราม่า']),
  novelSeed('novel-ya', 'Young Adult', 'วัยรุ่นโตขึ้น ค้นหาตัวตน', ['วัยรุ่น']),
];

/* ------------------------ 16. CHILDREN'S BOOK ----------------------- */

const CHILD_STRUCTURE = S(
  [
    ['ปก', 5],
    ['เปิดเรื่อง / แนะนำตัวละคร', 20],
    ['เนื้อเรื่อง (ภาพ + ข้อความสั้น)', 60],
    ['บทเรียน / คำถามชวนคุย', 15],
  ],
  ['Age-Appropriate Guard', 'Illustration Planner'],
  'ตอนที่',
);

const childSeed = (id: string, name: string, description: string, tags: string[], extra: Partial<Seed> = {}): Seed => ({
  id, name, category: 'children', contentType: 'children', description, audience: 'เด็กและผู้ปกครอง',
  pages: 24, chapters: 8, tags, structure: CHILD_STRUCTURE, lock: 'creative',
  writing: { sentenceComplexity: 'simple', paragraphLength: 'short', technicalLevel: 'beginner', storytellingLevel: 'high', citationDensity: 'none', tone: 'อบอุ่น อ่อนโยน เหมาะกับเด็ก' },
  visual: { imageDensity: 'high', imageStyle: 'ภาพประกอบสีสันสดใส เส้นนุ่ม เหมาะกับเด็ก', coverStyle: 'Bold' },
  images: 'ภาพประกอบเต็มหน้าเกือบทุกหน้า ตัวละครคงเส้นคงวา',
  ...extra,
});

const children: Seed[] = [
  childSeed('kids-bedtime', 'Bedtime Story', 'นิทานก่อนนอน จังหวะอ่านนุ่ม จบอบอุ่น', ['นิทาน'], { popular: true }),
  childSeed('kids-educational', 'Educational Story', 'นิทานสอนความรู้ สอดแทรกคำศัพท์', ['ความรู้', 'ครู']),
  childSeed('kids-adventure', 'Adventure', 'ผจญภัยสนุก กระตุ้นจินตนาการ', ['ผจญภัย']),
  childSeed('kids-moral', 'Moral Story', 'นิทานสอนใจ มีข้อคิดชัดเจน', ['ข้อคิด']),
  childSeed('kids-bilingual', 'Bilingual Story', 'สองภาษา ไทย–อังกฤษ คู่หน้า', ['สองภาษา'], { plan: 'starter' }),
  childSeed('kids-picture', 'Picture Book', 'ภาพนำเรื่อง ข้อความน้อยมาก', ['ภาพ'], { plan: 'starter' }),
  childSeed('kids-early-reader', 'Early Reader', 'ฝึกอ่านคำง่าย ประโยคสั้น', ['ฝึกอ่าน']),
];

/* -------------------------- 17. MANGA / COMIC ----------------------- */

const MANGA_ENGINES = ['Character DNA', 'Panel Planner', 'Dialogue Engine', 'Bubble Layout', 'Camera Director', 'Expression Sheet', 'Scene Continuity', 'Visual Consistency QA'];
const MANGA_STRUCTURE = S(
  [
    ['ปก + Character Sheet', 8],
    ['บทเปิด', 20],
    ['บทกลาง (ไคลแม็กซ์ย่อย)', 50],
    ['บทจบ', 15],
    ['ท้ายเล่ม / ผู้เขียน', 7],
  ],
  MANGA_ENGINES,
  'ตอนที่',
);

const mangaSeed = (id: string, name: string, description: string, tags: string[], extra: Partial<Seed> = {}): Seed => ({
  id, name, category: 'manga', contentType: 'manga', description, audience: 'นักอ่านการ์ตูน',
  pages: 40, chapters: 5, tags, structure: MANGA_STRUCTURE, lock: 'creative',
  writing: { storytellingLevel: 'high', paragraphLength: 'short', citationDensity: 'none', tone: 'บทพูดสั้น กระชับ มีจังหวะ' },
  visual: { imageDensity: 'high', imageStyle: 'ลายเส้นการ์ตูน ตัวละครคงเส้นคงวา', coverStyle: 'Bold' },
  images: 'วางแพเนลต่อหน้า พร้อมมุมกล้องและสีหน้าตัวละคร',
  ...extra,
});

const mangas: Seed[] = [
  mangaSeed('manga-japanese', 'Japanese Manga', 'มังงะญี่ปุ่น อ่านขวาไปซ้าย แพเนลไดนามิก', ['manga'], { popular: true, plan: 'starter' }),
  mangaSeed('manga-webtoon', 'Webtoon', 'เว็บตูนแนวตั้ง เลื่อนอ่านบนมือถือ', ['webtoon'], { plan: 'starter' }),
  mangaSeed('comic-western', 'Western Comic', 'คอมิกตะวันตก แพเนลกริดคลาสสิก', ['comic'], { category: 'comic' }),
  mangaSeed('graphic-novel', 'Graphic Novel', 'กราฟิกโนเวลเล่าเรื่องยาว โทนภาพจริงจัง', ['graphic novel'], { category: 'comic', plan: 'creator', pages: 80 }),
  mangaSeed('educational-comic', 'Educational Comic', 'คอมิกให้ความรู้ เหมาะสอนในห้องเรียน', ['ครู', 'ความรู้'], { category: 'comic', lock: 'medium' }),
  mangaSeed('manga-action', 'Action Manga', 'ฉากต่อสู้ จังหวะเร็ว มุมกล้องดุดัน', ['action'], { plan: 'creator' }),
  mangaSeed('manga-romance', 'Romance Manga', 'มังงะรัก เน้นสีหน้าและช่วงเงียบ', ['โรแมนซ์'], { plan: 'starter' }),
  mangaSeed('manga-fantasy', 'Fantasy Manga', 'โลกแฟนตาซี ออกแบบตัวละครและฉากพิเศษ', ['แฟนตาซี'], { plan: 'creator', difficulty: 'advanced' }),
];

/* --------------------------- 18. SCREENPLAY ------------------------- */

const SCREEN_STRUCTURE = S(
  [
    ['หน้าปก + Logline', 5],
    ['องก์ 1', 25],
    ['องก์ 2', 45],
    ['องก์ 3', 20],
    ['ตัวละคร / หมายเหตุกล้อง', 5],
  ],
  ['Scene Builder', 'Slugline Formatter', 'Dialogue Engine', 'Character Tracker'],
  'ฉากที่',
);

const screenSeed = (id: string, name: string, description: string, pages: number, tags: string[], extra: Partial<Seed> = {}): Seed => ({
  id, name, category: 'screenplay', contentType: 'screenplay', description, audience: 'ทีมโปรดักชัน / ผู้กำกับ',
  pages, chapters: Math.max(4, Math.round(pages / 8)), tags, structure: SCREEN_STRUCTURE, lock: 'creative',
  writing: { storytellingLevel: 'high', paragraphLength: 'short', citationDensity: 'none', tone: 'บทภาพยนตร์มาตรฐาน' },
  visual: { imageDensity: 'none', imageStyle: 'ไม่มีภาพประกอบ (ยกเว้น storyboard)' },
  images: 'ไม่ใส่ภาพโดยค่าเริ่มต้น เพิ่ม storyboard ได้ตามต้องการ',
  ...extra,
});

const screenplays: Seed[] = [
  screenSeed('short-film', 'Short Film', 'บทหนังสั้น 10–20 นาที', 20, ['หนังสั้น'], { popular: true }),
  screenSeed('feature-film', 'Feature Film', 'บทภาพยนตร์ยาวเต็มเรื่อง', 110, ['ภาพยนตร์'], { plan: 'creator', difficulty: 'advanced' }),
  screenSeed('series', 'Series', 'บทซีรีส์ วางอาร์คข้ามตอน', 60, ['ซีรีส์'], { plan: 'creator' }),
  screenSeed('episode', 'Episode', 'บทหนึ่งตอน พร้อม cold open', 35, ['ตอน'], { plan: 'starter' }),
  screenSeed('documentary', 'Documentary', 'บทสารคดี มีบทบรรยายและบทสัมภาษณ์', 30, ['สารคดี'], { lock: 'high' }),
  screenSeed('youtube-story', 'YouTube Story', 'สคริปต์คลิปเล่าเรื่อง มี hook 10 วินาทีแรก', 12, ['youtube', 'ครีเอเตอร์'], { isNew: true }),
  screenSeed('animation-script', 'Animation', 'บทแอนิเมชัน ระบุแอ็กชันละเอียด', 25, ['แอนิเมชัน'], { plan: 'starter' }),
  screenSeed('commercial-story', 'Commercial Story', 'สคริปต์โฆษณา 30–60 วินาที', 6, ['โฆษณา', 'การตลาด']),
];

/* ------------------- 19. AI TECHNOLOGY TEMPLATE PACK ---------------- */

const aiSeed = (id: string, name: string, description: string, audience: string, tags: string[], extra: Partial<Seed> = {}): Seed => ({
  id, name, category: 'book', contentType: 'book', description, audience, pages: 60, chapters: 8,
  tags: ['ai', ...tags], lock: 'medium', featured: true,
  visual: { imageStyle: 'ภาพประกอบเทคโนโลยีโทนน้ำเงิน–ม่วง', diagramStyle: 'ผังลำดับขั้นตอน' },
  ...extra,
});

const aiPack: Seed[] = [
  aiSeed('ai-beginner-guide', 'AI Beginner Guide', 'เริ่มใช้ AI จากศูนย์ พร้อมตัวอย่างงานจริง', 'มือใหม่ทุกสาย', ['beginner'], { popular: true, writing: { technicalLevel: 'beginner', sentenceComplexity: 'simple' } }),
  aiSeed('genai-guide', 'Generative AI Guide', 'เข้าใจ Generative AI และการใช้งานในองค์กร', 'คนทำงาน', ['genai'], { plan: 'starter' }),
  aiSeed('prompt-engineering', 'Prompt Engineering', 'เขียนพรอมป์ต์ให้ได้ผลลัพธ์ที่ต้องการ พร้อมคลังพรอมป์ต์', 'ผู้ใช้ AI ทุกระดับ', ['prompt'], { plan: 'starter', popular: true }),
  aiSeed('ai-video-guide', 'AI Video Guide', 'สร้างวิดีโอด้วย AI ตั้งแต่สคริปต์ถึงตัดต่อ', 'ครีเอเตอร์', ['วิดีโอ'], { plan: 'creator' }),
  aiSeed('ai-image-guide', 'AI Image Guide', 'สร้างภาพด้วย AI ควบคุมสไตล์และความสม่ำเสมอ', 'ดีไซเนอร์ / ครีเอเตอร์', ['ภาพ'], { plan: 'starter' }),
  aiSeed('ai-marketing-guide', 'AI Marketing Guide', 'ใช้ AI ทำการตลาดครบ funnel', 'นักการตลาด', ['การตลาด'], { plan: 'creator' }),
  aiSeed('ai-automation', 'AI Business Automation', 'วางระบบอัตโนมัติในธุรกิจด้วย AI', 'เจ้าของธุรกิจ', ['automation'], { plan: 'creator', difficulty: 'intermediate' }),
  aiSeed('ai-content-creator', 'AI Content Creator', 'ผลิตคอนเทนต์ต่อเนื่องด้วย AI', 'ครีเอเตอร์', ['คอนเทนต์'], { plan: 'starter' }),
  aiSeed('ai-for-teachers', 'AI for Teachers', 'ใช้ AI ช่วยสอนและออกแบบสื่อการเรียน', 'ครู', ['ครู'], { isNew: true, popular: true }),
  aiSeed('ai-for-entrepreneurs', 'AI for Entrepreneurs', 'ใช้ AI สร้างและขยายธุรกิจ', 'ผู้ประกอบการ', ['ธุรกิจ'], { plan: 'creator' }),
  aiSeed('ai-tools-handbook', 'AI Tools Handbook', 'รวมเครื่องมือ AI พร้อมวิธีเลือกใช้', 'ทุกคน', ['tools'], { plan: 'starter', pages: 90, chapters: 12 }),
];

/* -------------------- 20. SOURCE-BASED TEMPLATES -------------------- */

const sourceSeed = (id: string, name: string, description: string, contentType: TemplateContentType, category: TemplateCategory, pages: number): Seed => ({
  id, name, category, contentType, description,
  audience: 'กำหนดเองตามแหล่งข้อมูล', pages, chapters: Math.max(5, Math.round(pages / 10)),
  tags: ['sources', 'แหล่งข้อมูล', 'youtube', 'pdf'], lock: 'high', featured: true, isNew: true,
  prompt: 'วิเคราะห์แหล่งข้อมูลที่เลือกก่อน แล้วเสนอโครงสร้างที่เหมาะกับเนื้อหาจริง จากนั้นเขียนโดยอ้างอิงเฉพาะแหล่งข้อมูล',
});

const sourceBased: Seed[] = [
  { ...sourceSeed('sources-to-book', 'TURN MY SOURCES INTO A BOOK', 'เปลี่ยน YouTube / PDF / เว็บ ของคุณให้เป็นหนังสือที่อ้างอิงได้', 'book', 'book', 120), popular: true },
  sourceSeed('sources-to-presentation', 'TURN MY SOURCES INTO A PRESENTATION', 'สรุปแหล่งข้อมูลเป็นสไลด์นำเสนอ', 'presentation', 'presentation', 40),
  sourceSeed('sources-to-course', 'TURN MY SOURCES INTO A COURSE', 'แปลงแหล่งข้อมูลเป็นคอร์สพร้อมแบบฝึกหัด', 'course', 'course', 60),
  sourceSeed('sources-to-manual', 'TURN MY SOURCES INTO A MANUAL', 'แปลงแหล่งข้อมูลเป็นคู่มือใช้งานทีละขั้น', 'manual', 'manual', 50),
  sourceSeed('sources-to-report', 'TURN MY SOURCES INTO A REPORT', 'สรุปแหล่งข้อมูลเป็นรายงานเชิงวิเคราะห์', 'report', 'report', 30),
];

/* ------------------------------ CUSTOM ------------------------------ */

const customSeeds: Seed[] = [
  { id: 'custom-blank', name: 'Custom / เริ่มจากศูนย์', category: 'custom', contentType: 'book', description: 'กำหนดโครงสร้าง โทน และรูปแบบเองทั้งหมด', audience: 'ผู้ใช้ที่รู้ว่าต้องการอะไร', pages: 40, chapters: 8, tags: ['custom'] },
  { id: 'custom-article', name: 'Article / บทความ', category: 'custom', contentType: 'article', description: 'บทความยาวคุณภาพสูง พร้อมหัวข้อย่อยและสรุป', audience: 'ผู้อ่านออนไลน์', pages: 8, chapters: 4, tags: ['บทความ', 'seo'], isNew: true },
];

export const TEMPLATES: TemplateDefinition[] = [
  ...books, ...manuals, ...courses, ...decks, ...business, ...reports,
  ...novels, ...children, ...mangas, ...screenplays, ...aiPack, ...sourceBased, ...customSeeds,
].map(mk);

export const getTemplate = (id?: string | null) => TEMPLATES.find(t => t.id === id) ?? null;

/** Creation categories shown on the post-login home. */
export const CREATE_CATEGORIES: {
  id: string;
  label: string;
  emoji: string;
  contentType: TemplateContentType;
  categories: TemplateCategory[];
}[] = [
  { id: 'book', label: 'หนังสือ / eBook', emoji: '📘', contentType: 'book', categories: ['book', 'ebook'] },
  { id: 'manual', label: 'คู่มือ / Textbook', emoji: '📚', contentType: 'manual', categories: ['manual'] },
  { id: 'course', label: 'คอร์ส / Workbook', emoji: '🎓', contentType: 'course', categories: ['course', 'education'] },
  { id: 'presentation', label: 'พรีเซนเทชัน', emoji: '📊', contentType: 'presentation', categories: ['presentation'] },
  { id: 'report', label: 'รายงาน / วิจัย', emoji: '📑', contentType: 'report', categories: ['report', 'research'] },
  { id: 'business', label: 'ธุรกิจ / การตลาด', emoji: '📈', contentType: 'report', categories: ['business', 'marketing'] },
  { id: 'novel', label: 'นิยาย', emoji: '📖', contentType: 'novel', categories: ['novel'] },
  { id: 'children', label: 'หนังสือเด็ก', emoji: '🧒', contentType: 'children', categories: ['children'] },
  { id: 'manga', label: 'มังงะ / คอมิก', emoji: '💬', contentType: 'manga', categories: ['manga', 'comic'] },
  { id: 'screenplay', label: 'บทภาพยนตร์', emoji: '🎬', contentType: 'screenplay', categories: ['screenplay'] },
  { id: 'custom', label: 'กำหนดเอง', emoji: '✨', contentType: 'book', categories: ['custom'] },
];

export const categoryTemplates = (categoryId: string) => {
  const cat = CREATE_CATEGORIES.find(c => c.id === categoryId);
  if (!cat) return TEMPLATES;
  return TEMPLATES.filter(t => cat.categories.includes(t.category) || t.contentType === cat.contentType);
};
