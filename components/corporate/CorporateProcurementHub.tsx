"use client";

import { useState } from "react";
import { ShieldCheck, Download, FileText, CheckCircle2, Copy, Building, CreditCard, ExternalLink, Printer } from "lucide-react";
import Link from "next/link";

const COMPLIANCE_ITEMS = [
  {
    title: "KRA Tax Compliance Certificate",
    subtitle: "Active & Verified for 2026",
    id: "KRA-TCC-2026-99120",
    status: "Verified Active",
  },
  {
    title: "KRA PIN Certificate",
    subtitle: "PIN: P052199201A",
    id: "P052199201A",
    status: "eTIMS Integrated",
  },
  {
    title: "Certificate of Incorporation",
    subtitle: "Reg: CPR/2023/102910",
    id: "TouchGift East Africa Ltd",
    status: "Fully Registered",
  },
  {
    title: "Corporate Banking & Paybill",
    subtitle: "Standard Chartered (SCBLKENX) / Paybill 400200",
    id: "SCB: 0102839201900",
    status: "Verified Account",
  },
];

export default function CorporateProcurementHub() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDownloadFullPack = () => {
    const pack = `TOUCHGIFT EAST AFRICA LTD — CORPORATE VENDOR COMPLIANCE PACK
=============================================================
Date of Issue: October 2026
Registration Number: CPR/2023/102910
KRA PIN: P052199201A
KRA eTIMS Serial Engine: Active & Integrated
VAT Registered: Yes (16% Standard VAT Rate)

BANKING & SETTLEMENT DETAILS:
Bank: Standard Chartered Bank Kenya
Branch: Westlands, Nairobi
Account Name: TouchGift East Africa Ltd
Account Number: 0102839201900
Swift Code: SCBLKENX
Corporate M-Pesa Paybill: 400200
Account Reference: [Your Invoice Number / LPO]

OPERATIONAL & QUALITY SLA:
• Same-day delivery within Nairobi for confirmed dispatches
• Next-day delivery for major Kenyan towns (Mombasa, Kisumu, Nakuru, Eldoret)
• 100% replacement guarantee for fragile or damaged goods during transit
• Non-disclosure & recipient phone number privacy compliance

CONTACT PROCUREMENT DESK:
Email: corporate@touchgiftshop.co.ke
Phone: +254 700 000 000
Physical Address: TouchGift Concierge Hub, Westlands, Nairobi, Kenya`;

    const blob = new Blob([pack], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "TouchGift_Corporate_Vendor_Pack_2026.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <section id="procurement" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-20">
      <div
        className="rounded-3xl p-8 sm:p-12 transition-all relative overflow-hidden"
        style={{
          background: "var(--corp-hero-card, var(--portal-surface, #FFFFFF))",
          border: "1px solid var(--corp-hero-border, rgba(155, 27, 90, 0.2))",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.05)",
        }}
      >
        {/* Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--corp-hero-gold,#D4A853)]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-10 pb-8 border-b" style={{ borderColor: "var(--corp-hero-border, rgba(155, 27, 90, 0.1))" }}>
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 text-emerald-600 bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>KRA eTIMS & Audit Compliant</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-2 text-[color:var(--corp-hero-text)]">
              Procurement & Vendor Onboarding Hub
            </h2>
            <p className="text-xs sm:text-sm text-[color:var(--corp-text-muted)] leading-relaxed">
              Skip the 2-week vendor registration back-and-forth. Access verified KRA tax documentation, company registration, and official banking coordinates instantly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={handleDownloadFullPack}
              className="flex-1 lg:flex-none px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm"
              style={{
                background: "var(--corp-hero-accent, #9B1B5A)",
                color: "#FFFFFF",
              }}
            >
              <Download className="w-4 h-4" />
              <span>Download Vendor Pack</span>
            </button>

            <Link
              href="/corporate/vendor-pack"
              target="_blank"
              className="px-5 py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border transition-all"
              style={{
                borderColor: "var(--corp-hero-border, rgba(155, 27, 90, 0.2))",
                color: "var(--corp-hero-text)",
                background: "var(--portal-surface-2, rgba(155, 27, 90, 0.04))",
              }}
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Pack</span>
            </Link>
          </div>
        </div>

        {/* 4 Compliance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {COMPLIANCE_ITEMS.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl p-5 border flex flex-col justify-between transition-colors"
              style={{
                background: "var(--portal-surface-2, rgba(0, 0, 0, 0.02))",
                borderColor: "var(--corp-hero-border, rgba(155, 27, 90, 0.1))",
              }}
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                  {item.status}
                </span>
                <h4 className="text-sm font-bold mb-1 text-[color:var(--corp-hero-text)]">
                  {item.title}
                </h4>
                <p className="text-xs text-[color:var(--corp-text-muted)] mb-3">
                  {item.subtitle}
                </p>
              </div>

              <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: "var(--corp-hero-border, rgba(155, 27, 90, 0.08))" }}>
                <span className="font-mono text-[11px] font-semibold text-[color:var(--corp-hero-text)] truncate max-w-[140px]">
                  {item.id}
                </span>
                <button
                  onClick={() => handleCopy(item.id, item.title)}
                  className="text-xs font-semibold px-2 py-0.5 rounded transition-colors"
                  style={{
                    color: "var(--corp-hero-accent, #9B1B5A)",
                  }}
                >
                  {copiedKey === item.title ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Payment & Terms note */}
        <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs" style={{ borderColor: "var(--corp-hero-border, rgba(155, 27, 90, 0.1))", color: "var(--corp-text-muted)" }}>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>Corporate M-Pesa Paybill: <strong>400200</strong> · LPO / Purchase Order terms available for verified corporate clients</span>
          </div>
          <a
            href="mailto:corporate@touchgiftshop.co.ke?subject=Corporate%20Vendor%20Onboarding"
            className="font-bold underline hover:no-underline"
            style={{ color: "var(--corp-hero-accent, #9B1B5A)" }}
          >
            Request Supplier Registration Form →
          </a>
        </div>
      </div>
    </section>
  );
}
