import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "quarter"; // quarter | year | all

  const now = new Date();
  let fromDate: string;
  if (range === "year") {
    fromDate = new Date(now.getFullYear(), 0, 1).toISOString();
  } else if (range === "all") {
    fromDate = "2020-01-01T00:00:00Z";
  } else {
    fromDate = new Date(now.getTime() - 90 * 86400000).toISOString();
  }

  // ── 1. Total spend & orders in range ──────────────────────────
  const { data: ordersInRange } = await supabase
    .from("orders")
    .select("id, total_amount, status, department, recipient_name, created_at")
    .eq("is_corporate", true)
    .gte("created_at", fromDate);

  const orders = ordersInRange ?? [];
  const totalSpend = orders.reduce((s, o) => s + (Number(o.total_amount) || 0), 0);
  const deliveredOrders = orders.filter((o) => o.status === "delivered");
  const deliveryRate = orders.length > 0 ? Math.round((deliveredOrders.length / orders.length) * 100) : 0;

  // ── 2. Spend by department ─────────────────────────────────────
  const deptMap: Record<string, { spend: number; count: number }> = {};
  for (const o of orders) {
    const dept = (o.department as string) || "Unassigned";
    if (!deptMap[dept]) deptMap[dept] = { spend: 0, count: 0 };
    deptMap[dept].spend += Number(o.total_amount) || 0;
    deptMap[dept].count += 1;
  }
  const spendByDepartment = Object.entries(deptMap)
    .map(([dept, d]) => ({ dept, spend: d.spend, count: d.count }))
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 8);

  // ── 3. Top recipients ─────────────────────────────────────────
  const recipientMap: Record<string, { spend: number; count: number }> = {};
  for (const o of orders) {
    const name = (o.recipient_name as string) || "Unknown";
    if (!recipientMap[name]) recipientMap[name] = { spend: 0, count: 0 };
    recipientMap[name].spend += Number(o.total_amount) || 0;
    recipientMap[name].count += 1;
  }
  const topRecipients = Object.entries(recipientMap)
    .map(([name, d]) => ({ name, spend: d.spend, count: d.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // ── 4. Month-over-month trends (last 12 months) ───────────────
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = d.toISOString();
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString();
    const monthOrders = orders.filter((o) => {
      const ts = o.created_at as string;
      return ts >= monthStart && ts <= monthEnd;
    });
    months.push({
      month: d.toLocaleString("en", { month: "short" }),
      year: d.getFullYear(),
      orders: monthOrders.length,
      spend: monthOrders.reduce((s, o) => s + (Number(o.total_amount) || 0), 0),
    });
  }

  // ── 5. Order pipeline status ──────────────────────────────────
  const statusCounts: Record<string, number> = {};
  const statuses = ["pending_payment", "processing", "wrapped", "dispatched", "delivered", "cancelled"];
  for (const s of statuses) {
    statusCounts[s] = orders.filter((o) => o.status === s).length;
  }

  // ── 6. Milestone ROI ──────────────────────────────────────────
  const { data: milestoneRules } = await supabase
    .from("milestone_rules")
    .select("id, name, trigger_type, gift_budget, total_triggered, is_active");

  const milestoneROI = (milestoneRules ?? []).map((r) => ({
    name: r.name,
    trigger: r.trigger_type,
    budget: Number(r.gift_budget) || 0,
    triggered: Number(r.total_triggered) || 0,
    totalCost: (Number(r.gift_budget) || 0) * (Number(r.total_triggered) || 0),
    active: r.is_active,
  }));

  // ── 7. Pool stats ─────────────────────────────────────────────
  const { data: pools } = await supabase
    .from("corporate_gift_pools")
    .select("id, status, target_amount, current_amount, contributor_count")
    .gte("created_at", fromDate);

  const poolsData = pools ?? [];
  const totalPoolsRaised = poolsData.reduce((s, p) => s + (Number(p.current_amount) || 0), 0);
  const avgContribution = poolsData.reduce((s, p) => s + (Number(p.contributor_count) || 0), 0);
  const poolStats = {
    total: poolsData.length,
    active: poolsData.filter((p) => p.status === "active").length,
    completed: poolsData.filter((p) => p.status === "completed").length,
    totalRaised: totalPoolsRaised,
    avgContributors: poolsData.length > 0 ? Math.round(avgContribution / poolsData.length) : 0,
  };

  return NextResponse.json({
    range,
    summary: {
      totalOrders: orders.length,
      totalSpend,
      deliveredOrders: deliveredOrders.length,
      deliveryRate,
    },
    spendByDepartment,
    topRecipients,
    monthlyTrend: months,
    statusCounts,
    milestoneROI,
    poolStats,
  });
}
