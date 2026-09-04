import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface TemplateItemInput {
  product_id?: string | null;
  product_name: string;
  price: number;
  quantity?: number;
}

async function replaceItems(templateId: string, items: TemplateItemInput[]) {
  await supabase.from("hamper_template_items").delete().eq("template_id", templateId);
  if (items.length > 0) {
    const rows = items.map((it, i) => ({
      template_id: templateId,
      product_id: it.product_id ?? null,
      product_name: it.product_name,
      price: it.price ?? 0,
      quantity: it.quantity ?? 1,
      sort_order: i,
    }));
    await supabase.from("hamper_template_items").insert(rows);
  }
  await supabase
    .from("hamper_templates")
    .update({ item_count: items.reduce((s, it) => s + (it.quantity ?? 1), 0) })
    .eq("id", templateId);
}

// GET /api/admin/templates
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("hamper_templates")
    .select("*, hamper_template_items(id, product_id, product_name, price, quantity)")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ templates: data ?? [] });
}

// POST /api/admin/templates
export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, description, category, price_range_min, price_range_max, occasions, items, is_active, is_featured, sort_order } = body;

  if (!name || !category) {
    return NextResponse.json({ error: "name and category are required" }, { status: 400 });
  }

  const { data: template, error } = await supabase
    .from("hamper_templates")
    .insert({
      name,
      description: description || null,
      category,
      price_range_min: price_range_min ?? null,
      price_range_max: price_range_max ?? null,
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
    await replaceItems(template.id, items);
  }

  return NextResponse.json({ template }, { status: 201 });
}

// PATCH /api/admin/templates — update (pass id; pass items to replace)
export async function PATCH(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, items, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "Template ID required" }, { status: 400 });
  }

  const clean: Record<string, unknown> = {};
  for (const field of ["name", "description", "category", "price_range_min", "price_range_max", "occasions", "is_active", "is_featured", "sort_order"]) {
    if (updates[field] !== undefined) clean[field] = updates[field];
  }

  if (Object.keys(clean).length > 0) {
    const { error } = await supabase.from("hamper_templates").update(clean).eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  if (Array.isArray(items)) {
    await replaceItems(id, items);
  }

  return NextResponse.json({ success: true });
}

// DELETE /api/admin/templates?id=...
export async function DELETE(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Template ID required" }, { status: 400 });
  }

  const { error } = await supabase.from("hamper_templates").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
