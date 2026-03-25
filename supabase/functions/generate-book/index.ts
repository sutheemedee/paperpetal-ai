import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, pageCount, language, styleProfile } = await req.json();
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
            content: `Create a complete e-book on the topic: "${title}".
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
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
