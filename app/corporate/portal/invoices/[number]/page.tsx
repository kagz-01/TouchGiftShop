import { notFound, redirect } from "next/navigation";
import PortalPrintButton from "@/components/corporate/portal/PortalPrintButton";
import { getCorporateSession } from "@/lib/corporate-auth";
import { verifyAdmin } from "@/lib/admin-auth";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/**
 * The invoice document.
 *
 * A4, print-first, no portal chrome: this gets printed, filed, and forwarded
 * to an accounts payable team that has never heard of us. It carries the
 * registered seller details and the buyer snapshot recorded at issue time — not
 * whatever the account says today, because the finance team already filed the
 * version they were sent.
 *
 * The "print" stylesheet is the real UI here; the screen version is a preview.
 */

const SELLER_TAX_AREA = process.env.LEGAL_ENTITY_TAX_AREA || null;
const SELLER_LR_NUMBER = process.env.LEGAL_ENTITY_LR_NUMBER || null;
const SELLER_COMPANY_NUMBER = process.env.LEGAL_ENTITY_COMPANY_NUMBER || null;
const SELLER_PHONE = process.env.LEGAL_ENTITY_PHONE || null;

const money = (n: number) =>
  `KES ${Number(n).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const date = (v: string | null) =>
  v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

type Invoice = {
  id: string;
  invoice_number: string;
  status: string;
  seller_name: string;
  seller_pin: string | null;
  seller_vat_number: string | null;
  seller_address: string | null;
  seller_email: string | null;
  buyer_name: string;
  buyer_tax_id: string | null;
  buyer_address: string | null;
  buyer_email: string | null;
  vat_registered: boolean;
  vat_rate: number;
  subtotal: number;
  vat_amount: number;
  total_amount: number;
  payment_terms_days: number;
  due_at: string | null;
  issued_at: string | null;
  paid_at: string | null;
  psp_reference: string | null;
  corporate_order_id: string;
};

export default async function InvoiceDocumentPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;

  /* Staff get a preview as well as the client. Ops issues invoices, so ops has
     to be able to open one and see exactly what went out — otherwise the only
     way to check the document is to ask the client what they received. */
  const auth = await getCorporateSession();
  const staff = auth.ok ? null : await verifyAdmin();
  const isStaffPreview = !!staff?.ok;

  if (!auth.ok && !isStaffPreview && auth.reason === "signed_out") {
    redirect("/corporate/portal/sign-in?next=/corporate/portal/invoices");
  }

  /* A member only ever reaches their own account's invoices. Staff reach any,
   * which is the whole point of having them — so the account filter is dropped
   * entirely for staff rather than passed as null, because `eq.null` is not a
   * "match nothing" in PostgREST, it is a syntax error. */
  const accountScope = auth.ok ? auth.session.account.id : null;
  const findInvoice = () => {
    let q = db.from("corporate_invoices").select("*").eq("invoice_slug", number);
    if (accountScope) q = q.eq("corporate_account_id", accountScope);
    return q.maybeSingle();
  };
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  /* Scoped to the caller's account: a guessed invoice number must return
     somebody else's 404, not a price list. */
  const { data: invoice } = await findInvoice();

  if (!invoice) notFound();

  const inv = invoice as unknown as Invoice;

  // A client never sees a draft. Staff may, so they can proof it before issue.
  if (inv.status === "draft" && !isStaffPreview) notFound();

  const { data: lines } = await db
    .from("corporate_invoice_lines")
    .select("line_no, description, quantity, unit_price, line_total, is_discount")
    .eq("invoice_id", inv.id)
    .order("line_no", { ascending: true });

  const { data: order } = await db
    .from("corporate_orders")
    .select("recipient_count, delivery_date, gift_wrap")
    .eq("id", inv.corporate_order_id)
    .maybeSingle();

  const paid = inv.status === "paid";

  return (
    <div className="min-h-screen bg-[#F4F1ED] py-8 print:bg-white print:py-0">
      <style>{`
        @page { size: A4; margin: 16mm; }
        @media print {
          .no-print { display: none !important; }
          body { background: #fff; }
        }
      `}</style>

      <div className="no-print mx-auto mb-6 flex max-w-[210mm] items-center justify-between gap-4 px-4">
        <a
          href={isStaffPreview ? "/corporate/dashboard" : "/corporate/portal/invoices"}
          className="text-sm text-[color:var(--portal-text-muted)] hover:text-[color:var(--portal-text)]"
        >
          {isStaffPreview ? "← Ops dashboard" : "← All invoices"}
        </a>
        <div className="flex items-center gap-3">
          {isStaffPreview && (
            <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
              Staff preview — not visible to the client
            </span>
          )}
          <span className="text-xs text-[color:var(--portal-text-faint)]">
            {paid ? "Paid" : inv.due_at ? `Due ${date(inv.due_at)}` : "Payable on receipt"}
          </span>
          <PortalPrintButton
            className="rounded-xl px-4 py-2 text-sm font-semibold"
            style={{ background: "var(--portal-accent)", color: "var(--portal-accent-text)" }}
          />
        </div>
      </div>

      <article className="mx-auto max-w-[210mm] bg-white px-10 py-10 text-[#1A1410] shadow-[0_8px_40px_rgba(0,0,0,0.08)] print:max-w-none print:px-0 print:py-0 print:shadow-none">
        {/* ── Header ── */}
        <header className="flex items-start justify-between gap-8 border-b border-black/10 pb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{inv.seller_name}</h1>
            {inv.seller_address && (
              <p className="mt-2 max-w-xs text-xs leading-relaxed text-black/60">{inv.seller_address}</p>
            )}
            <dl className="mt-3 space-y-0.5 text-[11px] text-black/60">
              {inv.seller_pin && (
                <div className="flex gap-2">
                  <dt className="w-24">KRA PIN</dt>
                  <dd className="font-medium text-black/80">{inv.seller_pin}</dd>
                </div>
              )}
              {inv.seller_vat_number && (
                <div className="flex gap-2">
                  <dt className="w-24">VAT No.</dt>
                  <dd className="font-medium text-black/80">{inv.seller_vat_number}</dd>
                </div>
              )}
              {inv.seller_email && (
                <div className="flex gap-2">
                  <dt className="w-24">Email</dt>
                  <dd>{inv.seller_email}</dd>
                </div>
              )}
              {/* The tax area and LR number are not decoration: they are what
                  makes correspondence traceable to the right KRA office. */}
              {SELLER_TAX_AREA && (
                <div className="flex gap-2">
                  <dt className="w-24">Tax area</dt>
                  <dd>{SELLER_TAX_AREA}</dd>
                </div>
              )}
              {SELLER_LR_NUMBER && (
                <div className="flex gap-2">
                  <dt className="w-24">L.R. No.</dt>
                  <dd>{SELLER_LR_NUMBER}</dd>
                </div>
              )}
              {SELLER_COMPANY_NUMBER && (
                <div className="flex gap-2">
                  <dt className="w-24">Reg. No.</dt>
                  <dd className="font-medium text-black/80">{SELLER_COMPANY_NUMBER}</dd>
                </div>
              )}
              {SELLER_PHONE && (
                <div className="flex gap-2">
                  <dt className="w-24">Telephone</dt>
                  <dd>{SELLER_PHONE}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="text-right">
            <p className="text-[11px] uppercase tracking-[0.2em] text-black/50">
              {paid ? "Receipt" : "Invoice"}
            </p>
            <p className="mt-1 font-mono text-lg font-semibold">{inv.invoice_number}</p>
            <dl className="mt-3 space-y-0.5 text-[11px] text-black/60">
              <div className="flex justify-end gap-3">
                <dt>Issued</dt>
                <dd className="font-medium text-black/80">{date(inv.issued_at)}</dd>
              </div>
              {inv.due_at && (
                <div className="flex justify-end gap-3">
                  <dt>Due</dt>
                  <dd className="font-medium text-black/80">{date(inv.due_at)}</dd>
                </div>
              )}
            </dl>
            {paid && (
              <p className="mt-3 inline-block border border-emerald-600 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                PAID {inv.paid_at ? date(inv.paid_at) : ""}
              </p>
            )}
          </div>
        </header>

        {/* ── Parties ── */}
        <section className="mt-6 grid grid-cols-2 gap-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-black/50">Billed to</p>
            <p className="mt-1.5 font-medium">{inv.buyer_name}</p>
            {inv.buyer_address && (
              <p className="mt-1 max-w-xs text-xs leading-relaxed text-black/60">{inv.buyer_address}</p>
            )}
            {inv.buyer_tax_id && (
              <p className="mt-1 text-[11px] text-black/60">Tax ID: {inv.buyer_tax_id}</p>
            )}
            {inv.buyer_email && <p className="mt-1 text-[11px] text-black/60">{inv.buyer_email}</p>}
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-black/50">Delivery</p>
            <dl className="mt-1.5 space-y-1 text-xs text-black/70">
              {order?.recipient_count ? (
                <div className="flex gap-3">
                  <dt className="w-24 text-black/50">Recipients</dt>
                  <dd>{order.recipient_count}</dd>
                </div>
              ) : null}
              {order?.delivery_date ? (
                <div className="flex gap-3">
                  <dt className="w-24 text-black/50">For delivery</dt>
                  <dd>{date(order.delivery_date)}</dd>
                </div>
              ) : null}
              {inv.payment_terms_days > 0 ? (
                <div className="flex gap-3">
                  <dt className="w-24 text-black/50">Terms</dt>
                  <dd>Net {inv.payment_terms_days} days</dd>
                </div>
              ) : (
                <div className="flex gap-3">
                  <dt className="w-24 text-black/50">Terms</dt>
                  <dd>Payable on receipt</dd>
                </div>
              )}
            </dl>
          </div>
        </section>

        {/* ── Lines ── */}
        <table className="mt-8 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-black/20 text-left">
              <th className="py-2 pr-3 font-medium text-[10px] uppercase tracking-[0.14em] text-black/50">
                Description
              </th>
              <th className="py-2 px-3 text-right font-medium text-[10px] uppercase tracking-[0.14em] text-black/50">
                Qty
              </th>
              <th className="py-2 px-3 text-right font-medium text-[10px] uppercase tracking-[0.14em] text-black/50">
                Unit
              </th>
              <th className="py-2 pl-3 text-right font-medium text-[10px] uppercase tracking-[0.14em] text-black/50">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {(lines ?? []).map((l: { line_no: number; description: string; quantity: number; unit_price: number; line_total: number; is_discount: boolean }) => (
              <tr key={l.line_no} className="border-b border-black/5">
                <td className={`py-3 pr-3 ${l.is_discount ? "text-black/60" : ""}`}>{l.description}</td>
                <td className="px-3 text-right tabular-nums text-black/70">{Number(l.quantity)}</td>
                <td className="px-3 text-right tabular-nums text-black/70">{money(Number(l.unit_price))}</td>
                <td className={`pl-3 text-right tabular-nums ${l.is_discount ? "text-emerald-700" : ""}`}>
                  {l.is_discount ? `− ${money(Math.abs(Number(l.line_total)))}` : money(Number(l.line_total))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── Totals ── */}
        <section className="mt-6 flex justify-end">
          <dl className="w-full max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-black/60">Net amount</dt>
              <dd className="tabular-nums">{money(Number(inv.subtotal))}</dd>
            </div>
            {inv.vat_registered ? (
              <div className="flex justify-between">
                <dt className="text-black/60">VAT ({Number(inv.vat_rate)}%)</dt>
                <dd className="tabular-nums">{money(Number(inv.vat_amount))}</dd>
              </div>
            ) : (
              <p className="text-[11px] leading-relaxed text-black/50">
                The seller is not registered for VAT. No VAT has been charged and this
                document is not a tax invoice.
              </p>
            )}
            <div className="flex justify-between border-t border-black/20 pt-2 text-base font-semibold">
              <dt>Total due</dt>
              <dd className="tabular-nums">{money(Number(inv.total_amount))}</dd>
            </div>
          </dl>
        </section>

        {/* ── Payment ── */}
        <section className="mt-8 border-t border-black/10 pt-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-black/50">Payment</p>
          <p className="mt-1.5 text-xs leading-relaxed text-black/70">
            Settled through PesaPal (M-Pesa or card).
            {inv.psp_reference ? ` Receipt reference ${inv.psp_reference}.` : ""}{" "}
            Quote {inv.invoice_number} on any payment or query.
          </p>
        </section>

        <footer className="mt-10 border-t border-black/10 pt-3 text-[10px] leading-relaxed text-black/40">
          {inv.seller_name}
          {inv.seller_pin ? ` · KRA PIN ${inv.seller_pin}` : ""}
          {SELLER_COMPANY_NUMBER ? ` · Reg. No. ${SELLER_COMPANY_NUMBER}` : ""} · Generated for{" "}
          {inv.buyer_name}. This invoice reflects the record at the time of issue.
        </footer>
      </article>
    </div>
  );
}
