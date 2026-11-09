"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Package, LayoutDashboard, Sparkles, Store } from "lucide-react";
import { cn } from "@/lib/utils";

const CORP_TABS = [
  { href: "/corporate", label: "Home", icon: <Building2 className="w-5 h-5" /> },
  { href: "/corporate/catalog", label: "Catalog", icon: <Package className="w-5 h-5" /> },
  { href: "/corporate/showroom", label: "Showroom", icon: <Sparkles className="w-5 h-5" /> },
  { href: "/corporate/dashboard", label: "Portal", icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: "/", label: "Gift Shop", icon: <Store className="w-5 h-5" />, isReturn: true },
];

export default function CorporateBottomNav() {
  const pathname = usePathname();

  // Hide on checkout or login pages
  if (pathname.includes("checkout") || pathname.includes("login")) return null;

  return (
    <nav
      className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] inset-x-3 z-50 md:hidden"
      aria-label="Corporate Mobile Navigation"
    >
      <div className="flex items-center gap-1 rounded-[26px] p-1.5 border border-white/20 dark:border-white/10 bg-white/95 dark:bg-[#12121a]/95 backdrop-blur-2xl shadow-[0_12px_36px_rgba(0,0,0,0.35)]">
        {CORP_TABS.map((tab) => {
          const isActive = tab.isReturn ? false : pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex-1 min-w-0 flex flex-col items-center justify-center gap-1 rounded-2xl px-0.5 py-2 min-h-[48px] transition-all duration-200",
                isActive
                  ? "bg-brand text-white shadow-[0_4px_16px_rgba(155,27,90,0.35)] -translate-y-0.5 font-bold"
                  : tab.isReturn
                  ? "bg-brand/10 text-brand dark:text-brand-light font-bold hover:bg-brand/20"
                  : "text-gray-700 dark:text-zinc-200 hover:text-brand dark:hover:text-white font-medium"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="w-5 h-5 shrink-0">{tab.icon}</span>
              <span className="text-[10px] leading-none whitespace-nowrap">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
