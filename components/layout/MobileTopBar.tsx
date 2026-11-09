"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Building2,
  ArrowRight,
} from "lucide-react";

/* ── Mobile site header — slim soft-edged pill, md:hidden ────────────────────
   Left: logo + dropdown button (cart badge). Right: profile "T" + theme.
   The dropdown is account/utility only (Cart, Alerts, Track, Orders, Wishlist)
   — build tools live in the Gift Lab (Build) sheet. /shop hides this bar —
   that page owns its top (Back + Ask AI row). Absorbs the old standalone
   FloatingThemeToggle on the main branch. */

export default function MobileTopBar() {
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

  // The shop is a focused money surface with its own top row — don't stack bars.
  // Also hide on corporate side — CorporateHeader handles that chrome.
  if (pathname.startsWith("/shop") || pathname.startsWith("/corporate")) return null;

  return (
    <div
      ref={wrapRef}
      className="md:hidden sticky top-2 z-[55] mx-2 mt-2"
    >
      <div
        className="flex items-center gap-2 rounded-[22px] px-2 py-1.5 border backdrop-blur-xl shadow-card"
        style={{
          background: "var(--card-bg)",
          borderColor: "var(--card-border)",
        }}
      >
        {/* Left: logo, then menu */}
        <Link
          href="/"
          aria-label="TouchGift — go to homepage"
          className="shrink-0 flex items-center"
        >
          <Image
            src="/logo/logo.webp"
            alt=""
            width={36}
            height={36}
            className="w-9 h-9 rounded-full object-cover"
          />
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className={cn(
            "relative shrink-0 flex items-center justify-center w-11 h-11 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand",
            menuOpen
              ? "bg-brand text-white shadow-ribbon"
              : "text-brand-muted hover:text-brand hover:bg-brand/5"
          )}
        >
          <Menu className="w-5 h-5" />
          {itemCount > 0 && (
            <span className="absolute top-0.5 right-0.5 min-w-3.5 h-3.5 px-0.5 bg-coral text-white text-[8px] font-bold rounded-full flex items-center justify-center leading-none ring-2 ring-white/60 dark:ring-[#12121a]">
              {itemCount > 9 ? "9+" : itemCount}
            </span>
          )}
        </button>

        <div className="flex-1" />

        {/* Right: profile "T" (create/view profile), then theme */}
        <Link
          href="/account"
          aria-label="Your profile"
          className="shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-gradient-brand text-white shadow-ribbon font-display font-bold text-sm transition-transform active:scale-95"
        >
          T
        </Link>
        <div className="shrink-0">
          <ThemeToggle />
        </div>
      </div>

      {/* Dropdown — pure account/utility; every build tool lives in the
          Gift Lab (Build) sheet so nothing is duplicated here. */}
      {menuOpen && (
        <div
          role="menu"
          aria-label="Menu"
          className="absolute left-0 top-full mt-2 w-60 rounded-2xl border p-1.5 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.18)]"
          style={{
            background: "var(--card-bg)",
            borderColor: "var(--card-border)",
          }}
        >
          <MenuRow
            href="/cart"
            icon={<ShoppingBag className="w-4 h-4" />}
            label="Cart"
            badge={itemCount}
            onNavigate={() => setMenuOpen(false)}
          />
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
          <div className="my-1.5 h-px" style={{ background: "var(--surface-border)" }} />
          <Link
            href="/corporate"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2.5 p-2 rounded-xl bg-brand/10 text-brand dark:text-brand-light hover:bg-brand/15 transition-colors group"
          >
            <div className="w-7 h-7 rounded-lg bg-brand text-white flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold leading-tight flex items-center gap-1.5">
                Corporate Portal
                <span className="text-[8px] bg-brand text-white px-1.5 py-0.2 rounded font-bold uppercase">B2B</span>
              </p>
              <p className="text-[10px] text-gray-500 dark:text-zinc-400 truncate">Bulk packs & branded merch</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>
      )}
    </div>
  );
}
