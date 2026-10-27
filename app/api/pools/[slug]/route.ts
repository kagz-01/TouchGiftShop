import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { resolvePoolBalance, isSchemaMissing } from "@/lib/pool-ledger";
import { poolMoneyTotals } from "@/lib/pool-money";

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

  // Fetch contributions — respect privacy mode. refund_status travels with
  // them so the audit tab can show which contributions came back.
  const baseFields = isCorporate
    ? "id, contributor_name, amount, is_verified, is_anonymous, message, created_at, refund_status"
    : pool.privacy_mode === "anonymous"
    ? "id, amount, is_verified, is_anonymous, is_ghost, created_at, message, poll_vote_index, refund_status"
    : "id, contributor_name, amount, is_verified, is_anonymous, is_ghost, message, created_at, poll_vote_index, refund_status";

  const contributionQuery = (fields: string) =>
    supabaseAdmin
      .from(isCorporate ? "corporate_pool_contributions" : "pool_contributions")
      .select(fields)
      .eq("pool_id", pool.id)
      .order("created_at", { ascending: false });

  let { data: contributions, error: contribErr } = await contributionQuery(baseFields);

  /* refund_status arrives with the money-safety migration. Until it is
     applied, drop it rather than returning an empty contributor list. */
  if (contribErr && isSchemaMissing(contribErr)) {
    const fallback = baseFields
      .split(", ")
      .filter((f) => f !== "refund_status")
      .join(", ");
    ({ data: contributions, error: contribErr } = await contributionQuery(fallback));
  }
  if (contribErr) {
    console.error("[pools] contribution listing failed:", contribErr.message);
  }

  /* Balance from the ledger when it exists: posted credits minus posted
     debits, so money that has been refunded is no longer shown as held.
     Falls back to the verified sum when the migration has not run. */
  const resolved = await resolvePoolBalance(pool.id, isCorporate ? "corporate" : "consumer");
  const liveBalance = resolved.balance;
  const money = poolMoneyTotals(resolved.entries);

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
    money: { ...money, source: resolved.source },
  });
}
