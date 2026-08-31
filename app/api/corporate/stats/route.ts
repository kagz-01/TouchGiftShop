import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const now = new Date();
  const monthAgo = new Date(now.getTime() - 30 * 86400000).toISOString();
  const quarterAgo = new Date(now.getTime() - 90 * 86400000).toISOString();

  // Corporate orders
  const { count: totalOrders } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("is_corporate", true);

  const { count: monthOrders } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("is_corporate", true)
    .gte("created_at", monthAgo);

  // Delivered count
  const { count: deliveredCount } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("is_corporate", true)
    .eq("status", "delivered");

  // Revenue from corporate orders
  const { data: quarterRevenue } = await supabase
    .from("orders")
    .select("total_amount")
    .eq("is_corporate", true)
    .eq("status", "delivered")
    .gte("created_at", quarterAgo);

  const totalRevenue = (quarterRevenue ?? []).reduce(
    (sum, o) => sum + (Number(o.total_amount) || 0), 0
  );

  // Milestones
  const { count: milestoneRules } = await supabase
    .from("milestone_rules")
    .select("id", { count: "exact", head: true });

  const { count: activeMilestones } = await supabase
    .from("milestone_rules")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);

  // Clients
  const { count: totalClients } = await supabase
    .from("client_profiles")
    .select("id", { count: "exact", head: true });

  const { count: platinumClients } = await supabase
    .from("client_profiles")
    .select("id", { count: "exact", head: true })
    .eq("tier", "platinum");

  // Pools
  const { count: totalPools } = await supabase
    .from("corporate_gift_pools")
    .select("id", { count: "exact", head: true });

  const { count: activePools } = await supabase
    .from("corporate_gift_pools")
    .select("id", { count: "exact", head: true })
    .eq("status", "active");

  // Calendar events this month
  const { count: monthEvents } = await supabase
    .from("corporate_calendar_events")
    .select("id", { count: "exact", head: true })
    .gte("event_date", now.toISOString().split("T")[0])
    .lte("event_date", new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0]);

  // Marketplace vendors
  const { count: totalVendors } = await supabase
    .from("marketplace_vendors")
    .select("id", { count: "exact", head: true })
    .eq("status", "active");

  // Status breakdown for corporate orders
  const statuses = ["pending_payment", "processing", "wrapped", "dispatched", "delivered"];
  const statusCounts: Record<string, number> = {};
  for (const s of statuses) {
    const { count } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("is_corporate", true)
      .eq("status", s);
    statusCounts[s] = count ?? 0;
  }

  // Monthly activity (last 6 months)
  const monthlyActivity = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = d.toISOString();
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString();
    const { count } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("is_corporate", true)
      .gte("created_at", monthStart)
      .lte("created_at", monthEnd);
    monthlyActivity.push({
      month: d.toLocaleString("en", { month: "short" }),
      orders: count ?? 0,
    });
  }

  return NextResponse.json({
    totalOrders: totalOrders ?? 0,
    monthOrders: monthOrders ?? 0,
    deliveredCount: deliveredCount ?? 0,
    totalRevenue,
    milestoneRules: milestoneRules ?? 0,
    activeMilestones: activeMilestones ?? 0,
    totalClients: totalClients ?? 0,
    platinumClients: platinumClients ?? 0,
    totalPools: totalPools ?? 0,
    activePools: activePools ?? 0,
    monthEvents: monthEvents ?? 0,
    totalVendors: totalVendors ?? 0,
    statusCounts,
    monthlyActivity,
  });
}
