import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { generateImage } from "../_shared/ai-providers.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== 'string') return json({ error: 'Missing prompt' }, 400);

    try {
      const { imageUrl, provider } = await generateImage(prompt);
      return json({ imageUrl, provider: provider.provider, model: provider.image_model });
    } catch (e) {
      const detail = e instanceof Error ? e.message : String(e);
      console.error('image providers failed:', detail);
      const fallbackReason = detail.includes('image_provider_not_configured')
        ? 'image_provider_not_configured'
        : /:402|insufficient|quota|billing/i.test(detail)
          ? 'image_provider_out_of_credit'
          : 'image_provider_failed';

      // Do not silently return a branded SVG as if it were a finished illustration.
      // The studio can keep the book draft and show the user exactly what needs fixing.
      return json(
        {
          error: 'ไม่สามารถสร้างภาพประกอบได้ในขณะนี้',
          fallback: true,
          fallbackReason,
          detail: detail.slice(0, 300),
        },
        503,
      );
    }
  } catch (e) {
    console.error("generate-image error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
