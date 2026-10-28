"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useTheme } from "@/components/ui/ThemeProvider";
import MobileShopDrawer from "@/components/layout/MobileShopDrawer";
import BuildToolkitSheet from "@/components/layout/BuildToolkitSheet";
import { Package, FlaskConical, Bell, User, Settings } from "lucide-react";

const TABS: Array<{
  href: string;
  label: string;
  icon: React.ReactNode;
  highlight?: boolean;
  opensSheet?: "shop" | "build";
}> = [
  { href: "/", label: "Home", icon: <User className="w-5 h-5" /> },
  { href: "shop", label: "Shop", icon: <Package className="w-5 h-5" />, opensSheet: "shop" },
  { href: "build", label: "Build", icon: <FlaskConical className="w-5 h-5" />, opensSheet: "build" },
  { href: "/reminders", label: "Reminders", icon: <Bell className="w-5 h-5" /> },
  { href: "/account", label: "Account", icon: <Settings className="w-5 h-5" /> },
];

export default function BottomNav() {
  const pathname = usePathname()!;
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [shopOpen, setShopOpen] = useState(false);
  const [buildOpen, setBuildOpen] = useState(false);

  return (
    <nav
      className="fixed bottom-4 left-4 right-4 z-50 flex md:hidden"
      aria-label="Primary"
    >
      <div
        className={cn(
          "flex items-center justify-between px-3 py-1.5 transition-all duration-500",
          isDark
            ? "bg-[rgba(12,12,26,0.9)] border-white/10 shadow-[0_8px_32px_rgba(155,27,90,0.3)]"
            : "bg-white/95 border-[rgba(155,27,90,0.1)] shadow-card"
        )}
      >
        {TABS.map((tab) => {
          if (tab.opensSheet === "shop") {
            return (
              <button
                key={tab.href}
                onClick={() => setShopOpen(true)}
                className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-full transition-colors text-brand-muted hover:text-brand hover:bg-brand/5"
                aria-label="Browse shop categories"
              >
                {tab.icon}
                <span className="text-[10px]">Shop</span>
              </button>
            );
          }

          if (tab.opensSheet === "build") {
            return (
              <button
                key={tab.href}
                onClick={() => setBuildOpen(true)}
                className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-full transition-colors text-brand-muted hover:text-brand hover:bg-brand/5"
                aria-label="Build tools — hamper builder, pool gifting, customizer"
              >
                {tab.icon}
                <span className="text-[10px]">Build</span>
              </button>
            );
          }

          const active =
            tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href as string);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 rounded-full transition-all duration-300",
                active
                  ? "bg-gradient-brand text-white shadow-ribbon scale-105"
                  : "text-brand-muted hover:text-brand hover:bg-brand/5",
                tab.highlight && !active && "relative"
              )}
            >
              {tab.highlight && !active && (
                <span className="absolute -top-1 -right-0.5 w-1.5 h-1.5 bg-gold rounded-full animate-pulse-soft" />
              )}
              <span className="w-5 h-5 shrink-0">{tab.icon}</span>
              <span className={cn("text-[10px]", active ? "font-semibold" : "")}>
                {tab.label}
              </span>
            </Link>
          );
        })}

        {/* Compact theme toggle */}
        <div className="flex flex-col items-center gap-0.5 px-2 py-1">
          <div className="scale-[0.65] origin-center">
            <ThemeToggle />
          </div>
          <span className="text-[10px] text-brand-muted">Theme</span>
        </div>

        {shopOpen && (
          <MobileShopDrawer open={shopOpen} onClose={() => setShopOpen(false)} />
        )}
        {buildOpen && (
          <BuildToolkitSheet open={buildOpen} onClose={() => setBuildOpen(false)} />
        )}
      </div>
    </nav>
  );
}
