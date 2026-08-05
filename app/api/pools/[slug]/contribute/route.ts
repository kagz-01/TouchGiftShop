import { NextResponse } from "next/server";

// POST /api/pools/[slug]/contribute — TODO: insert into pool_contributions,
// trigger STK push for the contributor's own number, update current_balance
// on confirmed M-Pesa callback (not on request — wait for the callback).
export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const body = await req.json();
  return NextResponse.json(
    { contribution: null, slug: params.slug, received: body },
    { status: 501 }
  );
}
