"use client";

import { useEffect } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import {
  X,
  Sparkles,
  Gift,
  Search,
  ArrowRight,
  Zap,
  Wine,
  Flower2,
  Clock,
  PenLine,
  Laptop,
  Heart,
  Briefcase,
  ChevronRight,
} from "lucide-react";

type VisualCategory = {
  title: string;
  subtitle: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  gradient: string;
};

const VISUAL_CATEGORIES: VisualCategory[] = [
  {
    title: "Gift Sets & Hampers",
    subtitle: "Curated ready-to-send boxes",
    href: "/shop?category=gift-sets",
    icon: <Gift className="w-5 h-5 text-brand" />,
    badge: "Popular",
    gradient: "from-rose-500/10 via-brand/5 to-transparent border-rose-200/50 dark:border-rose-900/30",
  },
  {
    title: "Luxury Perfumes",
    subtitle: "Authentic designer scents",
    href: "/shop?category=perfumes",
    icon: <Sparkles className="w-5 h-5 text-amber-500" />,
    badge: "Same-Day",
    gradient: "from-amber-500/10 via-yellow-500/5 to-transparent border-amber-200/50 dark:border-amber-900/30",
  },
  {
    title: "Fresh Flowers",
    subtitle: "Bouquets & celebratory vases",
    href: "/shop?category=flowers",
    icon: <Flower2 className="w-5 h-5 text-rose-500" />,
    gradient: "from-pink-500/10 via-rose-500/5 to-transparent border-pink-200/50 dark:border-pink-900/30",
  },
  {
    title: "Wine & Spirits",
    subtitle: "Toasts, champagne & liqueurs",
    href: "/shop?category=drinks",
    icon: <Wine className="w-5 h-5 text-emerald-600" />,
    gradient: "from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-200/50 dark:border-emerald-900/30",
  },
  {
    title: "Personalized Gifts",
    subtitle: "Engraved name & custom notes",
    href: "/shop?personalizable=1",
    icon: <PenLine className="w-5 h-5 text-brand-dark dark:text-brand-light" />,
    badge: "Custom",
    gradient: "from-brand/10 via-brand/5 to-transparent border-brand/20 dark:border-brand/30",
  },
  {
    title: "Clocks & Timepieces",
    subtitle: "Desk clocks & luxury watches",
    href: "/shop?category=clocks",
    icon: <Clock className="w-5 h-5 text-sky-600" />,
    gradient: "from-sky-500/10 via-blue-500/5 to-transparent border-sky-200/50 dark:border-sky-900/30",
  },
];

const BUDGET_CHIPS = [
  { label: "⚡ Under 3K", href: "/shop?budget=under-3k" },
  { label: "🎁 Under 5K", href: "/shop?budget=under-5k" },
  { label: "💎 Luxury 10K+", href: "/shop?budget=10k-plus" },
  { label: "🚀 Same-Day Delivery", href: "/shop?fast_delivery=1" },
];

const RECIPIENT_CHIPS = [
  { label: "For Her", href: "/shop?recipient=her", icon: "👩" },
  { label: "For Him", href: "/shop?recipient=him", icon: "👨" },
  { label: "Couples", href: "/shop?recipient=couples", icon: "💍" },
  { label: "Corporate", href: "/corporate", icon: "🏢" },
];

export default function MobileShopDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
  onOpenBuildSheet?: () => void;
}) {
  // Lock body scroll while open (HCI modal integrity)
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Off-canvas Visual Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shop Gifts by Category"
        className="fixed left-0 right-0 bottom-0 z-[75] flex flex-col max-h-[92vh] bg-white dark:bg-[#12121a] rounded-t-3xl border-t border-brand/10 dark:border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.25)] animate-in slide-in-from-bottom duration-300"
      >
        {/* Drag Handle Indicator */}
        <div className="w-full flex justify-center pt-3 pb-1" aria-hidden="true">
          <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-zinc-700" />
        </div>

        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white">
                Find a Gift
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Nairobi Same-Day
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
              Hand-picked collections ready to send today.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 -mr-2 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close shop drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Visual Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 pb-12">
          {/* Quick Search Jump */}
          <Link
            href="/shop"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700/80 rounded-2xl text-xs text-gray-500 dark:text-zinc-400 hover:border-brand/40 transition-all shadow-sm"
          >
            <Search className="w-4 h-4 text-brand shrink-0" />
            <span className="flex-1 truncate">Search 500+ gifts, perfumes, hampers...</span>
            <span className="text-[10px] font-semibold text-brand px-2 py-0.5 bg-brand/10 rounded-lg">
              Search
            </span>
          </Link>

          {/* Quick Filter Chips (HCI Fitts's Law) */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 mb-2">
              Fast Gifting by Budget
            </p>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {BUDGET_CHIPS.map((chip) => (
                <Link
                  key={chip.label}
                  href={chip.href}
                  onClick={onClose}
                  className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-brand/10 hover:text-brand text-xs font-semibold whitespace-nowrap text-gray-800 dark:text-zinc-200 border border-transparent transition-colors min-h-[44px] flex items-center"
                >
                  {chip.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Visual Category Grid (Show, Don't Tell - 2 Columns) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                Curated Departments
              </p>
              <Link
                href="/shop"
                onClick={onClose}
                className="text-xs font-semibold text-brand hover:underline flex items-center gap-0.5"
              >
                All categories <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {VISUAL_CATEGORIES.map((cat) => (
                <Link
                  key={cat.title}
                  href={cat.href}
                  onClick={onClose}
                  className={`group relative flex flex-col justify-between p-3.5 rounded-2xl border bg-gradient-to-br ${cat.gradient} bg-white dark:bg-zinc-900/80 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all min-h-[110px]`}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-xl bg-white/90 dark:bg-zinc-800 shadow-sm flex items-center justify-center shrink-0">
                      {cat.icon}
                    </div>
                    {cat.badge && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-brand text-white shadow-xs">
                        {cat.badge}
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <h3 className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white leading-tight group-hover:text-brand transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-[10px] text-gray-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                      {cat.subtitle}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Shop by Recipient Pills */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 mb-2">
              Who is this gift for?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {RECIPIENT_CHIPS.map((chip) => (
                <Link
                  key={chip.label}
                  href={chip.href}
                  onClick={onClose}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-850 hover:bg-white dark:hover:bg-zinc-800 text-xs font-semibold text-gray-800 dark:text-zinc-200 transition-colors min-h-[44px]"
                >
                  <span className="text-base" aria-hidden="true">{chip.icon}</span>
                  <span className="flex-1">{chip.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </Link>
              ))}
            </div>
          </div>

          {/* AI Gift Finder Teaser Banner */}
          <Link
            href="/gift-finder"
            onClick={onClose}
            className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-gradient-to-r from-brand to-brand-light text-white shadow-card group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-gold-light animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold block">Indecisive? Let AI Match the Gift</span>
              <p className="text-[10px] text-white/80 leading-snug">
                Answer 3 quick questions — get instant personalized picks in Nairobi.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-white shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* Full-width Browse All Button */}
          <Link
            href="/shop"
            onClick={onClose}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-xs uppercase tracking-wider shadow-sm hover:opacity-95 transition-opacity"
          >
            Browse Full Catalog (500+ Items)
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </aside>
    </>,
    document.body
  );
}
