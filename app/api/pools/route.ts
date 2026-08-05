import { NextResponse } from "next/server";

// POST /api/pools — TODO: create a group_gifting_pools row, generate a
// unique slug, return the shareable link.
export async function POST(req: Request) {
  const body = await req.json();
  return NextResponse.json({ pool: null, received: body }, { status: 501 });
}
