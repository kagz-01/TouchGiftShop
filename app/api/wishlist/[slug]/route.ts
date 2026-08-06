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
      { error: wishlistError?.message ?? "Wishlist not found" },
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

// POST /api/wishlist/[slug] -- add an item to the wishlist
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

  const body = await req.json();
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ item });
}

// DELETE /api/wishlist/[slug] -- remove an item from the wishlist
export async function DELETE(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");

  if (!itemId) {
    return NextResponse.json({ error: "itemId required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("id", itemId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
