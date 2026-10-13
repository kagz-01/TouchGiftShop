"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import MegaMenu from "@/components/layout/MegaMenu";
import NotificationBell from "@/components/layout/NotificationBell";
import { Bell, Search, X, UserRound, MessageCircle, Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ui/ThemeToggle";
import VibeSelector from "@/components/ui/VibeSelector";
import MoodChip from "@/components/ui/MoodChip";
import CartBadge from "@/components/layout/CartBadge";
import SplashReveal from "@/components/ui/SplashReveal";
import SeasonalPromptBar from "@/components/home/SeasonalPromptBar";
import type { SessionUser } from "@/components/layout/LayoutWrapper";

const ANNOUNCEMENTS = [
  "🚀 Same-day delivery in Nairobi · Next-day nationwide",
  "🎁 Anonymous gifting available — surprise someone special",
  "✨ Free gift wrapping on all orders above KSh 3,000",
  "🏢 Corporate & bulk orders? Get a dedicated account manager",
];

export default function Header({ user, guest }: { user: SessionUser; guest: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [splashActive, setSplashActive] = useState(false);
  const router = useRouter();
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* The shell's height is dynamic — the seasonal bar appears and disappears
     as events come and go, and the announcement bar changes height when the
     page scrolls. LayoutWrapper's spacer used to hardcode 130px, which is
     already wrong and drifts further every time the seasonal bar shows.
     Publish the real height so the spacer can never disagree with us. */
  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    const publish = () =>
      document.documentElement.style.setProperty("--header-h", `${el.offsetHeight}px`);
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleLogoPress = useCallback(() => {
    const isHome = window.location.pathname === "/";
    if (isHome) {
      setSplashActive(true);
    } else {
      router.push("/");
    }
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
      {/* ── FIXED HEADER SHELL: promo bar + main nav ── */}
      <div
        ref={shellRef}
        className={cn("hidden md:flex flex-col fixed top-0 left-0 right-0 z-50 transition-all duration-500")}
        style={{
          backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "blur(0px)",
          background: scrolled ? "var(--header-bg-scrolled)" : "transparent",
          borderBottom: scrolled ? "1px solid rgba(155,27,90,0.10)" : "1px solid transparent",
          boxShadow: scrolled ? "0 4px 30px rgba(155,27,90,0.08)" : "none",
        }}
      >
        {/* ── SEASONAL + ANNOUNCEMENT BAR ──
            One promo strip, not two. It used to sit above a separate
            announcement bar as a sibling in normal flow while this shell is
            fixed at top:0 / z-50, so the shell painted straight over it and
            the Mashujaa Day countdown was permanently buried. Merging the
            two rotations removes the overlap by construction and reclaims
            the announcement bar's ~34px. */}
        <SeasonalPromptBar announcements={ANNOUNCEMENTS} />

        {/* ── MAIN HEADER ── */}
        <header
          className={cn("hidden md:block transition-all duration-500")}
        >
        {/* TOP ROW: Logo | Search | Icons */}
        <div className="page-container-capped py-2 flex items-center gap-4">

          {/* Logo — 90px square was the single largest item in the header and
              alone pushed the shell to 196px (22% of a 900px viewport).
              52px keeps it legible at md and recovers 38px. */}
          <button onClick={handleLogoPress} aria-label="TouchGift — go to homepage" className="flex-shrink-0 relative group focus:outline-none">
            <span className="absolute inset-0 rounded-full transition-all duration-500 scale-100 opacity-0 group-hover:opacity-100 group-hover:scale-125 bg-brand/10" />
            <Image src="/logo/logo.webp" alt="TouchGift" width={52} height={52} priority className="relative w-[52px] h-[52px] rounded-full object-cover transition-all duration-500 ring-2 ring-transparent group-hover:scale-110 group-hover:ring-brand/30 group-hover:shadow-[0_0_20px_rgba(155,27,90,0.25)]" />
            <span className="sr-only">TouchGift</span>
          </button>

          {/* Inline Search */}
          <div className="flex-1 max-w-xl">
            <form onSubmit={handleSearch} className="relative group">
              <div className={cn("flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-300", "bg-surface-raised border-surface-border", "hover:border-brand/30 hover:shadow-[0_0_0_3px_rgba(155,27,90,0.06)]", "focus-within:border-brand/40 focus-within:shadow-[0_0_0_3px_rgba(155,27,90,0.08)]")}>
                <Search className="w-4 h-4 text-theme-body flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Escape" && setSearchQuery("")}
                  aria-label="Search products"
                  placeholder="Search gifts, hampers, occasions..."
                  className="flex-1 bg-transparent text-theme-heading placeholder:text-theme-body/60 text-sm focus:outline-none min-w-0"
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery("")} aria-label="Clear search" className="text-theme-body hover:text-theme-heading transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {searchQuery.length === 0 && (
                <div className="absolute top-full left-0 right-0 pt-1 hidden group-focus-within:block z-50">
                  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-surface-border p-3 flex flex-wrap gap-2">
                    {["Birthday", "Corporate", "Flowers", "Under KSh 2,000", "Hampers"].map((q) => (
                      <button key={q} type="button" onClick={() => { router.push(`/shop?q=${encodeURIComponent(q)}`); setSearchQuery(""); }} className="text-xs bg-brand/5 hover:bg-brand/10 text-brand px-3 py-1.5 rounded-full transition-colors border border-brand/10 font-medium">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Corporate CTA */}
            <Link
              href="/corporate"
              className="hidden xl:flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold text-brand dark:text-brand-light hover:bg-brand/8 dark:hover:bg-brand/20 transition-all duration-200 border border-brand/20 dark:border-brand/40 hover:border-brand/40 dark:hover:border-brand/60 hover:shadow-[0_0_0_3px_rgba(155,27,90,0.06)] dark:hover:shadow-[0_0_0_3px_rgba(196,41,122,0.15)]"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Corporate</span>
            </Link>
            <div className="w-px h-5 bg-surface-border mx-1 hidden xl:block" />
            <Link href="https://wa.me/254700000000" target="_blank" rel="noopener noreferrer" className="hidden xl:flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 border border-green-200 dark:border-green-800">
              <MessageCircle className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </Link>
            <div className="w-px h-5 bg-surface-border mx-1 hidden xl:block" />
            <CartBadge />
            <div className="hidden lg:block">
              {user ? (
                <NotificationBell user={user} />
              ) : (
                <div className="group relative flex flex-col items-center justify-center">
                  <Link href="/login?next=/reminders" aria-label="Gift reminders" className="w-11 h-11 flex items-center justify-center shape-premium-button text-theme-body hover:text-brand hover:bg-brand/5 transition-all duration-200">
                    <Bell className="w-4 h-4" />
                  </Link>
                  <span className="absolute top-full mt-1.5 px-2 py-1 bg-gray-900 text-white text-[10px] font-medium rounded shadow-sm opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-50 whitespace-nowrap">Reminders</span>
                </div>
              )}
            </div>
            <MoodChip />
            <div className="w-px h-5 bg-surface-border mx-1" />
            <ThemeToggle />
            {user && !user.is_anonymous ? (
              <Link href="/account" className="w-11 h-11 shape-premium-button bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-white text-xs font-bold hover:shadow-glow hover:scale-105 transition-all duration-200 flex-shrink-0" aria-label="My account">
                {(user.email?.[0] ?? user.phone?.[3] ?? "G").toUpperCase()}
              </Link>
            ) : (guest || user?.is_anonymous) ? (
              <Link href="/login?next=/account" className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 shape-premium-button bg-brand/5 hover:bg-brand/10 transition-colors border border-brand/10 flex-shrink-0 rounded-full" aria-label="Guest — sign in">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">G</div>
                <span className="text-xs font-semibold text-theme-heading hidden sm:block">Guest</span>
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-theme-heading hover:text-brand hover:bg-brand/5 transition-all duration-200">
                  <UserRound className="w-3.5 h-3.5" />
                  Sign in
                </Link>
                <Link href="/login?mode=signup" className="px-4 py-2 rounded-full text-xs font-semibold bg-brand text-white hover:bg-brand-dark hover:shadow-[0_4px_16px_rgba(155,27,90,0.35)] hover:-translate-y-0.5 transition-all duration-300 flex-shrink-0">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>

        {/* BOTTOM ROW: Mega Menu */}
        <div className="border-t border-surface-border/50">
          <div className="page-container-capped">
            <MegaMenu />
          </div>
        </div>

        {/* Accent border on scroll */}
        <div className={cn("absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent transition-opacity duration-300", scrolled ? "opacity-100" : "opacity-0")} />
      </header>
      </div> {/* end fixed header shell */}

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm flex items-start justify-center pt-24" onClick={() => setSearchOpen(false)}>
          <div className="w-full max-w-xl mx-4 card-theme shape-premium-card shadow-card-hover overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSearch} className="flex items-center gap-3 px-5 py-4">
              <Search className="w-5 h-5 text-brand flex-shrink-0" />
              <input autoFocus type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search gifts, occasions, categories…" className="flex-1 bg-transparent text-theme-heading placeholder:text-theme-body text-sm focus:outline-none" />
              <button type="button" onClick={() => setSearchOpen(false)} className="text-theme-body hover:text-theme-heading transition-colors">
                <X className="w-5 h-5" />
              </button>
            </form>
            <div className="px-5 pb-4 flex flex-wrap gap-2">
              {["Birthday", "Wedding", "Corporate", "Flowers", "Under KSh 2000"].map((q) => (
                <button key={q} onClick={() => { setSearchOpen(false); router.push(`/shop?q=${encodeURIComponent(q)}`); }} className="text-xs bg-brand/5 hover:bg-brand/10 text-brand px-3 py-1.5 shape-premium-button transition-colors border border-brand/10">
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <SplashReveal active={splashActive} onDone={() => setSplashActive(false)} />
    </>
  );
}
