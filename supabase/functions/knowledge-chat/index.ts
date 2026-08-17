import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { generateText } from "../_shared/ai-providers.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MODE_RULES: Record<string, string> = {
  source_only: `SOURCE ONLY MODE. Answer EXCLUSIVELY from the provided sources.
If the answer is not in the sources, say clearly that it was not found in the project sources. Never fill gaps with your own knowledge.`,
  source_ai: `SOURCE + AI MODE. Sources are primary and authoritative. You may add your own explanation, but mark added knowledge as (ความรู้ทั่วไปของ AI) and never cite a source for it.`,
  creative: `CREATIVE MODE. You may creatively transform and extend the source material. Still cite sources when you use their facts.`,
  brainstorm: `BRAINSTORM MODE. Generate many diverse options and ideas built on the sources. Be concise per idea.`,
  editor: `EDITOR MODE. Act as a professional editor: improve clarity, structure and tone; point out weaknesses concretely.`,
  factcheck: `FACT CHECK MODE. For each claim in the question or in the sources, label it SUPPORTED / PARTIALLY SUPPORTED / UNSUPPORTED / CONFLICTING SOURCES / POSSIBLY OUTDATED with the evidence and citation.`,
  compare: `COMPARE MODE. Compare the selected sources: agreement, disagreement, unique information, contradictions, missing information, newest information, recommended source priority.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages = [], sources = [], mode = "source_ai", language = "thai" } = await req.json();

    const langLabel = language === "english" ? "English" : "Thai (ภาษาไทย)";

    const sourceBlock = sources.length
      ? sources
          .map((s: any, i: number) => {
            const label = `Source ${String(i + 1).padStart(2, "0")} · ${s.sourceType} · ${s.title}`;
            const chunks = (s.chunks || [])
              .map((c: any) => `- [${c.location || "n/a"}] ${c.heading || ""}: ${c.summary || c.content || ""}`)
              .join("\n");
            return `### ${label}
Role: ${s.role || "supporting"} | Category: ${s.category || "unknown"}
Summary: ${s.summary || ""}
Key points:
${(s.keyPoints || []).map((k: string) => `- ${k}`).join("\n")}
Chunks:
${chunks}`;
          })
          .join("\n\n")
      : "NO SOURCES SELECTED.";

    const system = `You are KIVORA - a source-grounded knowledge, book and presentation studio assistant.
Answer in ${langLabel}.

${MODE_RULES[mode] || MODE_RULES.source_ai}

CITATION RULES:
- Cite as [Source NN · location] using ONLY the source numbers and locations below.
- Never invent citations, page numbers or timestamps.
- Never attribute AI-generated information to a source.
- Surface conflicts between sources explicitly.

PROJECT SOURCES:
${sourceBlock}`;

    const { text } = await generateText([{ role: "system", content: system }, ...messages]);
    const encoder = new TextEncoder();
    const body = encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\ndata: [DONE]\n\n`);
    return new Response(body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  } catch (err) {
    console.error("knowledge-chat error", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
