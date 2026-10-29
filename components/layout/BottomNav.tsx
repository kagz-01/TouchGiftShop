"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ui/ThemeProvider";
import MobileShopDrawer from "@/components/layout/MobileShopDrawer";
import BuildToolkitSheet from "@/components/layout/BuildToolkitSheet";
import {
  Home,
  Package,
  Briefcase,
  FlaskConical,
} from "lucide-react";

type Tab = {
  href: string;
  label: string;
  icon: React.ReactNode;
  opensSheet?: "shop" | "build";
};

const TABS: Tab[] = [
  { href: "/", label: "Home", icon: <Home className="w-5 h-5" /> },
  { href: "shop", label: "Shop", icon: <Package className="w-5 h-5" />, opensSheet: "shop" },
  { href: "/corporate", label: "Corp", icon: <Briefcase className="w-5 h-5" /> },
  { href: "build", label: "Build", icon: <FlaskConical className="w-5 h-5" />, opensSheet: "build" },
];

const CHIP_BASE =
  "flex-1 min-w-0 flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
const CHIP_IDLE =
  "bg-gray-100/80 dark:bg-white/[0.06] text-brand-muted hover:text-brand hover:-translate-y-0.5";
const CHIP_ACTIVE =
  "bg-gradient-brand text-white shadow-ribbon -translate-y-0.5";

export default function BottomNav() {
  const pathname = usePathname()!;
  const { theme } = useTheme();
  const [shopOpen, setShopOpen] = useState(false);
  const [buildOpen, setBuildOpen] = useState(false);

  // The shop is a focused money surface: its tabs are replaced by the floating
  // filter bar (ShopBottomBar) so products own the screen. Back button up top escapes.
  if (pathname.startsWith("/shop")) return null;

  return (
    <nav className="fixed bottom-3 inset-x-3 z-50 md:hidden" aria-label="Primary">
      <div
        className={cn(
          "flex items-center gap-1.5 rounded-[26px] p-1.5 border backdrop-blur-xl transition-all duration-500",
          theme === "dark"
            ? "bg-[rgba(12,12,26,0.88)] border-white/10 shadow-[0_8px_32px_rgba(155,27,90,0.3)]"
            : "bg-white/85 border-[rgba(155,27,90,0.1)] shadow-card"
        )}
      >
        {TABS.map((tab) => {
          const isActive =
            !tab.opensSheet &&
            (tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href));

          const content = (
            <>
              <span className="w-5 h-5 shrink-0">{tab.icon}</span>
              <span
                className={cn(
                  "text-[10px] leading-none whitespace-nowrap",
                  isActive ? "font-bold" : "font-semibold"
                )}
              >
                {tab.label}
              </span>
            </>
          );

          if (tab.opensSheet) {
            return (
              <button
                key={tab.href}
                type="button"
                className={cn(CHIP_BASE, CHIP_IDLE)}
                onClick={() =>
                  tab.opensSheet === "shop" ? setShopOpen(true) : setBuildOpen(true)
                }
                aria-label={
                  tab.opensSheet === "shop"
                    ? "Browse shop categories"
                    : "Build tools — hamper builder, pool gifting, customizer"
                }
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(CHIP_BASE, isActive ? CHIP_ACTIVE : CHIP_IDLE)}
              aria-current={isActive ? "page" : undefined}
              aria-label={tab.label}
            >
              {content}
            </Link>
          );
        })}
      </div>
      {shopOpen && (
        <MobileShopDrawer open={shopOpen} onClose={() => setShopOpen(false)} />
      )}
      {buildOpen && (
        <BuildToolkitSheet open={buildOpen} onClose={() => setBuildOpen(false)} />
      )}
    </nav>
  );
}
