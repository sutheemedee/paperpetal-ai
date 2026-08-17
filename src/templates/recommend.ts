import { KnowledgeSource } from '@/knowledge/types';
import { CreationDraft, ProjectPlanSection } from './store';
import { TemplateDefinition } from './types';

/* ------------------------- intent keyword mapping ------------------------ */

const KEYWORD_HINTS: { words: string[]; tags: string[]; boost: number }[] = [
  { words: ['สอน', 'นักเรียน', 'ครู', 'ห้องเรียน', 'teach', 'student', 'อบรม', 'training'], tags: ['ครู', 'สอน', 'อบรม', 'คอร์ส', 'การศึกษา'], boost: 6 },
  { words: ['คอร์ส', 'course', 'workshop', 'เวิร์กช็อป', 'แบบฝึกหัด'], tags: ['คอร์ส', 'workshop', 'workbook'], boost: 6 },
  { words: ['คู่มือ', 'manual', 'วิธีใช้', 'ขั้นตอน', 'sop', 'guide'], tags: ['คู่มือ', 'manual', 'step', 'how-to'], boost: 5 },
  { words: ['สไลด์', 'presentation', 'พรีเซนต์', 'นำเสนอ', 'deck', 'pitch'], tags: ['pitch', 'ธุรกิจ', 'สอน', 'keynote'], boost: 5 },
  { words: ['ขาย', 'ลูกค้า', 'การตลาด', 'marketing', 'แบรนด์', 'brand', 'โฆษณา'], tags: ['การตลาด', 'ขายของ', 'branding', 'lead'], boost: 5 },
  { words: ['วิจัย', 'research', 'รายงาน', 'report', 'วิเคราะห์', 'ตลาด'], tags: ['วิจัย', 'รายงาน', 'ตลาด', 'white paper'], boost: 5 },
  { words: ['นิยาย', 'novel', 'เรื่องแต่ง', 'โรแมนซ์', 'แฟนตาซี'], tags: ['โรแมนซ์', 'แฟนตาซี', 'ผจญภัย', 'ดราม่า'], boost: 6 },
  { words: ['เด็ก', 'นิทาน', 'kids', 'children', 'ก่อนนอน'], tags: ['นิทาน', 'ฝึกอ่าน', 'ภาพ'], boost: 7 },
  { words: ['มังงะ', 'manga', 'การ์ตูน', 'comic', 'webtoon'], tags: ['manga', 'comic', 'webtoon'], boost: 7 },
  { words: ['บทหนัง', 'screenplay', 'หนังสั้น', 'ซีรีส์', 'สคริปต์', 'youtube'], tags: ['หนังสั้น', 'ซีรีส์', 'youtube', 'โฆษณา'], boost: 6 },
  { words: ['ai', 'เอไอ', 'chatgpt', 'prompt', 'automation'], tags: ['ai', 'prompt', 'automation'], boost: 4 },
  { words: ['ธุรกิจ', 'business', 'ร้าน', 'sme', 'ผู้ประกอบการ'], tags: ['ธุรกิจ', 'แผน'], boost: 4 },
];

const CONTENT_HINTS: { words: string[]; contentTypes: TemplateDefinition['contentType'][]; boost: number }[] = [
  { words: ['สไลด์', 'presentation', 'พรีเซนต์', 'นำเสนอ', 'deck'], contentTypes: ['presentation'], boost: 10 },
  { words: ['คอร์ส', 'course', 'สอนนักเรียน', 'อบรม', 'workshop'], contentTypes: ['course'], boost: 8 },
  { words: ['คู่มือ', 'manual', 'วิธีใช้', 'sop'], contentTypes: ['manual'], boost: 8 },
  { words: ['รายงาน', 'วิจัย', 'report', 'วิเคราะห์'], contentTypes: ['report'], boost: 8 },
  { words: ['นิยาย', 'novel'], contentTypes: ['novel'], boost: 10 },
  { words: ['นิทาน', 'เด็ก', 'kids'], contentTypes: ['children'], boost: 10 },
  { words: ['มังงะ', 'manga', 'การ์ตูน', 'comic'], contentTypes: ['manga'], boost: 10 },
  { words: ['บทหนัง', 'สคริปต์', 'screenplay', 'ซีรีส์'], contentTypes: ['screenplay'], boost: 10 },
  { words: ['หนังสือ', 'book', 'ebook', 'อีบุ๊ก'], contentTypes: ['book'], boost: 6 },
];

