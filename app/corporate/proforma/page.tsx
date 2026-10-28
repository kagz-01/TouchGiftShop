import type { Metadata } from "next";
import Link from "next/link";
import PortalPrintButton from "@/components/corporate/portal/PortalPrintButton";
import ProformaAutoPrint from "@/components/corporate/ProformaAutoPrint";
import { getPack, calculatePack, clampQty } from "@/lib/corporate-packs";
import { sellerConfig } from "@/lib/invoicing";

export const metadata: Metadata = {
  title: "Proforma Invoice | TouchGift Corporate",
  description: "Indicative corporate gift pack proforma.",
  robots: { index: false, follow: false },
};

/**
 * The proforma document.
 *
 * This is deliberately a document, not a checkout: no order exists yet, no
 * payment has been taken, and the buyer's finance team needs something they can
 * file and compare. It carries the same registered seller details as the real
 * invoice, and it is explicit that it is not a tax invoice.
 *
 * Print-first, A4, no corporate chrome. The browser's print dialog is the PDF
 * generator — the same convention as app/corporate/portal/invoices/[number].
 */

const money = (n: number) =>
  `KES ${Number(n).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const date = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

function cleanRef(value: string | null) {
  if (!value) return null;
  const cleaned = value.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 24);
  return cleaned.length >= 4 ? cleaned : null;
}

export default async function ProformaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const rawTier = typeof sp.tier === "string" ? sp.tier : null;
  const pack = getPack(rawTier);
  const rawQty = typeof sp.qty === "string" ? Number(sp.qty) : 50;
  const qty = clampQty(Number.isFinite(rawQty) ? rawQty : 50);
  const quote = calculatePack(pack, qty);
  const reference = cleanRef(typeof sp.ref === "string" ? sp.ref : null) ?? "DRAFT";
  const autoPrint = sp.print === "1";
  const company = typeof sp.company === "string" ? sp.company.slice(0, 120) : null;

  const seller = sellerConfig();
  const now = new Date();
  const validUntil = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  /* Pack prices are retail, so they are VAT-inclusive when the seller is
     registered. If the business ever switches to ex-VAT pricing, the same
     `pricesIncludeVat` flag the invoice uses flips this arithmetic. */
  let net = quote.subtotal;
  let vat = 0;
  let total = quote.subtotal;

  if (seller.vatRegistered) {
    if (seller.pricesIncludeVat) {
      net = Math.round((quote.subtotal * 100) / (100 + seller.vatRate));
      vat = quote.subtotal - net;
      total = quote.subtotal;
    } else {
      net = quote.subtotal;
      vat = Math.round((quote.subtotal * seller.vatRate) / 100);
      total = quote.subtotal + vat;
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F1ED] py-8 print:bg-white print:py-0">
      <style>{`
        @page { size: A4; margin: 16mm; }
        @media print {
          .no-print { display: none !important; }
          body { background: #fff; }
        }
      `}</style>

      <ProformaAutoPrint enabled={autoPrint} />

      <div className="no-print mx-auto mb-6 flex max-w-[210mm] items-center justify-between gap-4 px-4">
        <Link
          href="/corporate#packs"
          className="text-sm text-black/55 hover:text-black"
        >
          ← Back to packs
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-black/45">
            Indicative — not a tax invoice
          </span>
          <PortalPrintButton
            className="rounded-xl px-4 py-2 text-sm font-semibold"
            style={{ background: "#1D4E6B", color: "#FFFFFF" }}
          />
        </div>
      </div>

      <article className="mx-auto max-w-[210mm] bg-white px-10 py-10 text-[#1A1410] shadow-[0_8px_40px_rgba(0,0,0,0.08)] print:max-w-none print:px-0 print:py-0 print:shadow-none">
        {/* ── Header ── */}
        <header className="flex items-start justify-between gap-8 border-b border-black/10 pb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{seller.name}</h1>
            {seller.address && (
              <p className="mt-2 max-w-xs text-xs leading-relaxed text-black/60">{seller.address}</p>
            )}
            <dl className="mt-3 space-y-0.5 text-[11px] text-black/60">
              {seller.pin && (
                <div className="flex gap-2">
                  <dt className="w-24">KRA PIN</dt>
                  <dd className="font-medium text-black/80">{seller.pin}</dd>
                </div>
              )}
              {seller.vatRegistered && seller.vatNumber && (
                <div className="flex gap-2">
                  <dt className="w-24">VAT No.</dt>
                  <dd className="font-medium text-black/80">{seller.vatNumber}</dd>
                </div>
              )}
              {seller.email && (
                <div className="flex gap-2">
                  <dt className="w-24">Email</dt>
                  <dd>{seller.email}</dd>
                </div>
              )}
              {seller.companyNumber && (
                <div className="flex gap-2">
                  <dt className="w-24">Reg. No.</dt>
                  <dd className="font-medium text-black/80">{seller.companyNumber}</dd>
                </div>
              )}
              {seller.phone && (
                <div className="flex gap-2">
                  <dt className="w-24">Telephone</dt>
                  <dd>{seller.phone}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="text-right">
            <p className="text-[11px] uppercase tracking-[0.2em] text-black/50">Proforma invoice</p>
            <p className="mt-1 font-mono text-lg font-semibold">{reference}</p>
            <dl className="mt-3 space-y-0.5 text-[11px] text-black/60">
              <div className="flex justify-end gap-3">
                <dt>Date</dt>
                <dd className="font-medium text-black/80">{date(now)}</dd>
              </div>
              <div className="flex justify-end gap-3">
                <dt>Valid until</dt>
                <dd className="font-medium text-black/80">{date(validUntil)}</dd>
              </div>
            </dl>
          </div>
        </header>

        {/* ── Buyer / note ── */}
        <section className="mt-6 grid grid-cols-2 gap-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-black/50">Prepared for</p>
            <p className="mt-1.5 border-b border-dashed border-black/25 pb-1 font-medium">
              {company || "\u00A0"}
            </p>
            {!company && (
              <p className="mt-1 text-[10px] text-black/40">Company name to be completed by the buyer.</p>
            )}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-black/50">Order reference</p>
            <dl className="mt-1.5 space-y-1 text-xs text-black/70">
              <div className="flex gap-3">
                <dt className="w-24 text-black/50">Pack</dt>
                <dd>{pack.name}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-24 text-black/50">Boxes</dt>
                <dd>{quote.qty}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-24 text-black/50">Delivery</dt>
                <dd>Quoted separately</dd>
              </div>
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
              <th className="px-3 py-2 text-right font-medium text-[10px] uppercase tracking-[0.14em] text-black/50">
                Qty
              </th>
              <th className="px-3 py-2 text-right font-medium text-[10px] uppercase tracking-[0.14em] text-black/50">
                Unit
              </th>
              <th className="py-2 pl-3 text-right font-medium text-[10px] uppercase tracking-[0.14em] text-black/50">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-black/5">
              <td className="py-3 pr-3">
                <p className="font-medium">{pack.name} gift pack</p>
                <p className="mt-0.5 text-[11px] text-black/50">{pack.bestFor}</p>
              </td>
              <td className="px-3 text-right tabular-nums text-black/70">{quote.qty}</td>
              <td className="px-3 text-right tabular-nums text-black/70">{money(pack.price)}</td>
              <td className="pl-3 text-right tabular-nums">{money(quote.listTotal)}</td>
            </tr>
            {quote.savings > 0 && (
              <tr className="border-b border-black/5">
                <td className="py-3 pr-3 text-black/60">
                  Volume discount ({quote.band.pct}% on {quote.qty} boxes)
                </td>
                <td className="px-3 text-right tabular-nums text-black/60">1</td>
                <td className="px-3 text-right tabular-nums text-black/60">
                  − {money(quote.savings)}
                </td>
                <td className="pl-3 text-right tabular-nums text-emerald-700">
                  − {money(quote.savings)}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ── Totals ── */}
        <section className="mt-6 flex justify-end">
          <dl className="w-full max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-black/60">Net amount</dt>
              <dd className="tabular-nums">{money(net)}</dd>
            </div>
            {seller.vatRegistered ? (
              <div className="flex justify-between">
                <dt className="text-black/60">VAT ({seller.vatRate}%)</dt>
                <dd className="tabular-nums">{money(vat)}</dd>
              </div>
            ) : (
              <p className="text-[11px] leading-relaxed text-black/50">
                The seller is not registered for VAT. No VAT has been charged and this
                proforma is not a tax invoice.
              </p>
            )}
            <div className="flex justify-between border-t border-black/20 pt-2 text-base font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums">{money(total)}</dd>
            </div>
          </dl>
        </section>

        {/* ── Terms ── */}
        <section className="mt-8 border-t border-black/10 pt-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-black/50">Terms</p>
          <ul className="mt-1.5 space-y-1 text-[11px] leading-relaxed text-black/65">
            <li>
              This is an indicative proforma, not a tax invoice. Final pricing confirms
              stock, branding, artwork and delivery.
            </li>
            <li>
              Valid for 14 days from the date above. Delivery is quoted separately and
              confirmed against the delivery address.
            </li>
            <li>
              Payment by Paystack (M-Pesa or card) or bank transfer. LPOs accepted for
              approved corporate accounts. Payment terms are confirmed on the final quote.
            </li>
            <li>
              Branding: one logo, one position is included unless the final quote says
              otherwise. A digital proof is issued before production.
            </li>
          </ul>
        </section>

        <footer className="mt-10 border-t border-black/10 pt-3 text-[10px] leading-relaxed text-black/40">
          {seller.name}
          {seller.pin ? ` · KRA PIN ${seller.pin}` : ""}
          {seller.companyNumber ? ` · Reg. No. ${seller.companyNumber}` : ""} · Quote {reference} on
          any payment or query. Generated {date(now)}.
        </footer>
      </article>
    </div>
  );
}
