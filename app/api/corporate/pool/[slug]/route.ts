import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type PoolRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  recipient_name: string;
  recipient_role: string | null;
  recipient_department: string | null;
  occasion: string;
  target_amount: number;
  current_balance: number;
  min_contribution: number;
  deadline: string;
  status: string;
  show_leaderboard: boolean;
  anonymous_contributions: boolean;
  contributor_count: number;
  company_match_enabled: boolean;
  company_match_ratio: number;
  company_match_cap: number;
  company_match_used: number;
};

/**
 * GET /api/corporate/pool/[slug]
 *
 * The public read for a corporate gift pool. A pool is meant to be shared with
 * colleagues, so this is unauthenticated — but it exposes exactly what a
 * contributor needs and nothing else. Contributor names are withheld unless the
 * pool opted into a leaderboard, and phone numbers are never returned at all.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { data: pool, error } = await supabase
    .from("corporate_gift_pools")
    .select(
      "id, slug, title, description, recipient_name, recipient_role, recipient_department, " +
        "occasion, target_amount, current_balance, min_contribution, deadline, status, " +
        "show_leaderboard, anonymous_contributions, contributor_count, " +
        "company_match_enabled, company_match_ratio, company_match_cap, company_match_used"
    )
    .eq("slug", slug)
    .maybeSingle<PoolRow>();

  if (error) {
    console.error("[corporate/pool] read failed:", error.message);
    return NextResponse.json({ error: "Could not load this pool" }, { status: 500 });
  }
  if (!pool) return NextResponse.json({ error: "This pool is no longer available" }, { status: 404 });

  /* Recorded-but-unverified contributions are counted separately and never move
     the balance. The page says "0 people have contributed" a second after
     someone did, which reads exactly like their money vanished. */
  const { count: pendingCount } = await supabase
    .from("corporate_pool_contributions")
    .select("id", { count: "exact", head: true })
    .eq("pool_id", pool.id)
    .eq("is_verified", false);

  let contributors: { name: string; amount: number; created_at: string }[] = [];
  if (pool.show_leaderboard) {
    const { data } = await supabase
      .from("corporate_pool_contributions")
      .select("contributor_name, amount, created_at, is_anonymous")
      .eq("pool_id", pool.id)
      .eq("is_verified", true)
      .order("created_at", { ascending: false })
      .limit(50);

    contributors = (data ?? [])
      .filter((c) => !(c.is_anonymous && pool.anonymous_contributions))
      .map((c) => ({
        name: c.is_anonymous ? "Someone" : c.contributor_name,
        amount: Number(c.amount),
        created_at: c.created_at,
      }));
  }

  return NextResponse.json({
    pool: {
      slug: pool.slug,
      title: pool.title,
      description: pool.description,
      recipient_name: pool.recipient_name,
      recipient_role: pool.recipient_role,
      recipient_department: pool.recipient_department,
      occasion: pool.occasion,
      target_amount: pool.target_amount,
      current_balance: pool.current_balance,
      min_contribution: pool.min_contribution,
      deadline: pool.deadline,
      status: pool.status,
      show_leaderboard: pool.show_leaderboard,
      anonymous_contributions: pool.anonymous_contributions,
      contributor_count: pool.contributor_count,
      company_match: pool.company_match_enabled
        ? {
            ratio: pool.company_match_ratio,
            cap: pool.company_match_cap,
            used: pool.company_match_used,
          }
        : null,
    },
    contributors,
    pendingCount: pendingCount ?? 0,
  });
}
