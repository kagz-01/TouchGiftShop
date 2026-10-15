import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { EmailOtpType } from "@supabase/supabase-js";
import { activatePendingMembership } from "@/lib/corporate-auth";

// GET /auth/callback — handles:
//   1. Google OAuth  (code= query param — PKCE exchange)
//   2. Email magic link  (token_hash= + type= query params — OTP verification)
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code       = searchParams.get("code");
  const tokenHash  = searchParams.get("token_hash");
  const type       = searchParams.get("type") as EmailOtpType | null;
  const next       = searchParams.get("next") ?? "/account";

  const safeNext = next.startsWith("/") ? next : "/account";

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );

  /* An invite is redeemed exactly once, here. This callback is the only place
     a person becomes a known portal user, so it is the only place an `invited`
     membership may be promoted — sign-in alone must never grant access, or
     anyone who signs in lands inside a client's account. */
  const redeemInvite = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.email) {
      const accountId = await activatePendingMembership(user.id, user.email).catch((e) => {
        console.error("[auth/callback] invite redemption failed:", e);
        return null;
      });
      if (accountId) console.log(`[auth/callback] membership activated for ${user.email}`);
    }
  };

  // ── Path 1: Email magic-link (token_hash flow) ──────────────────────────────
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) {
      await redeemInvite();
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
    // Show a specific expired-link error so the user knows what happened
    return NextResponse.redirect(
      `${origin}/login?error=magic_link_expired`
    );
  }

  // ── Path 2: Google OAuth / PKCE code exchange ───────────────────────────────
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      await redeemInvite();
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  // ── Fallback ────────────────────────────────────────────────────────────────
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
