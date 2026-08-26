import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getRecommendation } from "@/lib/gift-quiz";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const systemPrompt = `You are T-Gifter, a warm, bantering Kenyan AI gift concierge for Touch Gift Shop.
Your job is to chat with users, figure out what they need, and either find gifts for them or write greeting cards.
Always use a friendly, enthusiastic Kenyan tone (e.g. "Niaje!", "Sawa", "Poa").

You MUST ALWAYS respond with a valid JSON object. 

If the user is asking for gift recommendations (or you have gathered enough info to search for gifts), use this format:
{
  "action": "search_gifts",
  "parameters": {
    "recipient": "her, him, couple, kids, any",
    "budget": "under-3000, 3000-5000, 5000-10000, luxury",
    "occasion": "birthday, anniversary, baby-shower, etc"
  },
  "message": "Your warm Kenyan message explaining you are finding gifts for them..."
}

If the user wants you to write a greeting card message, use this format:
{
  "action": "write_card",
  "message": "Your warm Kenyan message here, including the perfectly crafted greeting card text in quotes."
}

If it's just normal chat or banter (or you need more info from them to search for gifts), use this format:
{
  "action": "chat",
  "message": "Your normal chat response here..."
}`;

  // Format messages for the API (only user/assistant)
  const apiMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content
    }))
  ];

  // Try each provider
  const providers = [
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
            messages: apiMessages,
            max_tokens: 500,
            temperature: 0.7,
            response_format: { type: "json_object" }
          }),
        });
        if (!res.ok) continue;
        const data = await res.json();
        reply = data.choices?.[0]?.message?.content || "";
      } else {
        // Gemini doesn't support "system" role naturally in the messages array in standard way, 
        // need to format differently for Gemini v1beta.
        const geminiMessages = apiMessages.map((m) => {
          if (m.role === "system") {
             return { role: "user", parts: [{ text: "SYSTEM INSTRUCTION: " + m.content }] };
          }
          return { role: m.role === "user" ? "user" : "model", parts: [{ text: m.content }] };
        });

        const res = await fetch(provider.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: geminiMessages,
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
          
          let uiData = null;

          // If action is search_gifts, query the database!
          if (parsed.action === "search_gifts" && parsed.parameters) {
             const { recipient, occasion, budget } = parsed.parameters;
             
             // Very basic fallback logic for DB querying
             const recommendation = getRecommendation({ recipient: recipient || 'any', occasion: occasion || 'any', budget: budget || 'any', interests: [] });
             const categoryArray = recommendation.categories.length > 0 ? recommendation.categories : ["gifts-for-her"];

             const { data: products } = await supabaseAdmin
               .from("products")
               .select("id, name, slug, price, images, description")
               .eq("status", "published")
               .contains("categories", [categoryArray[0]])
               .limit(6);

             if (products && products.length > 0) {
               uiData = {
                 type: "products",
                 products
               };
             } else {
                parsed.message += "\n\n(Oops, I couldn't find exact matches for that right now, but I can keep looking!)";
             }
          }

          return NextResponse.json({ 
            reply: parsed.message,
            uiData,
            provider: provider.name 
          });
        } catch (e) {
          console.error("Failed to parse JSON", e);
          continue;
        }
      }
    } catch (e) {
      console.error("Provider failed", provider.name, e);
      continue;
    }
  }

  return NextResponse.json({ reply: "Sawa sawa, I'm taking a short break. Check back in a moment!" });
}
