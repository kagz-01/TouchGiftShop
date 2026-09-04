import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

  // Generate a random session token
  const sessionToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  // Store session in Supabase (persists across serverless instances)
  const { error } = await supabase
    .from("admin_sessions")
    .insert({ token: sessionToken, expires_at: expiresAt });

  if (error) {
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }

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

  if (session) {
    await supabase.from("admin_sessions").delete().eq("token", session);
  }

  cookieStore.delete("tg_admin_session");

  return NextResponse.json({ success: true });
}
