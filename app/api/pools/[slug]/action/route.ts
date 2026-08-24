import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";
import { refundPayment } from "@/lib/payment";

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
      // Fetch all contributions with PesaPal tracking IDs
      const { data: contributions } = await supabaseAdmin
        .from("pool_contributions")
        .select("id, amount, pesapal_tracking_id, contributor_name")
        .eq("pool_id", pool.id)
        .eq("is_verified", true)
        .not("pesapal_tracking_id", "is", null);

      // Mark pool as refunded
      await supabaseAdmin
        .from("group_gifting_pools")
        .update({ status: "refunded", closed_at: new Date().toISOString() })
        .eq("id", pool.id);
        
      // Decrement trust score for cancelling
      const { data: metrics } = await supabaseAdmin.from("user_metrics").select("trust_score").eq("user_id", user.id).single();
      if (metrics) {
        await supabaseAdmin.from("user_metrics").update({ trust_score: Math.max(0, metrics.trust_score - 10) }).eq("user_id", user.id);
      } else {
        await supabaseAdmin.from("user_metrics").insert({ user_id: user.id, trust_score: 90 });
      }

      // Process refunds via PesaPal
      const refundResults: { id: string; success: boolean; message: string }[] = [];
      for (const c of contributions ?? []) {
        const result = await refundPayment(
          c.pesapal_tracking_id!,
          Number(c.amount),
          user.email || user.id,
          `Refund for pool: ${pool.title}`
        );
        refundResults.push({ id: c.id, ...result });

        // Update contribution status
        await supabaseAdmin
          .from("pool_contributions")
          .update({ payment_method: result.success ? "refunded" : "refund_failed" })
          .eq("id", c.id);
      }

      const succeeded = refundResults.filter(r => r.success).length;
      const failed = refundResults.filter(r => !r.success).length;

      return NextResponse.json({
        success: true,
        message: failed > 0
          ? `${succeeded} of ${refundResults.length} refunds submitted. ${failed} failed — check contribution details.`
          : `${succeeded} refunds submitted. Processing takes 3-5 business days.`,
        refundResults,
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
