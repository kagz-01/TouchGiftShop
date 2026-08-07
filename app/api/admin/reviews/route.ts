import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/admin/reviews?status=pending&limit=50
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "50", 10));

  let query = supabaseAdmin
    .from("reviews")
    .select("*, media:review_media(*)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reviews: data || [] });
}
