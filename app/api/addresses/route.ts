import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/addresses — get user's saved addresses
export async function GET() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: addresses, error } = await supabaseAdmin
    .from("saved_addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ addresses: addresses ?? [] });
}

// POST /api/addresses — create a new address
export async function POST(req: Request) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { label, fullName, phone, addressLine1, addressLine2, city, county, postalCode, landmark, latitude, longitude, isDefault } = body;

  if (!addressLine1 || !city) {
    return NextResponse.json({ error: "Address line 1 and city are required" }, { status: 400 });
  }

  // If this is set as default, unset other defaults
  if (isDefault) {
    await supabaseAdmin
      .from("saved_addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);
  }

  const { data: address, error } = await supabaseAdmin
    .from("saved_addresses")
    .insert({
      user_id: user.id,
      label: label || "Home",
      full_name: fullName || null,
      phone: phone || null,
      address_line1: addressLine1,
      address_line2: addressLine2 || null,
      city,
      county: county || null,
      postal_code: postalCode || null,
      landmark: landmark || null,
      latitude: latitude || null,
      longitude: longitude || null,
      is_default: isDefault || false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ address });
}

// PUT /api/addresses — update an address
export async function PUT(req: Request) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { id, label, fullName, phone, addressLine1, addressLine2, city, county, postalCode, landmark, latitude, longitude, isDefault } = body;

  if (!id) {
    return NextResponse.json({ error: "Address ID required" }, { status: 400 });
  }

  if (isDefault) {
    await supabaseAdmin
      .from("saved_addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);
  }

  const { data: address, error } = await supabaseAdmin
    .from("saved_addresses")
    .update({
      label,
      full_name: fullName,
      phone,
      address_line1: addressLine1,
      address_line2: addressLine2,
      city,
      county,
      postal_code: postalCode,
      landmark,
      latitude,
      longitude,
      is_default: isDefault,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ address });
}

// DELETE /api/addresses?id=xxx — delete an address
export async function DELETE(req: Request) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Address ID required" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("saved_addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
