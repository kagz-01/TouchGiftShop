"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Building, 
  FileCheck2, 
  CreditCard, 
  Download, 
  Copy, 
  Check, 
  CheckCircle2, 
  ShieldCheck, 
  Landmark,
  FileText
} from "lucide-react";

interface ComplianceItem {
  icon: typeof Building;
  title: string;
  subtitle: string;
  id: string;
  status: string;
}

const COMPLIANCE_ITEMS: ComplianceItem[] = [
  {
    icon: FileCheck2,
    title: "KRA PIN & Tax Compliance",
    subtitle: "P052199201A · Verified Valid",
    id: "P052199201A",
    status: "Active & Current",
  },
  {
    icon: Building,
    title: "Company Registration",
    subtitle: "TouchGift Enterprise Ltd · CR12 Ready",
    id: "CPR/2023/189921",
    status: "Registrar Certified",
  },
  {
    icon: CreditCard,
    title: "Standard Chartered Bank Wire",
    subtitle: "KSh Corporate Operations Account",
    id: "0102030405001",
    status: "Bank Verified",
  },
  {
    icon: Landmark,
    title: "M-Pesa Corporate Paybill",
    subtitle: "Direct B2B STK · Acc: Company Name",
    id: "400200",
    status: "Safaricom Cleared",
  },
];

export default function CorporateProcurementHub() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadFullPack = () => {
    // Generate text dossier for immediate procurement review
    const content = `TOUCHGIFT ENTERPRISE VENDOR & PROCUREMENT DOSSIER
=====================================================
Entity: TouchGift Kenya Ltd
Trading As: TouchGift Corporate Gifting Concierge
KRA PIN: P052199201A
Tax Compliance Cert (TCC): Active & Valid 2026/2027
Certificate of Incorporation: CPR/2023/189921
Physical Address: TouchGift Concierge Hub, Westlands, Nairobi, Kenya
Official Support Phone: +254 183 172 111
Official Email: corporate@touchgiftshop.co.ke
Payment Channels:
  - M-Pesa Paybill: 400200 (Account: Your Company Name)
  - Bank Wire: Standard Chartered Bank (Acct: 0102030405001, Branch: Westlands)
eTIMS Integration: Enabled with Automated QR Verification on all invoices
Payment Terms: Net-30 available for approved corporate PO/LPO`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "TouchGift-Corporate-Vendor-Pack.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section id="procurement" className="relative z-10 max-w-7xl mx-auto px-4 py-20 scroll-mt-20">
      <div
        className="rounded-3xl p-6 sm:p-10 lg:p-12 relative overflow-hidden bg-white dark:bg-white/[0.04] border border-surface-border dark:border-white/10 shadow-sm"
      >
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-10 pb-8 border-b border-surface-border dark:border-white/10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 text-emerald-600 bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>KRA eTIMS & Audit Compliant</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-2 text-[color:var(--corp-text)]">
              Procurement & Vendor Onboarding Hub
            </h2>
            <p className="text-xs sm:text-sm text-[color:var(--corp-text-muted)] leading-relaxed">
              Skip the 2-week vendor registration back-and-forth. Access verified KRA tax documentation, company registration, and official banking coordinates instantly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={handleDownloadFullPack}
              className="flex-1 lg:flex-none px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm bg-brand hover:bg-brand-deep text-white"
            >
              <Download className="w-4 h-4" />
              <span>Download Vendor Pack</span>
            </button>

            <Link
              href="/corporate/vendor-pack"
              target="_blank"
              className="px-5 py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border transition-all border-surface-border dark:border-white/20 text-[color:var(--corp-text)] bg-surface-secondary/40 hover:bg-surface-secondary"
            >
              <FileText className="w-4 h-4 text-brand dark:text-brand-light" />
              <span>Printable Dossier</span>
            </Link>
          </div>
        </div>

        {/* 4 Compliance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {COMPLIANCE_ITEMS.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl p-5 border flex flex-col justify-between transition-colors bg-surface-secondary/30 dark:bg-white/[0.02] border-surface-border dark:border-white/10"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                  {item.status}
                </span>
                <h4 className="text-sm font-bold mb-1 text-[color:var(--corp-text)]">
                  {item.title}
                </h4>
                <p className="text-xs text-[color:var(--corp-text-muted)] mb-3">
                  {item.subtitle}
                </p>
              </div>

              <div className="pt-3 border-t border-surface-border dark:border-white/10 flex items-center justify-between">
                <span className="font-mono text-[11px] font-semibold text-[color:var(--corp-text)] truncate max-w-[140px]">
                  {item.id}
                </span>
                <button
                  onClick={() => handleCopy(item.id, item.title)}
                  className="text-xs font-semibold px-2 py-0.5 rounded transition-colors text-brand hover:text-brand-deep dark:text-brand-light"
                >
                  {copiedKey === item.title ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Payment & Terms note */}
        <div className="mt-8 pt-6 border-t border-surface-border dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[color:var(--corp-text-muted)]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              Net-30 credit terms available for recurring enterprise accounts subject to credit sign-off.
            </span>
          </div>
          <Link
            href="/corporate/proforma"
            className="text-brand hover:underline font-semibold shrink-0 dark:text-brand-light"
          >
            Generate Instant PDF Proforma Quote →
          </Link>
        </div>
      </div>
    </section>
  );
}
