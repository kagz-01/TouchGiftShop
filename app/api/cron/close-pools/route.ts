import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { refundPoolContributions } from "@/lib/pool-money";

// GET /api/cron/close-pools
// Invoked by Vercel Cron to expire pools that have passed their deadline
export async function GET(req: Request) {
  try {
    // 1. Close Consumer Pools
    const { error: consumerError } = await supabaseAdmin
      .from("group_gifting_pools")
      .update({ status: "expired" })
      .eq("status", "active")
      .lt("expires_at", new Date().toISOString());

    if (consumerError) throw consumerError;

    // 2. Close Corporate Pools
    const { error: corpError } = await supabaseAdmin
      .from("corporate_gift_pools")
      .update({ status: "expired" })
      .eq("status", "active")
      .lt("deadline", new Date().toISOString());

    if (corpError) throw corpError;

    /* 3. Pools that expired under "refund if under target": the money goes
       back without waiting for a human to open the manage page. Only pools
       carrying the flag are touched — an organiser who never chose it is not
       owed an automatic refund, and a refund cannot be undone. A pool is
       marked refunded only when every contribution came back; a partial run
       stays expired so the next tick retries the rest. */
    const { data: toRefund, error: listErr } = await supabaseAdmin
      .from("group_gifting_pools")
      .select("id, slug, title")
      .eq("status", "expired")
      .eq("under_target_action", "refund");

    if (listErr) throw listErr;

    const autoRefunded: string[] = [];
    const partial: { slug: string; failed: number; manual: number }[] = [];

    for (const pool of toRefund ?? []) {
      try {
        const run = await refundPoolContributions({
          id: pool.id,
          slug: pool.slug,
          title: pool.title,
          kind: "consumer",
          initiatedBy: "touchgift-pool-refund",
        });

        if (run.complete) {
          const { error } = await supabaseAdmin
            .from("group_gifting_pools")
            .update({
              status: "refunded",
              closed_at: new Date().toISOString(),
              current_balance: 0,
            })
            .eq("id", pool.id);
          if (error) throw error;
          autoRefunded.push(pool.slug);
        } else {
          partial.push({ slug: pool.slug, failed: run.failed, manual: run.manual });
        }
      } catch (e) {
        console.error(`[cron] auto-refund failed for ${pool.slug}:`, e);
        partial.push({ slug: pool.slug, failed: -1, manual: -1 });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Expired pools closed",
      autoRefunded,
      partial,
    });
  } catch (error) {
    console.error("Cron Error (close-pools):", error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
