import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { edgeErrorMessage } from '@/utils/fnError';
import { KnowledgeNote, KnowledgeSource, SourceRole, SourceType } from './types';

import { useAuth } from '@/auth/AuthProvider';

/** Per-user storage key so accounts on the same device never share knowledge. */
const keyFor = (uid?: string | null) => `paperpetal.knowledge.v2.${uid ?? 'guest'}`;

interface Persisted {
  projectName: string;
  contentType: string;
  sources: KnowledgeSource[];
  notes: KnowledgeNote[];
}

const empty: Persisted = {
  projectName: 'โปรเจกต์ความรู้ของฉัน',
  contentType: '',
  sources: [],
  notes: [],
};

const load = (uid?: string | null): Persisted => {
  try {
    const raw = localStorage.getItem(keyFor(uid));
    return raw ? { ...empty, ...JSON.parse(raw) } : empty;
  } catch {
    return empty;
  }
};

export interface AddSourceInput {
  sourceType: SourceType;
  title?: string;
  url?: string;
  text?: string;
  folder?: string;
}

interface Ctx extends Persisted {
  setProjectName: (v: string) => void;
  setContentType: (v: string) => void;
  addSource: (input: AddSourceInput) => Promise<KnowledgeSource>;
  updateSource: (id: string, patch: Partial<KnowledgeSource>) => void;
  removeSource: (id: string) => void;
  addNote: (note: Omit<KnowledgeNote, 'id' | 'createdAt'>) => void;
  removeNote: (id: string) => void;
  activeSources: KnowledgeSource[];
  chatPayloadSources: (ids?: string[]) => any[];
}

const KnowledgeContext = createContext<Ctx | null>(null);

export const KnowledgeProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const uid = user?.id ?? null;
  const [state, setState] = useState<Persisted>(() => load(uid));

  // Swap the whole store when the signed-in account changes (strict data isolation).
  useEffect(() => {
    setState(load(uid));
  }, [uid]);

  useEffect(() => {
    localStorage.setItem(keyFor(uid), JSON.stringify(state));
  }, [state, uid]);

  const addSource = useCallback(async (input: AddSourceInput) => {
    const { data, error } = await supabase.functions.invoke('ingest-source', {
      body: {
        sourceType: input.sourceType,
        url: input.url,
        text: input.text,
        title: input.title,
        language: 'thai',
      },
    });
    if (error) throw new Error(await edgeErrorMessage(error, 'เพิ่มแหล่งข้อมูลไม่สำเร็จ'));
    if (data?.error) throw new Error(data.error);

    const source: KnowledgeSource = {
      id: crypto.randomUUID(),
      sourceType: input.sourceType,
      title: data.title || input.title || 'Untitled',
      url: input.url,
      folder: input.folder || 'Research',
      tags: (data.knowledge?.keywords || []).slice(0, 5),
      enabled: true,
      role: 'supporting',
      category: data.knowledge?.sourceCategory || 'unknown',
      createdAt: new Date().toISOString(),
      warnings: data.warnings || [],
      rawText: data.rawText,
      knowledge: data.knowledge || {},
    };
    setState(s => ({ ...s, sources: [source, ...s.sources] }));
    return source;
  }, []);

  const updateSource = useCallback((id: string, patch: Partial<KnowledgeSource>) => {
    setState(s => ({ ...s, sources: s.sources.map(x => (x.id === id ? { ...x, ...patch } : x)) }));
  }, []);

  const removeSource = useCallback((id: string) => {
    setState(s => ({ ...s, sources: s.sources.filter(x => x.id !== id) }));
  }, []);

  const addNote = useCallback((note: Omit<KnowledgeNote, 'id' | 'createdAt'>) => {
    setState(s => ({
      ...s,
      notes: [{ ...note, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...s.notes],
    }));
  }, []);

  const removeNote = useCallback((id: string) => {
    setState(s => ({ ...s, notes: s.notes.filter(n => n.id !== id) }));
  }, []);

  const activeSources = useMemo(() => state.sources.filter(s => s.enabled), [state.sources]);

  const chatPayloadSources = useCallback(
    (ids?: string[]) =>
      state.sources
        .filter(s => s.enabled && (!ids || ids.includes(s.id)))
        .map(s => ({
          title: s.title,
          sourceType: s.sourceType,
          role: s.role as SourceRole,
          category: s.category,
          summary: s.knowledge.detailedSummary || s.knowledge.quickSummary || '',
          keyPoints: s.knowledge.keyPoints || [],
          chunks: (s.knowledge.chunks || []).slice(0, 25),
        })),
    [state.sources],
  );

  return (
    <KnowledgeContext.Provider
      value={{
        ...state,
        setProjectName: v => setState(s => ({ ...s, projectName: v })),
        setContentType: v => setState(s => ({ ...s, contentType: v })),
        addSource,
        updateSource,
        removeSource,
        addNote,
        removeNote,
        activeSources,
        chatPayloadSources,
      }}
    >
      {children}
    </KnowledgeContext.Provider>
  );
};

export const useKnowledge = () => {
  const ctx = useContext(KnowledgeContext);
  if (!ctx) throw new Error('useKnowledge must be used inside KnowledgeProvider');
  return ctx;
};
