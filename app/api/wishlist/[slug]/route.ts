import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/wishlist/[slug] -- fetch wishlist + items
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const { data: wishlist, error: wishlistError } = await supabase
    .from("wishlists")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (wishlistError || !wishlist) {
    return NextResponse.json(
      { error: "Wishlist not found" },
      { status: 404 }
    );
  }

  const { data: items } = await supabase
    .from("wishlist_items")
    .select("*, products(name, price, image_url, slug)")
    .eq("wishlist_id", wishlist.id)
    .order("created_at", { ascending: true });

  return NextResponse.json({ wishlist, items: items ?? [] });
}

// POST /api/wishlist/[slug] -- add an item to the wishlist (public, that's the point)
export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const { data: wishlist } = await supabase
    .from("wishlists")
    .select("id")
    .eq("slug", params.slug)
    .single();

  if (!wishlist) {
    return NextResponse.json({ error: "Wishlist not found" }, { status: 404 });
  }

  let body: { productId?: string; note?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { productId, note } = body;

  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  const { data: item, error } = await supabase
    .from("wishlist_items")
    .insert({
      wishlist_id: wishlist.id,
      product_id: productId,
      note: note ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }

  return NextResponse.json({ item });
}

// DELETE /api/wishlist/[slug]?itemId=... -- remove an item (verify it belongs to this wishlist)
export async function DELETE(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");

  if (!itemId) {
    return NextResponse.json({ error: "itemId required" }, { status: 400 });
  }

  // Verify the item belongs to this wishlist
  const { data: wishlist } = await supabase
    .from("wishlists")
    .select("id")
    .eq("slug", params.slug)
    .single();

  if (!wishlist) {
    return NextResponse.json({ error: "Wishlist not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("id", itemId)
    .eq("wishlist_id", wishlist.id);

  if (error) {
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// PATCH /api/wishlist/[slug] -- mark item as fulfilled (bought by someone)
export async function PATCH(
  req: Request,
  { params }: { params: { slug: string } }
) {
  let body: { itemId?: string; fulfilledBy?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { itemId, fulfilledBy } = body;

  if (!itemId) {
    return NextResponse.json({ error: "itemId required" }, { status: 400 });
  }

  // Verify the item belongs to this wishlist
  const { data: wishlist } = await supabase
    .from("wishlists")
    .select("id")
    .eq("slug", params.slug)
    .single();

  if (!wishlist) {
    return NextResponse.json({ error: "Wishlist not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("wishlist_items")
    .update({
      is_fulfilled: true,
      fulfilled_by: fulfilledBy || "Someone",
    })
    .eq("id", itemId)
    .eq("wishlist_id", wishlist.id);

  if (error) {
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
