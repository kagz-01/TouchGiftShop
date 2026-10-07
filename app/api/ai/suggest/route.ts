import { NextRequest, NextResponse } from "next/server";

// ── AI Gift Suggester ─────────────────────────────────────────────────────
// Uses Gemini 1.5 Flash when GEMINI_API_KEY is set.
// Falls back to a keyword-based heuristic when the key is missing.

const FALLBACK_SUGGESTIONS: Record<string, Array<{ name: string; price: number; image: string }>> = {
  cooking: [
    { name: "Premium Cast Iron Skillet Set", price: 8500, image: "" },
    { name: "Artisan Spice Blends Collection", price: 4200, image: "" },
    { name: "Professional Chef Knife", price: 12000, image: "" },
    { name: "Pasta Making Masterclass", price: 6000, image: "" },
  ],
  tech: [
    { name: "Noise Cancelling Headphones", price: 25000, image: "" },
    { name: "Smart Home Starter Kit", price: 15000, image: "" },
    { name: "Wireless Charging Desk Pad", price: 4500, image: "" },
    { name: "Mechanical Keyboard", price: 18000, image: "" },
  ],
  spa: [
    { name: "Luxury Spa Day Package", price: 12000, image: "" },
    { name: "Aromatherapy Diffuser & Oils", price: 5500, image: "" },
    { name: "Premium Silk Sleep Set", price: 8000, image: "" },
    { name: "Handcrafted Bath Bombs Box", price: 3500, image: "" },
  ],
  travel: [
    { name: "Personalized Leather Passport Holder", price: 3500, image: "" },
    { name: "Luxury Weekender Bag", price: 18000, image: "" },
    { name: "Travel Comfort Kit", price: 7500, image: "" },
    { name: "Noise Cancelling Travel Headphones", price: 22000, image: "" },
  ],
  fitness: [
    { name: "Premium Yoga Mat & Blocks Set", price: 6500, image: "" },
    { name: "Smart Fitness Tracker", price: 12000, image: "" },
    { name: "Insulated Water Bottle Collection", price: 3800, image: "" },
    { name: "Resistance Band Training Set", price: 4200, image: "" },
  ],
  books: [
    { name: "Curated Book Bundle (5 books)", price: 6000, image: "" },
    { name: "Kindle Paperwhite", price: 18000, image: "" },
    { name: "Literary Candle & Mug Set", price: 4500, image: "" },
    { name: "Personalized Bookplate Set", price: 2500, image: "" },
  ],
};

const KEYWORD_MAP: Record<string, string> = {
  cooking: "cooking", chef: "cooking", kitchen: "cooking", food: "cooking",
  tech: "tech", gadget: "tech", geek: "tech", developer: "tech", programmer: "tech",
  relax: "spa", spa: "spa", wellness: "spa", "self-care": "spa", skincare: "spa",
  travel: "travel", adventure: "travel", wanderlust: "travel",
  fitness: "fitness", gym: "fitness", workout: "fitness", yoga: "fitness", runner: "fitness",
  book: "books", reader: "books", literature: "books",
};

function fallbackSuggest(query: string, limit: number) {
  const lower = query.toLowerCase();
  for (const [kw, category] of Object.entries(KEYWORD_MAP)) {
    if (lower.includes(kw)) return (FALLBACK_SUGGESTIONS[category] ?? []).slice(0, limit);
  }
  return [
    { name: "Curated Wine & Cheese Hamper", price: 9500, image: "" },
    { name: "Luxury Leather Weekender Bag", price: 18000, image: "" },
    { name: "Personalized Engraved Watch", price: 15000, image: "" },
    { name: "Boutique Coffee Tasting Kit", price: 6000, image: "" },
  ].slice(0, limit);
}

async function geminiSuggest(query: string, limit: number) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const prompt = `You are a premium gift curator for a Kenyan gifting platform. Given this description of a recipient, suggest ${limit} thoughtful, specific gift ideas with realistic Kenyan Shilling prices.

Recipient description: "${query}"

Respond ONLY with a JSON array of objects. Each object must have exactly:
- "name": string (specific gift name, max 60 chars)
- "price": number (price in KES, realistic Kenyan market price, between 2000 and 50000)
- "image": string (empty string "")

No markdown, no explanation, just the JSON array.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
      }),
    }
  );

  if (!res.ok) return null;
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  // Parse the JSON response
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return null;
  const parsed = JSON.parse(jsonMatch[0]);
  if (!Array.isArray(parsed)) return null;

  return parsed.slice(0, limit).map((item: { name?: string; price?: number; image?: string }) => ({
    name: String(item.name ?? "").slice(0, 60),
    price: Math.max(500, Math.min(100000, Number(item.price) || 5000)),
    image: "",
  }));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const limit = Math.min(8, parseInt(searchParams.get("limit") || "4"));

  if (!q.trim()) {
    return NextResponse.json({ suggestions: [], source: "empty" });
  }

  try {
    // Try Gemini first
    const geminiResults = await geminiSuggest(q, limit);
    if (geminiResults && geminiResults.length > 0) {
      return NextResponse.json({ suggestions: geminiResults, source: "gemini" });
    }
  } catch (e) {
    console.error("Gemini suggest failed, falling back:", e);
  }

  // Fallback to keyword heuristic
  const fallback = fallbackSuggest(q, limit);
  return NextResponse.json({ suggestions: fallback, source: "fallback" });
}
