import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { createPaymentOrder } from "@/lib/payment";

const ContributeSchema = z.object({
  contributorName: z.string().max(100).optional(),
  contributorPhone: z.string().min(9).max(20),
  amount: z.number().positive(),
  message: z.string().max(300).optional(),
  isAnonymous: z.boolean().default(false),
  isGhost: z.boolean().default(false),
  paymentMethod: z.enum(["pesapal", "mpesa", "card", "airtel"]).default("pesapal"),
});

export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const body = await req.json();
  const parsed = ContributeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const d = parsed.data;

  // 1. Fetch pool and validate it's still active
  const { data: pool, error: poolErr } = await supabaseAdmin
    .from("group_gifting_pools")
    .select("id, status, target_amount, current_balance, min_contribution, title, expires_at, slug")
    .eq("slug", params.slug)
    .single();

  if (poolErr || !pool) {
    return NextResponse.json({ error: "Pool not found" }, { status: 404 });
  }
  if (pool.status !== "active") {
    return NextResponse.json({ error: "This pool is no longer accepting contributions" }, { status: 400 });
  }
  if (new Date(pool.expires_at) < new Date()) {
    return NextResponse.json({ error: "This pool has expired" }, { status: 400 });
  }
  if (d.amount < pool.min_contribution) {
    return NextResponse.json(
      { error: `Minimum contribution is KES ${pool.min_contribution}` },
      { status: 400 }
    );
  }

  // 2. Create a pending contribution record
  const { data: contribution, error: contribErr } = await supabaseAdmin
    .from("pool_contributions")
    .insert({
      pool_id: pool.id,
      contributor_name: d.isGhost ? null : (d.contributorName ?? "Anonymous"),
      contributor_phone: d.contributorPhone,
      amount: d.amount,
      message: d.message ?? null,
      payment_method: d.paymentMethod,
      is_anonymous: d.isAnonymous,
      is_ghost: d.isGhost,
      is_verified: false,
    })
    .select()
    .single();

  if (contribErr || !contribution) {
    return NextResponse.json({ error: "Failed to record contribution" }, { status: 500 });
  }

  // 3. Create PesaPal payment order
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://touchgiftshop.ac.ke";
  try {
    const { orderTrackingId, redirectUrl } = await createPaymentOrder({
      amount: d.amount,
      merchantReference: `POOL-${contribution.id}`,
      description: `Contribution to "${pool.title}" gift pool`,
      callbackUrl: `${siteUrl}/pool/${params.slug}/thanks?contribution=${contribution.id}`,
      phoneNumber: d.contributorPhone,
    });

    // Save tracking ID to contribution
    await supabaseAdmin
      .from("pool_contributions")
      .update({ pesapal_tracking_id: orderTrackingId })
      .eq("id", contribution.id);

    return NextResponse.json({
      contributionId: contribution.id,
      redirectUrl,
      orderTrackingId,
    });
  } catch (err) {
    // Cleanup pending contribution if payment init fails
    await supabaseAdmin.from("pool_contributions").delete().eq("id", contribution.id);
    return NextResponse.json(
      { error: (err as Error).message ?? "Payment initiation failed" },
      { status: 500 }
    );
  }
}

// Called by PesaPal IPN webhook to verify & mark contribution paid
export async function PATCH(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const { contributionId, orderTrackingId } = await req.json();
  if (!contributionId) {
    return NextResponse.json({ error: "contributionId required" }, { status: 400 });
  }

  const { data: contribution, error } = await supabaseAdmin
    .from("pool_contributions")
    .update({
      is_verified: true,
      payment_ref: orderTrackingId ?? null,
    })
    .eq("id", contributionId)
    .select("pool_id, amount")
    .single();

  if (error || !contribution) {
    return NextResponse.json({ error: "Contribution not found" }, { status: 404 });
  }

  // Recalculate pool balance and check if target hit
  const { data: allContribs } = await supabaseAdmin
    .from("pool_contributions")
    .select("amount")
    .eq("pool_id", contribution.pool_id)
    .eq("is_verified", true);

  const newBalance = (allContribs ?? []).reduce((s, c) => s + Number(c.amount), 0);

  const { data: pool } = await supabaseAdmin
    .from("group_gifting_pools")
    .select("target_amount, status")
    .eq("id", contribution.pool_id)
    .single();

  const targetHit = pool && newBalance >= pool.target_amount && pool.status === "active";

  await supabaseAdmin
    .from("group_gifting_pools")
    .update({
      current_balance: newBalance,
      ...(targetHit ? { status: "completed", closed_at: new Date().toISOString() } : {}),
    })
    .eq("id", contribution.pool_id);

  return NextResponse.json({ success: true, newBalance, targetHit: !!targetHit });
}
