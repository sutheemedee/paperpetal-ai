import { supabase } from '@/integrations/supabase/client';
import type { StyleProfile } from './generateBook';
import { edgeErrorMessage } from './fnError';

export const analyzeWritingStyle = async (sampleText: string): Promise<StyleProfile | null> => {
  const { data, error } = await supabase.functions.invoke('analyze-style', {
    body: { sampleText },
  });

  if (error) {
    const message = await edgeErrorMessage(error, 'วิเคราะห์สไตล์การเขียนไม่สำเร็จ');
    console.error('Style analysis error:', message);
    throw new Error(message);
  }

  if (data?.error) {
    console.error('Style analysis API error:', data.error);
    throw new Error(data.error);
  }

  return data as StyleProfile;
};