export interface Recommendation {
  template: TemplateDefinition;
  score: number;
  match: number;
  reason: string;
}

const norm = (s: string) => s.toLowerCase();

/** Heuristic intent recommender — no AI credits required (v1). */
export const recommendTemplates = (
  input: string,
  templates: TemplateDefinition[],
  options: { sources?: KnowledgeSource[]; limit?: number; categoryId?: string; recentIds?: string[] } = {},
): Recommendation[] => {
  const text = norm(`${input} ${(options.sources ?? []).map(s => `${s.title} ${s.tags.join(' ')}`).join(' ')}`);
  const hasSources = (options.sources?.length ?? 0) > 0;
  const limit = options.limit ?? 3;

  const scored = templates.map(t => {
    let score = 0;
    const reasons: string[] = [];

    for (const hint of KEYWORD_HINTS) {
      if (hint.words.some(w => text.includes(w))) {
        const overlap = t.tags.filter(tag => hint.tags.includes(tag)).length;
        if (overlap) {
          score += hint.boost * overlap;
          reasons.push(`ตรงกับความต้องการเรื่อง ${hint.tags.slice(0, 2).join(' / ')}`);
        }
      }
    }
    for (const hint of CONTENT_HINTS) {
      if (hint.words.some(w => text.includes(w)) && hint.contentTypes.includes(t.contentType)) {
        score += hint.boost;
        reasons.push('รูปแบบผลงานตรงกับที่คุณอธิบาย');
      }
    }
    // direct token overlap with name/description/tags
    const tokens = text.split(/[\s,.\-/]+/).filter(w => w.length >= 3);
    const hay = norm(`${t.name} ${t.description} ${t.tags.join(' ')} ${t.targetAudience}`);
    const hits = tokens.filter(w => hay.includes(w)).length;
    score += Math.min(hits, 6) * 2;

    if (hasSources) {
      if (t.sourceStrategy.lock === 'high') { score += 6; reasons.push('ใช้แหล่งข้อมูลของคุณเป็นหลัก (Source Lock สูง)'); }
      if (t.tags.includes('sources')) { score += 8; reasons.push('ออกแบบมาเพื่อเปลี่ยนแหล่งข้อมูลให้เป็นผลงานโดยตรง'); }
    } else if (t.tags.includes('sources')) {
      score -= 6;
    }
    if (options.categoryId && t.category === options.categoryId) score += 4;
    if (options.recentIds?.includes(t.id)) { score += 3; reasons.push('คุณเพิ่งใช้เทมเพลตแนวนี้'); }
    if (t.popular) score += 2;
    if (t.featured) score += 1;

    return { template: t, score, reasons };
  });

  const top = scored.sort((a, b) => b.score - a.score).slice(0, limit);
  const best = Math.max(1, top[0]?.score ?? 1);

  return top.map((row, i) => ({
    template: row.template,
    score: row.score,
    match: Math.max(58, Math.round((row.score / best) * (i === 0 ? 94 : 92 - i * 5))),
    reason: row.reasons[0] ?? `เหมาะกับ ${row.template.targetAudience} และให้ผลลัพธ์เป็น ${row.template.name}`,
  }));
};

