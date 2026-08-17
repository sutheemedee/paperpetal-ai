import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const fallbackBook = (title: string, pageCount: number, language: string, styleProfile: any, sources: any[]) => {
  const thai = language === 'thai';
  const safeTitle = title?.trim() || (thai ? 'หนังสือใหม่ของคุณ' : 'Your New Book');
  const chapterCount = Math.max(3, Math.min(8, Math.ceil(Number(pageCount || 24) / 10)));
  const pagesPerChapter = Math.max(2, Math.ceil(Number(pageCount || 24) / chapterCount));
  const sourceHint = sources?.length
    ? thai
      ? ` เนื้อหาควรนำแหล่งข้อมูล ${sources.length} แหล่งที่แนบไว้มาใช้เป็นฐานหลัก และระบุจุดที่ต้องตรวจสอบเพิ่มเติมก่อนเผยแพร่จริง`
      : ` Use the ${sources.length} attached sources as the main grounding and flag anything that needs review before publishing.`
    : '';

  return {
    title: safeTitle,
    subtitle: thai ? 'ฉบับร่างจาก KIVORA' : 'KIVORA Draft Edition',
    author: 'KIVORA AI',
    description: thai
      ? `โครงร่างหนังสือสำหรับ "${safeTitle}" พร้อมบท เนื้อหาเริ่มต้น และแนวทางภาพประกอบ${sourceHint}`
      : `A structured draft for "${safeTitle}" with chapters, starter copy, and illustration direction.${sourceHint}`,
    fallback: true,
    fallbackReason: 'ai_gateway_unavailable',
    chapters: Array.from({ length: chapterCount }, (_, chapterIndex) => ({
      chapterNumber: chapterIndex + 1,
      chapterTitle: thai ? `บทที่ ${chapterIndex + 1}: แก่นสำคัญของ ${safeTitle}` : `Chapter ${chapterIndex + 1}: Core Ideas for ${safeTitle}`,
      chapterImagePrompt: `Editorial illustration for chapter ${chapterIndex + 1} of a book titled "${safeTitle}", ${styleProfile?.tone || 'professional and modern'} mood, no text`,
      pages: Array.from({ length: pagesPerChapter }, (_, pageIndex) => {
        const pageNumber = chapterIndex * pagesPerChapter + pageIndex + 1;
        return {
          pageNumber,
          heading: thai ? `หัวข้อหน้า ${pageNumber}` : `Page ${pageNumber} Topic`,
          body: thai
            ? `หน้านี้เป็นเนื้อหาร่างสำหรับ "${safeTitle}" โดยวางประเด็นให้อ่านง่าย มีลำดับจากภาพรวมไปสู่รายละเอียด และเปิดพื้นที่ให้ผู้เขียนเติมข้อมูลเฉพาะเพิ่มเติม ระบบสร้างหน้านี้เป็น fallback เมื่อ AI gateway ไม่พร้อมใช้งาน เพื่อให้ผู้ดูแลระบบยังสามารถเริ่มโปรเจกต์ ตรวจโครงสร้างหนังสือ และส่งต่อไปแก้ไขใน Studio ได้ต่อเนื่อง${sourceHint}`
            : `This page is a starter draft for "${safeTitle}". It moves from context to practical detail and leaves room for domain-specific refinement. KIVORA generated this fallback when the AI gateway was unavailable so operators can still create the project structure, review the book flow, and continue editing in Studio.${sourceHint}`,
        };
      }),
    })),
    conclusion: thai ? `สรุปสาระสำคัญของ "${safeTitle}" และขั้นตอนต่อไปสำหรับการปรับแก้ก่อนเผยแพร่` : `A closing summary for "${safeTitle}" and next steps for refinement before publishing.`,
    backCoverText: thai ? `${safeTitle} คือหนังสือที่ออกแบบให้เปลี่ยนความรู้เป็นผลงานที่อ่านง่าย ใช้งานได้จริง และต่อยอดได้` : `${safeTitle} turns knowledge into a readable, practical, and publishable work.`,
    coverImagePrompt: `Premium modern book cover illustration for "${safeTitle}", symbolic editorial composition, no text`,
  };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, pageCount, language, styleProfile, sources = [], sourceMode = 'source_ai' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const buildSystemPrompt = (sp: any): string => {
      if (sp) {
        return `You are a professional book author.
CRITICAL: You must write in this exact style:
${sp.styleInstructions}

Tone: ${sp.tone}
Vocabulary level: ${sp.vocabularyLevel}
Sentence style: ${sp.sentenceStyle}
Writing persona: ${sp.writingPersona}

Every page, every sentence must match this style precisely.`;
      }
      return `You are a professional book author and content strategist.`;
    };

    const langLabel = language === 'thai' ? 'Thai (ภาษาไทย)' : 'English';

    const sourceBlock = sources.length
      ? `PROJECT SOURCES (source mode: ${sourceMode}):\n` +
        sources
          .map((s: any, i: number) => `### Source ${String(i + 1).padStart(2, '0')} \u00b7 ${s.sourceType} \u00b7 ${s.title} (role: ${s.role})
Summary: ${s.summary || ''}
Key points: ${(s.keyPoints || []).join(' | ')}
Chunks:
${(s.chunks || []).map((c: any) => `- [${c.location || 'n/a'}] ${c.heading || ''}: ${c.summary || c.content || ''}`).join('\n')}`)
          .join('\n\n') +
        `\n\nGROUNDING RULES:
- Base the book on these sources. Cite as [Source NN \u00b7 location] using ONLY the given source numbers and locations.
- Never invent citations, page numbers or timestamps. Never attribute your own knowledge to a source.
- Surface conflicts between sources instead of hiding them.
${sourceMode === 'source_only' ? '- SOURCE ONLY: do not add facts that are absent from the sources; state clearly when information is missing.' : ''}
${sourceMode === 'creative' ? '- CREATIVE: you may transform the source material creatively.' : ''}`
      : '';

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: buildSystemPrompt(styleProfile) },
          {
            role: "user",
            content: `${sourceBlock}\n\nCreate a complete e-book on the topic: "${title}".
Language: ${langLabel}
The book should have enough content to fill approximately ${pageCount} pages.

Return ONLY valid JSON (no markdown, no backticks):
{
  "title": string,
  "subtitle": string,
  "author": string,
  "description": string,
  "chapters": [
    {
      "chapterNumber": number,
      "chapterTitle": string,
      "chapterImagePrompt": "detailed English prompt for an AI image that represents this chapter visually",
      "pages": [
        {
          "pageNumber": number,
          "heading": string,
          "body": "long paragraph content for this page (at least 150 words)"
        }
      ]
    }
  ],
  "conclusion": string,
  "backCoverText": string,
  "coverImagePrompt": "detailed English prompt for the book cover illustration — no text, symbolic, editorial style"
}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify(fallbackBook(title, pageCount, language, styleProfile, sources)), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    
    try {
      const bookData = JSON.parse(text.replace(/```json|```/g, '').trim());
      return new Response(JSON.stringify(bookData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (parseErr) {
      console.error("Parse error:", parseErr, "Raw text:", text.slice(0, 500));
      return new Response(JSON.stringify({ error: "Failed to parse book data" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    console.error("generate-book error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
