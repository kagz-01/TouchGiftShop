import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const WEBHOOK_SECRET = process.env.SUPABASE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  // Require webhook secret to be configured — reject if not set
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const review = body.record as Record<string, unknown> | undefined;
  if (!review) {
    return NextResponse.json({ ok: true });
  }

  let productName = "Unknown product";
  if (review.product_id) {
    const { data: product } = await supabaseAdmin
      .from("products")
      .select("name")
      .eq("id", review.product_id)
      .single();
    if (product) productName = product.name;
  }

  return NextResponse.json({
    ok: true,
    reviewId: review.id,
    rating: review.rating,
    productName,
  });
}
