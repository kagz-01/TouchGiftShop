import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";
import { pointsToKsh, REFERRAL_BONUS_POINTS, CONVERSION_MIN_ORDER_KSH } from "@/lib/points";

// GET /api/referrals — get user's referral info
export async function GET() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Ensure user has a referral code
  let { data: codeRow } = await supabaseAdmin
    .from("referral_codes")
    .select("code")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!codeRow) {
    const code = `TG-${user.id.slice(0, 8).toUpperCase()}`;
    await supabaseAdmin.from("referral_codes").insert({
      user_id: user.id,
      code,
    });
    codeRow = { code };
  }

  const referralCode = codeRow.code;

  // Count referrals
  const { data: referrals } = await supabaseAdmin
    .from("referrals")
    .select("id, status, referrer_bonus_credited, created_at, converted_at")
    .eq("referrer_id", user.id)
    .order("created_at", { ascending: false });

  const totalReferrals = referrals?.length ?? 0;
  const successfulReferrals = referrals?.filter((r) => r.status === "converted").length ?? 0;

  // Points earned from referrals (new model — loyalty ledger)
  const { data: referralPoints } = await supabaseAdmin
    .from("loyalty_points")
    .select("points")
    .eq("user_id", user.id)
    .in("source", ["referral_bonus", "referral_first_order"]);

  const pointsEarned = referralPoints?.reduce((sum, r) => sum + Number(r.points), 0) ?? 0;

  // Legacy KSh credits (deprecated — kept for historical display)
  const { data: credits } = await supabaseAdmin
    .from("referral_credits")
    .select("amount, is_used")
    .eq("user_id", user.id);

  const totalEarned = credits?.reduce((sum, c) => sum + Number(c.amount), 0) ?? 0;
  const totalUsed = credits?.filter((c) => c.is_used).reduce((sum, c) => sum + Number(c.amount), 0) ?? 0;
  const availableBalance = totalEarned - totalUsed;

  const recentReferrals = referrals?.slice(0, 10).map((r) => ({
    id: r.id,
    status: r.status,
    createdAt: r.created_at,
    convertedAt: r.converted_at,
    bonusCredited: r.referrer_bonus_credited,
  })) ?? [];

  return NextResponse.json({
    referralCode,
    totalReferrals,
    successfulReferrals,
    pointsEarned,
    pointsValueKsh: pointsToKsh(pointsEarned),
    referralBonusPoints: REFERRAL_BONUS_POINTS,
    conversionMinOrderKsh: CONVERSION_MIN_ORDER_KSH,
    totalEarned,
    availableBalance,
    recentReferrals,
  });
}

// POST /api/referrals — apply a referral code (new user signup)
export async function POST(req: Request) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { referralCode } = await req.json();
  if (!referralCode || typeof referralCode !== "string") {
    return NextResponse.json({ error: "Referral code required" }, { status: 400 });
  }

  // Look up referrer via referral_codes table (fast indexed lookup)
  const { data: referrerCode } = await supabaseAdmin
    .from("referral_codes")
    .select("user_id")
    .eq("code", referralCode.toUpperCase())
    .maybeSingle();

  if (!referrerCode) {
    return NextResponse.json({ error: "Invalid referral code" }, { status: 404 });
  }

  if (referrerCode.user_id === user.id) {
    return NextResponse.json({ error: "You cannot refer yourself" }, { status: 400 });
  }

  // Check if already referred
  const { data: existing } = await supabaseAdmin
    .from("referrals")
    .select("id")
    .eq("referred_user_id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "You have already been referred" }, { status: 400 });
  }

  // Create the referral record
  const { data: referral, error } = await supabaseAdmin
    .from("referrals")
    .insert({
      referrer_id: referrerCode.user_id,
      referred_user_id: user.id,
      referral_code: referralCode.toUpperCase(),
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Credit the referred user with KSh 500 bonus
  await supabaseAdmin.from("referral_credits").insert({
    user_id: user.id,
    amount: 500.00,
    source: "referral_signup",
    referral_id: referral.id,
    expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
  });

  return NextResponse.json({ success: true, referral });
}
