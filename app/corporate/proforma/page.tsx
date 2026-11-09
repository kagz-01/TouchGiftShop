import type { Metadata } from "next";
import Link from "next/link";
import PortalPrintButton from "@/components/corporate/PortalPrintButton";
import ProformaAutoPrint from "@/components/corporate/ProformaAutoPrint";
import { getPack, calculatePack, clampQty } from "@/lib/corporate-packs";
import { sellerConfig } from "@/lib/invoicing";
import { amountInWords } from "@/lib/money-words";
import { createClient } from "@supabase/supabase-js";

export const metadata: Metadata = {
  title: "Official Quotation | Touchline Branding",
  description: "Official corporate quotation and proforma document from Touchline Branding Limited.",
  robots: { index: false, follow: false },
};

const money = (n: number) =>
  `KES ${Number(n).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const dateStr = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const stampDateStr = (d: Date) => {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

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
  const autoPrint = sp.print === "1";
  const seller = sellerConfig();
  const now = new Date();
  const validUntil = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  // Check if a quote_id was provided
  const quoteId = typeof sp.quote_id === "string" ? sp.quote_id : null;
  let quoteRow: {
    id: string;
    product_name: string;
    company_name: string;
    email: string;
    phone: string | null;
    category: string | null;
    quantity: number;
    quoted_amount: number | null;
    total_estimate: number | null;
    notes: string | null;
    valid_until: string | null;
  } | null = null;

  if (quoteId && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
      const { data } = await sb
        .from("corporate_quote_requests")
        .select("id, product_name, company_name, email, phone, category, quantity, quoted_amount, total_estimate, notes, valid_until")
        .eq("id", quoteId)
        .maybeSingle();
      if (data) quoteRow = data;
    } catch {
      // Proceed with searchParam fallbacks
    }
  }

  // Derive item details
  let title = "Corporate Gift Pack";
  let description = "Custom Corporate Order";
  let quantity = 50;
  let unitPrice = 0;
  let subtotal = 0;
  let discount = 0;
  let company = typeof sp.company === "string" ? sp.company.slice(0, 120) : null;
  let reference = cleanRef(typeof sp.ref === "string" ? sp.ref : null);

  if (quoteRow) {
    title = quoteRow.product_name;
    description = quoteRow.notes || (quoteRow.category ? `Category: ${quoteRow.category}` : "Bespoke corporate merchandise & branding");
    quantity = quoteRow.quantity || 1;
    const totalAmount = quoteRow.quoted_amount ?? quoteRow.total_estimate ?? 0;
    subtotal = totalAmount;
    unitPrice = quantity > 0 ? Math.round(subtotal / quantity) : subtotal;
    if (!company) company = quoteRow.company_name;
    if (!reference) reference = `TBR-Q-${quoteRow.id.slice(0, 8).toUpperCase()}`;
  } else {
    const rawTier = typeof sp.tier === "string" ? sp.tier : null;
    const pack = getPack(rawTier);
    const rawQty = typeof sp.qty === "string" ? Number(sp.qty) : 50;
    quantity = clampQty(Number.isFinite(rawQty) ? rawQty : 50);
    const packQuote = calculatePack(pack, quantity);
    title = `${pack.name} Gift Pack`;
    description = pack.bestFor;
    unitPrice = pack.price;
    subtotal = packQuote.listTotal;
    discount = packQuote.savings;
    if (!reference) reference = `TBR-Q-${now.getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
  }

  const netAfterDiscount = Math.max(0, subtotal - discount);

  // VAT calculations
  let net = netAfterDiscount;
  let vat = 0;
  let total = netAfterDiscount;

  if (seller.vatRegistered) {
    if (seller.pricesIncludeVat) {
      net = Math.round((netAfterDiscount * 100) / (100 + seller.vatRate));
      vat = netAfterDiscount - net;
      total = netAfterDiscount;
    } else {
      net = netAfterDiscount;
      vat = Math.round((netAfterDiscount * seller.vatRate) / 100);
      total = netAfterDiscount + vat;
    }
  }

  const words = amountInWords(total);

  return (
    <div className="min-h-screen bg-[#F4F1ED] py-8 print:bg-white print:py-0">
      <style>{`
        @page { size: A4; margin: 12mm; }
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          article { box-shadow: none !important; padding: 0 !important; }
        }
      `}</style>

      <ProformaAutoPrint enabled={autoPrint} />

      {/* ── Top Bar (Screen Only) ── */}
      <div className="no-print mx-auto mb-6 flex max-w-[210mm] items-center justify-between gap-4 px-4 flex-wrap">
        <Link
          href="/corporate/dashboard?tab=quotes"
          className="text-sm text-gray-700 hover:text-black font-semibold flex items-center gap-1.5"
        >
          ← Back to Quotes
        </Link>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <Link
            href={`/corporate/dashboard?tab=orders&ref=${reference}`}
            className="rounded-xl px-3.5 py-2 text-xs font-bold border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span>Proceed with LPO</span>
          </Link>
          <a
            href={`https://wa.me/254722668696?text=${encodeURIComponent(
              `Hi Touchline Branding! Here is our approved Quotation (${reference}) for ${company || "our organization"} (${quantity} units, ${money(total)}). Please proceed with artwork proof and production.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl px-3.5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span>Share via WhatsApp</span>
          </a>
          <PortalPrintButton
            className="rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold shadow-xs"
            style={{ background: "#9B1B5A", color: "#FFFFFF" }}
          />
        </div>
      </div>

      {/* ── TouchDesk Paper Document ── */}
      <article className="mx-auto max-w-[210mm] bg-white px-8 sm:px-10 py-10 text-[#1A1410] shadow-[0_8px_40px_rgba(0,0,0,0.08)] rounded-2xl print:max-w-none print:px-0 print:py-0 print:shadow-none print:rounded-none">
        {/* ── Letterhead ── */}
        <header className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-gray-200 pb-5">
          <div>
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/branding-dark.png"
                alt="Touchline Branding"
                className="h-16 w-auto max-w-72 object-contain"
              />
            </div>
            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-gray-900">{seller.name}</p>
            <p className="text-xs text-gray-600 leading-relaxed">
              {seller.address}
            </p>
            <p className="text-xs text-gray-600">
              Tel: <span className="font-semibold text-gray-900">{seller.phone}</span>
            </p>
            <p className="text-xs text-gray-600">
              {seller.email} · touchlineltd.co.ke
            </p>
            <p className="mt-1 text-xs font-bold tracking-wide text-[#9B1B5A] uppercase">
              YOUR IMAGE . YOUR SUCCESS
            </p>
            <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-600">
              {seller.pin ? (
                <p>
                  KRA PIN: <span className="font-mono font-semibold text-gray-900">{seller.pin}</span>
                </p>
              ) : null}
              {seller.companyNumber ? (
                <p>
                  Reg No: <span className="font-mono font-semibold text-gray-900">{seller.companyNumber}</span>
                </p>
              ) : null}
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block rounded-lg bg-[#c4962c] px-4 py-1.5 text-xs sm:text-sm font-black uppercase tracking-widest text-[#1c1914] shadow-xs">
              OFFICIAL QUOTATION
            </span>
            <h1 className="mt-2 font-mono text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
              {reference}
            </h1>
            <p className="mt-1 text-xs text-gray-500 font-medium">TouchGift Corporate Storefront</p>
          </div>
        </header>

        {/* ── Metadata Grid ── */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-3 text-sm">
            <div className="flex justify-between gap-4 py-1 border-b border-gray-200/60">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Client</span>
              <span className="text-right font-semibold text-gray-900">{company || "Client Organization"}</span>
            </div>
            <div className="flex justify-between gap-4 py-1 border-b border-gray-200/60">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Project</span>
              <span className="text-right font-medium text-gray-900 truncate max-w-[200px]">{title}</span>
            </div>
            <div className="flex justify-between gap-4 py-1 border-b border-gray-200/60">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Reference</span>
              <span className="text-right font-mono font-medium text-gray-900">{reference}</span>
            </div>
            <div className="flex justify-between gap-4 py-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Division</span>
              <span className="text-right font-medium text-[#9B1B5A]">Corporate Branding &amp; Gifts</span>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-3 text-sm">
            <div className="flex justify-between gap-4 py-1 border-b border-gray-200/60">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Date</span>
              <span className="text-right font-medium text-gray-900">{dateStr(now)}</span>
            </div>
            <div className="flex justify-between gap-4 py-1 border-b border-gray-200/60">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Valid Until</span>
              <span className="text-right font-semibold text-amber-700">{dateStr(validUntil)}</span>
            </div>
            <div className="flex justify-between gap-4 py-1 border-b border-gray-200/60">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Prepared By</span>
              <span className="text-right font-medium text-gray-900">Touchline Corporate Desk</span>
            </div>
            <div className="flex justify-between gap-4 py-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Tax Basis</span>
              <span className="text-right font-medium text-gray-900">
                {seller.vatRegistered ? "VAT Inclusive (16%)" : "VAT Exempt"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Line Items Table ── */}
        <table className="mt-6 w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100/80 border-y border-gray-200">
              <th className="border-x border-gray-200 px-3 py-2.5 text-left font-bold text-xs uppercase tracking-wide text-gray-800 w-12">
                No.
              </th>
              <th className="border-r border-gray-200 px-3 py-2.5 text-left font-bold text-xs uppercase tracking-wide text-gray-800">
                Description &amp; Specification
              </th>
              <th className="border-r border-gray-200 px-3 py-2.5 text-right font-bold text-xs uppercase tracking-wide text-gray-800 w-20">
                Qty
              </th>
              <th className="border-r border-gray-200 px-3 py-2.5 text-center font-bold text-xs uppercase tracking-wide text-gray-800 w-16">
                Unit
              </th>
              <th className="border-r border-gray-200 px-3 py-2.5 text-right font-bold text-xs uppercase tracking-wide text-gray-800 w-32">
                Unit Price
              </th>
              <th className="border-r border-gray-200 px-3 py-2.5 text-right font-bold text-xs uppercase tracking-wide text-gray-800 w-36">
                Total (KES)
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-50/50 transition-colors">
              <td className="border border-gray-200 px-3 py-3 text-gray-500 text-center font-medium">1</td>
              <td className="border border-gray-200 px-3 py-3">
                <span className="font-bold text-gray-900">{title}</span>
                <span className="block text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</span>
                <span className="inline-block text-[10px] font-semibold text-[#9B1B5A] mt-1 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                  Includes custom branding proof &amp; corporate packaging
                </span>
              </td>
              <td className="border border-gray-200 px-3 py-3 text-right tabular-nums font-semibold text-gray-900">
                {quantity}
              </td>
              <td className="border border-gray-200 px-3 py-3 text-center text-gray-500">pcs</td>
              <td className="border border-gray-200 px-3 py-3 text-right tabular-nums font-medium text-gray-800">
                {money(unitPrice)}
              </td>
              <td className="border border-gray-200 px-3 py-3 text-right tabular-nums font-bold text-gray-900">
                {money(subtotal)}
              </td>
            </tr>
            {discount > 0 && (
              <tr className="border border-gray-200 bg-emerald-50/40">
                <td className="border border-gray-200 px-3 py-2 text-center text-emerald-800 text-xs font-bold">—</td>
                <td className="border border-gray-200 px-3 py-2 text-xs font-semibold text-emerald-800" colSpan={4}>
                  Corporate Volume Discount Tier
                </td>
                <td className="border border-gray-200 px-3 py-2 text-right tabular-nums font-bold text-emerald-700">
                  − {money(discount)}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ── Totals Block ── */}
        <div className="mt-5 ml-auto w-full max-w-sm rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 text-sm">
          <div className="flex justify-between gap-4 py-1">
            <span className="text-gray-600">Subtotal</span>
            <span className="tabular-nums font-semibold text-gray-900">{money(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between gap-4 py-1 border-t border-gray-200 text-emerald-700">
              <span>Volume Discount</span>
              <span className="tabular-nums font-semibold">− {money(discount)}</span>
            </div>
          )}
          <div className="flex justify-between gap-4 py-1 border-t border-gray-200 text-gray-600">
            <span>Net (excl. VAT)</span>
            <span className="tabular-nums font-semibold text-gray-900">{money(net)}</span>
          </div>
          <div className="flex justify-between gap-4 py-1 border-t border-gray-200 text-gray-600">
            <span>VAT (16%)</span>
            <span className="tabular-nums font-semibold text-gray-900">{money(vat)}</span>
          </div>
          <div className="flex justify-between gap-4 py-2 border-t-2 border-gray-300 text-base font-black text-gray-900">
            <span>Grand Total</span>
            <span className="tabular-nums text-[#9B1B5A]">{money(total)}</span>
          </div>
        </div>

        {/* ── Amount In Words ── */}
        <div className="mt-4 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3.5 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800 mb-0.5">Amount in Words</p>
          <p className="text-xs font-bold text-gray-900 italic">{words}</p>
        </div>

        {/* ── Terms & Conditions (TouchDesk Protocol) ── */}
        <section className="mt-6 border-t border-gray-200 pt-4 text-xs">
          <h2 className="font-bold uppercase tracking-wider text-gray-700 mb-2">Terms &amp; Conditions</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-gray-600 leading-relaxed">
            <li className="flex items-start gap-1.5">
              <span className="text-[#9B1B5A] font-bold">•</span>
              <span><strong>50% deposit</strong> upon quote confirmation. Balance payable upon delivery.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-[#9B1B5A] font-bold">•</span>
              <span>Lead time commences upon receipt of deposit and formal client artwork approval.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-[#9B1B5A] font-bold">•</span>
              <span>All prices include standard 16% VAT unless an official VAT exemption certificate is provided.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-[#9B1B5A] font-bold">•</span>
              <span>This quotation remains valid for <strong>14 days</strong> from the date of issue.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-[#9B1B5A] font-bold">•</span>
              <span>Deliveries within Nairobi CBD and industrial zone included on bulk orders; regional dispatch quoted on request.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-[#9B1B5A] font-bold">•</span>
              <span>Errors and omissions excepted (E&amp;OE).</span>
            </li>
          </ul>
        </section>

        {/* ── Payment Block (TouchDesk Standard) ── */}
        <section className="mt-5 grid gap-3 sm:grid-cols-2 text-xs">
          <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-3.5">
            <h3 className="font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5 mb-2">
              🏛️ Bank Payment Details
            </h3>
            <p className="font-semibold text-gray-900">Family Bank · Donholm Branch</p>
            <p className="text-gray-500">P.O. Box 74145-0020 Nairobi</p>
            <p className="text-gray-600 mt-1">A/C Name: <span className="font-semibold text-gray-900">TOUCHLINE BRANDING LIMITED</span></p>
            <p className="font-mono font-bold text-gray-900 text-sm mt-0.5">A/C No: 033000036952</p>
            <p className="text-gray-500 text-[11px]">Bank Code: 70-033</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-3.5">
            <h3 className="font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5 mb-2">
              📱 M-Pesa Lipa Na M-Pesa
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-gray-600">Business No / Paybill:</span>
              <span className="font-mono text-base font-black text-gray-900">222111</span>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-gray-600">Account No:</span>
              <span className="font-mono font-bold text-gray-900">2058527</span>
            </div>
            <p className="text-gray-600 mt-1 font-medium">Account Name: TOUCHLINE BRANDING</p>
            <p className="text-gray-500 text-[11px]">Corporate Helpdesk: 0703 095 445 / +254 722 668 696</p>
          </div>
        </section>

        {/* ── Company Authority Stamp & Signature ── */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-800 mb-2">
              For Touchline Branding Ltd
            </p>
            <div className="flex items-center gap-4">
              <div className="relative inline-block border border-blue-900/20 bg-blue-50/30 p-2 rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/stamp-auth.png"
                  alt="Touchline Authorised Signature"
                  className="h-16 w-auto object-contain"
                />
                <span className="absolute bottom-3 right-4 font-mono text-[10px] font-bold text-blue-900">
                  {stampDateStr(now)}
                </span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/stamp-round.png"
                alt="Touchline Branding Company Seal"
                className="h-20 w-auto object-contain"
              />
            </div>
          </div>

          {/* ── Customer Acceptance / Stamp Box ── */}
          <div className="w-full sm:w-auto min-w-[280px] rounded-xl border border-dashed border-gray-300 bg-gray-50/40 p-4 text-xs">
            <p className="font-bold uppercase tracking-wider text-gray-700 mb-2">
              Customer Acceptance &amp; Stamp
            </p>
            <div className="space-y-1.5 text-gray-600">
              <p>Accepted By: <span className="border-b border-gray-300 inline-block w-40">&nbsp;</span></p>
              <p>Date: <span className="border-b border-gray-300 inline-block w-40">&nbsp;</span></p>
              <p>Signature: <span className="border-b border-gray-300 inline-block w-40">&nbsp;</span></p>
              <p>LPO No: <span className="border-b border-gray-300 inline-block w-40">&nbsp;</span></p>
            </div>
            <div className="mt-3 border border-gray-200 bg-white rounded-lg p-3 text-center text-gray-400 text-[10px]">
              Customer Official Stamp
            </div>
          </div>
        </div>

        {/* ── Document Footer ── */}
        <footer className="mt-8 border-t border-gray-200 pt-3 text-center text-[11px] text-gray-500">
          <span className="font-semibold text-gray-800">{seller.name}</span> · {seller.slogan || "YOUR IMAGE . YOUR SUCCESS"} · touchlineltd.co.ke · {seller.phone}
        </footer>
      </article>
    </div>
  );
}
