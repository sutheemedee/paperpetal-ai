import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const {
      topic,
      slideCount = 20,
      audience = 'ผู้เริ่มต้น',
      purpose = 'สอน',
      tone = 'Modern Technology',
      language = 'thai',
      presetType = 'Teaching',
      sources = [],
      sourceMode = 'source_ai',
      notesLevel = 'short',
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const langLabel = language === 'english' ? 'English' : 'Thai (ภาษาไทย)';

    const sourceBlock = sources.length
      ? sources
          .map((s: any, i: number) => `### Source ${String(i + 1).padStart(2, '0')} · ${s.sourceType} · ${s.title} (role: ${s.role})
Summary: ${s.summary}
Key points: ${(s.keyPoints || []).join(' | ')}
Chunks:
${(s.chunks || []).map((c: any) => `- [${c.location || 'n/a'}] ${c.heading || ''}: ${c.summary || c.content || ''}`).join('\n')}`)
          .join('\n\n')
      : 'NO SOURCES — rely on general knowledge and say so in the notes.';

    const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: `You are KIVORA's AI Presentation Architect.
Plan the storyline FIRST, then allocate slides, then write each slide. Never produce random slides without a narrative.
Write all slide text in ${langLabel}.
Source mode: ${sourceMode}. Cite as [Source NN · location] using ONLY the given source numbers and locations. Never invent citations, pages or timestamps.
Return ONLY valid JSON, no markdown fences.`,
          },
          {
            role: 'user',
            content: `TOPIC: ${topic}
PRESET: ${presetType} | AUDIENCE: ${audience} | PURPOSE: ${purpose} | TONE: ${tone}
EXACT SLIDE COUNT REQUIRED: ${slideCount}
SPEAKER NOTES: ${notesLevel}

PROJECT SOURCES:
${sourceBlock}

Return JSON:
{
  "title": string,
  "subtitle": string,
  "storyline": string,
  "coreMessage": string,
  "sections": [{"name": string, "slides": number}],
  "slides": [{
    "number": number,
    "layout": "cover"|"section"|"bigStatement"|"textImage"|"imageText"|"fullImage"|"threePoints"|"fourQuadrants"|"timeline"|"process"|"comparison"|"beforeAfter"|"chart"|"table"|"statistics"|"quote"|"caseStudy"|"diagram"|"roadmap"|"summary"|"cta"|"qa",
    "title": string,
    "subtitle": string,
    "bullets": string[],
    "body": string,
    "visual": {"kind": "photo"|"illustration"|"diagram"|"chart"|"icon"|"screenshot"|"none", "prompt": string},
    "citations": string[],
    "notes": string
  }]
}
The "slides" array MUST contain exactly ${slideCount} items numbered 1..${slideCount}.`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      console.error('AI gateway error', res.status, t);
      if (res.status === 429) return json({ error: 'ระบบ AI มีคำขอมากเกินไป กรุณาลองใหม่' }, 429);
      if (res.status === 402) return json({ error: 'เครดิต AI หมด กรุณาเติมเครดิต' }, 402);
      return json({ error: 'สร้างพรีเซนเทชันไม่สำเร็จ' }, 500);
    }

    const data = await res.json();
    let content: string = data.choices?.[0]?.message?.content ?? '';
    content = content.replace(/```json|```/g, '').trim();
    const deck = JSON.parse(content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1));
    return json(deck);
  } catch (err) {
    console.error('generate-presentation error', err);
    return json({ error: (err as Error).message || 'unknown error' }, 500);
  }
});
