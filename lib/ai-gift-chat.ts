/* ══════════════════════════════════════════════════════════
   AI Gift Chat Service — Multi-provider, Multi-language
   Chain: OpenRouter → OpenAI → Grok → Gemini → Ollama (local)
   Supports 15+ languages via LibreTranslate
   ══════════════════════════════════════════════════════════ */

import { translateForChat, translateFromChat } from "@/lib/translate";

export type AIProvider = "openrouter" | "openai" | "grok" | "gemini" | "ollama";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type GiftRecommendation = {
  product_id: string;
  name: string;
  reason: string;
  confidence: number;
};

export type ChatResponse = {
  reply: string;
  provider: AIProvider;
  recommendations?: GiftRecommendation[];
  language: string;
  noteSuggestion?: string;
  translatedFrom?: string;
};

/* ─── System Prompt — The Gift Concierge ─── */
const SYSTEM_PROMPT = `You are "T-Gifter" — TouchGift's AI gift concierge. You help people find the perfect gift in Kenya.

PERSONALITY:
- Warm, friendly, like a trusted friend who knows gifts
- Use Kenyan expressions naturally: "sawa", "poa", "niko hapa kukusaidia"
- Match the user's language — if they write in Swahili, reply in Swahili. If Sheng, reply in Sheng. If English, reply in English
- Be concise but thoughtful — 2-4 sentences max unless explaining something
- Use emojis sparingly but naturally 🎁

LANGUAGE RULES:
- English: Standard professional but warm
- Kiswahili: Use proper Kiswahili, not too formal
- Sheng: Mix of English and Swahili naturally ("Hey, unatafuta gift gani? Niko hapa kukusaidia")
- Detect the language from the user's first message and stay consistent

CORE CAPABILITIES:
1. GIFT RECOMMENDATION: Ask about the recipient (who, occasion, budget, interests) then recommend products
2. NOTE GENERATION: Help write heartfelt messages for gifts — offer to generate a handwritten-style note
3. HAMPER BUILDING: Suggest combinations of items for corporate or personal hampers
4. OCCASION HELP: Advise on appropriate gifts for Kenyan occasions (ruracio, kwanzaa, weddings, etc.)

GIFT DISCOVERY FLOW:
1. Ask: Who is the gift for? (partner, parent, friend, colleague, client)
2. Ask: What occasion? (birthday, anniversary, wedding, thank you, just because)
3. Ask: Budget range? (give options: under 2k, 2-5k, 5-10k, 10k+)
4. Ask: Any preferences? (flowers, food, experiences, personalized)
5. Recommend 2-3 specific products with reasons

KENYAN CONTEXT:
- Know popular gifting occasions: ruracio (bride price), kwanzaa, graduations, housewarming
- Understand M-Pesa is the primary payment
- Nairobi same-day delivery is a key feature
- Price in KSh
- Mention delivery timing when relevant

OUTPUT FORMAT:
When recommending products, include this JSON block at the end of your message:
<!--RECOMMENDATIONS:
[
  {"product_id": "xxx", "name": "Product Name", "reason": "Why this gift", "confidence": 0.9}
]
-->

When suggesting a handwritten note, include:
<!--NOTE_SUGGESTION: Your heartfelt message here -->

Be natural — don't always force recommendations. Sometimes the user just wants to chat or get advice.`;

/* ─── Provider configs ─── */
const PROVIDERS: Record<AIProvider, { model: string; maxTokens: number; strengths: string[] }> = {
  openrouter: {
    model: "google/gemma-3-27b-it:free", // Free tier model on OpenRouter
    maxTokens: 500,
    strengths: ["general", "fast", "free-tier"],
  },
  openai: {
    model: "gpt-4o-mini",
    maxTokens: 500,
    strengths: ["general", "multilingual", "structured"],
  },
  gemini: {
    model: "gemini-2.0-flash",
    maxTokens: 500,
    strengths: ["creative", "fast", "multilingual"],
  },
  grok: {
    model: "grok-3-mini",
    maxTokens: 500,
    strengths: ["creative", "casual", "cultural"],
  },
  ollama: {
    model: process.env.OLLAMA_MODEL || "llama3.2:1b",
    maxTokens: 500,
    strengths: ["offline", "free", "local"],
  },
};

