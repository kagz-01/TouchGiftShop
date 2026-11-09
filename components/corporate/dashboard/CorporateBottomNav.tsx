"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, LayoutDashboard, Sparkles, Store, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const CORP_TABS = [
  { href: "/corporate/catalog", label: "Catalog", icon: <Package className="w-5 h-5" /> },
  { href: "/corporate/dashboard", label: "Portal", icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: "/corporate/showroom", label: "Showroom", icon: <Sparkles className="w-5 h-5" /> },
  { href: "/", label: "Gift Shop", icon: <Store className="w-5 h-5" />, isReturn: true },
];

export default function CorporateBottomNav() {
  const pathname = usePathname();

  // Hide on checkout or login pages
  if (pathname.includes("checkout") || pathname.includes("login")) return null;

  return (
    <nav
      className="fixed bottom-3 inset-x-3 z-50 md:hidden"
      aria-label="Corporate Mobile Navigation"
    >
      <div className="flex items-center gap-1.5 rounded-[26px] p-1.5 border border-[color:var(--corp-border)] bg-[color:var(--corp-surface)]/90 backdrop-blur-xl shadow-2xl">
        {CORP_TABS.map((tab) => {
          const isActive = tab.isReturn ? false : pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex-1 min-w-0 flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 min-h-[48px] transition-all duration-200",
                isActive
                  ? "bg-[color:var(--corp-accent)] text-[color:var(--corp-accent-text)] shadow-sm -translate-y-0.5 font-bold"
                  : tab.isReturn
                  ? "bg-brand/10 text-brand dark:text-brand-light font-semibold hover:bg-brand/15"
                  : "text-[color:var(--corp-text-muted)] hover:text-[color:var(--corp-text)] font-medium"
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

