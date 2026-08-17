import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/auth/AuthProvider';
import { TEMPLATES, getTemplate } from './catalog';
import { TemplateDefinition } from './types';

/* --------------------------- local persistence --------------------------- */

const key = (uid: string | null | undefined, name: string) => `paperpetal.templates.${name}.${uid ?? 'guest'}`;

const read = <T,>(k: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const write = (k: string, value: unknown) => {
  try {
    localStorage.setItem(k, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('paperpetal:templates'));
  } catch {
    /* storage unavailable */
  }
};

/* ------------------------------ analytics -------------------------------- */

export type TemplateEvent =
  | 'template_view'
  | 'template_preview'
  | 'template_use'
  | 'template_completion'
  | 'template_export'
  | 'template_upgrade';

const ANALYTICS_KEY = 'paperpetal.templates.analytics.v1';

export type TemplateAnalytics = Record<string, Partial<Record<TemplateEvent, number>>>;

export const trackTemplate = (event: TemplateEvent, templateId: string) => {
  const all = read<TemplateAnalytics>(ANALYTICS_KEY, {});
  const row = all[templateId] ?? {};
  row[event] = (row[event] ?? 0) + 1;
  all[templateId] = row;
  write(ANALYTICS_KEY, all);
};

export const readTemplateAnalytics = () => read<TemplateAnalytics>(ANALYTICS_KEY, {});

/* --------------------------- admin overrides ----------------------------- */

const OVERRIDE_KEY = 'paperpetal.templates.overrides.v1';

export type TemplateOverride = Partial<
  Pick<TemplateDefinition, 'name' | 'description' | 'category' | 'minimumPlan' | 'isPremium' | 'popular' | 'featured' | 'published' | 'defaultPageCount'>
>;

export const readOverrides = () => read<Record<string, TemplateOverride>>(OVERRIDE_KEY, {});
export const saveOverride = (id: string, patch: TemplateOverride) => {
  const all = readOverrides();
  all[id] = { ...all[id], ...patch };
  write(OVERRIDE_KEY, all);
};

/* --------------------------- creation draft ------------------------------ */

export interface ProjectPlanSection {
  label: string;
  pages: number;
  notes?: string;
}

export interface CreationDraft {
  templateId: string;
  topic: string;
  purpose: string;
  audience: string;
  language: string;
  sourceIds: string[];
  pages: number;
  chapters: number;
  tone: string;
  visualDensity: 'none' | 'low' | 'medium' | 'high';
  citationLevel: 'none' | 'light' | 'medium' | 'heavy';
  visualStyle: string;
  imageStyle: string;
  designThemeId?: string;
  coverStyleId?: string;
  fontId?: string;
  autoStart?: boolean;
  plan?: {
    title: string;
    objective: string;
    sections: ProjectPlanSection[];
    estimatedImages: number;
    estimatedSlides?: number;
  };
}

const DRAFT_KEY = 'paperpetal.templates.draft.v1';

export const saveCreationDraft = (draft: CreationDraft) => write(DRAFT_KEY, draft);
export const readCreationDraft = () => read<CreationDraft | null>(DRAFT_KEY, null);
export const clearCreationDraft = () => write(DRAFT_KEY, null);

/* ------------------------------- the hook -------------------------------- */

export interface CustomTemplate extends TemplateDefinition {
  isUserTemplate: true;
}

export const useTemplates = () => {
  const { user } = useAuth();
  const uid = user?.id ?? null;
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const bump = () => setTick(t => t + 1);
    window.addEventListener('paperpetal:templates', bump);
    return () => window.removeEventListener('paperpetal:templates', bump);
  }, []);

  const favKey = key(uid, 'favorites');
  const recentKey = key(uid, 'recent');
  const customKey = key(uid, 'custom');

  const favorites = useMemo(() => read<string[]>(favKey, []), [favKey, tick]);
  const recent = useMemo(() => read<string[]>(recentKey, []), [recentKey, tick]);
  const custom = useMemo(() => read<CustomTemplate[]>(customKey, []), [customKey, tick]);
  const overrides = useMemo(() => readOverrides(), [tick]);

  const all = useMemo<TemplateDefinition[]>(
    () =>
      [...TEMPLATES, ...custom]
        .map(t => ({ ...t, ...(overrides[t.id] ?? {}) }))
        .filter(t => t.published !== false),
    [custom, overrides],
  );

  const byId = useCallback((id?: string | null) => all.find(t => t.id === id) ?? getTemplate(id), [all]);

  const toggleFavorite = useCallback(
    (id: string) => {
      const next = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
      write(favKey, next);
    },
    [favorites, favKey],
  );

  const markUsed = useCallback(
    (id: string) => {
      write(recentKey, [id, ...recent.filter(r => r !== id)].slice(0, 12));
      trackTemplate('template_use', id);
    },
    [recent, recentKey],
  );

  const saveAsTemplate = useCallback(
    (base: TemplateDefinition, name: string, patch: Partial<TemplateDefinition> = {}) => {
      const id = `user-${Date.now()}`;
      const next: CustomTemplate = {
        ...base,
        ...patch,
        id,
        name,
        category: 'custom',
        isPremium: false,
        minimumPlan: 'free',
        popular: false,
        featured: false,
        isNew: true,
        published: true,
        isUserTemplate: true,
      };
      write(customKey, [next, ...custom]);
      return next;
    },
    [custom, customKey],
  );

  const deleteCustom = useCallback(
    (id: string) => write(customKey, custom.filter(c => c.id !== id)),
    [custom, customKey],
  );

  return {
    all,
    byId,
    favorites,
    recent,
    custom,
    toggleFavorite,
    markUsed,
    saveAsTemplate,
    deleteCustom,
    isFavorite: (id: string) => favorites.includes(id),
  };
};
