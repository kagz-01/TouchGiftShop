import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
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

const ProductSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  description: z.string().optional(),
  price: z.number().positive(),
  image_url: z.string().url().optional().nullable(),
  images: z.array(z.string().url()).optional(),
  is_personalizable: z.boolean().optional(),
  in_stock: z.boolean().optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
});

// GET /api/admin/products?search=...&category=...&in_stock=true&limit=50&offset=0
export async function GET(req: Request) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category");
  const inStock = searchParams.get("in_stock");
  const limit = Number(searchParams.get("limit")) || 50;
  const offset = Number(searchParams.get("offset")) || 0;

  let query = supabase
    .from("products")
    .select(
      "*, product_categories(category_id, categories(name, slug))",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
  }

  if (inStock !== null && inStock !== undefined) {
    query = query.eq("in_stock", inStock === "true");
  }

  if (category) {
    query = query.eq("product_categories.categories.slug", category);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ products: data ?? [], total: count ?? 0 });
}

// POST /api/admin/products — create product
export async function POST(req: Request) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = ProductSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { categoryIds, ...productData } = parsed.data;

  // Create product
  const { data: product, error } = await supabase
    .from("products")
    .insert({
      name: productData.name,
      slug: productData.slug,
      description: productData.description || "",
      price: productData.price,
      image_url: productData.image_url || null,
      images: productData.images || [],
      is_personalizable: productData.is_personalizable ?? false,
      in_stock: productData.in_stock ?? true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Attach categories
  if (categoryIds && categoryIds.length > 0) {
    const links = categoryIds.map((categoryId) => ({
      product_id: product.id,
      category_id: categoryId,
    }));
    await supabase.from("product_categories").insert(links);
  }

  // Broadcast product update for real-time shop refresh
  const channel = supabase.channel("products-updates");
  await channel.send({
    type: "broadcast",
    event: "product-created",
    payload: { productId: product.id, name: product.name },
  });

  return NextResponse.json({ product }, { status: 201 });
}

// PATCH /api/admin/products — update product (pass id in body)
export async function PATCH(req: Request) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, categoryIds, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "Product ID required" }, { status: 400 });
  }

  // Clean up undefined values
  const cleanUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) cleanUpdates.name = updates.name;
  if (updates.slug !== undefined) cleanUpdates.slug = updates.slug;
  if (updates.description !== undefined) cleanUpdates.description = updates.description;
  if (updates.price !== undefined) cleanUpdates.price = updates.price;
  if (updates.image_url !== undefined) cleanUpdates.image_url = updates.image_url;
  if (updates.images !== undefined) cleanUpdates.images = updates.images;
  if (updates.is_personalizable !== undefined) cleanUpdates.is_personalizable = updates.is_personalizable;
  if (updates.in_stock !== undefined) cleanUpdates.in_stock = updates.in_stock;

  if (Object.keys(cleanUpdates).length === 0 && !categoryIds) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  const { error } = await supabase
    .from("products")
    .update(cleanUpdates)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update categories if provided
  if (categoryIds) {
    await supabase.from("product_categories").delete().eq("product_id", id);
    if (categoryIds.length > 0) {
      const links = categoryIds.map((categoryId: string) => ({
        product_id: id,
        category_id: categoryId,
      }));
      await supabase.from("product_categories").insert(links);
    }
  }

  // Broadcast for real-time shop refresh
  const channel = supabase.channel("products-updates");
  await channel.send({
    type: "broadcast",
    event: "product-updated",
    payload: { productId: id, updates: cleanUpdates },
  });

  return NextResponse.json({ success: true });
}

// DELETE /api/admin/products?id=...
export async function DELETE(req: Request) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Product ID required" }, { status: 400 });
  }

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Broadcast for real-time shop refresh
  const channel = supabase.channel("products-updates");
  await channel.send({
    type: "broadcast",
    event: "product-deleted",
    payload: { productId: id },
  });

  return NextResponse.json({ success: true });
}
