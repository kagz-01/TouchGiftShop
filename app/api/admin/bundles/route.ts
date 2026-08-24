import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function requireAdmin() {
  const cookieStore = cookies();
  const session = cookieStore.get("tg_admin_session")?.value;
  if (!session || session !== process.env.ADMIN_API_KEY) {
    return false;
  }
  return true;
}

async function broadcast(event: string, payload: Record<string, unknown>) {
  try {
    const channel = supabase.channel("catalog-updates");
    await channel.send({ type: "broadcast", event, payload });
  } catch {}
}

interface BundleItemInput {
  product_id?: string | null;
  product_name: string;
  quantity?: number;
}

async function replaceItems(bundleId: string, items: BundleItemInput[]) {
  await supabase.from("hamper_bundle_items").delete().eq("bundle_id", bundleId);
  if (items.length > 0) {
    const rows = items.map((it, i) => ({
      bundle_id: bundleId,
      product_id: it.product_id ?? null,
      product_name: it.product_name,
      quantity: it.quantity ?? 1,
      sort_order: i,
    }));
    await supabase.from("hamper_bundle_items").insert(rows);
  }
  await supabase
    .from("hamper_bundles")
    .update({ item_count: items.reduce((s, it) => s + (it.quantity ?? 1), 0) })
    .eq("id", bundleId);
}

// GET /api/admin/bundles
export async function GET() {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("hamper_bundles")
    .select("*, hamper_bundle_items(id, product_id, product_name, quantity)")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bundles: data ?? [] });
}

// POST /api/admin/bundles — create bundle (optionally with items)
export async function POST(req: Request) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, slug, description, image_url, regular_price, bundle_price, category, occasions, items, is_active, is_featured, sort_order } = body;

  if (!name || !slug || regular_price == null || bundle_price == null) {
    return NextResponse.json({ error: "name, slug, regular_price and bundle_price are required" }, { status: 400 });
  }

  const { data: bundle, error } = await supabase
    .from("hamper_bundles")
    .insert({
      name,
      slug,
      description: description || null,
      image_url: image_url || null,
      regular_price,
      bundle_price,
      category: category || "general",
      occasions: occasions || [],
      is_active: is_active ?? true,
      is_featured: is_featured ?? false,
      sort_order: sort_order ?? 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (Array.isArray(items)) {
    await replaceItems(bundle.id, items);
  }

  await broadcast("bundles-changed", { action: "created", id: bundle.id });

  return NextResponse.json({ bundle }, { status: 201 });
}

// PATCH /api/admin/bundles — update bundle (pass id in body; pass items to replace)
export async function PATCH(req: Request) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, items, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "Bundle ID required" }, { status: 400 });
  }

  const clean: Record<string, unknown> = {};
  for (const field of ["name", "slug", "description", "image_url", "regular_price", "bundle_price", "category", "occasions", "is_active", "is_featured", "sort_order"]) {
    if (updates[field] !== undefined) clean[field] = updates[field];
  }

  if (Object.keys(clean).length > 0) {
    const { error } = await supabase.from("hamper_bundles").update(clean).eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  if (Array.isArray(items)) {
    await replaceItems(id, items);
  }

  await broadcast("bundles-changed", { action: "updated", id });

  return NextResponse.json({ success: true });
}

// DELETE /api/admin/bundles?id=...
export async function DELETE(req: Request) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Bundle ID required" }, { status: 400 });
  }

  const { error } = await supabase.from("hamper_bundles").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await broadcast("bundles-changed", { action: "deleted", id });

  return NextResponse.json({ success: true });
}
