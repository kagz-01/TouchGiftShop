"use client";

import { Gift, Upload, Calculator, FileCheck, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface QuickActionBarProps {
  onNavigateTab: (tab: string) => void;
  onOpenUpload?: () => void;
}

export default function QuickActionBar({ onNavigateTab, onOpenUpload }: QuickActionBarProps) {
  const handleDownloadVendorPack = () => {
    // Generates TouchGift Corporate Vendor Pack summary
    const content = `TOUCHGIFT EAST AFRICA LTD - CORPORATE VENDOR COMPLIANCE PACK
=============================================================
Registration: CPR/2023/102910
KRA PIN: P052199201A
eTIMS Integrated: Yes (Active)
Standard Bank: Standard Chartered Bank Kenya (SCBLKENX)
M-Pesa Corporate Paybill: 400200
Physical Address: TouchGift Concierge Hub, Westlands, Nairobi
Contact: corporate@touchgiftshop.co.ke | +254 700 000 000
Services: Premium Corporate Hamper Assembly, Same-Day Nairobi Dispatch, WhatsApp Magic Link GPS Pin Intake.`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "TouchGift_Corporate_Vendor_Pack.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const actions = [
    {
      label: "Send Single Gift",
      sub: "Curate a VIP Hamper",
      icon: Gift,
      action: () => onNavigateTab("hamper"),
      primary: true,
    },
    {
      label: "Upload Recipient CSV",
      sub: "Bulk GPS Magic Links",
      icon: Upload,
      action: () => {
        if (onOpenUpload) onOpenUpload();
        else onNavigateTab("overview");
      },
      primary: false,
    },
    {
      label: "Instant Tier Quote",
      sub: "Calculate Volume Rates",
      icon: Calculator,
      action: () => onNavigateTab("quotes"),
      primary: false,
    },
    {
      label: "Download Vendor Pack",
      sub: "KRA PIN & Compliance",
      icon: FileCheck,
      action: handleDownloadVendorPack,
      primary: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <button
            key={act.label}
            onClick={act.action}
            className="group flex flex-col justify-between p-4 rounded-2xl text-left transition-all hover:-translate-y-0.5 active:scale-98 relative overflow-hidden"
            style={{
              background: act.primary ? "var(--portal-accent)" : "var(--portal-surface)",
              color: act.primary ? "var(--portal-accent-text)" : "var(--portal-text)",
              border: `1px solid ${act.primary ? "transparent" : "var(--portal-border)"}`,
              boxShadow: "var(--portal-shadow)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: act.primary ? "rgba(255,255,255,0.2)" : "var(--portal-accent-tint)",
                  color: act.primary ? "#FFFFFF" : "var(--portal-accent)",
                }}
              >
                <Icon className="w-4 h-4" />
              </div>
              <ArrowUpRight
                className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
              />
            </div>

            <div>
              <p className="text-xs font-bold leading-tight">{act.label}</p>
              <p
                className="text-[11px] mt-0.5 truncate"
                style={{
                  color: act.primary ? "rgba(255,255,255,0.8)" : "var(--portal-text-muted)",
                }}
              >
                {act.sub}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

