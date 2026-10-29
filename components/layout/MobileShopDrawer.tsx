"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { X, ChevronRight, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { MEGA_MENU_DATA } from "@/components/layout/MegaMenu";

export default function MobileShopDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  const renderLink = (link: (typeof MEGA_MENU_DATA)[number]["sections"][number]["links"][number]) => {
    const href = link.href;
    const soon = !href;
    return (
      <div key={link.label} className="mb-0.5">
        {soon ? (
          <span className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-white/8 border border-gray-100 dark:border-white/8 cursor-default">
            {link.icon && (
              <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/40 dark:bg-white/8 flex items-center justify-center text-gray-500 dark:text-white/50">
                {link.icon}
              </span>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-gray-500 dark:text-white/50 opacity-80">
                  {link.label}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 bg-white/30 dark:bg-white/10 rounded-full px-1.5 py-0.5">
                  Soon
                </span>
              </div>
              {link.description && (
                <p className="text-[10px] text-gray-500 dark:text-white/40 mt-0.5 leading-snug opacity-70">
                  {link.description}
                </p>
              )}
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0 opacity-40" />
          </span>
        ) : (
          <Link
            href={href}
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/8 border border-transparent transition-colors"
          >
            {link.icon && (
              <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-brand/10 dark:bg-brand/20 flex items-center justify-center text-brand dark:text-brand-light">
                {link.icon}
              </span>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {link.label}
                </span>
              </div>
              {link.description && (
                <p className="text-[10px] text-gray-600 dark:text-white/40 mt-0.5 leading-snug">
                  {link.description}
                </p>
              )}
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          </Link>
        )}
      </div>
    );
  };

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
          <h2 className="font-display font-bold text-lg">Shop</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            aria-label="Close shop menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-8">
          {MEGA_MENU_DATA.map((menu) => (
            <section key={menu.id} className="px-5 pb-5">
              {/* Group heading */}
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-white/40">
                {menu.label}
              </p>

              <div className="space-y-0.5">
                {menu.sections.map((section) => (
                  <div key={section.title}>
                    {section.links.length > 1 && (
                      <p className="text-[10px] font-semibold text-gray-600 dark:text-white/60 mb-1 px-1">
                        {section.title}
                      </p>
                    )}
                    {section.links.map(renderLink)}
                  </div>
                ))}
                {menu.featured && (
                  <div key="featured" className="mt-3 rounded-2xl p-3.5 border border-brand/10 dark:border-brand/20 bg-gradient-to-br from-brand/5 via-brand/2 to-coral/5 dark:from-brand/10 dark:via-brand/2 dark:to-coral/5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-brand dark:text-brand-light mb-1 block">
                      TouchGift Edit
                    </span>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                      {menu.featured.title}
                    </p>
                    <p className="text-[10px] text-gray-600 dark:text-white/40 mb-2.5 leading-snug">
                      {menu.featured.description}
                    </p>
                    <Link
                      href={menu.featured.href}
                      onClick={onClose}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand text-white text-[10px] font-bold rounded-lg hover:bg-brand-dark transition-colors"
                    >
                      {menu.featured.buttonText ?? "Explore"}
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 16 16">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>,
    document.body
  );
}
