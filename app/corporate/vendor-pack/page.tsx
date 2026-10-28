import type { Metadata } from "next";
import Link from "next/link";
import PortalPrintButton from "@/components/corporate/portal/PortalPrintButton";
import { sellerReadiness } from "@/lib/invoicing";

export const metadata: Metadata = {
  title: "Procurement Vendor Pack | TouchGift Corporate",
  description:
    "TouchGift corporate vendor pack — company profile, KRA PIN, tax compliance, service levels and ordering terms for procurement teams.",
  robots: { index: false, follow: false },
};

/**
 * The procurement vendor pack.
 *
 * This exists because "send us your compliance documents" is the first email a
 * corporate buyer sends, and it used to be answered by forwarding a PDF from
 * someone's inbox. The seller details come from the same env as the invoice, so
 * the pack and the tax document can never disagree.
 *
 * The compliance sections are deliberately honest: we state what is available
 * and how to verify it, rather than printing a certificate number we cannot
 * substantiate from the database.
 */

const date = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex gap-3 border-b border-black/5 py-2 text-xs">
      <dt className="w-40 shrink-0 text-black/50">{label}</dt>
      <dd className="font-medium text-black/80">{value || "—"}</dd>
    </div>
  );
}

export default function VendorPackPage() {
  const { config: seller, missing } = sellerReadiness();
  const now = new Date();

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
        <Link
          href="/corporate#packs"
          className="text-sm text-black/55 hover:text-black"
        >
          ← Back to corporate
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-black/45">
            Print or save as PDF
          </span>
          <PortalPrintButton
            className="rounded-xl px-4 py-2 text-sm font-semibold"
            style={{ background: "#1D4E6B", color: "#FFFFFF" }}
          />
        </div>
      </div>

      <article className="mx-auto max-w-[210mm] bg-white px-10 py-10 text-[#1A1410] shadow-[0_8px_40px_rgba(0,0,0,0.08)] print:max-w-none print:px-0 print:py-0 print:shadow-none">
        <header className="flex items-start justify-between gap-8 border-b border-black/10 pb-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-black/45">TouchGift Corporate</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Procurement vendor pack</h1>
            <p className="mt-2 max-w-md text-xs leading-relaxed text-black/60">
              Company profile, tax registration, service levels and ordering terms for
              procurement and vendor-onboarding teams.
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.18em] text-black/45">Issued</p>
            <p className="mt-1 font-medium">{date(now)}</p>
            <p className="mt-3 text-[10px] text-black/45">Valid until</p>
            <p className="font-medium">{date(new Date(now.getTime() + 180 * 864e5))}</p>
          </div>
        </header>

        {missing.length > 0 && (
          <div className="mt-6 border border-amber-500/40 bg-amber-50 px-4 py-3 text-[11px] leading-relaxed text-amber-900">
            <strong>Internal note:</strong> {missing.join(", ")} not configured. The
            corresponding fields are omitted from this pack. Complete them before sending
            to a buyer.
          </div>
        )}

        <section className="mt-8">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/50">
            1. Company profile
          </h2>
          <dl className="mt-2">
            <Row label="Registered name" value={seller.name} />
            <Row label="Trading name" value="TouchGift" />
            <Row label="Company registration no." value={seller.companyNumber} />
            <Row label="KRA PIN" value={seller.pin} />
            <Row
              label="VAT status"
              value={
                seller.vatRegistered
                  ? `VAT registered${seller.vatNumber ? ` — ${seller.vatNumber}` : ""}`
                  : "Not registered for VAT"
              }
            />
            <Row label="Registered address" value={seller.address} />
            <Row label="KRA tax area" value={seller.taxArea} />
            <Row label="L.R. number" value={seller.lrNumber} />
            <Row label="Email" value={seller.email} />
            <Row label="Telephone" value={seller.phone} />
          </dl>
        </section>

        <section className="mt-8">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/50">
            2. Tax & compliance
          </h2>
          <div className="mt-2 space-y-2 text-xs leading-relaxed text-black/70">
            <p>
              <strong className="text-black/85">KRA registration.</strong> Our PIN is{" "}
              {seller.pin ?? "available on request"}. The PIN can be verified against the
              KRA iTax portal.
            </p>
            <p>
              <strong className="text-black/85">Tax compliance.</strong> A current Tax
              Compliance Certificate (TCC) is available with any RFQ or vendor onboarding
              request. We do not print a TCC number in this pack unless it has been issued
              for the current period.
            </p>
            <p>
              <strong className="text-black/85">VAT.</strong>{" "}
              {seller.vatRegistered
                ? `We are registered for VAT${seller.vatNumber ? ` (${seller.vatNumber})` : ""}. VAT is charged at ${seller.vatRate}% where applicable, and tax invoices are issued on supply.`
                : "We are not registered for VAT. No VAT is charged and proformas are not tax invoices."}
            </p>
            <p>
              <strong className="text-black/85">Data protection.</strong> Recipient names,
              phone numbers and delivery addresses are collected only to fulfil the order.
              We do not sell or share them with third parties beyond the courier used for
              delivery.
            </p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/50">
            3. Service levels
          </h2>
          <div className="mt-2 overflow-hidden rounded border border-black/10">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-black/10 bg-black/[0.03] text-left">
                  <th className="px-3 py-2 font-medium text-black/60">Activity</th>
                  <th className="px-3 py-2 font-medium text-black/60">Standard service level</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Quote response", "Within 2 business hours during working hours."],
                  [
                    "Digital artwork proof",
                    "Within 1 business day of receiving usable artwork and order confirmation.",
                  ],
                  [
                    "Same-day dispatch (Nairobi)",
                    "Orders confirmed and artwork-approved before 6:00 PM, subject to stock.",
                  ],
                  [
                    "Nationwide delivery",
                    "Next business day after dispatch in major towns; remote areas may add a day.",
                  ],
                  ["Delivery confirmation", "Photo proof of delivery shared with the buyer."],
                  [
                    "Damage or shortage",
                    "Report within 48 hours of delivery; replacement or credit resolved within 2 business days.",
                  ],
                ].map(([activity, sla]) => (
                  <tr key={activity} className="border-b border-black/5 last:border-0">
                    <td className="px-3 py-2 font-medium text-black/75">{activity}</td>
                    <td className="px-3 py-2 text-black/65">{sla}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-black/45">
            These are standard service levels. The final quote confirms the delivery date
            and any seasonal cut-off for the specific order.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/50">
            4. Ordering & payment
          </h2>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-xs leading-relaxed text-black/70">
            <li>
              Share the brief, quantity, budget and delivery date. We confirm stock and
              issue a quote, usually within 2 business hours.
            </li>
            <li>
              Approve the quote and artwork proof. We issue a proforma or tax invoice as
              applicable.
            </li>
            <li>
              Pay by Paystack (M-Pesa or card) or bank transfer. LPOs are accepted for
              approved corporate accounts; payment terms are confirmed on the quote.
            </li>
            <li>
              We produce, dispatch and share photo proof of delivery. Invoices are issued
              on dispatch.
            </li>
          </ol>
          <dl className="mt-3 grid grid-cols-2 gap-x-8">
            <Row label="Currency" value="KES" />
            <Row
              label="Pricing basis"
              value={seller.pricesIncludeVat ? "VAT inclusive (where applicable)" : "VAT exclusive"}
            />
            <Row label="Proforma validity" value="14 days from issue" />
            <Row label="Delivery" value="Quoted separately per address" />
          </dl>
        </section>

        <section className="mt-8">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/50">
            5. Documents available on request
          </h2>
          <ul className="mt-2 grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-black/70">
            {[
              "KRA PIN certificate",
              "Certificate of incorporation / CR12",
              "Current Tax Compliance Certificate",
              "VAT registration certificate (where applicable)",
              "Bank details (verified by call-back)",
              "Data protection statement",
            ].map((doc) => (
              <li key={doc} className="flex gap-2">
                <span className="text-black/35">•</span>
                {doc}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 border-t border-black/10 pt-4 text-xs leading-relaxed text-black/65">
          <p className="text-[10px] uppercase tracking-[0.18em] text-black/50">Contact</p>
          <p className="mt-1.5">
            {seller.email ?? "Email available on request"}
            {seller.phone ? ` · ${seller.phone}` : ""}
          </p>
          <p className="mt-1 text-[11px] text-black/45">
            Quote the reference <span className="font-mono">VENDOR-{now.getFullYear()}</span> on
            any correspondence.
          </p>
        </section>

        <footer className="mt-10 border-t border-black/10 pt-3 text-[10px] leading-relaxed text-black/40">
          {seller.name}
          {seller.pin ? ` · KRA PIN ${seller.pin}` : ""}
          {seller.companyNumber ? ` · Reg. No. ${seller.companyNumber}` : ""} · Generated{" "}
          {date(now)}. This pack is a summary for procurement; the signed contract and
          current certificates prevail.
        </footer>
      </article>
    </div>
  );
}
