import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireCorporate } from "@/lib/corporate-auth";
import { sendEmail } from "@/lib/notifications";
import { auditPortal } from "@/lib/portal-audit";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const bodySchema = z.object({
  decision: z.enum(["accept", "decline"]),
  message: z.string().max(2000).optional(),
});

/* Client actions on a quote. The legal transitions are ops' map, mirrored:
   a client can accept or decline something that has been priced, and can walk
   an acceptance back, but cannot invent a state or skip the pricing step. */
const ALLOWED: Record<string, string[]> = {
  pending: [],
  quoted: ["accepted", "declined"],
  accepted: ["pending"],
  declined: ["pending"],
};

export async function POST(
  req: NextRequest,
  { params }: { params: { reference: string } }
) {
  const auth = await requireCorporate();
  if (!auth.ok) {
    await auditPortal({ req, action: "quotes.respond", outcome: "denied" });
    return auth.response;
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid response" },
      { status: 400 }
    );
  }

  const reference = params.reference.toUpperCase();
  const { session } = auth;

  /* Scoped by account AND by reference. Looking up by reference alone would let
     a client guess another company's quote — the reference is only 5 characters
     from a 31-symbol alphabet. */
  const { data: quote, error: readErr } = await supabase
    .from("corporate_quote_requests")
    .select("id, reference, company_name, email, product_name, quantity, quoted_amount, status")
    .eq("reference", reference)
    .eq("corporate_account_id", session.account.id)
    .maybeSingle();

  if (readErr) {
    return NextResponse.json({ error: "Could not load that quote" }, { status: 500 });
  }
  // 404, not 403: a client must not be able to probe which references exist.
  if (!quote) {
    return NextResponse.json({ error: "No such quote" }, { status: 404 });
  }

  const nextStatus = parsed.data.decision === "accept" ? "accepted" : "declined";
  if (!ALLOWED[quote.status]?.includes(nextStatus)) {
    return NextResponse.json(
      {
        error:
          quote.status === nextStatus
            ? `This quote is already ${nextStatus}.`
            : `This quote is currently "${quote.status}" and cannot be ${nextStatus} yet.`,
      },
      { status: 409 }
    );
  }

  const now = new Date().toISOString();
  const { data: updated, error: writeErr } = await supabase
    .from("corporate_quote_requests")
    .update({
      status: nextStatus,
      customer_response: {
        decision: parsed.data.decision,
        message: parsed.data.message ?? null,
        responded_by: session.email,
        responded_at: now,
      },
      customer_responded_at: now,
    })
    .eq("id", quote.id)
    .eq("status", quote.status) // guard: someone else may have moved it already
    .select("reference, status, customer_response, customer_responded_at")
    .maybeSingle();

  if (writeErr) {
    return NextResponse.json({ error: "Could not record your response" }, { status: 500 });
  }
  if (!updated) {
    return NextResponse.json(
      { error: "This quote changed while you were reading it. Refresh and try again." },
      { status: 409 }
    );
  }

  await auditPortal({
    req,
    action: "quotes.respond",
    corporateAccountId: session.account.id,
    actorUserId: session.userId,
    actorEmail: session.email,
    actorRole: session.membership.role,
    resource: "corporate_quote_requests",
    resourceRef: quote.reference,
  });

  // Ops hears about it immediately. A mail failure must not lose the decision —
  // it is already in the database.
  if (process.env.NOTIFY_EMAIL) {
    void sendEmail(
      process.env.NOTIFY_EMAIL,
      `${session.account.company_name} ${parsed.data.decision === "accept" ? "accepted" : "declined"} quote ${quote.reference}`,
      `<div style="font-family:system-ui,sans-serif">
         <h2>Client responded to a quote</h2>
         <p>
           <strong>${quote.reference}</strong> — ${quote.product_name} × ${quote.quantity}
           for ${quote.company_name}
         </p>
         <p>Decision: <strong>${parsed.data.decision}</strong> by ${session.email}</p>
         ${parsed.data.message ? `<p style="color:#555">"${parsed.data.message}"</p>` : ""}
       </div>`,
      `${quote.reference}: ${parsed.data.decision} by ${session.email}`
    ).catch((e) => console.error("[portal/respond] ops email failed:", e));
  }

  return NextResponse.json({ quote: updated });
}
