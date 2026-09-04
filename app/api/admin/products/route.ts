import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ColorVariantSchema = z.object({
  name: z.string().min(1),
  image: z.string().url().optional().nullable(),
  priceOverride: z.number().optional().nullable(),
});

const SizeVariantSchema = z.object({
  name: z.string().min(1),
  priceOverride: z.number().optional().nullable(),
});

const ProductSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  description: z.string().optional(),
  price: z.number().positive(),
  sale_price: z.number().positive().optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  images: z.array(z.string().url()).optional(),
  is_personalizable: z.boolean().optional(),
  in_stock: z.boolean().optional(),
  stock_quantity: z.number().int().optional().nullable(),
  sku: z.string().max(50).optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  weight_kg: z.number().optional().nullable(),
  tags: z.array(z.string()).optional(),
  seo_title: z.string().max(200).optional().nullable(),
  seo_description: z.string().optional().nullable(),
  color_variants: z.array(ColorVariantSchema).optional(),
  size_variants: z.array(SizeVariantSchema).optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
});

const ALLOWED_FIELDS = [
  "name", "slug", "description", "price", "sale_price",
  "image_url", "images", "is_personalizable", "in_stock",
  "stock_quantity", "sku", "status", "weight_kg",
  "tags", "seo_title", "seo_description",
  "color_variants", "size_variants", "is_coming_soon",
];

// GET /api/admin/products?search=...&category=...&in_stock=true&status=published&limit=50&offset=0
export async function GET(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category");
  const inStock = searchParams.get("in_stock");
  const status = searchParams.get("status");
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
    query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%,sku.ilike.%${search}%`);
  }

  if (inStock !== null && inStock !== undefined) {
    query = query.eq("in_stock", inStock === "true");
  }

  if (status && status !== "all") {
    query = query.eq("status", status);
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
  if (!(await requireAdmin())) {
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

  const insertData: Record<string, unknown> = {
    name: productData.name,
    slug: productData.slug,
    description: productData.description || "",
    price: productData.price,
    image_url: productData.image_url || null,
    images: productData.images || [],
    is_personalizable: productData.is_personalizable ?? false,
    in_stock: productData.in_stock ?? true,
    status: productData.status ?? "published",
    tags: productData.tags || [],
    color_variants: productData.color_variants || [],
    size_variants: productData.size_variants || [],
  };

  if (productData.sale_price != null) insertData.sale_price = productData.sale_price;
  if (productData.stock_quantity != null) insertData.stock_quantity = productData.stock_quantity;
  if (productData.sku != null) insertData.sku = productData.sku;
  if (productData.weight_kg != null) insertData.weight_kg = productData.weight_kg;
  if (productData.seo_title != null) insertData.seo_title = productData.seo_title;
  if (productData.seo_description != null) insertData.seo_description = productData.seo_description;

  const { data: product, error } = await supabase
    .from("products")
    .insert(insertData)
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
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, categoryIds, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "Product ID required" }, { status: 400 });
  }

  // Only include fields that are explicitly provided and allowed
  const cleanUpdates: Record<string, unknown> = {};
  for (const field of ALLOWED_FIELDS) {
    if (updates[field] !== undefined) {
      cleanUpdates[field] = updates[field];
    }
  }

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
  if (!(await requireAdmin())) {
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
