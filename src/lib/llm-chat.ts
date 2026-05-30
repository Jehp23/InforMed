/** Proveedor usado en respuestas API / UI */
export type LlmAssistSource = "groq" | "openai" | "rules";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

type LlmConfig = {
  source: Exclude<LlmAssistSource, "rules">;
  apiKey: string;
  baseUrl: string;
  model: string;
};

const GROQ_DEFAULT_MODEL = "llama-3.3-70b-versatile";
const OPENAI_DEFAULT_MODEL = "gpt-4o-mini";

export function isLlmConfigured(): boolean {
  return resolveLlmConfig() !== null;
}

function resolveLlmConfig(): LlmConfig | null {
  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (groqKey) {
    return {
      source: "groq",
      apiKey: groqKey,
      baseUrl: "https://api.groq.com/openai/v1/chat/completions",
      model: process.env.GROQ_MODEL?.trim() || GROQ_DEFAULT_MODEL,
    };
  }

  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (openaiKey) {
    return {
      source: "openai",
      apiKey: openaiKey,
      baseUrl: "https://api.openai.com/v1/chat/completions",
      model: process.env.OPENAI_MODEL?.trim() || OPENAI_DEFAULT_MODEL,
    };
  }

  return null;
}

/** Etiqueta amigable para la UI del asistente */
export function llmSourceLabel(source: LlmAssistSource | string | null): string {
  if (source === "groq") return "IA · Groq";
  if (source === "openai") return "IA · OpenAI";
  return "reglas locales";
}

/**
 * Chat completion compatible con OpenAI (Groq u OpenAI).
 * Devuelve null si no hay clave o la API falla.
 */
export async function chatCompletion(
  messages: ChatMessage[],
  temperature: number,
): Promise<{ text: string; source: Exclude<LlmAssistSource, "rules"> } | null> {
  const config = resolveLlmConfig();
  if (!config) return null;

  const res = await fetch(config.baseUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      temperature,
      messages,
    }),
  });

  if (!res.ok) {
    console.warn(
      `[llm-chat] ${config.source} ${res.status}: ${await res.text().catch(() => "")}`,
    );
    return null;
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) return null;

  return { text, source: config.source };
}
