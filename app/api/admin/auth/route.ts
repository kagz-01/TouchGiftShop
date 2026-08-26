import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

// POST /api/admin/auth — verify password and set session cookie
export async function POST(req: Request) {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { password } = body;

  if (!password) {
    return NextResponse.json({ error: "Password required" }, { status: 400 });
  }

  // Timing-safe comparison
  const adminKey = process.env.ADMIN_API_KEY || "";
  const inputBuf = Buffer.from(password);
  const keyBuf = Buffer.from(adminKey);

  if (inputBuf.length !== keyBuf.length || !crypto.timingSafeEqual(inputBuf, keyBuf)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  // Generate a random session token (don't store the raw API key in the cookie)
  const sessionToken = crypto.randomBytes(32).toString("hex");

  // Store the session token in a simple map (in-memory, per-serverless-instance)
  // For production with multiple instances, use Redis or Supabase session table
  if (!globalThis.__adminSessions) {
    globalThis.__adminSessions = new Map<string, number>();
  }
  globalThis.__adminSessions.set(sessionToken, Date.now() + 24 * 60 * 60 * 1000);

  const cookieStore = cookies();
  cookieStore.set("tg_admin_session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  return NextResponse.json({ success: true });
}

// DELETE /api/admin/auth — logout
export async function DELETE() {
  const cookieStore = cookies();
  const session = cookieStore.get("tg_admin_session")?.value;

  if (session && globalThis.__adminSessions) {
    globalThis.__adminSessions.delete(session);
  }

  cookieStore.delete("tg_admin_session");

  return NextResponse.json({ success: true });
}

// Extend globalThis for the session store
declare global {
  var __adminSessions: Map<string, number> | undefined;
}
