import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { z } from "zod";

const createVendorSchema = z.object({
  businessName: z.string().min(1).max(200),
  description: z.string().optional(),
  location: z.string().optional(),
  specialty: z.string().optional(),
  businessRegistrationNumber: z.string().optional(),
  deliveryTime: z.string().optional(),
  minOrderAmount: z.number().min(0).default(0),
  freeDeliveryThreshold: z.number().positive().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const specialty = searchParams.get("specialty");
    const sortBy = searchParams.get("sortBy") || "rating"; // 'rating' | 'products' | 'newest'

    let query = supabaseAdmin
      .from("marketplace_vendors")
      .select("*")
      .eq("status", "active");

    if (status) {
      query = query.eq("status", status);
    }
    if (search) {
      query = query.or(`business_name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (specialty) {
      query = query.eq("specialty", specialty);
    }

    // Sort
    switch (sortBy) {
      case "rating":
        query = query.order("avg_rating", { ascending: false });
        break;
      case "products":
        query = query.order("total_products", { ascending: false });
        break;
      case "newest":
        query = query.order("created_at", { ascending: false });
        break;
      default:
        query = query.order("avg_rating", { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error("Fetch vendors error:", error);
      return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 });
    }

    return NextResponse.json({ vendors: data });
  } catch (error) {
    console.error("Vendors GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createVendorSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const { data: vendor, error } = await supabaseAdmin
      .from("marketplace_vendors")
      .insert({
        business_name: data.businessName,
        description: data.description || null,
        location: data.location || null,
        specialty: data.specialty || null,
        business_registration_number: data.businessRegistrationNumber || null,
        delivery_time: data.deliveryTime || null,
        min_order_amount: data.minOrderAmount,
        free_delivery_threshold: data.freeDeliveryThreshold || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Create vendor error:", error);
      return NextResponse.json({ error: "Failed to create vendor" }, { status: 500 });
    }

    return NextResponse.json({ vendor }, { status: 201 });
  } catch (error) {
    console.error("Vendors POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
