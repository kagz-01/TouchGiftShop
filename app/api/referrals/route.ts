import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/referrals — get user's referral info
export async function GET() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Get referral code from user metadata
  const { data: profile } = await supabase.auth.getUser();
  const referralCode = profile.user?.user_metadata?.referral_code || `TG-${user.id.slice(0, 8).toUpperCase()}`;

  // Ensure referral code is set
  if (!profile.user?.user_metadata?.referral_code) {
    await supabase.auth.updateUser({ data: { referral_code: referralCode } });
  }

  // Count referrals
  const { data: referrals } = await supabaseAdmin
    .from("referrals")
    .select("id, status, referrer_bonus_credited, referred_bonus_credited, created_at, converted_at")
    .eq("referrer_id", user.id)
    .order("created_at", { ascending: false });

  const totalReferrals = referrals?.length ?? 0;
  const successfulReferrals = referrals?.filter((r) => r.status === "converted").length ?? 0;

  // Get total bonus earned
  const { data: credits } = await supabaseAdmin
    .from("referral_credits")
    .select("amount, is_used")
    .eq("user_id", user.id);

  const totalEarned = credits?.reduce((sum, c) => sum + Number(c.amount), 0) ?? 0;
  const totalUsed = credits?.filter((c) => c.is_used).reduce((sum, c) => sum + Number(c.amount), 0) ?? 0;
  const availableBalance = totalEarned - totalUsed;

  // Get recent referrals
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

  // Find the referrer by their code
  const { data: referrerUsers } = await supabaseAdmin.auth.admin.listUsers();
  const referrer = referrerUsers?.users?.find(
    (u) => u.user_metadata?.referral_code === referralCode.toUpperCase()
  );

  if (!referrer) {
    return NextResponse.json({ error: "Invalid referral code" }, { status: 404 });
  }

  if (referrer.id === user.id) {
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
      referrer_id: referrer.id,
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
    expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
  });

  return NextResponse.json({ success: true, referral });
}
