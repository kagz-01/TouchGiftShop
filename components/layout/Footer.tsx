"use client";

import Link from "next/link";
import { useState } from "react";

const SHOP_TAGS = [
  { href: "/?category=birthdays", label: "Birthdays", icon: "🎂" },
  { href: "/?category=anniversaries", label: "Anniversaries", icon: "💍" },
  { href: "/?category=weddings", label: "Weddings", icon: "💒" },
  { href: "/?category=condolences", label: "Condolences", icon: "🕊️" },
  { href: "/?category=corporate", label: "Corporate", icon: "🏢" },
  { href: "/?category=apology", label: "Apology", icon: "💐" },
  { href: "/?category=milestone", label: "Milestone", icon: "🏆" },
  { href: "/?category=just-because", label: "Just Because", icon: "💝" },
];

const HELP_LINKS = [
  { href: "/orders", label: "Track Order" },
  { href: "/reminders", label: "Reminders" },
  { href: "/wishlist", label: "Wishlists" },
  { href: "/gift-cards", label: "Gift Cards" },
  { href: "/corporate", label: "Corporate Gifts" },
  { href: "https://wa.me/254700000000", label: "WhatsApp Us", external: true },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

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
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">⚡</span>
              <div className="text-left">
                <p className="font-display font-semibold">On-time or it&apos;s free</p>
                <p className="text-white/70 text-xs">Same-day delivery in Nairobi</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">📸</span>
              <div className="text-left">
                <p className="font-display font-semibold">Photo proof first</p>
                <p className="text-white/70 text-xs">See the package before it ships</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">🤫</span>
              <div className="text-left">
                <p className="font-display font-semibold">Stay anonymous</p>
                <p className="text-white/70 text-xs">Your identity stays private</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="bg-gradient-dark text-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            {/* Newsletter + Quick Gift Finder */}
            <div className="md:col-span-4 space-y-6">
              <div>
                <h3 className="font-display text-xl font-semibold mb-2">
                  Join the Gift List 🎁
                </h3>
                <p className="text-white/60 text-sm mb-4">
                  Weekly deals, gifting inspo & exclusive early access
                </p>
                {subscribed ? (
                  <div className="bg-gold/20 text-gold rounded-xl px-4 py-3 text-sm font-medium animate-pop">
                    Welcome to the gift list! Check your email.
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm placeholder:text-white/40 focus:outline-none focus:border-gold transition-colors"
                      required
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-gold text-brand-deep rounded-xl font-semibold text-sm hover:bg-gold-light transition-colors"
                    >
                      Sign Up
                    </button>
                  </form>
                )}
              </div>

              {/* Quick Gift Finder */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-xs text-gold font-semibold uppercase tracking-wider mb-2">
                  Quick Gift Finder
                </p>
                <div className="flex gap-2 text-sm">
                  <span className="bg-white/10 px-3 py-1.5 rounded-lg">Who?</span>
                  <span className="bg-white/10 px-3 py-1.5 rounded-lg">Occasion?</span>
                  <span className="bg-white/10 px-3 py-1.5 rounded-lg">Budget?</span>
                </div>
              </div>
            </div>

            {/* Gift Tags — Shop */}
            <div className="md:col-span-4">
              <h4 className="text-xs text-gold font-semibold uppercase tracking-wider mb-4">
                Shop by Occasion
              </h4>
              <div className="flex flex-wrap gap-2">
                {SHOP_TAGS.map((tag) => (
                  <Link
                    key={tag.href}
                    href={tag.href}
                    className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-brand/20 border border-white/10 hover:border-brand/30 rounded-xl px-3 py-2 text-sm transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <span>{tag.icon}</span>
                    <span>{tag.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Help & Company */}
            <div className="md:col-span-4 space-y-6">
              <div>
                <h4 className="text-xs text-gold font-semibold uppercase tracking-wider mb-4">
                  Help & Quick Links
                </h4>
                <ul className="space-y-2">
                  {HELP_LINKS.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noopener noreferrer" : undefined}
                        className="text-sm text-white/70 hover:text-gold transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs text-white/40">
                  Need help? Chat with us on{" "}
                  <a
                    href="https://wa.me/254700000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold hover:text-gold-light transition-colors"
                  >
                    WhatsApp
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/40">
              © {new Date().getFullYear()} TouchGift — Just Say It 🎁
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-white/40 hover:text-gold transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a href="#" className="text-white/40 hover:text-gold transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="#" className="text-white/40 hover:text-gold transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
