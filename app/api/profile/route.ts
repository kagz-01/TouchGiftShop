import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;
const PHONE_RE = /^\+?[0-9]{7,15}$/;

type ProfileRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
};

async function getOrCreateProfile(user: {
  id: string;
  email?: string | null;
  phone?: string | null;
  user_metadata?: Record<string, unknown>;
}): Promise<ProfileRow> {
  const { data: existing } = await supabaseAdmin
    .from("profiles")
    .select("id, username, full_name, phone, email, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return existing as ProfileRow;

  // Seed from auth data (also covered by the on_auth_user_created trigger
  // for new signups — this covers users created before the table existed).
  const meta = user.user_metadata ?? {};
  const seed = {
    id: user.id,
    username: (meta.username as string) ?? null,
    full_name: ((meta.full_name as string) ?? (meta.name as string)) || null,
    phone: user.phone ?? null,
    email: user.email ?? null,
    avatar_url: (meta.avatar_url as string) ?? null,
  };

  const { data: created, error } = await supabaseAdmin
    .from("profiles")
    .upsert(seed, { onConflict: "id" })
    .select("id, username, full_name, phone, email, avatar_url")
    .single();

  if (error) throw new Error(error.message);
  return created as ProfileRow;
}

// GET /api/profile — fetch (or auto-create) the signed-in user's profile
export async function GET() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const profile = await getOrCreateProfile(user);
    return NextResponse.json({ profile });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load profile" },
      { status: 500 }
    );
  }
}

// PATCH /api/profile — update editable fields (full_name, username, phone, email)
export async function PATCH(req: Request) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  await getOrCreateProfile(user);

  const updates: Record<string, string | null> = {};
  const authUpdates: Record<string, unknown> = {};

  // Full name — free text, trimmed, capped
  if ("full_name" in body) {
    const name = typeof body.full_name === "string" ? body.full_name.trim() : "";
    if (name.length > 120) {
      return NextResponse.json({ error: "Name is too long (max 120 characters)" }, { status: 400 });
    }
    updates.full_name = name || null;
    authUpdates.data = { ...(authUpdates.data ?? {}), full_name: name || null };
  }

  // Username — format + availability
  if ("username" in body) {
    const username = typeof body.username === "string" ? body.username.trim() : "";
    if (username) {
      if (!USERNAME_RE.test(username)) {
        return NextResponse.json(
          { error: "Username must be 3-30 characters: letters, numbers, underscores only" },
          { status: 400 }
        );
      }
      const { data: taken } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .ilike("username", username)
        .neq("id", user.id)
        .maybeSingle();
      if (taken) {
        return NextResponse.json({ error: "That username is already taken" }, { status: 409 });
      }
      updates.username = username;
      authUpdates.data = { ...(authUpdates.data ?? {}), username };
    } else {
      updates.username = null;
    }
  }

  // Phone — format + availability (normalise Kenyan numbers to E.164)
  if ("phone" in body) {
    let phone = typeof body.phone === "string" ? body.phone.replace(/[\s-()]/g, "") : "";
    if (phone) {
      const digits = phone.replace(/\D/g, "");
      if (digits.startsWith("254")) phone = `+${digits}`;
      else if (digits.startsWith("0")) phone = `+254${digits.slice(1)}`;
      else if (!phone.startsWith("+")) phone = `+254${digits}`;

      if (!PHONE_RE.test(phone)) {
        return NextResponse.json({ error: "Please enter a valid phone number" }, { status: 400 });
      }
      const { data: taken } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("phone", phone)
        .neq("id", user.id)
        .maybeSingle();
      if (taken) {
        return NextResponse.json({ error: "That phone number is already in use" }, { status: 409 });
      }
      updates.phone = phone;
      authUpdates.phone = phone;
    } else {
      updates.phone = null;
    }
  }

  // Email — format + availability; goes through Supabase Auth so the user
  // must confirm the change from their inbox before it fully applies.
  if ("email" in body) {
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
      }
      const { data: taken } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("email", email)
        .neq("id", user.id)
        .maybeSingle();
      if (taken) {
        return NextResponse.json({ error: "That email is already in use" }, { status: 409 });
      }
      updates.email = email;
    } else {
      updates.email = null;
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select("id, username, full_name, phone, email, avatar_url")
    .single();

  if (error) {
    // Surface unique-violation errors with a friendly message
    if (error.code === "23505") {
      return NextResponse.json({ error: "That username, phone or email is already in use" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Keep auth record in sync (metadata for name/username, phone requires
  // no verification when updated server-side with the admin client).
  if (Object.keys(authUpdates).length > 0) {
    await supabaseAdmin.auth.admin.updateUserById(user.id, authUpdates);
  }

  return NextResponse.json({ profile, emailChangePending: "email" in updates && updates.email !== user.email });
}