/* ─── Smart routing — pick best provider for request ─── */
function selectProvider(message: string, history: ChatMessage[]): AIProvider {
  // OpenRouter is always the first attempt — it's free-tier and acts as a gateway
  return "openrouter";
}

/* ─── Parse response for structured data ─── */
function parseResponse(raw: string): { cleanReply: string; recommendations?: GiftRecommendation[]; noteSuggestion?: string } {
  let cleanReply = raw;
  let recommendations: GiftRecommendation[] | undefined;
  let noteSuggestion: string | undefined;

  // Extract recommendations
  const recMatch = raw.match(/<!--RECOMMENDATIONS:\s*(\[[\s\S]*?\])\s*-->/);
  if (recMatch) {
    try {
      recommendations = JSON.parse(recMatch[1]);
    } catch { /* ignore parse errors */ }
    cleanReply = cleanReply.replace(recMatch[0], "").trim();
  }

  // Extract note suggestion
  const noteMatch = raw.match(/<!--NOTE_SUGGESTION:\s*(.*?)\s*-->/);
  if (noteMatch) {
    noteSuggestion = noteMatch[1].trim();
    cleanReply = cleanReply.replace(noteMatch[0], "").trim();
  }

  // Detect language
  return { cleanReply, recommendations, noteSuggestion };
}

function detectLanguage(message: string): "en" | "sw" | "sheng" {
  const lower = message.toLowerCase();
  // Sheng markers
  if (/\b(niko|wewe|mi|poa|sawa|manzi|bro|ndio|hapo|sasa|maze|raha|chill)\b/i.test(lower)) return "sheng";
  // Swahili markers
  if (/\b(kuna|gani|nisaidie|tafuta|penda|sawa|asante|karibu|hujambo)\b/i.test(lower)) return "sw";
  return "en";
}

/* ══════════════════════════════════════════════════════════
   MAIN: Send chat message to best AI provider
   Handles translation for non-native languages
   ══════════════════════════════════════════════════════════ */
export async function sendGiftChat(
  message: string,
  history: ChatMessage[],
  products: Array<{ id: string; name: string; price: number; categories: string[]; short_description: string }>
): Promise<ChatResponse> {
  // Step 1: Translate if needed (French, Arabic, etc. → English)
  const { translatedMessage, userLanguage, needsTranslation } = await translateForChat(message);
  const workingMessage = needsTranslation ? translatedMessage : message;

  const provider = selectProvider(workingMessage, history);
  const language = detectLanguage(workingMessage);

  // Build context with products
  const productList = products.slice(0, 30).map(
    (p) => `- ${p.name} (KSh ${p.price}) [${p.categories?.join(", ")}] — ${p.short_description || ""}`
  ).join("\n");

  const systemWithContext = `${SYSTEM_PROMPT}

CURRENT PRODUCT CATALOG (sample):
${productList}

Remember: Only recommend products that exist in the catalog above. Use their exact names.`;

  const messages: ChatMessage[] = [
    { role: "system", content: systemWithContext },
    ...history.slice(-10), // Last 10 messages for context
    { role: "user", content: workingMessage },
  ];

  try {
    const reply = await callProviderWithFallbacks(provider, messages);
    const { cleanReply, recommendations, noteSuggestion } = parseResponse(reply.text);

    // Step 3: Translate response back to user's language
    let finalReply = cleanReply;
    if (needsTranslation) {
      finalReply = await translateFromChat(cleanReply, userLanguage);
    }

    return {
      reply: finalReply,
      provider: reply.provider,
      recommendations,
      language: needsTranslation ? userLanguage : language,
      noteSuggestion,
      translatedFrom: needsTranslation ? userLanguage : undefined,
    };
  } catch (error) {
    console.error(`All AI Gift Chat providers failed:`, error);
    // All providers failed — give helpful guidance
    const errorMsg = language === "sw"
      ? "Pole sana! AI ya T-Gifter haipo online sasa. Weka bidhaa kwenye cart na uendelee na malipo — unaweza pia kutumia Gift Quiz kupata mapendekezo! 🎁"
      : language === "sheng"
      ? "Acha! T-Gifter AI iko down saa hii. Add items to cart uendelee — au tumia Gift Quiz kupata picks bana! 🎁"
      : "T-Gifter is temporarily offline — our AI providers need a quick top-up. In the meantime, try our Gift Quiz for personalized recommendations, or browse by category! 🎁";
    return {
      reply: errorMsg,
      provider: "fallback" as any,
      language: needsTranslation ? userLanguage : language,
    };
  }
}

