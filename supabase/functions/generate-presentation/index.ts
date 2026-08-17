import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const fallbackDeck = (
  topic: string,
  slideCount: number,
  audience: string,
  purpose: string,
  tone: string,
  language: string,
  sources: any[],
) => {
  const thai = language !== "english";
  const safeTopic = topic?.trim() || (thai ? "พรีเซนเทชันใหม่" : "New Presentation");
  const count = Math.max(3, Math.min(80, Number(slideCount || 20)));
  const sourceNote = sources?.length
    ? thai
      ? `ใช้แหล่งข้อมูลที่แนบ ${sources.length} แหล่งเป็นฐาน และตรวจความถูกต้องก่อนนำเสนอ`
      : `Use the ${sources.length} attached sources as grounding and verify before presenting.`
    : thai
      ? "ยังไม่มีแหล่งข้อมูลแนบ"
      : "No sources attached.";

  return {
    title: safeTopic,
    subtitle: thai ? `สำหรับ ${audience} | เป้าหมาย: ${purpose}` : `For ${audience} | Goal: ${purpose}`,
    storyline: thai
      ? "โครงเรื่องเริ่มจากปัญหา ไปสู่แนวคิดหลัก ตัวอย่างใช้งาน และขั้นตอนต่อไป"
      : "Problem, core idea, practical examples, and next steps.",
    coreMessage: thai ? `${safeTopic} ควรถูกเล่าอย่างชัดเจน กระชับ และนำไปใช้ได้จริง` : `${safeTopic} should be clear, concise, and practical.`,
    fallback: true,
    fallbackReason: "ai_gateway_unavailable",
    sections: [
      { name: thai ? "เปิดเรื่อง" : "Opening", slides: Math.max(1, Math.round(count * 0.2)) },
      { name: thai ? "เนื้อหาหลัก" : "Core Content", slides: Math.max(1, Math.round(count * 0.6)) },
      { name: thai ? "สรุป" : "Summary", slides: Math.max(1, count - Math.round(count * 0.8)) },
    ],
    slides: Array.from({ length: count }, (_, i) => ({
      number: i + 1,
      layout: i === 0 ? "cover" : i === count - 1 ? "summary" : i % 5 === 0 ? "section" : "threePoints",
      title: i === 0 ? safeTopic : thai ? `ประเด็นที่ ${i}` : `Key Point ${i}`,
      subtitle: i === 0 ? tone : "",
      bullets: thai
        ? [`ใจความสำคัญของสไลด์ ${i + 1}`, "เชื่อมกับเป้าหมายผู้ฟัง", sourceNote]
        : [`Core idea for slide ${i + 1}`, "Connect to audience needs", sourceNote],
      body: thai
        ? "สไลด์นี้เป็นโครงร่าง fallback เพื่อให้ผู้ดูแลระบบสร้างงานต่อได้แม้ AI gateway ไม่พร้อมใช้งาน ควรปรับข้อความและหลักฐานก่อนเผยแพร่"
        : "This fallback slide keeps the operator flow usable when the AI gateway is unavailable. Refine wording and evidence before publishing.",
      visual: { kind: "illustration", prompt: `Modern premium presentation visual for "${safeTopic}", slide ${i + 1}, ${tone}, no text` },
      citations: [],
      notes: sourceNote,
    })),
  };
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const {
      topic,
      slideCount = 20,
      audience = "ผู้เริ่มต้น",
      purpose = "สอน",
      tone = "Modern Technology",
      language = "thai",
      presetType = "Teaching",
      sources = [],
      sourceMode = "source_ai",
      notesLevel = "short",
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langLabel = language === "english" ? "English" : "Thai (ภาษาไทย)";

    const sourceBlock = sources.length
      ? sources
          .map((s: any, i: number) => `### Source ${String(i + 1).padStart(2, "0")} · ${s.sourceType} · ${s.title} (role: ${s.role})
Summary: ${s.summary}
Key points: ${(s.keyPoints || []).join(" | ")}
Chunks:
${(s.chunks || []).map((c: any) => `- [${c.location || "n/a"}] ${c.heading || ""}: ${c.summary || c.content || ""}`).join("\n")}`)
          .join("\n\n")
      : "NO SOURCES - rely on general knowledge and say so in the notes.";

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are KIVORA's AI Presentation Architect.
Plan the storyline FIRST, then allocate slides, then write each slide. Never produce random slides without a narrative.
Write all slide text in ${langLabel}.
Source mode: ${sourceMode}. Cite as [Source NN · location] using ONLY the given source numbers and locations. Never invent citations, pages or timestamps.
Return ONLY valid JSON, no markdown fences.`,
          },
          {
            role: "user",
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
      console.error("AI gateway error", res.status, t);
      if (res.status === 402) return json(fallbackDeck(topic, slideCount, audience, purpose, tone, language, sources));
      if (res.status === 429) return json({ error: "ระบบ AI มีคำขอมากเกินไป กรุณาลองใหม่" }, 429);
      return json({ error: "สร้างพรีเซนเทชันไม่สำเร็จ" }, 500);
    }

    const data = await res.json();
    let content: string = data.choices?.[0]?.message?.content ?? "";
    content = content.replace(/```json|```/g, "").trim();
    const deck = JSON.parse(content.slice(content.indexOf("{"), content.lastIndexOf("}") + 1));
    return json(deck);
  } catch (err) {
    console.error("generate-presentation error", err);
    return json({ error: (err as Error).message || "unknown error" }, 500);
  }
});
