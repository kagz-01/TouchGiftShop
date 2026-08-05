import { NextResponse } from "next/server";

// GET /api/wishlist/[slug] — TODO: fetch wishlist + items.
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  return NextResponse.json(
    { wishlist: null, slug: params.slug },
    { status: 501 }
  );
}
