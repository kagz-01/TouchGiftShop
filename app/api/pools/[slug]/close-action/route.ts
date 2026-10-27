import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";
import { verifyAdmin } from "@/lib/admin-auth";
import { sendSms, sendEmail } from "@/lib/notifications";
import { refundPoolContributions } from "@/lib/pool-money";

// POST /api/pools/[slug]/close-action
// Body: { action: "extend" | "downgrade" | "refund", newDeadline?: string }
//
// Reachable from /pool/[slug]/manage, which the organiser opens from their
// pool. Extend and downgrade stay link-only (they move a deadline and a
// target, both reversible by another call); refund moves real money back to
// real people and is irreversible, so it now needs the organiser's session —
// the same standard /api/pools/[slug]/action already applies. Anyone who has
// only the slug cannot empty a pool.
export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const body = await req.json();
  const { action, newDeadline } = body as {
    action: "extend" | "downgrade" | "refund";
    newDeadline?: string;
  };

  const { data: pool } = await supabaseAdmin
    .from("group_gifting_pools")
    .select("id, title, status, current_balance, target_amount, organiser_user_id, slug")
    .eq("slug", slug)
    .single();

  if (!pool) return NextResponse.json({ error: "Pool not found" }, { status: 404 });
  if (pool.status !== "expired")
    return NextResponse.json({ error: "Pool is not expired" }, { status: 400 });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://touchgiftshop.co.ke";

  if (action === "extend") {
    if (!newDeadline)
      return NextResponse.json({ error: "newDeadline required" }, { status: 400 });
    const { error } = await supabaseAdmin
      .from("group_gifting_pools")
      .update({ status: "active", expires_at: new Date(newDeadline).toISOString() })
      .eq("id", pool.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, action: "extended" });
  }

  if (action === "downgrade") {
    // Mark as completed with current balance as the new "target"
    const { error } = await supabaseAdmin
      .from("group_gifting_pools")
      .update({ status: "completed", target_amount: pool.current_balance })
      .eq("id", pool.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, action: "downgraded" });
  }

  if (action === "refund") {
    const refused = await requireOrganiserOrOps(pool.organiser_user_id as string | null);
    if (refused) return refused;

    /* Refund every verified contribution through PesaPal and record the
       outcome per contribution. The pool is only marked "refunded" when the
       run came back complete — a partial run leaves it expired with the
       failures attached, because "refunded" is a claim about money that went
       back, not about an attempt. */
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
          current_balance: Math.max(0, pool.current_balance - run.refundedAmount),
        })
        .eq("id", pool.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (run.refunded > 0) {
      void notifyRefunded({
        poolTitle: pool.title,
        slug: pool.slug,
        count: run.refunded,
        amount: run.refundedAmount,
      }).catch(() => undefined);
    }

    return NextResponse.json({
      success: run.complete,
      action: "refunded",
      contributions: run.total,
      refunded: run.refunded,
      refundedAmount: run.refundedAmount,
      failed: run.failed,
      manual: run.manual,
      failures: run.failures,
      totalAmount: pool.current_balance,
      ...(run.complete
        ? {}
        : {
            error:
              run.failed > 0
                ? `${run.failed} refund(s) failed at PesaPal and are logged for retry.`
                : `${run.manual} contribution(s) were not taken through PesaPal and need a manual reversal.`,
          }),
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

/** Refunds need the pool's organiser, or an ops session. */
async function requireOrganiserOrOps(
  organiserId: string | null
): Promise<NextResponse | null> {
  const admin = await verifyAdmin();
  if (admin.ok) return null;

  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Sign in as the pool organiser to refund contributions." },
      { status: 401 }
    );
  }
  if (!organiserId || user.id !== organiserId) {
    return NextResponse.json(
      { error: "Only the pool organiser can refund this pool." },
      { status: 403 }
    );
  }
  return null;
}

async function notifyRefunded(args: {
  poolTitle: string;
  slug: string;
  count: number;
  amount: number;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://touchgiftshop.co.ke";
  const url = `${siteUrl}/pool/${args.slug}`;
  await sendSms(
    process.env.NOTIFY_PHONE ?? "",
    `Pool "${args.poolTitle}" refunded: KES ${args.amount.toFixed(2)} returned to ${args.count} contributor(s). ${url}`
  ).catch(() => undefined);
  await sendEmail(
    process.env.NOTIFY_EMAIL ?? "",
    `Pool refunded: ${args.poolTitle}`,
    `<div style="font-family:system-ui,sans-serif">
       <h2>${args.poolTitle}</h2>
       <p>KES ${args.amount.toFixed(2)} returned to ${args.count} contributor(s).</p>
       <p><a href="${url}">${url}</a></p>
     </div>`,
    `KES ${args.amount.toFixed(2)} returned to ${args.count} contributor(s). ${url}`
  ).catch(() => undefined);
}
