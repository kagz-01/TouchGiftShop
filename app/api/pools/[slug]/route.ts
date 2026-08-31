import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  // Try consumer pools first, then corporate pools
  let { data: pool, error: poolError } = await supabaseAdmin
    .from("group_gifting_pools")
    .select("*")
    .eq("slug", params.slug)
    .single();

  let isCorporate = false;

  if (poolError || !pool) {
    // Try corporate pools as fallback
    const { data: corpPool, error: corpError } = await supabaseAdmin
      .from("corporate_gift_pools")
      .select("*")
      .eq("slug", params.slug)
      .single();

    if (corpError || !corpPool) {
      return NextResponse.json(
        { error: "Pool not found" },
        { status: 404 }
      );
    }

    pool = corpPool;
    isCorporate = true;
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

  // Auto-close check: if target hit or deadline passed (consumer pools only)
  if (!isCorporate && pool.status === "active") {
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
      await supabaseAdmin
        .from("group_gifting_pools")
        .update({ current_balance: liveBalance })
        .eq("id", pool.id);
    }
  }

  return NextResponse.json({
    pool: { ...pool, current_balance: liveBalance, is_corporate: isCorporate },
    contributions: contributions ?? [],
    progressPercent: Math.min(
      100,
      Math.round((liveBalance / pool.target_amount) * 100)
    ),
  });
}
