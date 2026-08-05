import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/products?category=birthdays — reads the real products table.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  let query = supabaseAdmin.from("products").select(
    category
      ? "*, product_categories!inner(categories!inner(slug))"
      : "*"
  );

  if (category) {
    query = query.eq("product_categories.categories.slug", category);
  }

  const { data, error } = await query.eq("in_stock", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ products: data });
}
