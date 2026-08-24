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
    return NextResponse.json({ tier: LOYALTY_TIERS.bronze, discountPercent: 0 });
  }

  const { data: orders } = await supabaseAdmin
    .from("orders")
    .select("id, total_amount")
    .eq("user_id", user.id)
    .in("status", ["processing", "wrapped", "dispatched", "delivered"]);

  const totalOrders = orders?.length ?? 0;
  const totalSpend = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) ?? 0;
  const tier = getLoyaltyTier(totalOrders, totalSpend);

  const multipliers: Record<LoyaltyTierName, number> = {
    bronze: 1, silver: 1.5, gold: 2, platinum: 3,
  };
  const tierName = (Object.keys(LOYALTY_TIERS) as LoyaltyTierName[]).find(
    (t) => LOYALTY_TIERS[t].name === tier.name
  ) ?? "bronze";
  const totalPoints = Math.floor(totalSpend / 10) * multipliers[tierName];

  const nextTier = getNextTier(totalOrders, totalSpend);

  return NextResponse.json({
    tier: tier.name.toLowerCase(),
    tierConfig: tier,
    totalOrders,
    totalSpend,
    totalPoints,
    discountPercent: tier.discount,
    nextTier: nextTier ? nextTier.name.toLowerCase() : null,
    ordersToNext: nextTier ? Math.max(0, nextTier.minOrders - totalOrders) : 0,
  });
}
