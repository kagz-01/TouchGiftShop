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

  // Fetch contributions — respect privacy mode
  const selectFields =
    pool.privacy_mode === "anonymous"
      ? "id, amount, is_verified, is_anonymous, is_ghost, created_at, message"
      : "id, contributor_name, amount, is_verified, is_anonymous, is_ghost, message, created_at";

  const { data: contributions } = await supabaseAdmin
    .from("pool_contributions")
    .select(selectFields)
    .eq("pool_id", pool.id)
    .order("created_at", { ascending: false });

  // Calculate live progress
  const { data: balanceData } = await supabaseAdmin
    .from("pool_contributions")
    .select("amount")
    .eq("pool_id", pool.id)
    .eq("is_verified", true);

  const liveBalance = (balanceData ?? []).reduce(
    (sum, c) => sum + Number(c.amount),
    0
  );

  // Auto-close check: if target hit or deadline passed
  if (pool.status === "active") {
    const targetHit = liveBalance >= pool.target_amount;
    const deadlinePassed = new Date(pool.expires_at) < new Date();

    if (targetHit || deadlinePassed) {
      await supabaseAdmin
        .from("group_gifting_pools")
        .update({
          status: targetHit ? "completed" : "expired",
          current_balance: liveBalance,
          closed_at: new Date().toISOString(),
        })
        .eq("id", pool.id);

      pool.status = targetHit ? "completed" : "expired";
    } else {
      // Keep balance fresh
      await supabaseAdmin
        .from("group_gifting_pools")
        .update({ current_balance: liveBalance })
        .eq("id", pool.id);
    }
  }

  return NextResponse.json({
    pool: { ...pool, current_balance: liveBalance },
    contributions: contributions ?? [],
    progressPercent: Math.min(
      100,
      Math.round((liveBalance / pool.target_amount) * 100)
    ),
  });
}
