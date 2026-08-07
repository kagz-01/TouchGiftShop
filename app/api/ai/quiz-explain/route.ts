import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { recipient, occasion, budget, interests, products } = await req.json();

  // Build a prompt for T-Gifter to explain the quiz picks
  const productList = (products || [])
    .slice(0, 6)
    .map((p: { name: string; price: number; description?: string }) =>
      `- ${p.name} (KSh ${p.price}) — ${p.description || ""}`
    )
    .join("\n");

  const prompt = `A user just completed the gift quiz. Here are their answers:

- Recipient: ${recipient}
- Occasion: ${occasion}
- Budget: ${budget}
- Interests: ${(interests || []).join(", ")}

Here are the top product picks:
${productList}

Write a warm, personalized explanation (3-4 sentences) of WHY these gifts are perfect for this person. Be specific about the recipient and occasion. Use a friendly Kenyan tone. Don't use markdown. Don't include product names — just explain the thinking behind the picks.`;

  // Try each provider
  const providers = [
    { name: "openai", url: "https://api.openai.com/v1/chat/completions", key: process.env.OPENAI_API_KEY },
    { name: "gemini", url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, key: process.env.GEMINI_API_KEY },
    { name: "grok", url: "https://api.x.ai/v1/chat/completions", key: process.env.GROK_API_KEY },
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
            max_tokens: 200,
            temperature: 0.7,
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
            generationConfig: { maxOutputTokens: 200, temperature: 0.7 },
          }),
        });
        if (!res.ok) continue;
        const data = await res.json();
        reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      }

      if (reply) {
        return NextResponse.json({ explanation: reply, provider: provider.name });
      }
    } catch {
      continue;
    }
  }

  // Fallback: static explanation
  const recipientName = recipient === "her" ? "her" : recipient === "him" ? "him" : recipient === "couple" ? "the couple" : recipient === "baby" ? "the little one" : "them";
  const fallback = `We picked these gifts specifically for ${recipientName}${occasion !== "any" ? ` for ${occasion.replace("-", " ")}` : ""}. Each item matches the interests you told us about, and fits within your budget. Tap any product to see why it's a great choice!`;

  return NextResponse.json({ explanation: fallback, provider: "fallback" });
}
