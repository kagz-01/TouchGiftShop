import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/admin/stats
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
  const monthAgo = new Date(now.getTime() - 30 * 86400000).toISOString();

  // Total orders
  const { count: totalOrders } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true });

  // Today's orders
  const { count: todayOrders } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .gte("created_at", todayStart);

  // This week's orders
  const { count: weekOrders } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .gte("created_at", weekAgo);

  // Revenue this month (delivered orders)
  const { data: monthRevenue } = await supabase
    .from("orders")
    .select("total_amount")
    .eq("status", "delivered")
    .gte("created_at", monthAgo);

  const revenue = (monthRevenue ?? []).reduce(
    (sum, o) => sum + (Number(o.total_amount) || 0),
    0
  );

  // Status breakdown
  const statuses = [
    "pending_payment",
    "processing",
    "wrapped",
    "dispatched",
    "delivered",
    "failed",
  ];
  const statusCounts: Record<string, number> = {};

  for (const s of statuses) {
    const { count } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", s);
    statusCounts[s] = count ?? 0;
  }

  // Active riders (orders dispatched but not delivered)
  const { count: activeRiders } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("status", "dispatched");

  // Pin-drop orders awaiting recipient action
  const { count: pendingPinDrops } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("recipient_pin_requested", true)
    .is("delivery_lat", null);

  return NextResponse.json({
    totalOrders: totalOrders ?? 0,
    todayOrders: todayOrders ?? 0,
    weekOrders: weekOrders ?? 0,
    monthRevenue: revenue,
    statusCounts,
    activeRiders: activeRiders ?? 0,
    pendingPinDrops: pendingPinDrops ?? 0,
  });
}
