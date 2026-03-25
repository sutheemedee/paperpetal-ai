import { supabase } from '@/integrations/supabase/client';
import type { StyleProfile } from './generateBook';

export const analyzeWritingStyle = async (sampleText: string): Promise<StyleProfile | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-style', {
      body: { sampleText },
    });

    if (error) {
      console.error('Style analysis error:', error);
      return null;
    }

    if (data?.error) {
      console.error('Style analysis API error:', data.error);
      return null;
    }

    return data as StyleProfile;
  } catch (err) {
    console.error('Style analysis error:', err);
    return null;
  }
};
