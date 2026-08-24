import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/categories — public list of categories for catalog filters
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("id, name, slug")
    .order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ categories: data ?? [] });
}
