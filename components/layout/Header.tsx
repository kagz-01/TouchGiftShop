"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import MegaMenu from "@/components/layout/MegaMenu";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "hidden md:block transition-all duration-300 sticky top-0 z-50",
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-soft border-b border-surface-border"
          : "bg-white border-b border-transparent"
      )}
    >
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/logo.webp"
            alt="TouchGift"
            width={48}
            height={48}
            priority
            className="rounded-full transition-all duration-500 hover:scale-110 hover:rotate-[360deg] hover:drop-shadow-[0_0_12px_rgba(155,27,90,0.4)]"
          />
        </Link>

        {/* Mega Menu */}
        <MegaMenu />

        {/* Right side */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href="/corporate"
            className="text-xs font-semibold text-brand-deep hover:text-brand transition-colors hidden lg:block"
          >
            Corporate
          </Link>
          <Link
            href="/gift-finder"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand/5 hover:bg-brand/10 rounded-full text-xs font-medium text-brand transition-all"
          >
            <span>🤖</span>
            <span className="hidden lg:inline">Gift Finder</span>
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 rounded-full text-sm font-semibold bg-gradient-brand text-white shadow-ribbon hover:shadow-glow hover:-translate-y-0.5 transition-all duration-300"
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}
