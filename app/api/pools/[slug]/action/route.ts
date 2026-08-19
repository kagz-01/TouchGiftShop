import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { createServerSupabaseClient } from "@/lib/supabase-server";

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
  const supabase = createServerSupabaseClient();
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
      // Mark all contributions for refund and cancel pool
      await supabaseAdmin
        .from("group_gifting_pools")
        .update({ status: "refunded", closed_at: new Date().toISOString() })
        .eq("id", pool.id);
      // TODO: trigger PesaPal refund API per contribution
      return NextResponse.json({ success: true, message: "Pool cancelled. Refunds will be processed within 3-5 business days." });
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
