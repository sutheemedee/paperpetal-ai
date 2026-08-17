/** PaperPetal Template Engine — templates are reusable generation systems, not skins. */

export type TemplateCategory =
  | 'book'
  | 'ebook'
  | 'manual'
  | 'education'
  | 'course'
  | 'presentation'
  | 'business'
  | 'marketing'
  | 'report'
  | 'research'
  | 'novel'
  | 'children'
  | 'manga'
  | 'comic'
  | 'screenplay'
  | 'custom';

export type TemplateContentType =
  | 'book'
  | 'manual'
  | 'course'
  | 'presentation'
  | 'report'
  | 'novel'
  | 'children'
  | 'manga'
  | 'screenplay'
  | 'article';

export type PlanCodeName = 'free' | 'starter' | 'creator' | 'unlimited';

export type SourceLock = 'high' | 'medium' | 'low' | 'creative';

export type ExportFormatName = 'pdf' | 'docx' | 'epub' | 'pptx' | 'images';

export interface WritingDNA {
  tone: string;
  sentenceComplexity: 'simple' | 'medium' | 'complex';
  paragraphLength: 'short' | 'medium' | 'long';
  explanationDepth: 'light' | 'balanced' | 'deep';
  exampleFrequency: 'low' | 'medium' | 'high';
  technicalLevel: 'beginner' | 'intermediate' | 'advanced';
  storytellingLevel: 'low' | 'medium' | 'high';
  ctaStyle: 'none' | 'soft' | 'direct';
  citationDensity: 'none' | 'light' | 'medium' | 'heavy';
}

export interface StructureDNA {
  /** Ordered section blueprint used for the project plan. */
  sections: { label: string; share: number }[];
  /** Extra engines the template activates automatically. */
  engines?: string[];
  chapterLabel?: string;
}

export interface LayoutDNA {
  pageSize?: string;
  columns?: 1 | 2;
  density: 'airy' | 'balanced' | 'dense';
  calloutStyle?: string;
  tableStyle?: string;
}

export interface VisualDNA {
  palette: string;
  typography: string;
  coverStyle: string;
  chapterStyle: string;
  imageStyle: string;
  diagramStyle?: string;
  imageDensity: 'none' | 'low' | 'medium' | 'high';
}

export interface SourceStrategy {
  lock: SourceLock;
  recommendedSources: number;
  note: string;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  category: TemplateCategory;
  tags: string[];
  description: string;
  thumbnail: string;
  coverPreview: string[];
  contentType: TemplateContentType;
  targetAudience: string;
  defaultPageCount: number;
  defaultChapterCount: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  writingDNA: WritingDNA;
  structureDNA: StructureDNA;
  layoutDNA: LayoutDNA;
  visualDNA: VisualDNA;
  sourceStrategy: SourceStrategy;
  imageStrategy: string;
  citationStrategy: string;
  promptStrategy: string;
  exportPreset: ExportFormatName[];
  requiredInputs: string[];
  optionalInputs: string[];
  recommendedPlan: PlanCodeName;
  minimumPlan: PlanCodeName;
  isPremium: boolean;
  popular?: boolean;
  isNew?: boolean;
  featured?: boolean;
  published?: boolean;
  version: string;
  /** Marketplace-ready metadata (marketplace intentionally disabled in this release). */
  marketplace?: {
    creatorId?: string;
    price?: number;
    revenueShare?: number;
    rating?: number;
    downloads?: number;
    reviews?: number;
    license?: string;
    moderationStatus?: 'draft' | 'pending' | 'approved' | 'rejected';
    enabled: false;
  };
}

export const PLAN_ORDER: PlanCodeName[] = ['free', 'starter', 'creator', 'unlimited'];

export const planRank = (plan?: string) => {
  const i = PLAN_ORDER.indexOf((plan as PlanCodeName) ?? 'free');
  return i < 0 ? 0 : i;
};

export const CATEGORY_LABEL: Record<TemplateCategory, string> = {
  book: 'หนังสือ',
  ebook: 'eBook',
  manual: 'คู่มือ',
  education: 'การศึกษา',
  course: 'คอร์ส',
  presentation: 'พรีเซนเทชัน',
  business: 'ธุรกิจ',
  marketing: 'การตลาด',
  report: 'รายงาน',
  research: 'งานวิจัย',
  novel: 'นิยาย',
  children: 'หนังสือเด็ก',
  manga: 'มังงะ',
  comic: 'คอมิก',
  screenplay: 'บทภาพยนตร์',
  custom: 'กำหนดเอง',
};

export const CONTENT_TYPE_LABEL: Record<TemplateContentType, string> = {
  book: 'หนังสือ / eBook',
  manual: 'คู่มือ / Textbook',
  course: 'คอร์ส / Workbook',
  presentation: 'พรีเซนเทชัน',
  report: 'รายงาน / วิจัย',
  novel: 'นิยาย',
  children: 'หนังสือเด็ก',
  manga: 'มังงะ / คอมิก',
  screenplay: 'บทภาพยนตร์',
  article: 'บทความ',
};

export const SOURCE_LOCK_LABEL: Record<SourceLock, string> = {
  high: 'อ้างอิงแหล่งข้อมูลเข้ม (Source Lock สูง)',
  medium: 'อ้างอิงแหล่งข้อมูลปานกลาง',
  low: 'อ้างอิงเบา ๆ',
  creative: 'สร้างสรรค์อิสระ (Creative)',
};

export const EXPORT_LABEL: Record<ExportFormatName, string> = {
  pdf: 'PDF',
  docx: 'Word (.docx)',
  epub: 'EPUB',
  pptx: 'PowerPoint (.pptx)',
  images: 'ภาพ (PNG)',
};
