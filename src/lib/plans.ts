export type PlanCode = 'free' | 'starter' | 'creator' | 'unlimited';

export type UsageMetric = 'aiPages' | 'aiImages' | 'slides' | 'sourceProcessing' | 'exports' | 'research';

export interface PlanEntitlements {
  projects: number | null;
  aiPages: number | null;
  aiImages: number | null;
  slides: number | null;
  sourcesPerProject: number | null;
  exports: number | null;
  exportsPerDay: number | null;
  pdf: boolean;
  docx: boolean | 'preview';
  epub: boolean;
  pptx: boolean;
  watermark: boolean;
  ultraRealistic: boolean;
  advancedSources: boolean;
  youtube: boolean;
  manga: boolean;
  characterDNA: boolean;
  knowledgeMap: boolean;
  priorityQueue: boolean;
  fairUse?: boolean;
}

export interface Plan {
  code: PlanCode;
  name: string;
  price_thb: number;
  badge: string | null;
  sort_order: number;
  entitlements: PlanEntitlements;
}

/** Fallback mirror of the authoritative server config (used before plans load). */
export const FALLBACK_PLANS: Plan[] = [
  {
    code: 'free',
    name: 'Free Trial',
    price_thb: 0,
    badge: null,
    sort_order: 1,
    entitlements: {
      projects: 3, aiPages: 30, aiImages: 10, slides: 10, sourcesPerProject: 3,
      exports: null, exportsPerDay: 1, pdf: true, docx: 'preview', epub: false, pptx: false,
      watermark: true, ultraRealistic: false, advancedSources: false, youtube: false,
      manga: false, characterDNA: false, knowledgeMap: false, priorityQueue: false,
    },
  },
  {
    code: 'starter',
    name: 'Starter',
    price_thb: 399,
    badge: null,
    sort_order: 2,
    entitlements: {
      projects: 10, aiPages: 300, aiImages: 100, slides: 100, sourcesPerProject: 10,
      exports: 20, exportsPerDay: null, pdf: true, docx: true, epub: true, pptx: false,
      watermark: false, ultraRealistic: false, advancedSources: false, youtube: false,
      manga: false, characterDNA: false, knowledgeMap: false, priorityQueue: false,
    },
  },
  {
    code: 'creator',
    name: 'Creator',
    price_thb: 799,
    badge: 'MOST POPULAR',
    sort_order: 3,
    entitlements: {
      projects: 30, aiPages: 1000, aiImages: 400, slides: 400, sourcesPerProject: 30,
      exports: 100, exportsPerDay: null, pdf: true, docx: true, epub: true, pptx: true,
      watermark: false, ultraRealistic: true, advancedSources: true, youtube: true,
      manga: true, characterDNA: true, knowledgeMap: true, priorityQueue: true,
    },
  },
  {
    code: 'unlimited',
    name: 'Unlimited',
    price_thb: 1490,
    badge: 'PRO',
    sort_order: 4,
    entitlements: {
      projects: null, aiPages: 3000, aiImages: 1200, slides: 1200, sourcesPerProject: 100,
      exports: null, exportsPerDay: null, pdf: true, docx: true, epub: true, pptx: true,
      watermark: false, ultraRealistic: true, advancedSources: true, youtube: true,
      manga: true, characterDNA: true, knowledgeMap: true, priorityQueue: true, fairUse: true,
    },
  },
];

export const METRIC_LABEL: Record<UsageMetric, string> = {
  aiPages: 'AI Pages',
  aiImages: 'AI Images',
  slides: 'สไลด์',
  sourceProcessing: 'ประมวลผลแหล่งข้อมูล',
  exports: 'การส่งออก',
  research: 'งานวิจัย AI',
};

export const PLAN_HIGHLIGHTS: Record<PlanCode, string[]> = {
  free: ['3 โปรเจกต์', '30 AI Pages', '10 AI Images', '3 แหล่งข้อมูล/โปรเจกต์', 'ส่งออก 1 ครั้ง/วัน', 'มีลายน้ำ'],
  starter: ['10 โปรเจกต์', '300 AI Pages / เดือน', '100 AI Images', 'ส่งออก PDF · DOCX · EPUB', '20 ครั้ง/เดือน', 'ไม่มีลายน้ำ'],
  creator: ['30 โปรเจกต์', '1,000 AI Pages / เดือน', '400 AI Images · 400 สไลด์', 'PPTX แก้ไขได้ · EPUB 3', 'YouTube Knowledge · Visual DNA', 'Ultra Realistic · Priority'],
  unlimited: ['โปรเจกต์ไม่จำกัด', '3,000 AI Pages (Fair Use)', '1,200 AI Images · 1,200 สไลด์', '100 แหล่งข้อมูล/โปรเจกต์', 'Batch Export · Priority Queue', 'Priority Support'],
};

export const PLAN_CTA: Record<PlanCode, string> = {
  free: 'เริ่มใช้ฟรี',
  starter: 'เลือก Starter',
  creator: 'เลือก Creator',
  unlimited: 'ไปที่ Unlimited',
};

export const usageRatio = (used: number, limit: number | null) => {
  if (limit === null || limit === 0) return 0;
  return Math.min(1, used / limit);
};

export const usageTone = (ratio: number) => {
  if (ratio >= 1) return 'limit';
  if (ratio >= 0.9) return 'critical';
  if (ratio >= 0.75) return 'warn';
  return 'ok';
};