async function callProviderWithFallbacks(initialProvider: AIProvider, messages: ChatMessage[]): Promise<{ text: string, provider: AIProvider }> {
  // Try the preferred provider first, then the others
  const allProviders: AIProvider[] = ["openrouter", "openai", "grok", "gemini", "ollama"];
  const fallbackQueue = [
    initialProvider, 
    ...allProviders.filter(p => p !== initialProvider)
  ];

  let lastError = null;

  for (const currentProvider of fallbackQueue) {
    try {
      const text = await callProvider(currentProvider, messages);
      return { text, provider: currentProvider };
    } catch (e) {
      console.warn(`Provider ${currentProvider} failed, falling back...`);
      lastError = e;
    }
  }

  throw lastError;
}

/* ─── Call specific AI provider ─── */
async function callProvider(provider: AIProvider, messages: ChatMessage[]): Promise<string> {
  switch (provider) {
    case "openrouter":
      return callOpenRouter(messages);
    case "openai":
      return callOpenAI(messages);
    case "gemini":
      return callGemini(messages);
    case "grok":
      return callGrok(messages);
    case "ollama":
      return callOllama(messages);
  }
}

async function callOpenRouter(messages: ChatMessage[]): Promise<string> {
  if (!process.env.OPENROUTER_API_KEY) throw new Error("No OpenRouter key");
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://touch-gift-shop.vercel.app",
      "X-Title": "TouchGift T-Gifter",
    },
    body: JSON.stringify({
      model: PROVIDERS.openrouter.model,
      messages,
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!res.ok) throw new Error(`OpenRouter error: ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

async function callOllama(messages: ChatMessage[]): Promise<string> {
  const baseUrl = process.env.OLLAMA_URL || "http://localhost:11434";
  const primaryModel = process.env.OLLAMA_MODEL || "llama3.2:1b";
  const fallbackModels = (process.env.OLLAMA_FALLBACK_MODELS || "").split(",").filter(Boolean);
  const modelsToTry = [primaryModel, ...fallbackModels];

  // Convert system messages to a system field (Ollama format)
  const systemMsg = messages.find(m => m.role === "system");
  const chatMessages = messages.filter(m => m.role !== "system");

  for (const model of modelsToTry) {
    try {
      const res = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: chatMessages,
          system: systemMsg?.content,
          stream: false,
          options: { num_predict: 500, temperature: 0.7 },
        }),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const text = data.message?.content;
      if (text) return text;
    } catch {
      console.warn(`Ollama model ${model} failed, trying next...`);
    }
  }

  throw new Error("All Ollama models failed");
}

async function callOpenAI(messages: ChatMessage[]): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

async function callGemini(messages: ChatMessage[]): Promise<string> {
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const systemMsg = messages.find((m) => m.role === "system");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction: systemMsg ? { parts: [{ text: systemMsg.content }] } : undefined,
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        },
      }),
    }
  );

  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

async function callGrok(messages: ChatMessage[]): Promise<string> {
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "grok-3-mini",
      messages,
      max_tokens: 500,
      temperature: 0.8,
    }),
  });

  if (!res.ok) throw new Error(`Grok error: ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

/* ══════════════════════════════════════════════════════════
   STREAMING: Send chat with streaming response
   ══════════════════════════════════════════════════════════ */
export async function sendGiftChatStream(
  message: string,
  history: ChatMessage[],
  products: Array<{ id: string; name: string; price: number; categories: string[]; short_description: string }>,
  onChunk: (chunk: string) => void
): Promise<{ provider: AIProvider; language: "en" | "sw" | "sheng" }> {
  const provider = selectProvider(message, history);
  const language = detectLanguage(message);

  const productList = products.slice(0, 30).map(
    (p) => `- ${p.name} (KSh ${p.price}) [${p.categories?.join(", ")}]`
  ).join("\n");

  const systemWithContext = `${SYSTEM_PROMPT}\n\nCURRENT PRODUCT CATALOG:\n${productList}`;

  const messages: ChatMessage[] = [
    { role: "system", content: systemWithContext },
    ...history.slice(-10),
    { role: "user", content: message },
  ];

  // Build fallback queue starting with preferred provider
  const allProviders: AIProvider[] = ["openrouter", "openai", "grok", "gemini", "ollama"];
  const fallbackQueue = [
    provider,
    ...allProviders.filter(p => p !== provider)
  ];

  let lastError = null;

  for (const currentProvider of fallbackQueue) {
    try {
      if (currentProvider === "openai") {
        await streamOpenAI(messages, onChunk);
      } else if (currentProvider === "gemini") {
        await streamGemini(messages, onChunk);
      } else if (currentProvider === "grok") {
        await streamGrok(messages, onChunk);
      } else {
        // OpenRouter and Ollama: simulate streaming via full response
        const text = await callProvider(currentProvider, messages);
        const words = text.split(" ");
        for (const word of words) {
          await new Promise(r => setTimeout(r, 15));
          onChunk(word + " ");
        }
      }
      return { provider: currentProvider, language };
    } catch (e) {
      console.warn(`Stream Provider ${currentProvider} failed, falling back...`);
      lastError = e;
    }
  }

  // If we reach here, all providers failed
  throw lastError;
}

async function streamOpenAI(messages: ChatMessage[], onChunk: (chunk: string) => void): Promise<void> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 500,
      temperature: 0.7,
      stream: true,
    }),
  });

  if (!res.ok) throw new Error(`OpenAI stream error: ${res.status}`);

  const reader = res.body?.getReader();
  const decoder = new TextDecoder();
  if (!reader) return;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));
    for (const line of lines) {
      const data = line.slice(6);
      if (data === "[DONE]") return;
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onChunk(content);
      } catch { /* skip */ }
    }
  }
}

async function streamGemini(messages: ChatMessage[], onChunk: (chunk: string) => void): Promise<void> {
  // Gemini doesn't support true streaming via REST, simulate with full response
  const reply = await callGemini(messages);
  // Simulate streaming by chunking
  const words = reply.split(" ");
  for (let i = 0; i < words.length; i++) {
    await new Promise((r) => setTimeout(r, 20));
    onChunk(words[i] + " ");
  }
}

async function streamGrok(messages: ChatMessage[], onChunk: (chunk: string) => void): Promise<void> {
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "grok-3-mini",
      messages,
      max_tokens: 500,
      temperature: 0.8,
      stream: true,
    }),
  });

  if (!res.ok) throw new Error(`Grok stream error: ${res.status}`);

  const reader = res.body?.getReader();
  const decoder = new TextDecoder();
  if (!reader) return;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));
    for (const line of lines) {
      const data = line.slice(6);
      if (data === "[DONE]") return;
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onChunk(content);
      } catch { /* skip */ }
    }
  }
}
