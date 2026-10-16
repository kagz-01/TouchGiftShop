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

  if (lines.length === 0) {
    const qty = num(order.recipient_count, 1);
    const price = num(order.unit_amount, num(order.total_amount) / qty);
    lines.push({
      line_no: n++,
      description: product?.name
        ? `${product.name} — gift for ${qty} ${qty === 1 ? "recipient" : "recipients"}`
        : `Corporate gift order for ${qty} ${qty === 1 ? "recipient" : "recipients"}`,
      quantity: qty,
      unit_price: Math.round(price * 100) / 100,
      line_total: Math.round(qty * price * 100) / 100,
      is_discount: false,
      meta: product ? { product_id: product.id } : {},
    });
  }

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
    .neq("status", "void")
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
     after a rollback. The prefix and fiscal year are formatted around it. */
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
  const invoiceNumber = formatInvoiceNumber(seq, args.issuedAt);

  const { data: invoice, error } = await db
    .from("corporate_invoices")
    .insert({
      invoice_number: invoiceNumber,
      fiscal_year: args.issuedAt.getFullYear(),
      corporate_order_id: order.id,
      corporate_account_id: order.corporate_account_id,

      status: "issued",
      issued_at: args.issuedAt.toISOString(),
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