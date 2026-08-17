export type ShowcaseCategory =
  | 'book'
  | 'academic'
  | 'business'
  | 'presentation'
  | 'medical'
  | 'legal'
  | 'education'
  | 'kids'
  | 'language'
  | 'manga'
  | 'novel';

export interface ShowcasePage {
  title: string;
  kicker?: string;
  body: string[];
  bullets?: string[];
  note?: string;
  layout?: 'document' | 'spread' | 'slide' | 'comic' | 'kids';
}

export interface ShowcaseProject {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: ShowcaseCategory;
  subcategory: string;
  language: string;
  format: string;
  pageCount?: number;
  slideCount?: number;
  audience: string;
  style: string;
  exportFormats: string[];
  templateId: string;
  featured: boolean;
  cover: {
    theme: string;
    eyebrow: string;
    title: string;
    subtitle: string;
  };
  tableOfContents: string[];
  pages: ShowcasePage[];
}

export const CATEGORY_LABEL: Record<ShowcaseCategory | 'all', string> = {
  all: 'ทั้งหมด',
  book: 'หนังสือ',
  academic: 'วิจัย',
  business: 'ธุรกิจ',
  presentation: 'Presentation',
  medical: 'การแพทย์',
  legal: 'กฎหมาย',
  education: 'การศึกษา',
  kids: 'เด็ก',
  language: 'ภาษา',
  manga: 'Manga / Comic',
  novel: 'นิยาย',
};

