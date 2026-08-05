import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const { data: pool, error: poolError } = await supabaseAdmin
    .from("group_gifting_pools")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (poolError || !pool) {
    return NextResponse.json(
      { error: poolError?.message ?? "Pool not found" },
      { status: 404 }
    );
  }

  const { data: contributions } = await supabaseAdmin
    .from("pool_contributions")
    .select("id, contributor_name, amount, is_verified, created_at")
    .eq("pool_id", pool.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({
    pool,
    contributions: contributions ?? [],
  });
}
