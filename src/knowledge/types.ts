export type SourceType =
  | 'youtube'
  | 'website'
  | 'pdf'
  | 'docx'
  | 'txt'
  | 'text'
  | 'note'
  | 'ai_note';

export type SourceRole = 'primary' | 'supporting' | 'creative';

export type SourceCategory =
  | 'official'
  | 'academic'
  | 'professional'
  | 'news'
  | 'community'
  | 'personal'
  | 'unknown';

export interface SourceChunk {
  heading?: string;
  location?: string;
  content?: string;
  summary?: string;
  keywords?: string[];
}

export interface SourceKnowledge {
  quickSummary?: string;
  detailedSummary?: string;
  beginnerSummary?: string;
  keyPoints?: string[];
  concepts?: { term: string; definition: string }[];
  steps?: string[];
  examples?: string[];
  toolsMentioned?: string[];
  namesMentioned?: string[];
  claims?: { claim: string; location?: string }[];
  warnings?: string[];
  actionItems?: string[];
  questions?: string[];
  keywords?: string[];
  entities?: string[];
  timeline?: { label: string; location?: string }[];
  chapters?: { heading: string; location?: string; summary?: string }[];
  chunks?: SourceChunk[];
  sourceCategory?: SourceCategory;
  reliabilityNote?: string;
}

export interface KnowledgeSource {
  id: string;
  sourceType: SourceType;
  title: string;
  url?: string;
  folder: string;
  tags: string[];
  enabled: boolean;
  role: SourceRole;
  category: SourceCategory;
  createdAt: string;
  warnings: string[];
  rawText?: string;
  knowledge: SourceKnowledge;
}

export interface KnowledgeNote {
  id: string;
  title: string;
  content: string;
  kind: 'manual' | 'ai' | 'summary' | 'idea' | 'research';
  createdAt: string;
}

export const SOURCE_FOLDERS = [
  'Research',
  'Reference',
  'Characters',
  'Product Data',
  'Course Material',
  'Images',
  'Archive',
];

export const SOURCE_TYPE_LABEL: Record<SourceType, string> = {
  youtube: 'YouTube',
  website: 'Website',
  pdf: 'PDF',
  docx: 'DOCX',
  txt: 'TXT',
  text: 'Text',
  note: 'Note',
  ai_note: 'AI Note',
};