/** Templates surfaced as "แนะนำสำหรับคุณ" on home. */
export const recommendedForYou = (
  templates: TemplateDefinition[],
  opts: { categoryId?: string; recentKinds?: string[]; recentIds?: string[]; hasSources?: boolean; limit?: number },
): TemplateDefinition[] => {
  const limit = opts.limit ?? 6;
  const scored = templates.map(t => {
    let score = (t.popular ? 5 : 0) + (t.featured ? 3 : 0) + (t.isNew ? 2 : 0);
    if (opts.categoryId && t.category === opts.categoryId) score += 8;
    if (opts.recentIds?.includes(t.id)) score += 6;
    if (opts.recentKinds?.some(k => t.contentType === k)) score += 4;
    if (opts.hasSources && t.sourceStrategy.lock === 'high') score += 4;
    if (!opts.hasSources && t.tags.includes('sources')) score -= 4;
    return { t, score };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map(r => r.t);
};

/* ---------------------------- 26. PAGE BUDGET ---------------------------- */

export const buildPageBudget = (template: TemplateDefinition, totalPages: number, chapters: number): ProjectPlanSection[] => {
  const sections = template.structureDNA.sections;
  const totalShare = sections.reduce((sum, s) => sum + s.share, 0) || 1;
  const rows: ProjectPlanSection[] = [];

  sections.forEach(section => {
    const budget = Math.max(1, Math.round((section.share / totalShare) * totalPages));
    const isMain = section.share === Math.max(...sections.map(s => s.share));
    if (isMain && chapters > 1) {
      const per = Math.max(1, Math.floor(budget / chapters));
      for (let i = 1; i <= chapters; i += 1) {
        const extra = i === chapters ? budget - per * chapters : 0;
        rows.push({
          label: `${template.structureDNA.chapterLabel ?? 'บทที่'} ${i}`,
          pages: Math.max(1, per + extra),
        });
      }
    } else {
      rows.push({ label: section.label, pages: budget });
    }
  });

  // reconcile to hit the requested target exactly
  let diff = totalPages - rows.reduce((sum, r) => sum + r.pages, 0);
  let i = 0;
  while (diff !== 0 && rows.length) {
    const row = rows[i % rows.length];
    if (diff > 0) { row.pages += 1; diff -= 1; } else if (row.pages > 1) { row.pages -= 1; diff += 1; }
    i += 1;
    if (i > rows.length * 40) break;
  }
  return rows;
};

const DENSITY_RATIO: Record<CreationDraft['visualDensity'], number> = { none: 0, low: 0.12, medium: 0.28, high: 0.6 };

/** 25. AI PROJECT PLAN — deterministic plan preview before any generation. */
export const buildProjectPlan = (template: TemplateDefinition, draft: CreationDraft) => {
  const sections = buildPageBudget(template, draft.pages, draft.chapters);
  const estimatedImages = Math.max(2, Math.round(draft.pages * DENSITY_RATIO[draft.visualDensity]));
  return {
    title: draft.topic || template.name,
    objective:
      draft.purpose ||
      `ส่งมอบ${template.name}สำหรับ${draft.audience || template.targetAudience} ตามโครงสร้างของเทมเพลต`,
    sections,
    estimatedImages,
    estimatedSlides: template.contentType === 'presentation' ? draft.pages : undefined,
  };
};

/** 23. CREATE FROM SOURCES — possible outputs from the selected knowledge. */
export const outputIdeasFromSources = (sources: KnowledgeSource[], templates: TemplateDefinition[]) => {
  const depth = sources.reduce((sum, s) => sum + (s.knowledge?.chunks?.length ?? 0) + (s.knowledge?.keyPoints?.length ?? 0), 0);
  const scale = Math.min(2.2, Math.max(0.6, depth / 40 + 0.6));
  const pick = (id: string) => templates.find(t => t.id === id);
  const ideas = [
    { template: pick('sources-to-book'), pages: Math.round(80 * scale), unit: 'หน้า' },
    { template: pick('sources-to-presentation'), pages: Math.round(30 * scale), unit: 'สไลด์' },
    { template: pick('sources-to-course'), pages: Math.round(35 * scale), unit: 'หน้า' },
    { template: pick('sources-to-manual'), pages: Math.round(25 * scale), unit: 'หน้า' },
  ];
  return ideas.filter(i => i.template) as { template: TemplateDefinition; pages: number; unit: string }[];
};

/** 39. REPURPOSE ENGINE options for an existing project. */
export const REPURPOSE_OPTIONS: { id: string; label: string; templateId: string; pages: number }[] = [
  { id: 'presentation', label: 'พรีเซนเทชัน', templateId: 'sources-to-presentation', pages: 40 },
  { id: 'workbook', label: 'Workbook', templateId: 'workshop-workbook', pages: 30 },
  { id: 'quick-guide', label: 'Quick Guide', templateId: 'howto-ebook', pages: 10 },
  { id: 'article', label: 'บทความ', templateId: 'custom-article', pages: 8 },
  { id: 'course', label: 'คอร์ส', templateId: 'sources-to-course', pages: 60 },
  { id: 'social', label: 'Social Content', templateId: 'social-media-plan', pages: 12 },
  { id: 'summary', label: 'สรุปย่อ', templateId: 'sources-to-report', pages: 6 },
];
