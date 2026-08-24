import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";
import { getLoyaltyTier, LOYALTY_TIERS, getNextTier } from "@/lib/loyalty";
import type { LoyaltyTierName } from "@/lib/loyalty";

export async function GET() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ tier: LOYALTY_TIERS.bronze, discountPercent: 0, totalPoints: 0 });
  }

  // Count completed orders for tier calculation
  const { data: orders } = await supabaseAdmin
    .from("orders")
    .select("id, total_amount")
    .eq("user_id", user.id)
    .in("status", ["processing", "wrapped", "dispatched", "delivered"]);

  const totalOrders = orders?.length ?? 0;
  const totalSpend = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) ?? 0;
  const tier = getLoyaltyTier(totalOrders, totalSpend);

  // Get actual points from ledger
  const { data: pointsRows } = await supabaseAdmin
    .from("loyalty_points")
    .select("points, source")
    .eq("user_id", user.id);

  let totalPointsEarned = 0;
  let totalPointsRedeemed = 0;
  pointsRows?.forEach((row) => {
    if (row.source === "redeemed") {
      totalPointsRedeemed += row.points;
    } else {
      totalPointsEarned += row.points;
    }
  });
  const totalPoints = totalPointsEarned - totalPointsRedeemed;

  // Get available referral credits
  const { data: credits } = await supabaseAdmin
    .from("referral_credits")
    .select("amount, is_used")
    .eq("user_id", user.id);

  const availableCredits = credits
    ?.filter((c) => !c.is_used)
    .reduce((sum, c) => sum + Number(c.amount), 0) ?? 0;

  const nextTier = getNextTier(totalOrders, totalSpend);

  return NextResponse.json({
    tier: tier.name.toLowerCase(),
    tierConfig: tier,
    totalOrders,
    totalSpend,
    totalPoints,
    totalPointsEarned,
    availableCredits,
    discountPercent: tier.discount,
    nextTier: nextTier ? nextTier.name.toLowerCase() : null,
    ordersToNext: nextTier ? Math.max(0, nextTier.minOrders - totalOrders) : 0,
  });
}
