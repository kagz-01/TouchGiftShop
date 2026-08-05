import { NextResponse } from "next/server";

// POST /api/wishlist — TODO: create a wishlists row + slug.
export async function POST(req: Request) {
  const body = await req.json();
  return NextResponse.json({ wishlist: null, received: body }, { status: 501 });
}
