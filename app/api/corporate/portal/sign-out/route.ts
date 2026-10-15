import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* POST /api/corporate/portal/sign-out — ends the Supabase session.
   A form POST, not a link, so a prefetched or embedded URL cannot sign a
   client out. */
export async function POST(req: Request) {
  await supabase.auth.signOut();

  const { searchParams, origin } = new URL(req.url);
  const next = searchParams.get("next");
  const safe = next?.startsWith("/") ? next : "/corporate/portal";

  return NextResponse.redirect(`${origin}${safe}`, { status: 303 });
}
