import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase-server";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

const CreatePoolSchema = z.object({
  // Recipient
  recipientName: z.string().min(1).max(100),
  recipientPhotoUrl: z.string().url().optional(),
  occasion: z.string().max(50).optional(),
  // Pool
  title: z.string().min(3).max(255),
  description: z.string().max(500).optional(),
  // Gift
  giftProductId: z.string().uuid().optional(),
  giftName: z.string().max(200).optional(),
  giftPrice: z.number().positive().optional(),
  giftImageUrl: z.string().url().optional(),
  // Financial
  targetAmount: z.number().positive(),
  minContribution: z.number().min(1).default(50),
  overTargetBehaviour: z.enum(["wallet_credit", "gift_upgrade"]).default("wallet_credit"),
  // Deadline
  expiresAt: z.string().datetime(),
  // Privacy
  privacyMode: z.enum(["named", "anonymous"]).default("named"),
  surpriseMode: z.boolean().default(true),
  ghostModeAllowed: z.boolean().default(true),
  isPollMode: z.boolean().default(false),
  pollOptions: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    image: z.string().optional()
  })).optional(),
});

export async function POST(req: Request) {
  const supabase = createServerSupabase();

  // Organiser must be logged in
  const { data: { user } } = await supabase.auth.getUser();

  const body = await req.json();
  const parsed = CreatePoolSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const d = parsed.data;
  const baseSlug = slugify(d.recipientName + "-" + (d.occasion ?? "gift"));
  let slug = `${baseSlug}-${Date.now().toString(36)}`;

  // Ensure unique slug
  const { data: existing } = await supabase
    .from("group_gifting_pools")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const { data: pool, error } = await supabase
    .from("group_gifting_pools")
    .insert({
      organiser_user_id: user?.id ?? null,
      creator_id: user?.id ?? null,
      recipient_name: d.recipientName,
      recipient_photo_url: d.recipientPhotoUrl ?? null,
      occasion: d.occasion ?? null,
      title: d.title,
      description: d.description ?? null,
      slug,
      gift_product_id: d.giftProductId ?? null,
      gift_name: d.giftName ?? null,
      gift_price: d.giftPrice ?? null,
      gift_image_url: d.giftImageUrl ?? null,
      target_amount: d.targetAmount,
      current_balance: 0,
      min_contribution: d.minContribution,
      over_target_behaviour: d.overTargetBehaviour,
      under_target_action: null,
      expires_at: d.expiresAt,
      privacy_mode: d.privacyMode,
      surprise_mode: d.surpriseMode,
      ghost_mode_allowed: d.ghostModeAllowed,
      is_poll_mode: d.isPollMode,
      poll_options: d.pollOptions ? JSON.stringify(d.pollOptions) : null,
      status: "active",
    })
    .select()
    .single();

  if (error || !pool) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to create pool" },
      { status: 500 }
    );
  }

  return NextResponse.json({ pool, shareUrl: `/pool/${pool.slug}` });
}

export async function GET(req: Request) {
  const supabase = createServerSupabase();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  let query = supabase
    .from("group_gifting_pools")
    .select("*, pool_contributions(count)")
    .order("created_at", { ascending: false });

  if (userId) {
    query = query.eq("organiser_user_id", userId);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ pools: data });
}
