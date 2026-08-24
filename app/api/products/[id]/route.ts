import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { data: product, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("id", params.id)
    .eq("status", "published")
    .single();

  if (error || !product) {
    return NextResponse.json(
      { error: error?.message ?? "Product not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ product });
}
