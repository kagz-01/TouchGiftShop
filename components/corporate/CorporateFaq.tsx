"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: "How does TouchGift handle KRA eTIMS invoices and VAT for corporate accounting?",
    a: "Every corporate order generates an official KRA eTIMS compliant invoice with your company's KRA PIN, QR verification code, and itemized VAT breakdown. We submit to the KRA Tax Invoice Management System in real time, guaranteeing full expense deductibility for your corporate tax filing.",
  },
  {
    q: "Can we pay via LPO / Purchase Order with Net-30 credit terms?",
    a: "Yes. For registered enterprise accounts and repeat corporate buyers, we accept approved Purchase Orders (PO/LPO) with standard Net-30 payment terms upon successful credit evaluation. Alternatively, you can pay via M-Pesa Corporate Paybill (400200) or Standard Chartered Bank Wire.",
  },
  {
    q: "How does recipient address confirmation work if our HR team doesn't have home addresses?",
    a: "You never need to collect or store private home addresses. Simply provide staff names and phone numbers via our CSV upload. TouchGift dispatches secure automated WhatsApp Magic Links directly to each recipient, allowing them to drop their preferred GPS delivery pin or landmark in complete privacy.",
  },
  {
    q: "What is your delivery coverage and SLA for large nationwide campaigns?",
    a: "Within Nairobi and surrounding metropolitan hubs (Kiambu, Machakos, Kajiado), we fulfill same-day or next-day scheduled deliveries with real-time photographic handoff confirmation. Across wider Kenya, our vetted courier logistics partners deliver within 24 to 48 hours.",
  },
  {
    q: "Can hampers be customized for Halal, non-alcoholic, or dietary requirements?",
    a: "Absolutely. We offer fully customizable hamper curations including 100% Halal options, alcohol-free gourmet crates, artisanal Kenyan teas and specialty coffees, sugar-free confections, and vegan-friendly self-care ensembles.",
  },
  {
    q: "Do you support custom enterprise branding, logos, and personalized gift notes?",
    a: "Yes. TouchGift offers bespoke laser engraving on drinkware and executive wooden chests, custom embroidery, foil-stamped ribbon detailing, and calligraphy handwritten gift notes bearing your company logo.",
  },
];

export default function CorporateFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="relative z-10 max-w-4xl mx-auto px-4 py-20 scroll-mt-20">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 bg-brand/10 text-brand border border-brand/20 dark:text-brand-light">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Procurement & HR Clarity</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3 text-[color:var(--corp-text)]">
          Frequently Answered Questions
        </h2>
        <p className="text-xs sm:text-sm text-[color:var(--corp-text-muted)] max-w-lg mx-auto">
          Everything your finance director, HR lead, and legal counsel need to know before partner onboarding.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border transition-all overflow-hidden bg-white dark:bg-white/[0.04] border-surface-border dark:border-white/10 shadow-sm"
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4 text-left font-bold text-sm sm:text-base text-[color:var(--corp-text)] transition-colors hover:text-brand"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
                    isOpen ? "rotate-180 text-brand" : "text-[color:var(--corp-text-muted)]"
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm leading-relaxed text-[color:var(--corp-text-muted)] border-t border-surface-border/50 dark:border-white/5">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
