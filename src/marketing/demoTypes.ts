/** Public, read-only demo project model used by the marketing showcase. */

export type DemoBlock =
  | { type: 'h'; text: string }
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'quote'; text: string }
  | { type: 'prompt'; label?: string; text: string }
  | { type: 'table'; head: string[]; rows: string[][] }
  | { type: 'stat'; items: { label: string; value: string }[] }
  | { type: 'diagram'; steps: string[] }
  | { type: 'panel'; caption?: string; tone?: 'wide' | 'tall'; art: string; dialogue?: { who: string; line: string }[] }
  | { type: 'note'; text: string };

export interface DemoPage {
  /** Short label used in the table of contents. */
  label: string;
  kind: 'cover' | 'toc' | 'content' | 'slide' | 'comic';
  title?: string;
  subtitle?: string;
  /** Optional illustration (imported asset URL). */
  image?: string;
  blocks: DemoBlock[];
  /** Speaker notes (presentation demos). */
  notes?: string;
}

export type DemoKind = 'book' | 'manual' | 'presentation' | 'manga' | 'guide';

export interface DemoProject {
  id: string;
  title: string;
  subtitle: string;
  kind: DemoKind;
  typeLabel: string;
  unit: 'pages' | 'slides';
  /** Size of the imagined full project. */
  total: number;
  /** How many pages/slides the public sample contains. */
  sampleCount: number;
  description: string;
  cover: string;
  visualStyle: string;
  badge: 'AI DEMO' | 'SAMPLE PROJECT' | 'FICTIONAL AI DEMO';
  tags: string[];
  /** Template applied when a visitor clicks "สร้างงานแบบนี้" (no demo prose copied). */
  template: { kind: string; tone: string; pages?: number; slides?: number };
  isDemo: true;
}

export interface DemoContent {
  pages: DemoPage[];
}
