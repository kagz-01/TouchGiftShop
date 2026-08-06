"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/gift-lab", label: "Gift Lab" },
  { href: "/orders", label: "Orders" },
  { href: "/reminders", label: "Reminders" },
];

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
        "hidden md:flex items-center justify-between px-8 py-4 transition-all duration-300 sticky top-0 z-50",
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-soft border-b border-surface-border"
          : "bg-white border-b border-transparent"
      )}
    >
      <Link href="/" className="flex items-center gap-2 group">
        <Image
          src="/logo.webp"
          alt="TouchGift"
          width={140}
          height={49}
          priority
          className="transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      <nav className="flex items-center gap-1">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
              "hover:bg-brand/5 hover:text-brand",
              "relative after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2",
              "after:w-0 after:h-0.5 after:bg-gradient-brand after:rounded-full",
              "after:transition-all after:duration-300 hover:after:w-3/4"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className={cn(
            "px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300",
            "bg-gradient-brand text-white shadow-ribbon",
            "hover:shadow-glow hover:-translate-y-0.5",
            "active:translate-y-0"
          )}
        >
          Sign in
        </Link>
      </div>
    </header>
  );
}
