import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/wishlist/[slug] — fetch wishlist + items
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const { data: wishlist, error: wishlistError } = await supabaseAdmin
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

  const { data: items } = await supabaseAdmin
    .from("wishlist_items")
    .select("*, products(name, price, image_url)")
    .eq("wishlist_id", wishlist.id)
    .order("created_at", { ascending: true });

  return NextResponse.json({ wishlist, items: items ?? [] });
}

// POST /api/wishlist/[slug] — add an item to the wishlist
export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const { data: wishlist } = await supabaseAdmin
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

  const { data: item, error } = await supabaseAdmin
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
