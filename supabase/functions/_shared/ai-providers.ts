import { admin } from "./entitlements.ts";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

interface ProviderSetting {
  id?: string;
  provider: "gemini" | "openrouter" | "lovable";
  label?: string;
  api_key: string;
  base_url?: string | null;
  chat_model: string;
  image_model?: string | null;
  enabled?: boolean;
  priority?: number;
}

export const maskSecret = (value?: string | null) => {
  if (!value) return "";
  if (value.length <= 8) return "••••";
  return `${value.slice(0, 4)}••••${value.slice(-4)}`;
};

export async function listAiProvidersForAdmin() {
  const { data, error } = await admin()
    .from("ai_provider_settings")
    .select("id, provider, label, base_url, chat_model, image_model, enabled, priority, created_at, updated_at")
    .order("priority", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getTextProviders(): Promise<ProviderSetting[]> {
  const { data, error } = await admin()
    .from("ai_provider_settings")
    .select("*")
    .eq("enabled", true)
    .order("priority", { ascending: true });

  if (!error && data?.length) return data as ProviderSetting[];

  const providers: ProviderSetting[] = [];
  const gemini = Deno.env.get("GEMINI_API_KEY");
  if (gemini) {
    providers.push({
      provider: "gemini",
      label: "Gemini env",
      api_key: gemini,
      chat_model: Deno.env.get("GEMINI_CHAT_MODEL") || "gemini-2.5-flash",
      priority: 10,
    });
  }
  const openrouter = Deno.env.get("OPENROUTER_API_KEY");
  if (openrouter) {
    providers.push({
      provider: "openrouter",
      label: "OpenRouter env",
      api_key: openrouter,
      base_url: "https://openrouter.ai/api/v1",
      chat_model: Deno.env.get("OPENROUTER_CHAT_MODEL") || "google/gemini-2.0-flash-exp:free",
      priority: 20,
    });
  }
  const lovable = Deno.env.get("LOVABLE_API_KEY");
  if (lovable) {
    providers.push({
      provider: "lovable",
      label: "Lovable env",
      api_key: lovable,
      base_url: "https://ai.gateway.lovable.dev/v1",
      chat_model: Deno.env.get("LOVABLE_CHAT_MODEL") || "google/gemini-3-flash-preview",
      priority: 30,
    });
  }
  return providers;
}

const geminiText = async (provider: ProviderSetting, messages: ChatMessage[]) => {
  const system = messages.find(m => m.role === "system")?.content;
  const contents = messages
    .filter(m => m.role !== "system")
    .map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(provider.chat_model)}:generateContent?key=${provider.api_key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
        contents,
        generationConfig: { temperature: 0.7 },
      }),
    },
  );
  const raw = await res.text();
  if (!res.ok) throw new Error(`${provider.provider}:${res.status}:${raw.slice(0, 500)}`);
  const data = JSON.parse(raw);
  return data.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("") || "";
};

const openAiCompatibleText = async (provider: ProviderSetting, messages: ChatMessage[]) => {
  const baseUrl =
    provider.base_url ||
    (provider.provider === "lovable" ? "https://ai.gateway.lovable.dev/v1" : "https://openrouter.ai/api/v1");
  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.api_key}`,
      "Content-Type": "application/json",
      ...(provider.provider === "openrouter"
        ? { "HTTP-Referer": "https://paperpetal-ai.lovable.app", "X-Title": "KIVORA" }
        : {}),
    },
    body: JSON.stringify({ model: provider.chat_model, messages }),
  });
  const raw = await res.text();
  if (!res.ok) throw new Error(`${provider.provider}:${res.status}:${raw.slice(0, 500)}`);
  const data = JSON.parse(raw);
  return data.choices?.[0]?.message?.content || "";
};

export async function generateText(messages: ChatMessage[]) {
  const providers = await getTextProviders();
  if (!providers.length) throw new Error("No AI provider configured");
  const errors: string[] = [];
  for (const provider of providers) {
    try {
      const text = provider.provider === "gemini"
        ? await geminiText(provider, messages)
        : await openAiCompatibleText(provider, messages);
      if (text.trim()) return { text, provider };
      errors.push(`${provider.provider}:empty_response`);
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }
  }
  throw new Error(`All AI providers failed: ${errors.join(" | ")}`);
}

export const jsonFromText = (text: string) => {
  const clean = text.replace(/```json|```/g, "").trim();
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  return JSON.parse(clean.slice(start, end + 1));
};
