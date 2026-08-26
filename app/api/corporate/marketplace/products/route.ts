import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";
import { z } from "zod";

const createProductSchema = z.object({
  vendorId: z.string().uuid(),
  productId: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  price: z.number().positive(),
  bulkPrice: z.number().positive().optional(),
  bulkMinQuantity: z.number().int().positive().optional(),
  category: z.string().optional(),
  images: z.array(z.string()).default([]),
  freeDelivery: z.boolean().default(false),
  handlingTime: z.string().default("1-2 days"),
});

export async function GET(req: NextRequest) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get("vendorId");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "popular"; // 'popular' | 'price_asc' | 'price_desc' | 'newest' | 'rating'

    let query = supabaseAdmin
      .from("marketplace_products")
      .select("*, marketplace_vendors(business_name, avg_rating, delivery_time, is_verified)")
      .eq("is_active", true);

    if (vendorId) {
      query = query.eq("vendor_id", vendorId);
    }
    if (category) {
      query = query.eq("category", category);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Sort
    switch (sortBy) {
      case "price_asc":
        query = query.order("price", { ascending: true });
        break;
      case "price_desc":
        query = query.order("price", { ascending: false });
        break;
      case "newest":
        query = query.order("created_at", { ascending: false });
        break;
      case "rating":
        query = query.order("avg_rating", { ascending: false });
        break;
      case "popular":
      default:
        query = query.order("total_sold", { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error("Fetch marketplace products error:", error);
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }

    return NextResponse.json({ products: data });
  } catch (error) {
    console.error("Marketplace products GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const { data: product, error } = await supabaseAdmin
      .from("marketplace_products")
      .insert({
        vendor_id: data.vendorId,
        product_id: data.productId || null,
        name: data.name,
        description: data.description || null,
        price: data.price,
        bulk_price: data.bulkPrice || null,
        bulk_min_quantity: data.bulkMinQuantity || null,
        category: data.category || null,
        images: data.images,
        free_delivery: data.freeDelivery,
        handling_time: data.handlingTime,
      })
      .select()
      .single();

    if (error) {
      console.error("Create marketplace product error:", error);
      return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }

    // Update vendor product count
    await supabaseAdmin.rpc("increment_column", {
      table_name: "marketplace_vendors",
      column_name: "total_products",
      row_id: data.vendorId,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Marketplace products POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
