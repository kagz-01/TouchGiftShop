import { createClient } from "@supabase/supabase-js";

/**
 * Corporate invoicing.
 *
 * Three things this module refuses to guess:
 *
 *   1. Who the seller is. The trading brand on the website is not necessarily
 *      the registered entity — the M-Pesa paybill here reads "Touchline
 *      Branding" while the storefront says TouchGift. An invoice carries the
 *      registered name, KRA PIN and VAT number, or it is not a tax document.
 *      All of it comes from env; none of it is hardcoded, for the same reason
 *      the bank details were.
 *
 *   2. Whether VAT applies. If the business is not registered for VAT, the
 *      invoice says so on its face instead of quietly adding 16.5% it cannot
 *      account for.
 *
 *   3. When tax is due. Default is dispatch: that is the point of supply for a
 *      gift, and the date the client can legitimately expense it.
 */

const supabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

const num = (v: unknown, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export function sellerConfig() {
  const registered = /^(1|true|yes)$/i.test(process.env.VAT_REGISTERED ?? "");
  return {
    name: process.env.LEGAL_ENTITY_NAME || "TouchGift",
    pin: process.env.LEGAL_ENTITY_PIN || null,
    vatNumber: process.env.LEGAL_ENTITY_VAT_NUMBER || null,
    address: process.env.LEGAL_ENTITY_ADDRESS || null,
    email: process.env.LEGAL_ENTITY_EMAIL || process.env.NOTIFY_EMAIL || null,
    taxArea: process.env.LEGAL_ENTITY_TAX_AREA || null,
    lrNumber: process.env.LEGAL_ENTITY_LR_NUMBER || null,
    /* The company number answers to the Registrar of Companies; the PIN answers
       to KRA. Printing one without the other leaves a client unable to verify
       the seller against the register they were told to check. */
    companyNumber: process.env.LEGAL_ENTITY_COMPANY_NUMBER || null,
    phone: process.env.LEGAL_ENTITY_PHONE || null,
    vatRegistered: registered,
    vatRate: registered ? num(process.env.VAT_RATE, 16.5) : 0,
    /* Kenyan retail quotes tax-inclusive. If the business ever switches to
       ex-VAT pricing this flips and the arithmetic below follows. */
    pricesIncludeVat: !/^(0|false|no)$/i.test(process.env.PRICES_INCLUDE_VAT ?? "true"),
    prefix: (process.env.INVOICE_PREFIX || "TG").toUpperCase(),
  };
}

/** Throws rather than issuing a document that cannot be filed. */
export function sellerReadiness() {
  const c = sellerConfig();
  const missing: string[] = [];
  if (!process.env.LEGAL_ENTITY_NAME) missing.push("LEGAL_ENTITY_NAME");
  if (!process.env.LEGAL_ENTITY_PIN) missing.push("LEGAL_ENTITY_PIN");
  if (!process.env.LEGAL_ENTITY_ADDRESS) missing.push("LEGAL_ENTITY_ADDRESS");
  /* A VAT invoice without a VAT registration number is not a VAT invoice. The
     alternative — charging 16.5% and printing no number — produces a document
     the client's finance team rejects and we cannot defend. */
  if (c.vatRegistered && !c.vatNumber) missing.push("LEGAL_ENTITY_VAT_NUMBER");
  return { config: c, missing };
}

export function formatInvoiceNumber(seq: number, date = new Date()) {
  const { prefix } = sellerConfig();
  return `${prefix}/${date.getFullYear()}/${String(seq).padStart(4, "0")}`;
}

/** The URL-safe form. Slashes in an invoice number cannot survive a single
 *  dynamic route segment, so links and emails use this instead. */
export function invoiceSlug(number: string) {
  return number.replace(/[^A-Za-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export type InvoiceLine = {
  line_no: number;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  is_discount: boolean;
  meta?: Record<string, unknown>;
};

type OrderForInvoice = {
  id: string;
  corporate_account_id: string | null;
  company_name: string | null;
  status: string;
  product_id: string | null;
  hamper_items: unknown;
  recipient_count: number | null;
  unit_amount: number | null;
  subtotal: number | null;
  bulk_discount_percent: number | null;
  bulk_discount_amount: number | null;
  wrap_surcharge: number | null;
  total_amount: number | null;
  gift_wrap: string | null;
  delivery_date: string | null;
  created_at: string;
  payment_merchant_ref: string | null;
};

type Product = { id: string; name: string; price: number };

/**
 * Build the line items.
 *
 * A hamper is several things at several prices; collapsing that to one total is
 * what made the old "request an invoice" mailto necessary. Where the order
 * carries no itemisation we still produce a real line rather than nothing —
 * an invoice with no lines is a receipt in nicer type.
 */
export function buildLines(order: OrderForInvoice, product?: Product | null): InvoiceLine[] {
  const lines: InvoiceLine[] = [];
  let n = 1;

  const items = Array.isArray(order.hamper_items) ? (order.hamper_items as Record<string, unknown>[]) : [];

  if (items.length > 0) {
    for (const item of items) {
      const qty = num(item.quantity ?? item.qty, 1);
      const price = num(item.unit_price ?? item.price ?? item.unit_amount, 0);
      if (!qty || !price) continue;
      lines.push({
        line_no: n++,
        description: String(item.name ?? item.title ?? item.description ?? "Item"),
        quantity: qty,
        unit_price: price,
        line_total: Math.round(qty * price * 100) / 100,
        is_discount: false,
      });
    }
  }

  /* Whether wrapping is its own line or already inside the unit price depends
     on where the lines came from, and getting it wrong charges the client
     twice. Itemised hamper contents are priced before wrapping, so wrapping is
     a separate line. The single-line fallback uses `unit_amount`, which the
     intake route already has wrapping folded in — so adding a wrapping line
     there double-counts it. */
  const fromItemisedLines = lines.length > 0;

  if (!fromItemisedLines) {
    const qty = num(order.recipient_count, 1);
    const price = num(order.unit_amount, num(order.total_amount) / qty);
    const wrap = num(order.wrap_surcharge);
    const label = [
      product?.name ?? "Corporate gift order",
      `${qty} ${qty === 1 ? "recipient" : "recipients"}`,
      wrap > 0 ? `${order.gift_wrap ?? "standard"} wrapping included` : null,
    ]
      .filter(Boolean)
      .join(" — ");

    lines.push({
      line_no: n++,
      description: label,
      quantity: qty,
      unit_price: Math.round(price * 100) / 100,
      line_total: Math.round(qty * price * 100) / 100,
      is_discount: false,
      meta: product ? { product_id: product.id } : {},
    });
  } else {
    const wrap = num(order.wrap_surcharge);
    if (wrap > 0) {
      lines.push({
        line_no: n++,
        description: `Gift wrapping — ${order.gift_wrap ?? "standard"}`,
        quantity: num(order.recipient_count, 1),
        unit_price: wrap,
        line_total: wrap,
        is_discount: false,
      });
    }
  }

  const discount = num(order.bulk_discount_amount);
  if (discount > 0) {
    lines.push({
      line_no: n++,
      description: `Bulk discount${order.bulk_discount_percent ? ` (${order.bulk_discount_percent}%)` : ""}`,
      quantity: 1,
      unit_price: -discount,
      line_total: -discount,
      is_discount: true,
    });
  }

  return lines;
}

/**
 * VAT arithmetic.
 *
 * Inclusive pricing (the default, and what a Kenyan retail site quotes) means
 * the order total already contains the tax. The invoice therefore has to take
 * it back out to show net and VAT separately — multiplying by the rate would
 * overcharge the client by 16.5% and make the document unusable.
 */
export function computeTotals(lines: InvoiceLine[]) {
  const { vatRegistered, vatRate, pricesIncludeVat } = sellerConfig();

  const gross = lines.reduce((sum, l) => sum + l.line_total, 0);
  const roundedGross = Math.round(gross * 100) / 100;

  if (!vatRegistered) {
    return {
      vatRegistered: false,
      vatRate: 0,
      netAmount: roundedGross,
      vatAmount: 0,
      grossAmount: roundedGross,
      pricesIncludeVat,
    };
  }

  if (pricesIncludeVat) {
    const net = Math.round((roundedGross / (1 + vatRate / 100)) * 100) / 100;
    return {
      vatRegistered: true,
      vatRate,
      netAmount: net,
      vatAmount: Math.round((roundedGross - net) * 100) / 100,
      grossAmount: roundedGross,
      pricesIncludeVat,
    };
  }

  const net = roundedGross;
  const vat = Math.round(net * (vatRate / 100) * 100) / 100;
  return {
    vatRegistered: true,
    vatRate,
    netAmount: net,
    vatAmount: vat,
    grossAmount: Math.round((net + vat) * 100) / 100,
    pricesIncludeVat,
  };
}

export async function issueInvoiceForOrder(
  orderId: string,
  opts: {
    /** A draft draws a number but is not a document anyone files. It exists so
     *  ops can see the layout and the arithmetic before the registered entity
     *  details are settled — it must never reach a client. */
    draft?: boolean;
    paymentTermsDays?: number;
    buyerOverride?: { name?: string; taxId?: string; address?: string; email?: string };
    pspReference?: string | null;
    markPaid?: boolean;
    issuedBy?: string;
  } = {}
) {
  const db = supabase();

  const { data: order, error } = await db
    .from("corporate_orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (error) throw new Error(`Could not read the order: ${error.message}`);
  if (!order) return { ok: false as const, code: "not_found" as const };
  if (!order.corporate_account_id) {
    return { ok: false as const, code: "untenanted" as const };
  }

  /* One live invoice per order. Re-issuing would be legitimate only if the
     previous one was void, and that path is explicit below. */
  const { data: existing } = await db
    .from("corporate_invoices")
    .select("invoice_number, status")
    .eq("corporate_order_id", orderId)
    /* Drafts do not count: a draft that has been looked at and discarded must
       not stop the real document being issued. */
    .eq("status", "issued")
    .maybeSingle();

  if (existing) {
    return { ok: false as const, code: "already_issued" as const, invoice: existing };
  }

  const { data: product } = order.product_id
    ? await db.from("products").select("id, name, price").eq("id", order.product_id).maybeSingle()
    : { data: null };

  const lines = buildLines(order as unknown as OrderForInvoice, product as Product | null);
  const totals = computeTotals(lines);
  const seller = sellerConfig();

  const { data: account } = await db
    .from("corporate_accounts")
    .select("company_name, company_email, tax_id, default_payment_terms")
    .eq("id", order.corporate_account_id)
    .maybeSingle();

  const termsDays =
    opts.paymentTermsDays ??
    (/net_(\d+)/.exec(account?.default_payment_terms ?? "")?.[1]
      ? Number(/net_(\d+)/.exec(account?.default_payment_terms ?? "")![1])
      : 0);

  const issuedAt = new Date();
  const dueAt = termsDays > 0
    ? new Date(issuedAt.getTime() + termsDays * 86400000)
    : null;

  /* The number comes from a Postgres sequence, not from the application: an
     app-side counter resets on deploy, races under concurrency, and repeats
     after a rollback. Drafts are stamped DRAFT-<seq> from the same sequence
     rather than the official format, so looking at a draft cannot leave a hole
     in the client's numbering. */
  const { data: seq, error: seqErr } = await db.rpc("next_corporate_invoice_number");

  if (seqErr || seq == null) {
    // Never fall back to a timestamp or a random string. A duplicate invoice
    // number is an audit finding; a missing invoice is an email.
    console.error("[invoicing] could not draw an invoice number:", seqErr?.message);
    return { ok: false as const, code: "numbering_unavailable" as const };
  }

  return createWithNumber(Number(seq), lines, totals, seller, account, order, {
    issuedAt, dueAt, termsDays, opts,
  });
}

type CreateArgs = {
  issuedAt: Date;
  dueAt: Date | null;
  termsDays: number;
  opts: {
    draft?: boolean;
    paymentTermsDays?: number;
    buyerOverride?: { name?: string; taxId?: string; address?: string; email?: string };
    pspReference?: string | null;
    markPaid?: boolean;
    issuedBy?: string;
  };
};

async function createWithNumber(
  seq: number,
  lines: InvoiceLine[],
  totals: ReturnType<typeof computeTotals>,
  seller: ReturnType<typeof sellerConfig>,
  account: { company_name: string; company_email: string | null; tax_id: string | null } | null,
  order: { id: string; corporate_account_id: string; company_name: string | null },
  args: CreateArgs
) {
  const db = supabase();
  const invoiceNumber = args.opts.draft
    ? `DRAFT-${String(seq).padStart(4, "0")}`
    : formatInvoiceNumber(seq, args.issuedAt);
  const slug = invoiceSlug(invoiceNumber);

  const { data: invoice, error } = await db
    .from("corporate_invoices")
    .insert({
      invoice_number: invoiceNumber,
      invoice_slug: slug,
      fiscal_year: args.issuedAt.getFullYear(),
      corporate_order_id: order.id,
      corporate_account_id: order.corporate_account_id,

      status: args.opts.draft ? "draft" : "issued",
      issued_at: args.opts.draft ? null : args.issuedAt.toISOString(),
      paid_at: args.opts.markPaid ? args.issuedAt.toISOString() : null,
      psp_reference: args.opts.pspReference ?? null,

      seller_name: seller.name,
      seller_pin: seller.pin,
      seller_vat_number: seller.vatNumber,
      seller_address: seller.address,
      seller_email: seller.email,

      buyer_name: args.opts.buyerOverride?.name ?? order.company_name ?? account?.company_name ?? "Client",
      buyer_tax_id: args.opts.buyerOverride?.taxId ?? account?.tax_id ?? null,
      buyer_address: args.opts.buyerOverride?.address ?? null,
      buyer_email: args.opts.buyerOverride?.email ?? account?.company_email ?? null,
      buyer_override: args.opts.buyerOverride ?? {},

      vat_registered: totals.vatRegistered,
      vat_rate: totals.vatRate,
      subtotal: totals.netAmount,
      discount_amount: 0,
      vat_amount: totals.vatAmount,
      total_amount: totals.grossAmount,

      payment_terms_days: args.termsDays,
      due_at: args.dueAt?.toISOString() ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(`Could not write the invoice: ${error.message}`);

  const { error: linesErr } = await db.from("corporate_invoice_lines").insert(
    lines.map((l) => ({
      invoice_id: invoice.id,
      line_no: l.line_no,
      description: l.description,
      quantity: l.quantity,
      unit_price: l.unit_price,
      line_total: l.line_total,
      is_discount: l.is_discount,
      meta: l.meta ?? {},
    }))
  );
  if (linesErr) throw new Error(`Could not write invoice lines: ${linesErr.message}`);

  return { ok: true as const, invoice };
}
/* ─────────────────────────────────────────────────────────────────────────────
 * Void, credit notes, and the event trail
 *
 * Invoicing is automatic from dispatch onward, which means nobody is watching
 * each order. "Why does this order have an invoice" therefore needs an answer
 * that outlives the code that produced it — hence corporate_invoice_events.
 * ───────────────────────────────────────────────────────────────────────────── */

export async function recordInvoiceEvent(args: {
  event: string;
  corporateOrderId?: string | null;
  invoiceId?: string | null;
  creditNoteId?: string | null;
  actor?: string | null;
  detail?: Record<string, unknown>;
}) {
  try {
    const db = supabase();
    const { error } = await db.from("corporate_invoice_events").insert({
      event: args.event,
      corporate_order_id: args.corporateOrderId ?? null,
      invoice_id: args.invoiceId ?? null,
      credit_note_id: args.creditNoteId ?? null,
      actor: args.actor ?? "system",
      detail: args.detail ?? {},
    });
    if (error) console.error("[invoicing] event write failed:", error.message);
  } catch (e) {
    console.error("[invoicing] event threw:", e);
  }
}

export type VoidResult =
  | { ok: true; invoice: { id: string; invoice_number: string; status: string } }
  | { ok: false; code: "not_found" | "already_void" | "is_paid" | "already_credited" | "no_reason" };

/**
 * Withdraw an issued invoice. The number is kept — a voided invoice that
 * silently vanished is indistinguishable from one that was never issued, and
 * the client may already have filed it.
 *
 * A *paid* invoice cannot be voided. Once money has moved, the answer is a
 * credit note and a refund, not a retraction that leaves the payment orphaned.
 */
export async function voidInvoice(args: {
  invoiceId: string;
  reason: string;
  note?: string;
  actor?: string;
}): Promise<VoidResult> {
  const db = supabase();

  const { data: invoice, error } = await db
    .from("corporate_invoices")
    .select("id, invoice_number, status, corporate_order_id, corporate_account_id")
    .eq("id", args.invoiceId)
    .maybeSingle();

  if (error) throw new Error(`Could not read the invoice: ${error.message}`);
  if (!invoice) return { ok: false, code: "not_found" };
  if (invoice.status === "void") return { ok: false, code: "already_void" };
  if (invoice.status === "paid") return { ok: false, code: "is_paid" };
  if (!args.reason.trim()) return { ok: false, code: "no_reason" };

  const { data: credits } = await db
    .from("corporate_credit_notes")
    .select("id")
    .eq("invoice_id", invoice.id)
    .neq("status", "draft")
    .limit(1);
  if (credits?.length) return { ok: false, code: "already_credited" };

  const { data: updated, error: updateErr } = await db
    .from("corporate_invoices")
    .update({
      status: "void",
      voided_at: new Date().toISOString(),
      void_reason: args.reason.trim(),
    })
    .eq("id", invoice.id)
    .eq("status", invoice.status)
    .select("id, invoice_number, status")
    .maybeSingle();

  if (updateErr) throw new Error(`Could not void the invoice: ${updateErr.message}`);
  if (!updated) return { ok: false, code: "already_void" };

  await recordInvoiceEvent({
    event: "invoice.voided",
    corporateOrderId: invoice.corporate_order_id,
    invoiceId: invoice.id,
    actor: args.actor ?? null,
    detail: { reason: args.reason.trim(), note: args.note ?? null },
  });

  return { ok: true, invoice: updated };
}

export type CreditNoteResult =
  | { ok: true; creditNote: Record<string, unknown> }
  | {
      ok: false;
      code:
        | "not_found"
        | "no_lines"
        | "amount_exceeds_invoice"
        | "already_fully_credited"
        | "bad_reason"
    };

/**
 * Raise a credit note against an issued or paid invoice.
 *
 * The amount defaults to the full invoice — the common case is "this was wrong,
 * here is the credit" — but it can be partial, because "three of the fifty
 * hampers were never delivered" is the more common case than people assume.
 * The ceiling is enforced here rather than trusted from the client.
 */
export async function issueCreditNote(args: {
  invoiceId: string;
  reason: string;
  reasonNote?: string;
  amount?: number;
  lineRefs?: number[];
  actor?: string;
}): Promise<CreditNoteResult> {
  const db = supabase();

  const REASONS = new Set([
    "duplicate",
    "incorrect_amount",
    "goods_returned",
    "service_not_delivered",
    "other",
  ]);
  if (!REASONS.has(args.reason)) return { ok: false, code: "bad_reason" };

  const { data: invoice, error } = await db
    .from("corporate_invoices")
    .select("*")
    .eq("id", args.invoiceId)
    .maybeSingle();

  if (error) throw new Error(`Could not read the invoice: ${error.message}`);
  if (!invoice) return { ok: false, code: "not_found" };
  if (invoice.status === "void") return { ok: false, code: "not_found" };

  const { data: lines } = await db
    .from("corporate_invoice_lines")
    .select("line_no, description, quantity, unit_price, line_total")
    .eq("invoice_id", invoice.id)
    .order("line_no", { ascending: true });

  if (!lines?.length) return { ok: false, code: "no_lines" };

  /* What has already been credited against this invoice, so a second note
     cannot credit the same money twice. */
  const { data: priorCredits } = await db
    .from("corporate_credit_notes")
    .select("total_amount")
    .eq("invoice_id", invoice.id)
    .neq("status", "draft");

  const alreadyCredited = (priorCredits ?? []).reduce(
    (sum, c) => sum + Number(c.total_amount ?? 0),
    0
  );
  const invoiceTotal = Number(invoice.total_amount ?? 0);
  const remaining = Math.round((invoiceTotal - alreadyCredited) * 100) / 100;

  if (remaining <= 0) return { ok: false, code: "already_fully_credited" };

  const creditAmount =
    args.amount == null ? remaining : Math.round(args.amount * 100) / 100;

  if (creditAmount <= 0 || creditAmount > remaining) {
    return { ok: false, code: "amount_exceeds_invoice" };
  }

  /* Scale the invoice's net/VAT across the credit in the same proportion, so a
     partial credit does not distort the VAT line. */
  const ratio = invoiceTotal > 0 ? creditAmount / invoiceTotal : 1;
  const netAmount = Math.round(Number(invoice.subtotal ?? 0) * ratio * 100) / 100;
  const vatAmount = Math.round(Number(invoice.vat_amount ?? 0) * ratio * 100) / 100;

  const creditedLines = args.lineRefs?.length
    ? lines.filter((l) => args.lineRefs!.includes(Number(l.line_no)))
    : lines;

  const { data: seq, error: seqErr } = await db.rpc("next_corporate_credit_note_number");
  if (seqErr || seq == null) {
    throw new Error("Credit note numbering is unavailable");
  }

  const { prefix } = sellerConfig();
  const now = new Date();
  const number = `${prefix}CN/${now.getFullYear()}/${String(seq).padStart(4, "0")}`;

  const { data: creditNote, error: insertErr } = await db
    .from("corporate_credit_notes")
    .insert({
      credit_note_number: number,
      fiscal_year: now.getFullYear(),
      invoice_id: invoice.id,
      corporate_order_id: invoice.corporate_order_id,
      corporate_account_id: invoice.corporate_account_id,
      status: "issued",
      reason: args.reason,
      reason_note: args.reasonNote?.trim() || null,

      vat_registered: invoice.vat_registered,
      vat_rate: invoice.vat_rate,
      subtotal: netAmount,
      vat_amount: vatAmount,
      total_amount: creditAmount,

      lines: creditedLines.map((l) => ({
        line_no: l.line_no,
        description: l.description,
        quantity: Number(l.quantity),
        unit_price: Number(l.unit_price),
        // Negative: a credit reduces what is owed.
        line_total: -Math.round(Number(l.line_total) * ratio * 100) / 100,
      })),

      seller_name: invoice.seller_name,
      seller_pin: invoice.seller_pin,
      seller_vat_number: invoice.seller_vat_number,
      seller_address: invoice.seller_address,
      buyer_name: invoice.buyer_name,
      buyer_tax_id: invoice.buyer_tax_id,
      buyer_address: invoice.buyer_address,
      buyer_email: invoice.buyer_email,

      issued_by: args.actor ?? null,
      issued_at: now.toISOString(),
    })
    .select()
    .single();

  if (insertErr) throw new Error(`Could not write the credit note: ${insertErr.message}`);

  await recordInvoiceEvent({
    event: "credit_note.issued",
    corporateOrderId: invoice.corporate_order_id,
    invoiceId: invoice.id,
    creditNoteId: creditNote.id,
    actor: args.actor ?? null,
    detail: { credit_note_number: number, amount: creditAmount, reason: args.reason },
  });

  return { ok: true, creditNote };
}

/** What has been credited against an invoice, for the ops screen. */
export async function creditSummary(invoiceId: string) {
  const db = supabase();
  const { data } = await db
    .from("corporate_credit_notes")
    .select("id, credit_note_number, total_amount, reason, issued_at")
    .eq("invoice_id", invoiceId)
    .neq("status", "draft")
    .order("issued_at", { ascending: false });

  const total = (data ?? []).reduce((s, c) => s + Number(c.total_amount ?? 0), 0);
  return { notes: data ?? [], creditedTotal: total };
}
