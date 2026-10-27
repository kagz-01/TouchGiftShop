import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";
import { refundPoolContributions } from "@/lib/pool-money";

const CloseSchema = z.object({
  action: z.enum(["refund", "extend", "downgrade", "place_order"]),
  newDeadline: z.string().datetime().optional(), // required if action === 'extend'
  downgradeGiftId: z.string().uuid().optional(),  // required if action === 'downgrade'
  deliveryAddress: z.string().optional(),          // required if action === 'place_order'
});

export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = CloseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { action, newDeadline, deliveryAddress } = parsed.data;

  // Fetch pool and verify organiser
  const { data: pool, error: poolErr } = await supabaseAdmin
    .from("group_gifting_pools")
    .select("*")
    .eq("slug", params.slug)
    .eq("organiser_user_id", user.id)
    .single();

  if (poolErr || !pool) {
    return NextResponse.json({ error: "Pool not found or not authorised" }, { status: 404 });
  }

  switch (action) {
    case "refund": {
      // Decrement trust score for cancelling
      const { data: metrics } = await supabaseAdmin.from("user_metrics").select("trust_score").eq("user_id", user.id).single();
      if (metrics) {
        await supabaseAdmin.from("user_metrics").update({ trust_score: Math.max(0, metrics.trust_score - 10) }).eq("user_id", user.id);
      } else {
        await supabaseAdmin.from("user_metrics").insert({ user_id: user.id, trust_score: 90 });
      }

      /* Refund every verified contribution through PesaPal, one ledger row
         each. The pool is marked refunded only when the run is complete, so
         "refunded" never means "we tried" — a partial run stays expired with
         the failures attached for retry. Contributions are recorded through
         refund_status now, not by overwriting payment_method (which still
         holds how they paid). */
      const run = await refundPoolContributions({
        id: pool.id,
        slug: pool.slug,
        title: pool.title,
        kind: "consumer",
        initiatedBy: user.email || user.id,
      });

      if (run.complete) {
        await supabaseAdmin
          .from("group_gifting_pools")
          .update({
            status: "refunded",
            under_target_action: "refund",
            closed_at: new Date().toISOString(),
            current_balance: Math.max(0, Number(pool.current_balance ?? 0) - run.refundedAmount),
          })
          .eq("id", pool.id);
      }

      const refundResults = run.failures.map((f) => ({
        id: f.id,
        success: false,
        message: f.message,
      }));

      return NextResponse.json({
        success: run.complete,
        message: run.complete
          ? `${run.refunded} refunds submitted. Processing takes 3-5 business days.`
          : `${run.refunded} of ${run.total} refunds submitted. ${run.failed} failed, ${run.manual} could not be reversed through PesaPal — check contribution details.`,
        refundResults,
        refunded: run.refunded,
        refundedAmount: run.refundedAmount,
        failed: run.failed,
        manual: run.manual,
      });
    }

    case "extend": {
      if (!newDeadline) {
        return NextResponse.json({ error: "newDeadline is required to extend" }, { status: 400 });
      }
      await supabaseAdmin
        .from("group_gifting_pools")
        .update({ status: "active", expires_at: newDeadline, under_target_action: "extend" })
        .eq("id", pool.id);
      return NextResponse.json({ success: true, message: "Deadline extended. Contributors will be notified." });
    }

    case "downgrade": {
      await supabaseAdmin
        .from("group_gifting_pools")
        .update({ status: "fulfilled", under_target_action: "downgrade", order_placed_at: new Date().toISOString() })
        .eq("id", pool.id);
      return NextResponse.json({ success: true, message: "Proceeding with downgraded gift using collected funds." });
    }

    case "place_order": {
      if (pool.status !== "completed") {
        return NextResponse.json({ error: "Pool must be completed (target hit) to place an order" }, { status: 400 });
      }
      await supabaseAdmin
        .from("group_gifting_pools")
        .update({ status: "fulfilled", order_placed_at: new Date().toISOString() })
        .eq("id", pool.id);
      return NextResponse.json({ success: true, message: "Order placed! We'll send you a photo proof before dispatch." });
    }

    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}
