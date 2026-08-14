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

export const generateBook = async (
  title: string,
  pageCount: number,
  language: string,
  styleProfile: StyleProfile | null,
  sources: any[] = [],
  sourceMode: string = 'source_ai',
): Promise<any> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-book', {
      body: { title, pageCount, language, styleProfile, sources, sourceMode },
    });

    if (error) {
      console.error('Generate book error:', error);
      throw new Error(error.message || 'Failed to generate book');
    }

    if (data?.error) {
      console.error('Generate book API error:', data.error);
      throw new Error(data.error);
    }

    return data;
  } catch (err) {
    console.error('Generate book error:', err);
    throw err;
  }
};
