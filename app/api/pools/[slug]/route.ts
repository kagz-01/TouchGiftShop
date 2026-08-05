import { NextResponse } from "next/server";

// GET /api/pools/[slug] — TODO: fetch pool + contributions, compute progress.
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  return NextResponse.json({ pool: null, slug: params.slug }, { status: 501 });
}
