import { admin } from "./entitlements.ts";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type ProviderKind = "gemini" | "openai" | "openrouter" | "lovable";

interface ProviderSetting {
  id?: string;
  provider: ProviderKind;
  capability?: "text" | "image" | "both";
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

const defaultBaseUrl = (provider: ProviderKind) => {
  if (provider === "openai") return "https://api.openai.com/v1";
  if (provider === "openrouter") return "https://openrouter.ai/api/v1";
  if (provider === "lovable") return "https://ai.gateway.lovable.dev/v1";
  return "";
};

export async function listAiProvidersForAdmin() {
  const { data, error } = await admin()
    .from("ai_provider_settings")
    .select("id, provider, capability, label, base_url, chat_model, image_model, enabled, priority, api_key, created_at, updated_at")
    .order("priority", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row: Record<string, unknown>) => {
    const { api_key, ...rest } = row;
    return { ...rest, key_mask: maskSecret(api_key as string) };
  });
}

async function loadProviders(kinds: Array<"text" | "image">): Promise<ProviderSetting[]> {
  const { data, error } = await admin()
    .from("ai_provider_settings")
    .select("*")
    .eq("enabled", true)
    .order("priority", { ascending: true });

  const rows = (!error && data ? (data as ProviderSetting[]) : []).filter(p => {
    const cap = p.capability ?? "text";
    return cap === "both" || kinds.includes(cap as "text" | "image");
  });
  if (rows.length) return rows;
  return [];
}

export async function getTextProviders(): Promise<ProviderSetting[]> {
  const configured = await loadProviders(["text"]);
  if (configured.length) return configured;

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
  const openai = Deno.env.get("OPENAI_API_KEY");
  if (openai) {
    providers.push({
      provider: "openai",
      label: "OpenAI env",
      api_key: openai,
      base_url: "https://api.openai.com/v1",
      chat_model: Deno.env.get("OPENAI_CHAT_MODEL") || "gpt-4o-mini",
      image_model: Deno.env.get("OPENAI_IMAGE_MODEL") || "gpt-image-1",
      priority: 15,
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

export async function getImageProviders(): Promise<ProviderSetting[]> {
  const configured = await loadProviders(["image"]);
  if (configured.length) return configured.filter(p => p.image_model || p.provider !== "gemini");

  const providers: ProviderSetting[] = [];
  const openai = Deno.env.get("OPENAI_API_KEY");
  if (openai) {
    providers.push({
      provider: "openai",
      label: "OpenAI env",
      api_key: openai,
      base_url: "https://api.openai.com/v1",
      chat_model: "gpt-4o-mini",
      image_model: Deno.env.get("OPENAI_IMAGE_MODEL") || "gpt-image-1",
      priority: 10,
    });
  }
  const gemini = Deno.env.get("GEMINI_API_KEY");
  if (gemini) {
    providers.push({
      provider: "gemini",
      label: "Gemini env",
      api_key: gemini,
      chat_model: "gemini-2.5-flash",
      image_model: Deno.env.get("GEMINI_IMAGE_MODEL") || "gemini-2.5-flash-image",
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
      chat_model: "google/gemini-2.5-flash-image",
      image_model: Deno.env.get("LOVABLE_IMAGE_MODEL") || "google/gemini-2.5-flash-image",
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
  const baseUrl = provider.base_url || defaultBaseUrl(provider.provider);
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

/* ---------------- Image generation ---------------- */

const geminiImage = async (provider: ProviderSetting, prompt: string) => {
  const model = provider.image_model || "gemini-2.5-flash-image";
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${provider.api_key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] }),
    },
  );
  const raw = await res.text();
  if (!res.ok) throw new Error(`gemini_image:${res.status}:${raw.slice(0, 400)}`);
  const data = JSON.parse(raw);
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    const inline = part.inlineData || part.inline_data;
    if (inline?.data) return `data:${inline.mimeType || inline.mime_type || "image/png"};base64,${inline.data}`;
  }
  throw new Error("gemini_image:no_image");
};

const openAiImage = async (provider: ProviderSetting, prompt: string) => {
  const baseUrl = (provider.base_url || defaultBaseUrl("openai")).replace(/\/$/, "");
  const res = await fetch(`${baseUrl}/images/generations`, {
    method: "POST",
    headers: { Authorization: `Bearer ${provider.api_key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: provider.image_model || "gpt-image-1",
      prompt,
      size: "1024x1024",
      n: 1,
    }),
  });
  const raw = await res.text();
  if (!res.ok) throw new Error(`openai_image:${res.status}:${raw.slice(0, 400)}`);
  const data = JSON.parse(raw);
  const item = data.data?.[0];
  if (item?.b64_json) return `data:image/png;base64,${item.b64_json}`;
  if (item?.url) return String(item.url);
  throw new Error("openai_image:no_image");
};

const chatModalityImage = async (provider: ProviderSetting, prompt: string) => {
  const baseUrl = (provider.base_url || defaultBaseUrl(provider.provider)).replace(/\/$/, "");
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.api_key}`,
      "Content-Type": "application/json",
      ...(provider.provider === "openrouter"
        ? { "HTTP-Referer": "https://paperpetal-ai.lovable.app", "X-Title": "KIVORA" }
        : {}),
    },
    body: JSON.stringify({
      model: provider.image_model || provider.chat_model,
      messages: [{ role: "user", content: prompt }],
      modalities: ["image", "text"],
    }),
  });
  const raw = await res.text();
  if (!res.ok) throw new Error(`${provider.provider}_image:${res.status}:${raw.slice(0, 400)}`);
  const data = JSON.parse(raw);
  const url = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!url) throw new Error(`${provider.provider}_image:no_image`);
  return String(url);
};

/** Tries every enabled image provider by priority. Throws only when all fail. */
export async function generateImage(prompt: string) {
  const providers = await getImageProviders();
  if (!providers.length) throw new Error("image_provider_not_configured");
  const errors: string[] = [];
  for (const provider of providers) {
    try {
      const imageUrl = provider.provider === "gemini"
        ? await geminiImage(provider, prompt)
        : provider.provider === "openai"
          ? await openAiImage(provider, prompt)
          : await chatModalityImage(provider, prompt);
      if (imageUrl) return { imageUrl, provider };
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }
  }
  throw new Error(`All image providers failed: ${errors.join(" | ")}`);
}

export const jsonFromText = (text: string) => {
  const clean = text.replace(/```json|```/g, "").trim();
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  return JSON.parse(clean.slice(start, end + 1));
};
