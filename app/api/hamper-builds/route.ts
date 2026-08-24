import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { z } from "zod";

const HamperInput = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
  })).min(1).max(8),
  boxSize: z.enum(["Small", "Medium", "Large"]),
  boxPrice: z.number().positive(),
  itemsTotal: z.number().positive(),
  total: z.number().positive(),
});

// POST /api/hamper-builds — create a hamper build record
export async function POST(req: Request) {
  const parsed = HamperInput.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const input = parsed.data;

  // Generate a short reference code
  const refCode = `HAM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const { data: hamper, error } = await supabaseAdmin
    .from("hamper_builds")
    .insert({
      ref_code: refCode,
      items: input.items,
      box_size: input.boxSize,
      box_price: input.boxPrice,
      items_total: input.itemsTotal,
      total: input.total,
      status: "pending_payment",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ hamper });
}

// GET /api/hamper-builds?ref=HAM-XXX — fetch a hamper by ref code
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ref = searchParams.get("ref");
  if (!ref) {
    return NextResponse.json({ error: "Missing ref parameter" }, { status: 400 });
  }

  const { data: hamper, error } = await supabaseAdmin
    .from("hamper_builds")
    .select("*")
    .eq("ref_code", ref)
    .single();

  if (error || !hamper) {
    return NextResponse.json({ error: "Hamper not found" }, { status: 404 });
  }

  // Resolve product details for each item
  const productIds = hamper.items.map((i: { productId: string }) => i.productId);
  const { data: products } = await supabaseAdmin
    .from("products")
    .select("id, name, price, image_url")
    .in("id", productIds);

  const productMap = new Map((products ?? []).map((p) => [p.id, p]));
  const resolvedItems = hamper.items.map((item: { productId: string; quantity: number }) => ({
    ...item,
    product: productMap.get(item.productId) ?? null,
  }));

  return NextResponse.json({ hamper: { ...hamper, resolvedItems } });
}
