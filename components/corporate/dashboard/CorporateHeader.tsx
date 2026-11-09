"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

/**
 * CorporateHeader – a sticky, scroll‑aware header for the corporate dashboard.
 * It mirrors the global site header (fixed, blurred on scroll, height published)
 * while adding corporate‑specific items such as a breadcrumb and a demo‑preset switcher.
 */
export default function CorporateHeader({
  activeTabLabel,
  availablePresets,
  demoPreset,
  isDemo,
  onSelectPreset,
  onMobileNavToggle,
}: {
  activeTabLabel: string;
  availablePresets?: { id: string; name: string; industry: string }[];
  demoPreset?: string;
  isDemo?: boolean;
  onSelectPreset?: (preset: string) => void;
  onMobileNavToggle?: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  // Sticky‑scroll effect – same as global Header
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Publish height so the rest of the page can offset via var(--header-h)
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const publish = () =>
      document.documentElement.style.setProperty(
        "--header-h",
        `${el.offsetHeight}px`,
      );
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <header
      ref={headerRef}
      className={cn(
        "sticky top-0 z-50 shrink-0 transition-all duration-300",
        scrolled
          ? "bg-var(--corp-header-bg-scrolled) backdrop-blur-xl border-b"
          : "bg-var(--corp-header-bg)",
      )}
      role="banner"
    >
      <div className="flex items-center gap-4 px-4 h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo/logo.webp"
            alt="TouchGift"
            width={32}
            height={32}
            className="rounded"
          />
          <span className="font-semibold" style={{ color: "var(--corp-header-text)" }}>
            Corporate
          </span>
        </Link>
          {/* Mobile hamburger */}
          <button
            onClick={onMobileNavToggle}
            className="lg:hidden w-11 h-11 flex items-center justify-center rounded-xl text-var(--corp-text-muted) hover:bg-var(--corp-surface-2) transition-colors"
            aria-label="Open mobile navigation"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

        {/* Breadcrumb – hidden on very small screens */}
        <nav
          aria-label="Breadcrumb"
          className="hidden lg:flex items-center gap-1.5 text-sm"
        >
          <Link href="/" className="text-var(--corp-text-faint)">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-var(--corp-border)" />
          <span style={{ color: "var(--corp-text-muted)" }}>Corporate</span>
          <ChevronRight className="w-3.5 h-3.5 text-var(--corp-border)" />
          <span className="font-semibold" style={{ color: "var(--corp-text)" }}>
            {activeTabLabel}
          </span>
        </nav>

        {/* Right side – demo preset switcher (only in demo mode) */}
        <div className="ml-auto flex items-center gap-4">
          {isDemo && availablePresets && onSelectPreset && (
            <div className="flex items-center gap-1.5 p-1 rounded-xl" style={{ background: "var(--corp-surface-2)", border: "1px solid var(--corp-border-soft)" }}>
              <span className="text-[11px] font-semibold" style={{ color: "var(--corp-text-faint)" }}>
                Demo Client:
              </span>
              {(availablePresets || []).map(p => (
                <button
                  key={p.id}
                  onClick={() => onSelectPreset(p.id)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                  style={{
                    background:
                      demoPreset === p.id ? "var(--corp-accent)" : "transparent",
                    color:
                      demoPreset === p.id ? "var(--corp-accent-text)" : "var(--corp-text-muted)",
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}
          {/* Back to main store pill */}
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-brand/10 text-brand dark:text-brand-light hover:bg-brand/20 transition-colors shrink-0 min-h-[36px]"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            <span>Gift Shop</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

