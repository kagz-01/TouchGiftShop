"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import { cn } from "@/lib/utils";
import MegaMenu from "@/components/layout/MegaMenu";
import CategoryTabs from "@/components/layout/CategoryTabs";

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
        "hidden md:block sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-soft"
          : "bg-white"
      )}
    >
      {/* Upper section — Logo + Nav */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between border-b border-surface-border">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/logo.webp"
            alt="TouchGift"
            width={40}
            height={40}
            priority
            className="h-10 w-10 rounded-full object-cover transition-all duration-500 hover:scale-110 hover:rotate-[360deg] hover:drop-shadow-[0_0_12px_rgba(155,27,90,0.4)]"
          />
        </Link>

        {/* Mega Menu */}
        <MegaMenu />

        {/* Right side */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href="/account"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-muted hover:text-brand transition-colors hidden lg:flex"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            Account
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 rounded-full text-sm font-semibold bg-gradient-brand text-white shadow-ribbon hover:shadow-glow hover:-translate-y-0.5 transition-all duration-300"
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* Lower section — Category Tabs */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
        <Suspense fallback={<div className="h-10" />}>
          <CategoryTabs />
        </Suspense>
      </div>
    </header>
  );
}
