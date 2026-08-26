import { NextResponse, type NextRequest } from "next/server";

// Simple in-memory rate limiter
// In production with multiple instances, use Redis (e.g. @upstash/ratelimit)

type RateLimitEntry = { count: number; resetAt: number };

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt < now) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

const LIMITS: Record<string, { max: number; windowMs: number }> = {
  // Strict limits for expensive/auth routes
  "/api/chat": { max: 20, windowMs: 60_000 },
  "/api/ai/gift-chat": { max: 20, windowMs: 60_000 },
  "/api/ai/generate-note": { max: 10, windowMs: 60_000 },
  "/api/ai/quiz-explain": { max: 15, windowMs: 60_000 },
  "/api/ai/quiz-refine": { max: 15, windowMs: 60_000 },
  "/api/admin/auth": { max: 5, windowMs: 60_000 },
  "/api/payment/create-order": { max: 10, windowMs: 60_000 },
  "/api/customizations/upload": { max: 10, windowMs: 60_000 },
  "/api/reviews/upload": { max: 10, windowMs: 60_000 },
  // Moderate limits for write operations
  "/api/orders": { max: 30, windowMs: 60_000 },
  "/api/gift-cards": { max: 20, windowMs: 60_000 },
  "/api/gift-cards/redeem": { max: 10, windowMs: 60_000 },
  "/api/reviews": { max: 15, windowMs: 60_000 },
  "/api/wishlist": { max: 30, windowMs: 60_000 },
};

const DEFAULT_LIMIT = { max: 60, windowMs: 60_000 };

function matchRoute(pathname: string) {
  // Exact match first
  if (LIMITS[pathname]) return LIMITS[pathname];
  // Prefix match (e.g. /api/orders/123 matches /api/orders)
  for (const [prefix, limit] of Object.entries(LIMITS)) {
    if (pathname.startsWith(prefix + "/") || pathname === prefix) return limit;
  }
  return DEFAULT_LIMIT;
}

export function rateLimit(request: NextRequest): NextResponse | null {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "anonymous";

  const pathname = request.nextUrl.pathname;
  const { max, windowMs } = matchRoute(pathname);

  const key = `${ip}:${pathname}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return null; // allowed
  }

  entry.count++;

  if (entry.count > max) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)),
          "X-RateLimit-Limit": String(max),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  return null; // allowed
}
