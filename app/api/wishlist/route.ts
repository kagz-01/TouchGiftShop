import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

const CreateWishlistInput = z.object({
  ownerName: z.string().min(1).max(100),
  occasion: z.string().optional(),
  message: z.string().max(200).optional(),
});

// POST /api/wishlist -- create a wishlist
export async function POST(req: Request) {
  const parsed = CreateWishlistInput.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { ownerName, occasion, message } = parsed.data;
  const baseSlug = slugify(ownerName) || "wishlist";
  let slug = baseSlug;

  const { data: existing } = await supabase
    .from("wishlists")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    slug = `${baseSlug}-${Date.now().toString(36)}`;
  }

  const { data: wishlist, error } = await supabase
    .from("wishlists")
    .insert({
      owner_name: ownerName,
      slug,
      occasion: occasion || null,
      message: message || null,
    })
    .select()
    .single();

  if (error || !wishlist) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to create wishlist" },
      { status: 500 }
    );
  }

  return NextResponse.json({ wishlist });
}
