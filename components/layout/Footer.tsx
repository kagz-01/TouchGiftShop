"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const QUICK_LINKS = [
  { href: "/gift-finder", label: "AI Gift Finder" },
  { href: "/gift-lab", label: "Gift Lab" },
  { href: "/gift-lab/pool", label: "Pool a Gift" },
  { href: "/corporate", label: "Corporate Gifts" },
  { href: "/gift-cards", label: "Gift Cards" },
  { href: "/orders", label: "Track Order" },
  { href: "/wishlist/create", label: "Create Wishlist" },
  { href: "/reminders", label: "Reminders" },
];

const SUPPORT_LINKS = [
  { href: "https://wa.me/254142677898", label: "WhatsApp Us", external: true },
  { href: "/login", label: "Sign In / Create Account" },
  { href: "mailto:info@touchgiftshop.co.ke", label: "Email Support" },
];

const POLICY_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/returns", label: "Return & Refund Policy" },
  { href: "/delivery", label: "Delivery Policy" },
];

const SOCIALS = [
  {
    href: "https://www.facebook.com/share/185SzXR7nv/",
    label: "Facebook",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    href: "https://www.instagram.com/touchgiftshop?igsh=MXR2MWV5NGp3dnoxcg==",
    label: "Instagram",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    href: "https://www.tiktok.com/@touchgiftshop001?_r=1&_t=ZS-98d5B03EZMr",
    label: "TikTok",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.51a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48V13.2a8.27 8.27 0 004.77 1.52V11.3a4.83 4.83 0 01-.81-.61z" />
      </svg>
    ),
  },
  {
    href: "https://wa.me/254142677898",
    label: "WhatsApp",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const pathname = usePathname();

  // Define which paths should show the footer. 
  // We keep it off app-like pages (dashboard, shop, product, checkout, etc) for a cleaner UX.
  const SHOW_FOOTER_PATHS = ["/", "/corporate", "/terms", "/privacy", "/returns", "/delivery"];
  
  if (!SHOW_FOOTER_PATHS.includes(pathname)) {
    return null;
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="mt-auto">
      {/* Guarantees Ribbon */}
      <div className="bg-gradient-brand text-white">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">⚡</span>
              <p className="text-sm font-semibold">On-time or it&apos;s free</p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">📸</span>
              <p className="text-sm font-semibold">Photo proof first</p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">🤫</span>
              <p className="text-sm font-semibold">Stay anonymous</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="bg-gradient-dark text-white">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Brand + Newsletter */}
            <div className="md:col-span-4 space-y-5">
              <div>
                <h3 className="font-display text-lg font-bold mb-1">TouchGift</h3>
                <p className="text-white/50 text-sm">Just say it. We&apos;ll make it happen.</p>
              </div>

              <div>
                <p className="text-xs text-gold font-semibold uppercase tracking-wider mb-2">
                  Join the Gift List
                </p>
                {subscribed ? (
                  <div className="bg-gold/20 text-gold rounded-xl px-4 py-2.5 text-sm font-medium animate-pop">
                    Welcome! Check your email.
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email"
                      className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm placeholder:text-white/40 focus:outline-none focus:border-gold transition-colors"
                      required
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gold text-brand-deep rounded-xl font-semibold text-sm hover:bg-gold-light transition-colors"
                    >
                      Sign Up
                    </button>
                  </form>
                )}
              </div>

              <div className="flex items-center gap-3">
                {SOCIALS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-gold/20 hover:text-gold transition-all"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-3">
              <h4 className="text-xs text-gold font-semibold uppercase tracking-wider mb-3">
                Quick Links
              </h4>
              <ul className="space-y-2">
                {QUICK_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 hover:text-gold transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div className="md:col-span-2">
              <h4 className="text-xs text-gold font-semibold uppercase tracking-wider mb-3">
                Support
              </h4>
              <ul className="space-y-2">
                {SUPPORT_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="text-sm text-white/60 hover:text-gold transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Policies */}
            <div className="md:col-span-3">
              <h4 className="text-xs text-gold font-semibold uppercase tracking-wider mb-3">
                Policies
              </h4>
              <ul className="space-y-2">
                {POLICY_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 hover:text-gold transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-5 bg-white/5 rounded-xl p-3 border border-white/10">
                <p className="text-xs text-white/40">
                  Same-day delivery in Nairobi. Next-day nationwide.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-5 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/30">
              © {new Date().getFullYear()} TouchGift — Just Say It 🎁
            </p>
            <div className="flex items-center gap-4 text-xs text-white/30">
              <Link href="/privacy" className="hover:text-white/60 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white/60 transition-colors">
                Terms
              </Link>
              <Link href="/returns" className="hover:text-white/60 transition-colors">
                Returns
              </Link>
              <Link href="/delivery" className="hover:text-white/60 transition-colors">
                Delivery
              </Link>
              <a href="https://wa.me/254142677898" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
