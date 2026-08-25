import { redirect } from "next/navigation";
import { cookies } from "next/headers";

// /ref/[code] — Landing page for referral links
// Stores the code in a cookie, then redirects to signup.
// The signup flow reads the cookie and applies the referral automatically.
export default async function ReferralLandingPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const cookieStore = await cookies();
  cookieStore.set("tg_referral_code", code.toUpperCase(), {
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  // Redirect new users straight to signup with code pre-filled
  redirect(`/login?mode=signup&ref=${encodeURIComponent(code.toUpperCase())}`);
}
