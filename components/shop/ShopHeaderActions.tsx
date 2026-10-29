"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { MenuRow } from "@/components/layout/MenuRow";
import {
  Menu,
  ShoppingBag,
  Bell,
  Map,
  Package,
  Heart,
  Palette,
} from "lucide-react";

/* ── Shop header actions — mobile only (md:hidden) ───────────────────────────
   /shop hides both the MobileTopBar and the BottomNav, so this is the only
   chrome offering cart + account links while browsing gifts. Desktop keeps
   the site Header's own cart/menu — hence md:hidden.
   The dropdown mirrors the top bar's utility set minus Cart (a dedicated
   header icon here) plus a theme row, since the top bar's toggle never
   renders on /shop. */

export default function ShopHeaderActions() {
  const pathname = usePathname()!;
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when the route changes (covers row taps and back nav).
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [menuOpen]);

  return (
    <div
      ref={wrapRef}
      className="relative md:hidden flex items-center gap-1.5 shrink-0"
    >
      {/* Cart — moved up from ShopBottomBar so it stays visible while browsing */}
      <Link
        href="/cart"
        aria-label={`Shopping cart${itemCount > 0 ? `, ${itemCount} items` : ""}`}
        className="relative shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-gradient-brand text-white shadow-ribbon transition-transform active:scale-95"
      >
        <ShoppingBag className="w-4 h-4" />
        {itemCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-3.5 h-3.5 px-0.5 bg-coral text-white text-[8px] font-bold rounded-full flex items-center justify-center leading-none ring-2 ring-white/70 dark:ring-[#12121a]">
            {itemCount > 9 ? "9+" : itemCount}
          </span>
        )}
      </Link>

      <button
        type="button"
        onClick={() => setMenuOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        className={cn(
          "shrink-0 flex items-center justify-center w-9 h-9 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
          menuOpen
            ? "bg-brand text-white shadow-ribbon"
            : "text-brand-muted hover:text-brand hover:bg-brand/5"
        )}
      >
        <Menu className="w-5 h-5" />
      </button>

      {menuOpen && (
        <div
          role="menu"
          aria-label="Menu"
          className="absolute right-0 top-full mt-2 z-10 w-60 rounded-2xl border p-1.5 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.18)]"
          style={{
            background: "var(--card-bg)",
            borderColor: "var(--card-border)",
          }}
        >
          <MenuRow
            href="/reminders"
            icon={<Bell className="w-4 h-4" />}
            label="Alerts"
            onNavigate={() => setMenuOpen(false)}
          />
          <div className="my-1 h-px" style={{ background: "var(--surface-border)" }} />
          <MenuRow
            href="/track"
            icon={<Map className="w-4 h-4" />}
            label="Track a Gift"
            onNavigate={() => setMenuOpen(false)}
          />
          <MenuRow
            href="/orders"
            icon={<Package className="w-4 h-4" />}
            label="Your Orders"
            onNavigate={() => setMenuOpen(false)}
          />
          <MenuRow
            href="/wishlist"
            icon={<Heart className="w-4 h-4" />}
            label="Wishlist"
            onNavigate={() => setMenuOpen(false)}
          />
          <div className="my-1 h-px" style={{ background: "var(--surface-border)" }} />
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-brand-muted">
            <span className="text-brand shrink-0">
              <Palette className="w-4 h-4" />
            </span>
            <span className="flex-1">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      )}
    </div>
  );
}
