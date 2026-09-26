import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return request.ip ?? "";
}

function isIpAllowed(ip: string): boolean {
  const allowedIps = process.env.ADMIN_ALLOWED_IPS;
  if (!allowedIps) return true;

  const list = allowedIps.split(",").map((s) => s.trim()).filter(Boolean);
  if (list.length === 0) return true;

  return list.includes(ip);
}

export async function middleware(request: NextRequest) {
  // Apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const rateLimited = rateLimit(request);
    if (rateLimited) return rateLimited;
  }

  let response = NextResponse.next({ request: { headers: request.headers } });

  // Only build a Supabase client when an auth cookie is actually present.
  // Anonymous traffic (the vast majority, and every public image) would
  // otherwise pay for a client + getSession() on every single request.
  const hasAuthCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") || c.name.includes("auth-token"));

  if (hasAuthCookie) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({ name, value, ...options });
            response = NextResponse.next({ request: { headers: request.headers } });
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({ name, value: "", ...options });
            response = NextResponse.next({ request: { headers: request.headers } });
            response.cookies.set({ name, value: "", ...options });
          },
        },
      }
    );

    // Refreshes the session cookie when the access token has expired.
    // The return value is intentionally unused.
    await supabase.auth.getSession();
  }

  const pathname = request.nextUrl.pathname;
  const ADMIN_LOGIN = "/admin-access-2026";

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const ip = getClientIp(request);
    if (!isIpAllowed(ip)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    if (pathname !== ADMIN_LOGIN) {
      const adminSession = request.cookies.get("tg_admin_session")?.value;
      if (!adminSession) {
        const loginUrl = new URL(ADMIN_LOGIN, request.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Verify session exists in Supabase and is not expired
      const adminClient = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { cookies: { get: () => adminSession } }
      );
      const { data } = await adminClient
        .from("admin_sessions")
        .select("expires_at")
        .eq("token", adminSession)
        .single();

      if (!data || new Date(data.expires_at).getTime() < Date.now()) {
        const loginUrl = new URL(ADMIN_LOGIN, request.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Skip static files and public assets — middleware was running on every
    // /hero/*.webp, /products/* and /logo/* request.
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|.*\\.(?:svg|png|jpg|jpeg|webp|avif|gif|ico|css|js|woff2?|txt|xml)$).*)",
  ],
};
