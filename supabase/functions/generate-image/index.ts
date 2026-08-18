import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { generateImage } from "../_shared/ai-providers.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const escapeSvgText = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const fallbackImage = (prompt: string) => {
  const text = escapeSvgText((prompt || "KIVORA").slice(0, 64));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#050816"/>
        <stop offset="45%" stop-color="#29235c"/>
        <stop offset="100%" stop-color="#00d4ff"/>
      </linearGradient>
      <linearGradient id="accent" x1="0" x2="1">
        <stop offset="0%" stop-color="#7a5cff"/>
        <stop offset="55%" stop-color="#ff6bd5"/>
        <stop offset="100%" stop-color="#00d4ff"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="800" fill="url(#bg)"/>
    <path d="M120 630 C260 440 360 720 520 500 C680 280 800 360 1080 160 L1080 800 L120 800 Z" fill="url(#accent)" opacity="0.36"/>
    <circle cx="880" cy="220" r="140" fill="#ffffff" opacity="0.08"/>
    <text x="96" y="120" fill="#ffffff" font-family="Arial, sans-serif" font-size="42" font-weight="700">KIVORA</text>
    <text x="96" y="180" fill="#dbe7ff" font-family="Arial, sans-serif" font-size="24">AI image fallback</text>
    <text x="96" y="700" fill="#ffffff" font-family="Arial, sans-serif" font-size="28">${text}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Missing prompt' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      const { imageUrl, provider } = await generateImage(prompt);
      return new Response(JSON.stringify({ imageUrl, provider: provider.provider, model: provider.image_model }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error('image providers failed:', message);
      const notConfigured = message.includes('image_provider_not_configured');
      const outOfCredit = /:402|insufficient|quota|billing/i.test(message);
      return new Response(
        JSON.stringify({
          imageUrl: fallbackImage(prompt),
          fallback: true,
          fallbackReason: notConfigured
            ? 'image_provider_not_configured'
            : outOfCredit
              ? 'image_provider_out_of_credit'
              : 'image_provider_failed',
          detail: message.slice(0, 300),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
  } catch (e) {
    console.error("generate-image error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
