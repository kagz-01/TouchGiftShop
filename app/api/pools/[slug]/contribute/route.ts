import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { createPaymentOrder } from "@/lib/payment";
import { settlePoolContribution } from "@/lib/pool-money";

const ContributeSchema = z.object({
  contributorName: z.string().max(100).optional(),
  contributorPhone: z.string().min(9).max(20),
  amount: z.number().positive(),
  message: z.string().max(300).optional(),
  isAnonymous: z.boolean().default(false),
  isGhost: z.boolean().default(false),
  paymentMethod: z.enum(["pesapal", "mpesa", "card", "airtel"]).default("pesapal"),
  pollVoteIndex: z.number().int().optional(),
  splitParentId: z.string().uuid().optional(),
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

  // 1. Fetch pool and validate it's still active — check both consumer and corporate tables
  let pool: { id: string; status: string; target_amount: number; current_balance: number; min_contribution: number; title: string; expires_at: string; slug: string } | null = null;

  const { data: consumerPool } = await supabaseAdmin
    .from("group_gifting_pools")
    .select("id, status, target_amount, current_balance, min_contribution, title, expires_at, slug")
    .eq("slug", params.slug)
    .single();

  if (consumerPool) {
    pool = consumerPool;
  } else {
    const { data: corpPoolRaw } = await supabaseAdmin
      .from("corporate_gift_pools")
      .select("id, status, target_amount, current_balance, min_contribution, title, deadline, slug")
      .eq("slug", params.slug)
      .single();
    if (corpPoolRaw) {
      pool = { ...corpPoolRaw, expires_at: corpPoolRaw.deadline };
    }
  }

  if (!pool) {
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
      contributor_name: d.isGhost ? "Anonymous" : (d.contributorName ?? "Anonymous"),
      contributor_phone: d.contributorPhone,
      amount: d.amount,
      message: d.message ?? null,
      payment_method: d.paymentMethod,
      is_anonymous: d.isAnonymous,
      is_ghost: d.isGhost,
      is_verified: false,
      poll_vote_index: d.pollVoteIndex ?? null,
      split_parent_id: d.splitParentId ?? null,
    })
    .select()
    .single();

  if (contribErr || !contribution) {
    return NextResponse.json({ error: "Failed to record contribution" }, { status: 500 });
  }

  // 3. Create PesaPal payment order
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://touchgiftshop.co.ke";
  try {
    const { orderTrackingId, redirectUrl } = await createPaymentOrder({
      amount: d.amount,
      merchantReference: `pool-${contribution.id}`,
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

// Called after PesaPal redirects back (and by the IPN). Marks the contribution
// paid — but only after settlePoolContribution has re-queried PesaPal for it.
// This route is public, so the request body is not evidence: anyone could
// PATCH is_verified=true against a contribution they never paid for, and the
// old code did exactly that, then added the amount to the pool balance.
export async function PATCH(req: Request) {
  const { contributionId, orderTrackingId } = await req.json();
  if (!contributionId) {
    return NextResponse.json({ error: "contributionId required" }, { status: 400 });
  }

  const result = await settlePoolContribution(contributionId, {
    orderTrackingId: orderTrackingId ?? null,
  });

  if (!result.ok) {
    const status =
      result.reason === "not_found"
        ? 404
        : result.reason === "psp_unreachable"
        ? 502
        : result.reason === "not_completed"
        ? 409
        : 400;
    const message =
      result.reason === "not_completed"
        ? `Payment not completed (${result.detail ?? "unknown"}). The contribution has not been credited.`
        : result.reason === "psp_unreachable"
        ? "Could not confirm the payment with PesaPal. Nothing has been credited — try again shortly."
        : "Contribution not found";
    return NextResponse.json({ error: message }, { status });
  }

  return NextResponse.json({
    success: true,
    newBalance: result.balance,
    targetHit: result.targetHit,
    paidAmount: result.paidAmount,
    alreadySettled: result.alreadySettled,
    ...(result.mismatch ? { amountMismatch: true } : {}),
  });
}
