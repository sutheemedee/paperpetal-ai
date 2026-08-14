import type { DemoContent, DemoProject } from '../demoTypes';
import coverBusiness from '@/assets/demos/demo-business.jpg';
import coverPrompt from '@/assets/demos/demo-prompt.jpg';
import coverMarketing from '@/assets/demos/demo-marketing.jpg';
import coverManga from '@/assets/demos/demo-manga.jpg';
import coverSmb from '@/assets/demos/demo-smb.jpg';

/**
 * Public, read-only demo catalogue. Metadata is tiny and safe to ship with the
 * landing page; the readable sample content is loaded on demand only when a
 * visitor opens the demo reader.
 */
export const DEMO_PROJECTS: DemoProject[] = [
  {
    id: 'ai-business-mastery-2026',
    title: 'AI BUSINESS MASTERY 2026',
    subtitle: 'คู่มือประยุกต์ AI สำหรับผู้ประกอบการ',
    kind: 'book',
    typeLabel: 'Book / eBook',
    unit: 'pages',
    total: 120,
    sampleCount: 10,
    description: 'คู่มือประยุกต์ AI สำหรับผู้ประกอบการ ตั้งแต่การวางกลยุทธ์ การสร้างคอนเทนต์ ไปจนถึง Workflow Automation',
    cover: coverBusiness,
    visualStyle: 'Premium Futuristic Business',
    badge: 'AI DEMO',
    tags: ['ธุรกิจ', 'กลยุทธ์', 'Automation'],
    template: { kind: 'book', tone: 'professional', pages: 120 },
    isDemo: true,
  },
  {
    id: 'prompt-engineering-zero-to-pro',
    title: 'PROMPT ENGINEERING FROM ZERO TO PRO',
    subtitle: 'คู่มือเทคนิคการสั่งงาน AI',
    kind: 'manual',
    typeLabel: 'Technology Manual',
    unit: 'pages',
    total: 85,
    sampleCount: 9,
    description: 'คู่มือเทคโนโลยีที่พาไปทีละขั้น จากกายวิภาคของ Prompt เฟรมเวิร์กที่ใช้ซ้ำได้ ไปจนถึงเวิร์กช็อปและเช็กลิสต์',
    cover: coverPrompt,
    visualStyle: 'Technical Neon Schematic',
    badge: 'AI DEMO',
    tags: ['คู่มือ', 'เทคโนโลยี', 'Prompt'],
    template: { kind: 'manual', tone: 'instructional', pages: 85 },
    isDemo: true,
  },
  {
    id: 'ai-marketing-masterclass',
    title: 'AI MARKETING MASTERCLASS',
    subtitle: 'สไลด์สอนการตลาดด้วย AI',
    kind: 'presentation',
    typeLabel: 'Presentation',
    unit: 'slides',
    total: 40,
    sampleCount: 11,
    description: 'ชุดสไลด์ธีม Modern Technology พร้อมไดอะแกรม Workflow ตัวเลขตัวอย่าง เคสสาธิต และสคริปต์ผู้พูดทุกสไลด์',
    cover: coverMarketing,
    visualStyle: 'Modern Technology',
    badge: 'AI DEMO',
    tags: ['Presentation', 'การตลาด', 'PPTX'],
    template: { kind: 'presentation', tone: 'modern-technology', slides: 40 },
    isDemo: true,
  },
  {
    id: 'neon-city-ai-heroes',
    title: 'NEON CITY AI HEROES',
    subtitle: 'เล่ม 1: เสียงจากชั้นใต้ดิน',
    kind: 'manga',
    typeLabel: 'Manga / Graphic Novel',
    unit: 'pages',
    total: 60,
    sampleCount: 9,
    description: 'มังงะไซไฟเรื่องแต่ง แสดงการล็อก Character DNA ให้ตัวละครคงเส้นคงวา พร้อมบทสนทนาและหน้าฉากแอ็กชัน',
    cover: coverManga,
    visualStyle: 'Neon Cyberpunk Manga',
    badge: 'FICTIONAL AI DEMO',
    tags: ['มังงะ', 'เรื่องแต่ง', 'Character DNA'],
    template: { kind: 'manga', tone: 'cyberpunk', pages: 60 },
    isDemo: true,
  },
  {
    id: 'ai-for-small-business',
    title: 'AI FOR SMALL BUSINESS',
    subtitle: 'คู่มือฉบับเร็วสำหรับธุรกิจขนาดเล็ก',
    kind: 'guide',
    typeLabel: 'Quick Guide',
    unit: 'pages',
    total: 30,
    sampleCount: 10,
    description: 'คู่มือฉบับเร็วสำหรับร้านและธุรกิจขนาดเล็ก รวม 10 use case ตัวอย่าง Prompt เช็กลิสต์ และแผนลงมือ 30 วัน',
    cover: coverSmb,
    visualStyle: 'Friendly Minimal',
    badge: 'SAMPLE PROJECT',
    tags: ['SME', 'Quick Guide', 'Prompt'],
    template: { kind: 'guide', tone: 'friendly', pages: 30 },
    isDemo: true,
  },
];

export const getDemo = (id?: string) => DEMO_PROJECTS.find(d => d.id === id);

const LOADERS: Record<string, () => Promise<{ default: DemoContent }>> = {
  'ai-business-mastery-2026': () => import('./aiBusinessMastery'),
  'prompt-engineering-zero-to-pro': () => import('./promptEngineering'),
  'ai-marketing-masterclass': () => import('./aiMarketingMasterclass'),
  'neon-city-ai-heroes': () => import('./neonCityHeroes'),
  'ai-for-small-business': () => import('./aiForSmallBusiness'),
};

/** Lazily fetch the readable sample pages for one demo (never on initial load). */
export const loadDemoContent = async (id: string): Promise<DemoContent | null> => {
  const loader = LOADERS[id];
  if (!loader) return null;
  const mod = await loader();
  return mod.default;
};
