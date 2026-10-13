import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/corporate/quotes?status=pending&limit=50&page=1
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "all";
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 100);
  const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
  const offset = (page - 1) * limit;

  let query = supabase
    .from("corporate_quote_requests")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status !== "all") query = query.eq("status", status);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ quotes: data ?? [], total: count ?? 0, page, limit });
}

// PATCH /api/corporate/quotes  — update status
export async function PATCH(req: NextRequest) {
  const { id, status, quoted_at } = await req.json();
  if (!id || !status) return NextResponse.json({ error: "id + status required" }, { status: 400 });

  const validStatuses = ["pending", "quoted", "accepted", "declined"];
  if (!validStatuses.includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const update: Record<string, unknown> = { status };
  if (status === "quoted") update.quoted_at = quoted_at ?? new Date().toISOString();

  const { data, error } = await supabase
    .from("corporate_quote_requests")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ quote: data });
}
