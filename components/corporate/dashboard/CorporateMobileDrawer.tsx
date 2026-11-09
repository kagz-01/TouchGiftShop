"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { createPortal } from "react-dom";
import {
  X,
  Building2,
  Package,
  Sparkles,
  LayoutDashboard,
  CalendarDays,
  FileText,
  MessageCircle,
  Store,
  ArrowRight,
  Sun,
  Moon,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useTheme } from "@/components/ui/ThemeProvider";

interface CorporateMobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

const CORP_NAV_ITEMS = [
  {
    href: "/corporate",
    label: "Corporate Home",
    desc: "B2B overview, packaging & volume discounts",
    icon: <Building2 className="w-5 h-5 text-brand dark:text-brand-light" />,
  },
  {
    href: "/corporate/catalog",
    label: "Corporate Catalog",
    desc: "500+ brandable gifts with wholesale MOQ",
    icon: <Package className="w-5 h-5 text-amber-500" />,
    badge: "500+ Items",
  },
  {
    href: "/corporate/showroom",
    label: "Virtual Showroom",
    desc: "Digital proofs, mockup builder & samples",
    icon: <Sparkles className="w-5 h-5 text-sky-500" />,
  },
  {
    href: "/corporate/dashboard",
    label: "Client Dashboard",
    desc: "Active orders, quotes & team delivery tracking",
    icon: <LayoutDashboard className="w-5 h-5 text-emerald-500" />,
  },
  {
    href: "/corporate/dashboard?tab=milestones",
    label: "Milestones & Anniversaries",
    desc: "Automated workiversaries & employee birthdays",
    icon: <CalendarDays className="w-5 h-5 text-rose-500" />,
  },
  {
    href: "/corporate/proforma",
    label: "Proforma Invoice & LPO",
    desc: "Instant quotation for corporate procurement",
    icon: <FileText className="w-5 h-5 text-brand dark:text-brand-light" />,
  },
  {
    href: "/corporate/vendor-pack",
    label: "Vendor Pack & Compliance",
    desc: "Official KRA PIN, bank details & procurement pack",
    icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
  },
];

export default function CorporateMobileDrawer({ open, onClose }: CorporateMobileDrawerProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || typeof window === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Corporate Navigation Menu"
      className="fixed inset-0 z-[999] flex justify-start bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[340px] bg-white dark:bg-[#11111a] h-full shadow-2xl flex flex-col overflow-hidden border-r border-gray-100 dark:border-white/10 animate-in slide-in-from-left duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/10 shrink-0 bg-gray-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo/logo.webp"
              alt="TouchGift Logo"
              width={36}
              height={36}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-brand/20"
            />
            <div>
              <p className="font-display font-bold text-base leading-tight text-gray-900 dark:text-white">
                TouchGift
              </p>
              <p className="text-[10px] text-brand font-bold uppercase tracking-wider">
                Corporate Tier
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-12">
          {/* Core Routes */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 mb-2 px-1">
              Corporate Workspace
            </p>
            <div className="space-y-1">
              {CORP_NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-start gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group min-h-[52px]"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-brand transition-colors">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-zinc-400 leading-snug line-clamp-1 mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 self-center opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* Direct B2B Support */}
          <div className="pt-2 border-t border-gray-100 dark:border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 mb-2 px-1">
              Concierge & Procurement
            </p>
            <a
              href="https://wa.me/254183172111?text=Hi%20TouchGift!%20I'd%20like%20to%20discuss%20a%20corporate%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/15 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold leading-tight">WhatsApp Corporate Desk</p>
                <p className="text-[10px] opacity-80 mt-0.5">Direct chat with account manager</p>
              </div>
            </a>
          </div>

          {/* Switch to Main Retail Gift Shop */}
          <div className="pt-2 border-t border-gray-100 dark:border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 mb-2 px-1">
              Personal Gifting
            </p>
            <Link
              href="/"
              onClick={onClose}
              className="flex items-center gap-3 p-3 rounded-2xl bg-brand/10 text-brand dark:text-brand-light border border-brand/20 hover:bg-brand/15 transition-colors group"
            >
              <div className="w-9 h-9 rounded-xl bg-brand text-white flex items-center justify-center shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold leading-tight">Exit to Retail Gift Shop</p>
                <p className="text-[10px] text-gray-500 dark:text-zinc-400 mt-0.5">Switch to personal orders & delivery</p>
              </div>
              <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Theme switch in drawer footer */}
          <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-gray-600 dark:text-zinc-400">
              Appearance
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs font-semibold text-gray-800 dark:text-zinc-200"
            >
              {isDark ? <Moon className="w-3.5 h-3.5 text-amber-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
              <span>{isDark ? "Dark Mode" : "Light Mode"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

