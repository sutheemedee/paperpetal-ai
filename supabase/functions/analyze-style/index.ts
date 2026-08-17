import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { generateText, jsonFromText } from "../_shared/ai-providers.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { sampleText } = await req.json();
    const { text } = await generateText([
      {
        role: "user",
        content: `Analyze this writing sample and return a JSON style profile.

Sample text:
"""
${String(sampleText || "").slice(0, 4000)}
"""

Return ONLY valid JSON:
{
  "tone": "formal|casual|academic|friendly|storytelling|journalistic",
  "complexity": "simple|intermediate|advanced",
  "language": "thai|english|mixed",
  "sentenceStyle": "short|medium|long|mixed",
  "characteristics": ["list", "of", "3-5", "style traits"],
  "vocabularyLevel": "basic|intermediate|technical|literary",
  "writingPersona": "2-sentence description of the author voice",
  "styleInstructions": "Detailed instructions for an AI to mimic this exact style when writing new content."
}`,
      },
    ]);

    return new Response(JSON.stringify(jsonFromText(text)), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-style error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
