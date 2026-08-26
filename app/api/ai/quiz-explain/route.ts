import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { recipient, occasion, budget, interests, products } = await req.json();

  // Build a prompt for T-Gifter to explain the quiz picks
  const productList = (products || [])
    .map((p: { id: string; name: string; price: number; description?: string }) =>
      `- [ID: ${p.id}] ${p.name} (KSh ${p.price}) — ${p.description || ""}`
    )
    .join("\n");

  const prompt = `You are T-Gifter, a warm Kenyan AI gift concierge. A user just completed the gift quiz. Here are their answers:

- Recipient: ${recipient}
- Occasion: ${occasion}
- Budget: ${budget}
- Interests: ${(interests || []).join(", ")}

Here are the products we found that match:
${productList}

Your task:
1. Select the absolute TOP 4 products from the list that perfectly match the user's answers.
2. Write a warm, personalized explanation (3-4 sentences) of WHY these gifts are perfect overall. Use a friendly Kenyan tone (e.g. "poa", "sawa"). Don't use markdown. Don't include specific product names here.
3. For each of the 4 products you selected, write a 1-sentence specific reason why it fits.

You MUST return a JSON object with exactly this schema:
{
  "explanation": "Your overall warm explanation...",
  "top_picks": [
    {
      "product_id": "the exact ID from the list",
      "reason": "1-sentence reason why this specific product fits."
    }
  ]
}`;

  // Try each provider in order: OpenRouter → OpenAI → Grok → Gemini → Ollama (local)
  const providers = [
    { name: "openrouter", url: "https://openrouter.ai/api/v1/chat/completions", key: process.env.OPENROUTER_API_KEY },
    { name: "openai", url: "https://api.openai.com/v1/chat/completions", key: process.env.OPENAI_API_KEY },
    { name: "grok", url: "https://api.x.ai/v1/chat/completions", key: process.env.GROK_API_KEY },
    { name: "gemini", url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, key: process.env.GEMINI_API_KEY },
  ];

  for (const provider of providers) {
    if (!provider.key) continue;

    try {
      let reply = "";

      if (provider.name === "openrouter" || provider.name === "openai" || provider.name === "grok") {
        const res = await fetch(provider.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${provider.key}`,
            ...(provider.name === "openrouter" ? {
              "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://touch-gift-shop.vercel.app",
              "X-Title": "TouchGift T-Gifter",
            } : {}),
          },
          body: JSON.stringify({
            model: provider.name === "openrouter" ? "google/gemma-3-27b-it:free" : provider.name === "openai" ? "gpt-4o-mini" : "grok-3-mini",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 500,
            temperature: 0.7,
            response_format: { type: "json_object" }
          }),
        });
        if (!res.ok) continue;
        const data = await res.json();
        reply = data.choices?.[0]?.message?.content || "";
      } else {
        // Gemini
        const res = await fetch(provider.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 500, temperature: 0.7, responseMimeType: "application/json" },
          }),
        });
        if (!res.ok) continue;
        const data = await res.json();
        reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      }

      if (reply) {
        try {
          const parsed = JSON.parse(reply);
          return NextResponse.json({ 
            explanation: parsed.explanation, 
            top_picks: parsed.top_picks,
            provider: provider.name 
          });
        } catch {
          // If JSON parsing fails, just continue to next provider
          continue;
        }
      }
    } catch {
      continue;
    }
  }

  // Ollama local fallback (last resort)
  try {
    const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
    const models = [process.env.OLLAMA_MODEL || "llama3.2:1b", ...(process.env.OLLAMA_FALLBACK_MODELS || "").split(",").filter(Boolean)];
    for (const model of models) {
      const res = await fetch(`${ollamaUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          stream: false,
          options: { num_predict: 500, temperature: 0.7 },
        }),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const reply = data.message?.content || "";
      if (reply) {
        try {
          const parsed = JSON.parse(reply);
          return NextResponse.json({ explanation: parsed.explanation, top_picks: parsed.top_picks, provider: "ollama" });
        } catch { continue; }
      }
    }
  } catch { /* Ollama not running — continue to static fallback */ }

  // Static fallback
  const recipientName = recipient === "her" ? "her" : recipient === "him" ? "him" : recipient === "couple" ? "the couple" : recipient === "baby" ? "the little one" : "them";
  const fallback = `We picked these gifts specifically for ${recipientName}${occasion !== "any" ? ` for ${occasion.replace("-", " ")}` : ""}. Each item matches the interests you told us about, and fits within your budget. Tap any product to see why it's a great choice!`;

  return NextResponse.json({ explanation: fallback, top_picks: [], provider: "fallback" });
}
