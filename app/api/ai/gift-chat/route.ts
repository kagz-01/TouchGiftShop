import { NextRequest, NextResponse } from "next/server";
import { sendGiftChat, sendGiftChatStream, type ChatMessage } from "@/lib/ai-gift-chat";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { message, history = [], stream = false } = body;

  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  // Fetch products from Supabase for context
  const { data: products } = await supabase
    .from("products")
    .select("id, name, price, categories, short_description")
    .eq("in_stock", true)
    .limit(50);

  const chatProducts = (products || []).map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    categories: p.categories || [],
    short_description: p.short_description || "",
  }));

  // Streaming response
  if (stream) {
    const encoder = new TextEncoder();
    const streamResponse = new ReadableStream({
      async start(controller) {
        try {
          const result = await sendGiftChatStream(message, history as ChatMessage[], chatProducts, (chunk) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`));
          });
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true, provider: result.provider, language: result.language })}\n\n`)
          );
        } catch (error) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: "Chat failed" })}\n\n`)
          );
        }
        controller.close();
      },
    });

    return new Response(streamResponse, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  // Regular response
  const result = await sendGiftChat(message, history as ChatMessage[], chatProducts);

  return NextResponse.json({
    reply: result.reply,
    provider: result.provider,
    recommendations: result.recommendations,
    language: result.language,
    noteSuggestion: result.noteSuggestion,
  });
}
