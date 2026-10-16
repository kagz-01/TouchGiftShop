"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutGrid, FileText, Package, Wallet, Users, Settings, LogOut, Menu, X, ReceiptText,
} from "lucide-react";
import { useState } from "react";
import ThemeToggle from "@/components/ui/ThemeToggle";

export type PortalNavItem = {
  href: string;
  label: string;
  icon: typeof LayoutGrid;
  /** Shown as a quiet count beside the label. Never a badge colour. */
  count?: number;
};

export default function PortalShell({
  companyName,
  contactName,
  contactEmail,
  children,
}: {
  companyName: string;
  contactName: string | null;
  contactEmail: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const nav: PortalNavItem[] = [
    { href: "/corporate/portal", label: "Overview", icon: LayoutGrid },
    { href: "/corporate/portal/quotes", label: "Quotes", icon: FileText },
    { href: "/corporate/portal/orders", label: "Orders", icon: Package },
    { href: "/corporate/portal/invoices", label: "Invoices", icon: ReceiptText },
    { href: "/corporate/portal/spend", label: "Spend", icon: Wallet },
    { href: "/corporate/portal/people", label: "People", icon: Users },
    { href: "/corporate/portal/settings", label: "Settings", icon: Settings },
  ];

  const isCurrent = (href: string) =>
    href === "/corporate/portal" ? pathname === href : pathname.startsWith(href);

  const navList = (
    <nav className="flex flex-col gap-1">
      {nav.map((item) => {
        const active = isCurrent(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMenuOpen(false)}
            aria-current={active ? "page" : undefined}
            className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors"
            style={{
              background: active ? "var(--portal-accent-tint)" : "transparent",
              color: active ? "var(--portal-accent)" : "var(--portal-text-muted)",
              fontWeight: active ? 600 : 400,
            }}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1">{item.label}</span>
            {item.count != null && item.count > 0 && (
              <span className="text-xs tabular-nums text-[color:var(--portal-text-faint)]">
                {item.count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="corporate-portal min-h-screen bg-[color:var(--portal-bg)] text-[color:var(--portal-text)]">
      {/* ── Header ── */}
      <header
        className="sticky top-0 z-30 border-b backdrop-blur-md"
        style={{
          background: "var(--portal-header-bg)",
          borderColor: "var(--portal-border-soft)",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-3 sm:px-8">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="-ml-2 flex h-10 w-10 items-center justify-center rounded-lg text-[color:var(--portal-text-muted)] lg:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/corporate/portal" className="-my-1 flex min-w-0 items-center gap-2.5 py-1">
            <Image src="/logo/logo.webp" alt="" width={30} height={30} className="rounded-full" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold leading-tight">
                {companyName}
              </span>
              <span className="block text-[11px] leading-tight text-[color:var(--portal-text-faint)]">
                Client portal
              </span>
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-1.5">
            <ThemeToggle />
            <span className="hidden max-w-[16rem] truncate px-2 text-xs text-[color:var(--portal-text-faint)] sm:block">
              {contactName ?? contactEmail}
            </span>
            <form action="/api/corporate/portal/sign-out" method="post">
              <button
                type="submit"
                className="flex h-10 items-center gap-2 rounded-lg px-3 text-xs font-medium text-[color:var(--portal-text-muted)] transition-colors hover:bg-[color:var(--portal-surface-2)]"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-8 px-5 py-6 sm:px-8 lg:py-10">
        {/* ── Rail ── */}
        <aside className="hidden w-52 flex-shrink-0 lg:block">
          <div className="sticky top-24">{navList}</div>
        </aside>

        {menuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              className="absolute inset-0 bg-black/30"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            />
            <div className="absolute inset-x-0 top-0 border-b p-4" style={{ background: "var(--portal-surface)", borderColor: "var(--portal-border)" }}>
              {navList}
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
