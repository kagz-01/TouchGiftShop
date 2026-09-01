import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id);
  let query = supabaseAdmin
    .from("products")
    .select("*")
    .eq("status", "published");
  if (isUuid) {
    query = query.eq("id", params.id);
  } else {
    query = query.eq("slug", params.id);
  }
  const { data: product, error } = await query.single();

  if (error || !product) {
    return NextResponse.json(
      { error: error?.message ?? "Product not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ product });
}
