"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import MegaMenu from "@/components/layout/MegaMenu";
import NotificationBell from "@/components/layout/NotificationBell";
import { createClient } from "@/lib/supabase-browser";
import { ShoppingBag, Bell, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [logoPressed, setLogoPressed] = useState(false);
  const [user, setUser] = useState<{ email?: string | null; phone?: string | null } | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Check auth state
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Logo press animation — 3-step: press → burst → settle
  const handleLogoPress = useCallback(() => {
    setLogoPressed(true);
    setTimeout(() => setLogoPressed(false), 700);
    router.push("/");
  }, [router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      setSearchQuery("");
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header
        className={cn(
          "hidden md:block sticky top-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/95 backdrop-blur-xl shadow-[0_1px_24px_rgba(155,27,90,0.08)]"
            : "bg-white/80 backdrop-blur-sm"
        )}
      >
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-2 flex items-center gap-6">

          {/* ── Logo ── */}
          <button
            onClick={handleLogoPress}
            aria-label="TouchGift — go to homepage"
            className="flex-shrink-0 relative group focus:outline-none"
          >
            {/* Glow ring on hover */}
            <span
              className={cn(
                "absolute inset-0 rounded-full transition-all duration-500",
                logoPressed
                  ? "scale-150 opacity-0 bg-brand/30"
                  : "scale-100 opacity-0 group-hover:opacity-100 group-hover:scale-125 bg-brand/10"
              )}
            />
            {/* Secondary ripple on press */}
            {logoPressed && (
              <span className="absolute inset-0 rounded-full bg-brand/20 animate-ping" />
            )}
            <Image
              src="/logo.webp"
              alt="TouchGift"
              width={52}
              height={52}
              priority
              className={cn(
                "relative rounded-full object-cover transition-all duration-500 ring-2 ring-transparent",
                logoPressed
                  ? "scale-90 rotate-[15deg] ring-brand/50 brightness-110"
                  : "scale-100 rotate-0 group-hover:scale-110 group-hover:ring-brand/30 group-hover:shadow-[0_0_20px_rgba(155,27,90,0.25)]"
              )}
            />
            {/* Wordmark — shows on wider screens */}
            <span className="sr-only">TouchGift</span>
          </button>

          {/* Brand wordmark next to logo */}
          <Link
            href="/"
            className="hidden lg:flex flex-col leading-none group flex-shrink-0"
          >
            <span className="font-display text-lg font-bold text-brand-deep tracking-tight group-hover:text-brand transition-colors duration-200">
              Touch<span className="text-brand">Gift</span>
            </span>
            <span className="text-[10px] text-brand-muted font-medium tracking-widest uppercase">
              Kenya&apos;s gift platform
            </span>
          </Link>

          {/* ── Mega Menu — takes remaining space ── */}
          <div className="flex-1 flex justify-center">
            <MegaMenu />
          </div>

          {/* ── Right actions ── */}
          <div className="flex items-center gap-1 flex-shrink-0">

            {/* Search */}
            <div className="group relative flex flex-col items-center justify-center">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search gifts"
                className="w-9 h-9 flex items-center justify-center rounded-full text-brand-muted hover:text-brand hover:bg-brand/5 transition-all duration-200"
              >
                <Search className="w-4 h-4" />
              </button>
              <span className="absolute top-full mt-1.5 px-2 py-1 bg-gray-900 text-white text-[10px] font-medium rounded shadow-sm opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-50">
                Search
              </span>
            </div>

            {/* Orders */}
            <div className="group relative flex flex-col items-center justify-center">
              <Link
                href={user ? "/orders" : "/login?next=/orders"}
                aria-label="Your orders"
                className="relative w-9 h-9 flex items-center justify-center rounded-full text-brand-muted hover:text-brand hover:bg-brand/5 transition-all duration-200"
              >
                <ShoppingBag className="w-4 h-4" />
              </Link>
              <span className="absolute top-full mt-1.5 px-2 py-1 bg-gray-900 text-white text-[10px] font-medium rounded shadow-sm opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-50 whitespace-nowrap">
                {user ? "Orders" : "Sign in to see Orders"}
              </span>
            </div>

            {/* Notifications / Reminders */}
            <div className="hidden lg:block">
              {user ? (
                <NotificationBell user={user} />
              ) : (
                <div className="group relative flex flex-col items-center justify-center">
                  <Link
                    href="/login?next=/reminders"
                    aria-label="Gift reminders"
                    className="w-9 h-9 flex items-center justify-center rounded-full text-brand-muted hover:text-brand hover:bg-brand/5 transition-all duration-200"
                  >
                    <Bell className="w-4 h-4" />
                  </Link>
                  <span className="absolute top-full mt-1.5 px-2 py-1 bg-gray-900 text-white text-[10px] font-medium rounded shadow-sm opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-50 whitespace-nowrap">
                    Sign in to see Reminders
                  </span>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-surface-border mx-1" />

            {user ? (
              /* Logged-in avatar */
              <Link
                href="/account"
                className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-white text-xs font-bold hover:shadow-glow hover:scale-105 transition-all duration-200 flex-shrink-0"
                aria-label="My account"
              >
                {(user.email?.[0] ?? user.phone?.[3] ?? "G").toUpperCase()}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden lg:block px-3 py-1.5 text-xs font-medium text-brand-muted hover:text-brand transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/login?mode=signup"
                  className="px-4 py-2 rounded-full text-sm font-semibold bg-brand text-white hover:bg-brand-dark hover:shadow-[0_4px_16px_rgba(155,27,90,0.35)] hover:-translate-y-0.5 transition-all duration-300 flex-shrink-0"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Hairline bottom border when scrolled */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/20 to-transparent transition-opacity duration-300",
            scrolled ? "opacity-100" : "opacity-0"
          )}
        />
      </header>

      {/* ── Search overlay ── */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm flex items-start justify-center pt-24"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-xl mx-4 bg-white rounded-2xl shadow-card-hover overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSearch} className="flex items-center gap-3 px-5 py-4">
              <Search className="w-5 h-5 text-brand flex-shrink-0" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search gifts, occasions, categories…"
                className="flex-1 bg-transparent text-brand-deep placeholder:text-brand-muted text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-brand-muted hover:text-brand-deep transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </form>
            {/* Quick links */}
            <div className="px-5 pb-4 flex flex-wrap gap-2">
              {["Birthday", "Wedding", "Corporate", "Flowers", "Under KSh 2000"].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setSearchOpen(false);
                    router.push(`/shop?q=${encodeURIComponent(q)}`);
                  }}
                  className="text-xs bg-brand/5 hover:bg-brand/10 text-brand px-3 py-1.5 rounded-full transition-colors border border-brand/10"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
