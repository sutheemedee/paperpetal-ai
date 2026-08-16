export interface StyleProfile {
  tone: string;
  complexity: string;
  language: string;
  sentenceStyle: string;
  characteristics: string[];
  vocabularyLevel: string;
  writingPersona: string;
  styleInstructions: string;
}

import { supabase } from '@/integrations/supabase/client';
import { edgeErrorMessage } from './fnError';

export const generateBook = async (
  title: string,
  pageCount: number,
  language: string,
  styleProfile: StyleProfile | null,
  sources: any[] = [],
  sourceMode: string = 'source_ai',
): Promise<any> => {
  const { data, error } = await supabase.functions.invoke('generate-book', {
    body: { title, pageCount, language, styleProfile, sources, sourceMode },
  });

  if (error) {
    const message = await edgeErrorMessage(error, 'สร้างหนังสือไม่สำเร็จ กรุณาลองใหม่');
    console.error('Generate book error:', message);
    throw new Error(message);
  }

  if (data?.error) {
    console.error('Generate book API error:', data.error);
    throw new Error(data.error);
  }

  return data;
};