export const SHOWCASE_PROJECTS: ShowcaseProject[] = [
  {
    id: 'ai-mastery-2026',
    slug: 'ai-mastery-2026',
    title: 'AI Mastery 2026',
    subtitle: 'คู่มือใช้ AI สำหรับคนทำงาน',
    description: 'ตัวอย่างหนังสือเทคโนโลยีที่รวมโครงบท คำอธิบาย ตัวอย่าง workflow และ checklist สำหรับนำ AI ไปใช้จริง',
    category: 'book',
    subcategory: 'AI / Technology Book',
    language: 'ไทย',
    format: 'Book · A5',
    pageCount: 120,
    audience: 'คนทำงาน ผู้ประกอบการ และทีมคอนเทนต์',
    style: 'Futuristic editorial / Prism tech',
    exportFormats: ['PDF', 'DOCX', 'EPUB'],
    templateId: 'ai-tech-guide',
    featured: true,
    cover: {
      theme: 'from-[#14213D] via-[#2D7CFF] to-[#00CFFF]',
      eyebrow: 'AI GUIDE',
      title: 'AI Mastery 2026',
      subtitle: 'ทำงานเร็วขึ้น คิดเป็นระบบขึ้น และสร้างผลงานได้มากขึ้นด้วย AI',
    },
    tableOfContents: ['คำนำ', 'บทที่ 1 Generative AI คืออะไร', 'บทที่ 2 Prompt Design', 'บทที่ 3 AI Workflow', 'Checklist ใช้งานจริง'],
    pages: [
      {
        title: 'คำนำ',
        kicker: 'Preface',
        body: [
          'หนังสือเล่มนี้ออกแบบให้ผู้อ่านเริ่มใช้ AI ได้อย่างเป็นระบบ ไม่ใช่แค่ถามคำถาม แต่รู้จักออกแบบบริบท เป้าหมาย และเกณฑ์คุณภาพของคำตอบ',
          'ตัวอย่างทุกบทเป็นสถานการณ์จำลองสำหรับการเรียนรู้ ผู้อ่านควรตรวจสอบข้อเท็จจริงและปรับใช้ให้เหมาะกับงานจริงของตนเอง',
        ],
      },
      {
        title: 'บทที่ 1: Generative AI คืออะไร',
        body: [
          'Generative AI คือระบบที่สร้างข้อความ ภาพ โค้ด หรือโครงงานใหม่จากคำสั่งและบริบทที่ผู้ใช้ให้ ความสามารถหลักไม่ได้อยู่ที่การตอบเร็ว แต่อยู่ที่การช่วยจัดโครงความคิดและเปลี่ยนข้อมูลกระจัดกระจายให้เป็นผลงานที่ใช้ต่อได้',
        ],
        bullets: ['ใช้สรุปและจัดหมวดข้อมูล', 'ช่วยร่างเนื้อหาและโครงเรื่อง', 'สร้าง variation ของแนวคิด', 'ตรวจจุดอ่อนของงานก่อนเผยแพร่'],
      },
      {
        title: 'Checklist: AI Workflow ที่ดี',
        layout: 'spread',
        body: ['ก่อนเริ่มงานทุกครั้ง ให้กำหนดผลลัพธ์ที่ต้องการ กลุ่มผู้อ่าน แหล่งข้อมูลที่อนุญาต และรูปแบบไฟล์ปลายทาง'],
        bullets: ['กำหนดเป้าหมาย', 'ใส่แหล่งข้อมูล', 'ขอ outline ก่อนเขียน', 'ให้ AI ตรวจ consistency', 'ส่งออกและตรวจ proof'],
      },
    ],
  },
  {
    id: 'research-intelligence',
    slug: 'research-intelligence',
    title: 'Research Intelligence',
    subtitle: 'ตัวอย่างรายงานวิจัยพร้อม citation',
    description: 'สาธิตโครงงานวิจัยแบบอ่านได้จริง ตั้งแต่ abstract, research questions, methodology และ references ตัวอย่าง',
    category: 'academic',
    subcategory: 'Academic Report',
    language: 'ไทย / English terms',
    format: 'Research · A4',
    pageCount: 86,
    audience: 'นักศึกษา นักวิจัย และทีมวิเคราะห์',
    style: 'Academic dark cover / clean white pages',
    exportFormats: ['PDF', 'DOCX'],
    templateId: 'sources-to-report',
    featured: true,
    cover: {
      theme: 'from-[#0F172A] via-[#334155] to-[#7C3AED]',
      eyebrow: 'RESEARCH DEMO',
      title: 'Research Intelligence',
      subtitle: 'ตัวอย่างโครงรายงานวิจัยพร้อมบทคัดย่อ วิธีวิจัย และรายการอ้างอิง',
    },
    tableOfContents: ['Abstract', 'Chapter 1 Introduction', 'Literature Review', 'Methodology', 'Demo References'],
    pages: [
      {
        title: 'Abstract',
        body: [
          'This sample demonstrates how KIVORA can structure a research-style report from selected sources. The content is for demonstration only and should not be treated as verified research findings.',
          'The report illustrates problem framing, research objectives, and a transparent citation area for source-grounded writing.',
        ],
        note: 'DEMO ONLY: citations shown here are placeholders for style demonstration.',
      },
      {
        title: 'Chapter 1: Introduction',
        body: ['การเริ่มรายงานวิจัยที่ดีควรอธิบายปัญหา บริบท ความสำคัญ และขอบเขตการศึกษาให้ชัดเจน เพื่อให้ผู้อ่านเข้าใจว่าทำไมคำถามวิจัยจึงมีความหมาย'],
        bullets: ['Problem Statement', 'Research Objectives', 'Research Questions', 'Scope and Limitations'],
      },
      {
        title: 'References Style',
        body: ['ตัวอย่างการอ้างอิงในเนื้อหาอาจแสดงเป็น (Demo Source, 2026) และในท้ายรายงานจัดเป็นรายการ references ที่ตรวจกลับได้เมื่อผู้ใช้แนบแหล่งข้อมูลจริง'],
      },
    ],
  },
  {
    id: 'growth-deck',
    slug: 'growth-deck',
    title: 'AI Growth Strategy',
    subtitle: 'พรีเซนเทชันสำหรับทีมธุรกิจ',
    description: 'ตัวอย่าง slide deck พร้อม message hierarchy, key visual, roadmap และ speaker note แบบกระชับ',
    category: 'presentation',
    subcategory: 'Business Presentation',
    language: 'ไทย',
    format: 'Presentation · 16:9',
    slideCount: 8,
    audience: 'ผู้บริหาร ทีมขาย และทีมการตลาด',
    style: 'Premium business deck / neon wave',
    exportFormats: ['PPTX', 'PDF'],
    templateId: 'business-pitch-deck',
    featured: true,
    cover: {
      theme: 'from-[#1E1B4B] via-[#7C3AED] to-[#DB2777]',
      eyebrow: 'PRESENTATION',
      title: 'AI Growth Strategy',
      subtitle: 'แผนใช้ AI เพิ่มยอดขายและลดงานซ้ำใน 90 วัน',
    },
    tableOfContents: ['01 Cover', '02 Problem', '03 Opportunity', '04 Use Cases', '05 Roadmap'],
    pages: [
      {
        title: 'AI Growth Strategy',
        layout: 'slide',
        body: ['เปลี่ยนทีมขายและการตลาดให้ทำงานเร็วขึ้นด้วย AI workflow ที่วัดผลได้'],
        bullets: ['90-day roadmap', 'Lead response automation', 'Content production engine'],
      },
      {
        title: 'Problem',
        layout: 'slide',
        body: ['ทีมใช้เวลามากกับงานซ้ำ เช่น สรุปลูกค้า เขียน proposal และผลิตคอนเทนต์ ทำให้เวลาสำหรับกลยุทธ์ลดลง'],
        bullets: ['Response time สูง', 'Message ไม่สม่ำเสมอ', 'ข้อมูลลูกค้ากระจาย'],
      },
      {
        title: 'Roadmap',
        layout: 'slide',
        body: ['เริ่มจาก use case ที่ง่าย วัดผลชัด แล้วขยายไปยัง workflow ที่มีผลต่อรายได้'],
        bullets: ['Week 1-2: Knowledge base', 'Week 3-6: Sales assistant', 'Week 7-12: Campaign engine'],
      },
    ],
  },
  {
    id: 'milo-little-star',
    slug: 'milo-little-star',
    title: 'มิโลกับดาวดวงน้อย',
    subtitle: 'นิทานเด็กพร้อมหน้ากิจกรรม',
    description: 'ตัวอย่างหนังสือเด็กภาพสี มีตัวละครสม่ำเสมอ เนื้อเรื่องอ่านง่าย และหน้ากิจกรรมท้ายเล่ม',
    category: 'kids',
    subcategory: 'Picture Book',
    language: 'ไทย',
    format: 'Kids Book · Square',
    pageCount: 24,
    audience: 'เด็ก 4-7 ปี ผู้ปกครอง และครู',
    style: 'Soft colorful illustration / bedtime story',
    exportFormats: ['PDF', 'EPUB', 'Images'],
    templateId: 'kids-bedtime',
    featured: true,
    cover: {
      theme: 'from-[#38BDF8] via-[#A78BFA] to-[#F472B6]',
      eyebrow: 'KIDS BOOK',
      title: 'มิโลกับดาวดวงน้อย',
      subtitle: 'นิทานอบอุ่นเกี่ยวกับความกล้าและการแบ่งปันแสงสว่าง',
    },
    tableOfContents: ['รู้จักมิโล', 'คืนที่ฟ้ามืด', 'ดาวดวงน้อย', 'กิจกรรมท้ายเล่ม'],
    pages: [
      {
        title: 'รู้จักมิโล',
        layout: 'kids',
        body: ['มิโลเป็นเด็กน้อยที่ชอบมองท้องฟ้าทุกคืน เขามีกล้องดูดาวสีฟ้าและสมุดเล่มเล็กสำหรับวาดสิ่งที่เห็น'],
      },
      {
        title: 'คืนที่ฟ้ามืด',
        layout: 'kids',
        body: ['คืนหนึ่ง ท้องฟ้าไม่มีดาวเลย มิโลได้ยินเสียงเบา ๆ จากหลังหน้าต่าง “ช่วยฉันหน่อยได้ไหม”'],
      },
      {
        title: 'กิจกรรม: วาดดาวของหนู',
        layout: 'kids',
        body: ['ลองวาดดาวหนึ่งดวง แล้วเขียนหนึ่งคำที่ทำให้หนูรู้สึกกล้าหาญ'],
        bullets: ['ดาวของฉันชื่ออะไร?', 'ดาวของฉันช่วยใคร?', 'วันนี้ฉันแบ่งปันอะไรได้บ้าง?'],
      },
    ],
  },
  {
    id: 'neon-guardians-manga',
    slug: 'neon-guardians-manga',
    title: 'Neon Guardians',
    subtitle: 'มังงะไซไฟตัวอย่าง',
    description: 'ตัวอย่าง comic/manga reader ที่โชว์ character sheet, panels, dialogue และ scene progression',
    category: 'manga',
    subcategory: 'Manga / Comic',
    language: 'ไทย',
    format: 'Manga · Vertical pages',
    pageCount: 36,
    audience: 'นักอ่านการ์ตูน ครีเอเตอร์ และทีมคอนเทนต์',
    style: 'Neon cyberpunk / cinematic panels',
    exportFormats: ['PDF', 'Images'],
    templateId: 'manga-japanese',
    featured: true,
    cover: {
      theme: 'from-[#020617] via-[#4F46E5] to-[#EC4899]',
      eyebrow: 'MANGA DEMO',
      title: 'Neon Guardians',
      subtitle: 'เมื่อเมืองทั้งเมืองถูกปิดไฟ เด็กฝึกงานคนหนึ่งค้นพบพลังของแสง',
    },
    tableOfContents: ['Character Sheet', 'Page 1: Blackout', 'Page 2: Signal', 'Page 3: First Light'],
    pages: [
      {
        title: 'Character Sheet',
        layout: 'comic',
        body: ['ARIA: เด็กฝึกงานซ่อมระบบไฟเมือง', 'NOVA: AI drone ขนาดเล็กที่เก็บความทรงจำของเมือง', 'THE SHADE: เงาลึกลับที่ดูดพลังงานจากสัญญาณไฟ'],
      },
      {
        title: 'Page 1: Blackout',
        layout: 'comic',
        body: ['Panel 1: เมืองสูงเสียดฟ้าอยู่ในความมืด', 'Panel 2: Aria วิ่งผ่านตรอกพร้อมไฟฉาย', 'Panel 3: เสียงจาก drone: “สัญญาณสุดท้ายอยู่บนหอคอย”'],
      },
      {
        title: 'Page 2: Signal',
        layout: 'comic',
        body: ['Aria: “ถ้าเราจุดไฟได้หนึ่งดวง เมืองนี้ยังมีหวัง”', 'Nova: “กำลังเปิดแผนที่พลังงาน... ระวังด้านหลัง!”'],
      },
    ],
  },
  {
    id: 'human-anatomy-visual-guide',
    slug: 'human-anatomy-visual-guide',
    title: 'Human Anatomy Visual Guide',
    subtitle: 'คู่มือภาพกายวิภาคเพื่อการศึกษา',
    description: 'ตัวอย่าง medical publication ที่เน้นความชัดเจน label และ disclaimer ทางการแพทย์',
    category: 'medical',
    subcategory: 'Medical Atlas',
    language: 'ไทย / English labels',
    format: 'Medical Guide · A4',
    pageCount: 64,
    audience: 'ครู นักเรียนสายวิทย์ และทีมอบรมสุขภาพ',
    style: 'Clinical / scientific infographic',
    exportFormats: ['PDF', 'DOCX'],
    templateId: 'medical-atlas',
    featured: true,
    cover: {
      theme: 'from-[#0F766E] via-[#2563EB] to-[#0F172A]',
      eyebrow: 'MEDICAL DEMO',
      title: 'Human Anatomy',
      subtitle: 'Visual Guide for Learning Body Systems',
    },
    tableOfContents: ['Medical Disclaimer', 'Body Systems Overview', 'Circulatory System', 'Learning Summary'],
    pages: [
      {
        title: 'Medical Disclaimer',
        body: ['เอกสารนี้เป็นตัวอย่างเพื่อการศึกษาเท่านั้น ไม่ใช่คำแนะนำทางการแพทย์ การวินิจฉัย หรือการรักษา หากมีอาการผิดปกติควรปรึกษาบุคลากรทางการแพทย์'],
      },
      {
        title: 'Body Systems Overview',
        body: ['ร่างกายมนุษย์ประกอบด้วยระบบที่ทำงานประสานกัน เช่น ระบบไหลเวียนเลือด ระบบหายใจ ระบบประสาท และระบบกล้ามเนื้อ'],
        bullets: ['Circulatory', 'Respiratory', 'Nervous', 'Musculoskeletal'],
      },
    ],
  },
  {
    id: 'legal-guide-contracts',
    slug: 'legal-guide-contracts',
    title: 'Contract Basics for Creators',
    subtitle: 'คู่มือกฎหมายเบื้องต้นสำหรับครีเอเตอร์',
    description: 'ตัวอย่าง legal guide ที่จัดโครงข้อควรรู้ วิเคราะห์ตัวอย่าง และมี disclaimer ชัดเจน',
    category: 'legal',
    subcategory: 'Legal Guide',
    language: 'ไทย',
    format: 'Legal Manual · A4',
    pageCount: 48,
    audience: 'ครีเอเตอร์ ฟรีแลนซ์ และผู้ประกอบการ',
    style: 'Formal authoritative / minimal',
    exportFormats: ['PDF', 'DOCX'],
    templateId: 'legal-guide',
    featured: false,
    cover: {
      theme: 'from-[#111827] via-[#374151] to-[#7C2D12]',
      eyebrow: 'LEGAL DEMO',
      title: 'Contract Basics',
      subtitle: 'อ่านสัญญางานสร้างสรรค์ให้เข้าใจ ก่อนลงนาม',
    },
    tableOfContents: ['Disclaimer', 'องค์ประกอบของสัญญา', 'สิทธิ์ใช้งานผลงาน', 'Checklist ก่อนลงนาม'],
    pages: [
      {
        title: 'Disclaimer',
        body: ['เนื้อหานี้เป็นตัวอย่างเพื่อการศึกษา ไม่ใช่คำปรึกษากฎหมายเฉพาะบุคคล กรณีมีข้อพิพาทหรือสัญญาจริงควรปรึกษาทนายความ'],
      },
      {
        title: 'สิทธิ์ใช้งานผลงาน',
        body: ['สัญญาควรระบุให้ชัดว่าใครเป็นเจ้าของลิขสิทธิ์ ใครมีสิทธิ์ใช้งาน ใช้ได้ที่ใด ระยะเวลาเท่าใด และแก้ไขดัดแปลงได้หรือไม่'],
        bullets: ['Ownership', 'License scope', 'Duration', 'Territory', 'Revision rights'],
      },
    ],
  },
  {
    id: 'english-everyday-life',
    slug: 'english-everyday-life',
    title: 'English for Everyday Life',
    subtitle: 'หนังสือภาษาอังกฤษใช้งานจริง',
    description: 'ตัวอย่าง language workbook พร้อมคำศัพท์ บทสนทนา แบบฝึกหัด และเฉลยตัวอย่าง',
    category: 'language',
    subcategory: 'Vocabulary / Conversation Book',
    language: 'ไทย + English',
    format: 'Workbook · A5',
    pageCount: 72,
    audience: 'ผู้เริ่มเรียนภาษาอังกฤษ',
    style: 'Friendly educational / illustrated cards',
    exportFormats: ['PDF', 'DOCX'],
    templateId: 'student-workbook',
    featured: true,
    cover: {
      theme: 'from-[#22C55E] via-[#38BDF8] to-[#6366F1]',
      eyebrow: 'LANGUAGE BOOK',
      title: 'English for Everyday Life',
      subtitle: 'คำศัพท์ บทสนทนา และแบบฝึกหัดสำหรับใช้ในชีวิตประจำวัน',
    },
    tableOfContents: ['At the Cafe', 'Asking Directions', 'Small Talk', 'Practice'],
    pages: [
      {
        title: 'At the Cafe',
        body: ['เรียนรู้ประโยคพื้นฐานสำหรับสั่งเครื่องดื่ม ถามราคา และขอคำแนะนำจากพนักงาน'],
        bullets: ['I would like a hot latte.', 'Could you recommend something sweet?', 'How much is it?'],
      },
      {
        title: 'Conversation Practice',
        body: ['A: Good morning. What would you like today?', 'B: I would like an iced tea, please.', 'A: Sure. Anything else?', 'B: That is all, thank you.'],
      },
    ],
  },
];

export const featuredShowcase = SHOWCASE_PROJECTS.filter(project => project.featured);

export const getShowcaseProject = (slug?: string) =>
  SHOWCASE_PROJECTS.find(project => project.slug === slug) ?? null;
