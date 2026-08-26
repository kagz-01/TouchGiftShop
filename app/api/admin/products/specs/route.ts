import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";

// GET /api/admin/products/specs?product_id=...
export async function GET(_req: Request) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(_req.url);
  const product_id = searchParams.get("product_id");

  let query = supabaseAdmin.from("product_specs").select("*");

  if (product_id) {
    query = query.eq("product_id", product_id);
  }

  query = query.order("sort_order", { ascending: true }).order("spec_key");

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Failed to fetch specs" }, { status: 500 });
  }

  return NextResponse.json({ specs: data ?? [] });
}

// POST /api/admin/products/specs
export async function POST(req: Request) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { product_id, spec_key, spec_value, icon, sort_order } = body;

  if (!product_id || !spec_key) {
    return NextResponse.json({ error: "product_id and spec_key required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("product_specs")
    .upsert({
      product_id,
      spec_key,
      spec_value: (spec_value as string) || "",
      icon: (icon as string) || null,
      sort_order: (sort_order as number) ?? 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to save spec" }, { status: 500 });
  }

  try {
    const channel = supabaseAdmin.channel("catalog-updates");
    await channel.send({ type: "broadcast", event: "specs-changed", payload: { productId: product_id } });
  } catch {}

  return NextResponse.json({ spec: data }, { status: 201 });
}

// DELETE /api/admin/products/specs?id=...&product_id=...
export async function DELETE(req: Request) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const productId = searchParams.get("product_id");

  if (!id) {
    return NextResponse.json({ error: "Spec ID required" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("product_specs")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Failed to delete spec" }, { status: 500 });
  }

  try {
    const channel = supabaseAdmin.channel("catalog-updates");
    await channel.send({ type: "broadcast", event: "specs-changed", payload: { productId } });
  } catch {}

  return NextResponse.json({ success: true });
}
