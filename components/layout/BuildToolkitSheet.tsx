"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { X, Gift, Users, Palette, Target, Store, ArrowRight } from "lucide-react";

type BuildTool = {
  href: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  intent: "mix-and-match" | "group" | "customize" | "quiz" | "bulk";
};

/** Intentional build tools — each tab on the bottom nav is a hub, not a dead
   link. The Build sheet surfaces every "superpower" so mobile users discover
   pool gifting, hamper building, customization and bulk ordering in one tap,
   instead of hunting through a hamburger menu they can't see. */
const TOOLS: BuildTool[] = [
  {
    href: "/gift-lab/build-hamper",
    label: "Build a Hamper",
    description: "Mix and match products into a custom gift box.",
    icon: <Gift className="w-5 h-5" />,
    intent: "mix-and-match",
  },
  {
    href: "/pool/create",
    label: "Pool a Gift",
    description: "Chip in with friends or colleagues for one bigger gift.",
    icon: <Users className="w-5 h-5" />,
    intent: "group",
  },
  {
    href: "/gift-quiz",
    label: "Gift Match Quiz",
    description: "Answer four quick questions — we curate the picks.",
    icon: <Target className="w-5 h-5" />,
    intent: "quiz",
  },
  {
    href: "/corporate/catalog",
    label: "Bulk & Corporate",
    description: "Branded merch, invoices and LPOs for teams.",
    icon: <Store className="w-5 h-5" />,
    intent: "bulk",
  },
];

export default function BuildToolkitSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed left-0 right-0 bottom-0 z-[70] flex flex-col max-h-[92vh] bg-white dark:bg-[#12121a] border-t border-gray-100 dark:border-white/8 shadow-[0_-24px_48px_rgba(0,0,0,0.18)]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/8">
          <h2 className="font-display font-bold text-lg">Gift Lab</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            aria-label="Close build tools"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-white/40 mb-4">
            Build tools
          </p>

          <div className="space-y-2">
            {TOOLS.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                onClick={onClose}
                className="flex items-center gap-4 px-4 py-3.5 rounded-2xl border border-gray-100 dark:border-white/8 bg-white dark:bg-[#16162a] hover:bg-gray-50 dark:hover:bg-white/6 transition-colors"
              >
                <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand/10 dark:bg-brand/20 flex items-center justify-center text-brand dark:text-brand-light">
                  {tool.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {tool.label}
                  </span>
                  <p className="text-[10px] text-gray-600 dark:text-white/40 mt-0.5 leading-snug">
                    {tool.description}
                  </p>
                </div>
                <span className="text-[10px] text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-gray-100 dark:bg-white/8 text-gray-500 dark:text-white/50">
                  {tool.intent}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
