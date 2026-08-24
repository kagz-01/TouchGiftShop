import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// POST /api/admin/auth — verify password and set session cookie
export async function POST(req: Request) {
  const { password } = await req.json();

  if (!password) {
    return NextResponse.json({ error: "Password required" }, { status: 400 });
  }

  // Verify against ADMIN_API_KEY
  if (password !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  // Set session cookie (24 hours)
  const cookieStore = cookies();
  cookieStore.set("tg_admin_session", process.env.ADMIN_API_KEY!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });

  return NextResponse.json({ success: true });
}

// DELETE /api/admin/auth — logout
export async function DELETE() {
  const cookieStore = cookies();
  cookieStore.delete("tg_admin_session");

  return NextResponse.json({ success: true });
}
