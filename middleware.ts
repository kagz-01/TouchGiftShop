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

  await supabase.auth.getSession();

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

      if (globalThis.__adminSessions) {
        const expiresAt = globalThis.__adminSessions.get(adminSession);
        if (!expiresAt || expiresAt < Date.now()) {
          const loginUrl = new URL(ADMIN_LOGIN, request.url);
          loginUrl.searchParams.set("from", pathname);
          return NextResponse.redirect(loginUrl);
        }
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json|icons).*)"],
};
