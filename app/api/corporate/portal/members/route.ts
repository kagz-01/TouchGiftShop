import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { guard } from "@/lib/portal-guard";
import { auditPortal } from "@/lib/portal-audit";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const inviteSchema = z.object({
  corporate_account_id: z.string().uuid(),
  email: z.string().min(3).max(200).refine((v) => EMAIL_RE.test(v), "Enter a valid email address"),
  role: z.enum(["owner", "member", "viewer"]).default("member"),
  full_name: z.string().max(120).optional(),
  job_title: z.string().max(120).optional(),
});

const revokeSchema = z.object({
  membership_id: z.string().uuid(),
});

const roleSchema = z.object({
  membership_id: z.string().uuid(),
  role: z.enum(["owner", "member", "viewer"]),
});

/* Access is issued here and only here. There is no "sign up for a corporate
   account" path, because `company_name` on a quote request is free text that
   anyone can write — a self-service claim would let a stranger walk into a
   client's account by typing its name. */

export async function GET(req: NextRequest) {
  const denied = await guard();
  if (denied) return denied;

  const accountId = req.nextUrl.searchParams.get("corporate_account_id");
  if (!accountId) {
    return NextResponse.json({ error: "corporate_account_id is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("corporate_account_members")
    .select("id, email, role, status, full_name, job_title, last_seen_at, created_at")
    .eq("corporate_account_id", accountId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ members: data ?? [] });
}

export async function POST(req: NextRequest) {
  const denied = await guard();
  if (denied) return denied;

  const parsed = inviteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid invite" },
      { status: 400 }
    );
  }
  const { corporate_account_id, email, role, full_name, job_title } = parsed.data;
  const clean = email.trim().toLowerCase();

  const { data: account } = await supabase
    .from("corporate_accounts")
    .select("id, company_name")
    .eq("id", corporate_account_id)
    .maybeSingle();

  if (!account) {
    return NextResponse.json({ error: "No such corporate account" }, { status: 404 });
  }

  /* A revoked row is matched on purpose so the invite lands on the same person
     rather than creating a second membership. Re-inviting is allowed: ops
     removing someone for a mistake and adding them back a week later is a real
     sequence, and it takes a deliberate POST either way. What must never happen
     is a revoked member quietly regaining access without that POST. */
  const { data: existing } = await supabase
    .from("corporate_account_members")
    .select("id, status")
    .eq("corporate_account_id", corporate_account_id)
    .ilike("email", clean)
    .maybeSingle();

  const { data, error } = existing
    ? await supabase
        .from("corporate_account_members")
        .update({ status: "invited", role })
        .eq("id", existing.id)
        .select()
        .single()
    : await supabase
        .from("corporate_account_members")
        .insert({
          corporate_account_id,
          email: clean,
          role,
          status: "invited",
          full_name: full_name ?? null,
          job_title: job_title ?? null,
          invited_by: "ops",
        })
        .select()
        .single();

  if (error) {
    // 23505 = the partial unique index on (user_id) where status <> revoked.
    const conflict =
      error.code === "23505"
        ? "That person already has access through another account."
        : error.message;
    return NextResponse.json({ error: conflict }, { status: 409 });
  }

  await auditPortal({
    req,
    action: "members.invite",
    corporateAccountId: corporate_account_id,
    // Deliberately the invited address, not the staff operator: the audit is
    // about who gained access to a client's data, and that is the record that
    // matters six months later.
    actorEmail: clean,
    resource: "corporate_account_members",
    resourceRef: data?.email ?? clean,
  });

  return NextResponse.json({ member: data }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const denied = await guard();
  if (denied) return denied;

  const parsed = roleSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid role change" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("corporate_account_members")
    .update({ role: parsed.data.role })
    .eq("id", parsed.data.membership_id)
    .neq("status", "revoked")
    .select("id, role")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "No such member" }, { status: 404 });
  return NextResponse.json({ member: data });
}

export async function DELETE(req: NextRequest) {
  const denied = await guard();
  if (denied) return denied;

  const parsed = revokeSchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams.entries())
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "membership_id is required" }, { status: 400 });
  }

  /* Both states can be revoked: a mistake at invitation time has to be
     undoable, and only a `revoked` row is a dead end. */
  const { data, error } = await supabase
    .from("corporate_account_members")
    .update({ status: "revoked" })
    .eq("id", parsed.data.membership_id)
    .in("status", ["invited", "active"])
    .select("id")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) {
    return NextResponse.json(
      { error: "That member has already been removed" },
      { status: 409 }
    );
  }

  await auditPortal({
    req,
    action: "members.revoke",
    resource: "corporate_account_members",
    resourceRef: data.id,
  });

  return NextResponse.json({ revoked: data.id });
}
