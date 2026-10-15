import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdmin } from "@/lib/admin-auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/* Roadmap §3 Phase 1.1 — the operational lifecycle. `declined` is kept from the
   original four so existing rows stay valid; the approval states are Phase 4
   and deliberately NOT added here, because nothing writes them yet and widening
   the CHECK now would let quotes land in states no UI can move them out of. */
const STATUSES = ["pending", "quoted", "accepted", "declined"] as const;
type QuoteStatus = (typeof STATUSES)[number];

/* Only these transitions are legal. Previously any status could jump to any
   other, which meant an accidental double-click could silently reopen a
   declined quote. Ops can always walk back one step, but not skip forward
   past `quoted` — you cannot mark something accepted that was never quoted. */
const TRANSITIONS: Record<QuoteStatus, QuoteStatus[]> = {
  pending:  ["quoted", "declined"],
  quoted:   ["accepted", "declined", "pending"],
  accepted: [],
  declined: ["pending"],
};

const PATCHABLE = [
  "status",
  "assignee",
  "internal_notes",
  "quoted_amount",
  "valid_until",
  "phone",
  "category",
  "moq_tier",
  "design_payload",
  "design_preview_url",
] as const;

/* Ops tooling. This table holds customer emails, phone numbers and free-text
   messages, and this route uses the service-role key which bypasses RLS, so the
   only thing standing between the internet and that data is this check. It was
   missing entirely — see commit message. */
async function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/* A dead pooler connection must not read as a bad session: the operator would
   be told to sign in again over a transient network blip. */
async function guard() {
  const auth = await verifyAdmin();
  if (auth.ok) return null;
  if (auth.reason === "unavailable") {
    return NextResponse.json(
      { error: "Could not verify your session right now. Try again." },
      { status: 503 }
    );
  }
  return unauthorized();
}

/* Supabase's .or() and .ilike() take raw filter strings, so user input has to
   be escaped or a quote in a search box breaks the query (or injects a clause).
   Postgres escapes a literal with a backslash. */
function escapeLike(input: string) {
  return input.replace(/([\\%_])/g, "\\$1");
}

// GET /api/corporate/quotes
//   ?status=all|pending|quoted|accepted|declined
//   &q=<search company / email / phone / product>
//   &category=<slug>   &from=<YYYY-MM-DD>   &to=<YYYY-MM-DD>
//   &assignee=<name>   &limit=50   &page=1
export async function GET(req: NextRequest) {
  const denied = await guard();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "all";
  const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 50), 1), 100);
  const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
  const offset = (page - 1) * limit;

  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category")?.trim();
  const assignee = searchParams.get("assignee")?.trim();
  const from = searchParams.get("from")?.trim();
  const to = searchParams.get("to")?.trim();

  let query = supabase
    .from("corporate_quote_requests")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status !== "all") {
    if (!STATUSES.includes(status as QuoteStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    query = query.eq("status", status);
  }

  if (category) query = query.eq("category", category);
  if (assignee) query = query.eq("assignee", assignee);
  if (from) query = query.gte("created_at", new Date(from).toISOString());
  // Inclusive end-of-day: the date picker gives YYYY-MM-DD, which Date() reads
  // as midnight, so a bare `lte` silently drops everything from that day.
  if (to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    query = query.lte("created_at", end.toISOString());
  }

  if (q) {
    const term = `%${escapeLike(q)}%`;
    query = query.or(
      [
        `company_name.ilike.${term}`,
        `email.ilike.${term}`,
        `phone.ilike.${term}`,
        `product_name.ilike.${term}`,
        // Ops is asked for the reference on the phone, not the company name.
        `reference.ilike.${term}`,
      ].join(",")
    );
  }

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ quotes: data ?? [], total: count ?? 0, page, limit });
}

// PATCH /api/corporate/quotes — ops edit of a single quote.
// Only whitelisted fields are written; `id` and `created_at` are never accepted
// from the body, so a crafted request cannot repoint the update at another row.
export async function PATCH(req: NextRequest) {
  const denied = await guard();
  if (denied) return denied;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id } = body as { id?: unknown };
  if (typeof id !== "string" || !id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  for (const key of PATCHABLE) {
    if (key in body) update[key] = body[key];
  }
  if (!Object.keys(update).length) {
    return NextResponse.json({ error: "No updatable fields provided" }, { status: 400 });
  }

  // Validate the transition against the row's CURRENT status, so the check
  // cannot be bypassed by sending only the new status.
  if ("status" in update) {
    const next = update.status as string;
    if (!STATUSES.includes(next as QuoteStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const { data: current, error: readErr } = await supabase
      .from("corporate_quote_requests")
      .select("status")
      .eq("id", id)
      .single();
    if (readErr || !current) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    const from = (current.status ?? "pending") as QuoteStatus;
    const to = next as QuoteStatus;
    if (from === to) {
      // Idempotent no-op — clicking "Send Quote" twice shouldn't 400.
      delete update.status;

      // ...but it must not fall through to an UPDATE with an empty patch.
      // PostgREST returns zero rows for that, so .single() raises and the
      // route 500s. Reply with the unchanged row instead.
      if (!Object.keys(update).length) {
        const { data: unchanged } = await supabase
          .from("corporate_quote_requests")
          .select("*")
          .eq("id", id)
          .single();
        return NextResponse.json({ quote: unchanged, unchanged: true });
      }
    } else if (!TRANSITIONS[from]?.includes(to)) {
      return NextResponse.json(
        { error: `Cannot move a quote from "${from}" to "${next}"` },
        { status: 409 }
      );
    }
  }

  if ("quoted_amount" in update && update.quoted_amount !== null) {
    const amount = Number(update.quoted_amount);
    if (!Number.isFinite(amount) || amount < 0) {
      return NextResponse.json({ error: "quoted_amount must be a positive number" }, { status: 400 });
    }
    update.quoted_amount = amount;
  }

  if ("status" in update && update.status === "quoted" && !("quoted_at" in body)) {
    update.quoted_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("corporate_quote_requests")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ quote: data });
}
