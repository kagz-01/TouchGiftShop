import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { recipient, occasion, budget, interests, products, previousPicks, feedback } = await req.json();

  // Filter out previous picks so AI doesn't recommend them again
  const prevIds = new Set((previousPicks || []).map((p: any) => p.product_id));
  const remainingProducts = (products || []).filter((p: any) => !prevIds.has(p.id));

  const productList = remainingProducts
    .map((p: { id: string; name: string; price: number; description?: string }) =>
      `- [ID: ${p.id}] ${p.name} (KSh ${p.price}) — ${p.description || ""}`
    )
    .join("\n");

  const prompt = `You are T-Gifter, a warm Kenyan AI gift concierge. A user previously completed the gift quiz with these answers:

- Recipient: ${recipient}
- Occasion: ${occasion}
- Budget: ${budget}
- Interests: ${(interests || []).join(", ")}

We showed them some initial recommendations, but they gave this feedback:
"${feedback}"

Here are the remaining products available:
${productList}

Your task:
1. Select the absolute TOP 4 products from the remaining list that perfectly match their new feedback.
2. Write a warm, personalized explanation (3-4 sentences) of how these new picks address their feedback. Use a friendly Kenyan tone (e.g. "poa", "sawa"). Don't use markdown. Don't include specific product names here.
3. For each of the 4 products you selected, write a 1-sentence specific reason why it fits their feedback.

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

      if (provider.name === "openai" || provider.name === "grok") {
        const res = await fetch(provider.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${provider.key}`,
          },
          body: JSON.stringify({
            model: provider.name === "openai" ? "gpt-4o-mini" : "grok-3-mini",
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
  } catch { /* Ollama not running */ }

  // Static fallback
  const fallback = `We've adjusted our recommendations based on your feedback: "${feedback}". Here are some alternatives that might work better. Tap any product to see why it's a great choice!`;
  const fallbackPicks = remainingProducts.slice(0, 4).map((p: any) => ({
    product_id: p.id,
    reason: "A great alternative that might better fit what you're looking for."
  }));

  return NextResponse.json({ explanation: fallback, top_picks: fallbackPicks, provider: "fallback" });
}
