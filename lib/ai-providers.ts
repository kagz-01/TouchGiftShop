/* ══════════════════════════════════════════════════════════
   Centralized AI Provider Utility — T-Gifter
   Chain: OpenRouter (17 free models) → Grok → Gemini → Ollama → Static
   ══════════════════════════════════════════════════════════ */

export type AIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

// All available free OpenRouter models — tried in order
const OPENROUTER_FREE_MODELS = [
  "nvidia/nemotron-3.5-lightning:free",        // fast, reliable
  "google/gemma-4-31b-it:free",               // Google's best free
  "google/gemma-4-26b-a4b-it:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "minimax/minimax-m3:free",
  "minimax/minimax-m2.7:free",
  "thinkingmachines/inkling:free",
  "thinkingmachines/inkling-small:free",
  "poolside/laguna-s-2.1:free",
  "poolside/laguna-xs-2.1:free",
  "z-ai/glm-5.2:free",
  "liquid/lfm-2.5-2.6b:free",
  "dots-studio/dots-3-note-preview:free",
  "cohere/north-mini-code:free",
  "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
  "nvidia/nemotron-3.5-content-safety:free",   // last resort free
];

// Ollama local models — tried in order
const OLLAMA_MODELS = [
  process.env.OLLAMA_MODEL || "llama3.2:1b",
  ...(process.env.OLLAMA_FALLBACK_MODELS || "").split(",").filter(Boolean),
];

/** Call OpenRouter, cycling through all free models until one responds */
async function callOpenRouter(messages: AIMessage[]): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("No OPENROUTER_API_KEY");

  for (const model of OPENROUTER_FREE_MODELS) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://touch-gift-shop.vercel.app",
          "X-Title": "TouchGift T-Gifter",
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 600,
          temperature: 0.7,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as any;
        console.warn(`OpenRouter model ${model} failed: ${res.status}`, err?.error?.message);
        continue;
      }
      const data = await res.json() as any;
      const text = data?.choices?.[0]?.message?.content;
      if (text) {
        console.info(`[T-Gifter] OpenRouter responded via ${model}`);
        return text;
      }
    } catch (e) {
      console.warn(`OpenRouter model ${model} threw:`, e);
    }
  }
  throw new Error("All OpenRouter free models exhausted");
}

/** Call Grok (xAI) */
async function callGrok(messages: AIMessage[]): Promise<string> {
  const key = process.env.GROK_API_KEY;
  if (!key) throw new Error("No GROK_API_KEY");
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: "grok-3-mini", messages, max_tokens: 600, temperature: 0.7 }),
  });
  if (!res.ok) throw new Error(`Grok error: ${res.status}`);
  const data = await res.json() as any;
  return data.choices[0].message.content;
}

/** Call Gemini (Google) — updated model */
async function callGemini(messages: AIMessage[]): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("No GEMINI_API_KEY");

  const systemMsg = messages.find((m) => m.role === "system");
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": key,
      },
      body: JSON.stringify({
        contents,
        systemInstruction: systemMsg ? { parts: [{ text: systemMsg.content }] } : undefined,
        generationConfig: { maxOutputTokens: 600, temperature: 0.7 },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
  const data = await res.json() as any;
  return data.candidates[0].content.parts[0].text;
}

/** Call Ollama (local) — cycles through all configured models */
async function callOllama(messages: AIMessage[]): Promise<string> {
  const baseUrl = process.env.OLLAMA_URL || "http://localhost:11434";
  const systemMsg = messages.find((m) => m.role === "system");
  const chatMessages = messages.filter((m) => m.role !== "system");

  for (const model of OLLAMA_MODELS) {
    try {
      const res = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: chatMessages,
          system: systemMsg?.content,
          stream: false,
          options: { num_predict: 600, temperature: 0.7 },
        }),
      });
      if (!res.ok) continue;
      const data = await res.json() as any;
      const text = data?.message?.content;
      if (text) {
        console.info(`[T-Gifter] Ollama responded via ${model}`);
        return text;
      }
    } catch {
      console.warn(`Ollama model ${model} failed`);
    }
  }
  throw new Error("All Ollama models failed");
}

/**
 * Main entry point — tries every provider in order until one succeeds.
 * Returns { text, provider }
 * 
 * Chain: OpenRouter (17 free) → Grok → Gemini → Ollama (local)
 */
export async function callAI(messages: AIMessage[]): Promise<{ text: string; provider: string }> {
  const chain: Array<{ name: string; fn: () => Promise<string> }> = [
    { name: "openrouter", fn: () => callOpenRouter(messages) },
    { name: "grok",       fn: () => callGrok(messages) },
    { name: "gemini",     fn: () => callGemini(messages) },
    { name: "ollama",     fn: () => callOllama(messages) },
  ];

  for (const { name, fn } of chain) {
    try {
      const text = await fn();
      return { text, provider: name };
    } catch (e) {
      console.warn(`[T-Gifter] Provider ${name} failed:`, (e as Error).message);
    }
  }

  throw new Error("All AI providers failed");
}

/**
 * Same as callAI but enforces JSON output.
 * For providers that can't guarantee JSON, we try to extract it from the response.
 */
export async function callAIJson(messages: AIMessage[]): Promise<{ data: any; provider: string }> {
  const { text, provider } = await callAI(messages);

  // Try direct parse first
  try {
    return { data: JSON.parse(text), provider };
  } catch {
    // Extract JSON from markdown code blocks or surrounding text
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) ||
                      text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const extracted = jsonMatch[1] || jsonMatch[0];
        return { data: JSON.parse(extracted), provider };
      } catch { /* fall through */ }
    }
  }

  throw new Error(`Failed to parse JSON from ${provider} response`);
}
