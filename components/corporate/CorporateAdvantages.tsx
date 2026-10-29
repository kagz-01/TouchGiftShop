"use client";

import { motion } from "framer-motion";
import { MapPin, FileCheck2, Palette, Truck, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const ADVANTAGES = [
  {
    icon: MapPin,
    badge: "No Address Hassle",
    title: "WhatsApp Magic Links",
    description: "Never collect private employee home addresses. TouchGift dispatches a branded WhatsApp/SMS link where the recipient chooses their preferred delivery date and drops their exact GPS pin.",
    highlight: "100% confidential & POPIA / Data Privacy compliant",
  },
  {
    icon: FileCheck2,
    badge: "Procurement Ready",
    title: "Instant KRA eTIMS Tax Invoices",
    description: "Every order issues a verified KRA eTIMS invoice with official QR code and PIN verification. Attach your internal LPO/PO reference directly for 1-click clearance with Accounts Payable.",
    highlight: "Net-14 / Net-30 credit terms for approved corporate accounts",
  },
  {
    icon: Palette,
    badge: "Executive Finish",
    title: "Bespoke Brand Studio",
    description: "Elevate beyond generic promotional swag. Preview your corporate logo laser-engraved on vacuum tumblers, embossed on leather folios, and printed on custom satin ribbons in your exact brand hex code.",
    highlight: "Digital 3D proof before production begins",
  },
  {
    icon: Truck,
    badge: "White-Glove Logistics",
    title: "Temperature-Controlled Nairobi Fleet",
    description: "Artisanal chocolates, delicate floral arrangements, and premium wines require chilled handling. Our dedicated concierge riders handle every delivery with white-glove presentation.",
    highlight: "Live GPS broadcast & recipient signature proof",
  },
];

export default function CorporateAdvantages() {
  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-20">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
          style={{
            background: "var(--corp-hero-accent, rgba(155, 27, 90, 0.1))",
            color: "var(--corp-hero-accent, #9B1B5A)",
            border: "1px solid var(--corp-hero-border, rgba(155, 27, 90, 0.2))",
          }}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>The TouchGift Enterprise Advantage</span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-[color:var(--corp-hero-text)]">
          Why Kenya&apos;s leading employers <br className="hidden sm:block" />
          <span className="italic font-light" style={{ color: "var(--corp-hero-accent, #9B1B5A)" }}>
            trust TouchGift at scale.
          </span>
        </h2>
        <p className="text-sm sm:text-base leading-relaxed text-[color:var(--corp-text-muted)]">
          Built from the ground up for HR directors, People teams, and procurement officers who demand flawless execution, data confidentiality, and audit-ready accounting.
        </p>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {ADVANTAGES.map((adv, idx) => {
          const Icon = adv.icon;
          return (
            <motion.div
              key={adv.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all hover:-translate-y-1 group"
              style={{
                background: "var(--corp-hero-card, var(--portal-surface, #FFFFFF))",
                border: "1px solid var(--corp-hero-border, var(--portal-border, rgba(155, 27, 90, 0.15)))",
                boxShadow: "0 4px 24px rgba(0, 0, 0, 0.04)",
              }}
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                    style={{
                      background: "var(--corp-hero-accent, rgba(155, 27, 90, 0.12))",
                      color: "var(--corp-hero-accent, #9B1B5A)",
                    }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span
                    className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border"
                    style={{
                      background: "var(--corp-hero-gold-tint, rgba(212, 168, 83, 0.12))",
                      color: "var(--corp-hero-gold, #D4A853)",
                      borderColor: "var(--corp-hero-gold, rgba(212, 168, 83, 0.3))",
                    }}
                  >
                    {adv.badge}
                  </span>
                </div>

                <h3 className="font-display text-xl sm:text-2xl font-bold mb-3 text-[color:var(--corp-hero-text)]">
                  {adv.title}
                </h3>
                <p className="text-sm leading-relaxed text-[color:var(--corp-text-muted)] mb-6">
                  {adv.description}
                </p>
              </div>

              <div
                className="pt-4 border-t flex items-center gap-2 text-xs font-semibold"
                style={{
                  borderColor: "var(--corp-hero-border, rgba(155, 27, 90, 0.1))",
                  color: "var(--corp-hero-accent, #9B1B5A)",
                }}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{adv.highlight}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Control Room Live Banner */}
      <div
        className="mt-12 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
        style={{
          background: "linear-gradient(135deg, rgba(155, 27, 90, 0.08) 0%, rgba(212, 168, 83, 0.08) 100%)",
          border: "1px solid var(--corp-hero-border, rgba(155, 27, 90, 0.2))",
        }}
      >
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-[color:var(--corp-hero-gold,#D4A853)]">
            Production Corporate Portal
          </p>
          <h4 className="text-lg sm:text-xl font-bold text-[color:var(--corp-hero-text)]">
            Want to see how your team manages bulk gifting live?
          </h4>
          <p className="text-xs sm:text-sm text-[color:var(--corp-text-muted)]">
            Explore our interactive Kenyan Enterprise Walkthrough with Safaricom, Equity, and KCB presets.
          </p>
        </div>

        <Link
          href="/corporate/dashboard"
          className="px-6 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shrink-0 transition-transform active:scale-95 shadow-md"
          style={{
            background: "var(--corp-hero-accent, #9B1B5A)",
            color: "#FFFFFF",
          }}
        >
          <span>Launch Dashboard Walkthrough</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}

