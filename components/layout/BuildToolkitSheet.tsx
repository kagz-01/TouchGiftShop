"use client";

import { useEffect } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import {
  X,
  Gift,
  Users,
  Store,
  CreditCard,
  PenLine,
  Target,
  ArrowRight,
  Sparkles,
  ChevronRight,
  PackageCheck,
  CheckCircle2,
} from "lucide-react";

type BuildCard = {
  href: string;
  badge: string;
  title: string;
  description: string;
  actionText: string;
  icon: React.ReactNode;
  gradient: string;
};

const BUILD_CARDS: BuildCard[] = [
  {
    href: "/gift-lab/build-hamper",
    badge: "Most Popular",
    title: "Build a Custom Hamper",
    description: "Choose luxury gift box, ribbon, message card & hand-picked items.",
    actionText: "Assemble Hamper",
    icon: <Gift className="w-5 h-5 text-brand" />,
    gradient: "from-brand/10 via-rose-500/5 to-transparent border-brand/20",
  },
  {
    href: "/pool/create",
    badge: "Group Gifting",
    title: "Pool a Gift Together",
    description: "Invite friends or coworkers with a wax-sealed link. Everyone chips in via M-Pesa.",
    actionText: "Create Group Pool",
    icon: <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
    gradient: "from-amber-500/10 via-yellow-500/5 to-transparent border-amber-200/50 dark:border-amber-900/30",
  },
  {
    href: "/shop?personalizable=1",
    badge: "Custom Laser",
    title: "Personalize with Name",
    description: "Laser-engraved bottles, monogrammed notebooks, printed mugs & tumblers.",
    actionText: "Customize Gifts",
    icon: <PenLine className="w-5 h-5 text-sky-600 dark:text-sky-400" />,
    gradient: "from-sky-500/10 via-blue-500/5 to-transparent border-sky-200/50 dark:border-sky-900/30",
  },
  {
    href: "/gift-cards",
    badge: "Delivered in 30s",
    title: "Digital Gift Cards",
    description: "Can't decide? Let them choose their own luxury gift. Delivered via SMS & WhatsApp.",
    actionText: "Send Gift Card",
    icon: <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
    gradient: "from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-200/50 dark:border-emerald-900/30",
  },
  {
    href: "/corporate/catalog",
    badge: "B2B & Teams",
    title: "Corporate & Bulk Gifting",
    description: "Brandable client gifts, onboarding hampers, instant proforma invoices & LPO support.",
    actionText: "Corporate Catalog",
    icon: <Store className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />,
    gradient: "from-zinc-500/10 via-zinc-400/5 to-transparent border-zinc-200 dark:border-zinc-800",
  },
  {
    href: "/gift-quiz",
    badge: "60-Second Quiz",
    title: "Gift Match Quiz",
    description: "Answer 4 quick clues about their personality and budget. We curate the rest.",
    actionText: "Take Quiz",
    icon: <Target className="w-5 h-5 text-rose-500" />,
    gradient: "from-pink-500/10 via-rose-500/5 to-transparent border-pink-200/50 dark:border-pink-900/30",
  },
];

export default function BuildToolkitSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  // Lock body scroll while open
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

      {/* Visual Toolkit Sheet */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Gift Lab Toolkit"
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
                TouchGift Studio
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand/10 text-brand dark:text-brand-light flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Gift Lab
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
              Every way to create, personalize, and pool a gift.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 -mr-2 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close build toolkit"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List with Visual Cards */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 pb-12">
          {BUILD_CARDS.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              onClick={onClose}
              className={`group flex items-start gap-3.5 p-3.5 rounded-2xl border bg-gradient-to-r ${card.gradient} bg-white dark:bg-zinc-900/80 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all min-h-[72px]`}
            >
              <div className="w-11 h-11 rounded-xl bg-white/95 dark:bg-zinc-800 shadow-sm flex items-center justify-center shrink-0 mt-0.5">
                {card.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-white/80 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-100 dark:border-zinc-700">
                    {card.badge}
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-brand transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-zinc-400 mt-0.5 leading-snug">
                  {card.description}
                </p>
                <div className="mt-2 flex items-center gap-1 text-xs font-bold text-brand dark:text-brand-light">
                  <span>{card.actionText}</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </aside>
    </>,
    document.body
  );
}
