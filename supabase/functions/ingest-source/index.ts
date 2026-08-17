import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const stripHtml = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

const youtubeId = (url: string) => {
  const m = url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([A-Za-z0-9_-]{6,})/);
  return m?.[1] || '';
};

const fmtTime = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

/** Best-effort YouTube acquisition: metadata (oEmbed) + caption track when publicly available. */
const fetchYoutube = async (url: string) => {
  const id = youtubeId(url);
  let title = '';
  let author = '';
  let description = '';
  let transcript = '';
  let transcriptAvailable = false;

  try {
    const r = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
    if (r.ok) {
      const d = await r.json();
      title = d.title || '';
      author = d.author_name || '';
    }
  } catch (_) { /* ignore */ }

  try {
    const page = await fetch(`https://www.youtube.com/watch?v=${id}`, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'th,en' },
    });
    const html = await page.text();
    const desc = html.match(/"shortDescription":"(.*?)","/);
    if (desc) description = JSON.parse(`"${desc[1]}"`);
    if (!title) title = stripHtml(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '');

    const tracks = [...html.matchAll(/"baseUrl":"(https:\/\/www\.youtube\.com\/api\/timedtext[^"]+)"/g)].map(m =>
      JSON.parse(`"${m[1]}"`),
    );
    for (const track of tracks) {
      const tr = await fetch(track);
      if (!tr.ok) continue;
      const xml = await tr.text();
      const cues = [...xml.matchAll(/<text start="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g)];
      if (!cues.length) continue;
      transcript = cues
        .map(c => `[${fmtTime(parseFloat(c[1]))}] ${stripHtml(c[2])}`)
        .join('\n');
      transcriptAvailable = true;
      break;
    }
  } catch (_) { /* ignore */ }

  return { title, author, description, transcript, transcriptAvailable };
};

const fetchWebsite = async (url: string) => {
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await r.text();
  const title = stripHtml(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] || url);
  return { title, text: stripHtml(html).slice(0, 24000) };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { sourceType, url, text, title: givenTitle, language = 'thai' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    let title = givenTitle || '';
    let body = text || '';
    let meta: Record<string, unknown> = { sourceType, url: url || '' };
    let warnings: string[] = [];

    if (sourceType === 'youtube' && url) {
      const yt = await fetchYoutube(url);
      title = title || yt.title || 'YouTube';
      meta = { ...meta, author: yt.author, transcriptAvailable: yt.transcriptAvailable };
      body = [
        yt.title && `TITLE: ${yt.title}`,
        yt.author && `CHANNEL: ${yt.author}`,
        yt.description && `DESCRIPTION:\n${yt.description}`,
        yt.transcript ? `TRANSCRIPT (with timestamps):\n${yt.transcript}` : '',
      ]
        .filter(Boolean)
        .join('\n\n')
        .slice(0, 60000);
      if (!yt.transcriptAvailable) {
        warnings.push('ไม่พบคำบรรยาย (transcript) สาธารณะของคลิปนี้ — ความรู้ที่สกัดได้มาจากชื่อคลิปและคำอธิบายเท่านั้น คุณสามารถวางข้อความ transcript เองเพื่อความแม่นยำ');
      }
    } else if (sourceType === 'website' && url) {
      const site = await fetchWebsite(url);
      title = title || site.title;
      body = site.text;
    }

    if (!body || body.trim().length < 20) {
      return json({ error: 'ไม่พบเนื้อหาที่อ่านได้จากแหล่งข้อมูลนี้', warnings }, 422);
    }

    const langLabel = language === 'english' ? 'English' : 'Thai (ภาษาไทย)';

    const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: `You are KIVORA's Source Processor. You EXTRACT knowledge strictly from the supplied source text.
ABSOLUTE RULES:
- Never invent facts, page numbers or timestamps. Only use timestamps that literally appear as [MM:SS] in the source.
- If something is not in the source, omit it. Empty arrays are acceptable.
- Write summaries in ${langLabel}. Keep keywords/entities in their original language.
Return ONLY valid JSON, no markdown fences.`,
          },
          {
            role: 'user',
            content: `SOURCE TYPE: ${sourceType}
SOURCE TITLE: ${title}
SOURCE URL: ${url || '-'}

SOURCE TEXT:
"""
${body.slice(0, 60000)}
"""

Return JSON:
{
  "title": string,
  "sourceCategory": "official"|"academic"|"professional"|"news"|"community"|"personal"|"unknown",
  "reliabilityNote": string,
  "quickSummary": string,
  "detailedSummary": string,
  "beginnerSummary": string,
  "keyPoints": string[],
  "concepts": [{"term": string, "definition": string}],
  "steps": string[],
  "examples": string[],
  "toolsMentioned": string[],
  "namesMentioned": string[],
  "claims": [{"claim": string, "location": string}],
  "warnings": string[],
  "actionItems": string[],
  "questions": string[],
  "keywords": string[],
  "entities": string[],
  "timeline": [{"label": string, "location": string}],
  "chapters": [{"heading": string, "location": string, "summary": string}],
  "chunks": [{"heading": string, "location": string, "content": string, "summary": string, "keywords": string[]}]
}
"location" = timestamp range like "12:42–14:18" for video, page/section for documents, "" if unknown.
Produce 6–25 chunks that together cover the source faithfully.`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      console.error('AI gateway error', res.status, t);
      if (res.status === 429) return json({ error: 'ระบบ AI มีคำขอมากเกินไป กรุณาลองใหม่อีกครั้ง' }, 429);
      if (res.status === 402) return json({ error: 'เครดิต AI หมด กรุณาเติมเครดิต' }, 402);
      return json({ error: 'วิเคราะห์แหล่งข้อมูลไม่สำเร็จ' }, 500);
    }

    const data = await res.json();
    let content: string = data.choices?.[0]?.message?.content ?? '';
    content = content.replace(/```json|```/g, '').trim();
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');
    const knowledge = JSON.parse(content.slice(start, end + 1));

    return json({
      title: knowledge.title || title,
      meta,
      warnings,
      rawText: body.slice(0, 20000),
      knowledge,
    });
  } catch (err) {
    console.error('ingest-source error', err);
    return json({ error: (err as Error).message || 'unknown error' }, 500);
  }
});
