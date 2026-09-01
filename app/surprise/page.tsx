"use client";

import Link from "next/link";
import { useState } from "react";
import {
  EyeOff, MapPin, Camera, Zap, ArrowLeft, ChevronRight,
  ShieldCheck, Package, Clock, CheckCircle
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: <EyeOff className="w-6 h-6 text-white" />,
    title: "Pick a gift & go anonymous",
    description:
      "Browse and add any gift to your cart. At checkout, tick 'Send Anonymously' — your name and the price are completely hidden from the recipient.",
    color: "from-brand to-brand-light",
    tag: "At Checkout",
  },
  {
    number: "02",
    icon: <MapPin className="w-6 h-6 text-white" />,
    title: "We WhatsApp them a pin-drop link",
    description:
      "Don't have their address? No problem. After payment, we send the recipient a secure WhatsApp link. They tap on the map to drop their exact delivery pin.",
    color: "from-gold to-amber-400",
    tag: "Zero awkwardness",
  },
  {
    number: "03",
    icon: <Camera className="w-6 h-6 text-white" />,
    title: "You see it before they do",
    description:
      "We photograph every gift before it leaves our facility and send it to you. You see exactly what they're about to receive — no surprises on your end.",
    color: "from-coral to-rose-400",
    tag: "Photo proof",
  },
  {
    number: "04",
    icon: <Zap className="w-6 h-6 text-white" />,
    title: "Rider delivers to their pin",
    description:
      "Our rider uses the recipient's dropped pin for delivery. With Surprise Safeguard on, we never call or text the recipient first — the surprise stays intact.",
    color: "from-emerald-500 to-teal-400",
    tag: "Surprise intact",
  },
];

const faqs = [
  {
    q: "Does the recipient know who sent it?",
    a: "Only if you want them to. Toggle 'Send Anonymously' at checkout — your name, the price, and payment details are completely hidden.",
  },
  {
    q: "What if they don't open the pin-drop link?",
    a: "We send gentle reminders over 24 hours. If they still haven't pinned, we'll contact you (the sender) to arrange an alternative delivery point.",
  },
  {
    q: "Can I still include a personal note?",
    a: "Absolutely. You can write a heartfelt note at checkout. In anonymous mode, the note shows up but your name is replaced with 'A secret admirer' (or whatever you choose).",
  },
  {
    q: "What's the Photo Proof feature?",
    a: "Before every gift leaves our warehouse, our team photographs it and uploads the image to your order page. You can see exactly what they receive.",
  },
];

export default function SurpriseFeaturePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen section-theme-a">
      {/* ── Header ── */}
      <div className="bg-white border-b border-black/5 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-brand-muted hover:bg-brand/5 hover:text-brand transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-display font-bold text-brand-deep text-sm leading-none">Surprise Someone</h1>
            <p className="text-[11px] text-brand-muted mt-0.5">Anonymous · Pin Drop · Photo Proof</p>
          </div>
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-dark via-brand to-brand-light pt-16 pb-20 px-4">
        {/* Orbs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full translate-x-20 -translate-y-20" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold/10 rounded-full -translate-x-10 translate-y-10" />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/15 mb-6">
            <EyeOff className="w-3.5 h-3.5 text-gold" />
            <span className="text-[11px] font-semibold text-white/80 uppercase tracking-wider">Anonymous Gifting</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            Surprise them,<br />
            <span className="text-gold">without needing their address.</span>
          </h2>
          <p className="text-white/65 text-base max-w-md mx-auto mb-8 leading-relaxed">
            They get a gift. You stay anonymous. No address needed upfront.
            It's the most thoughtful way to send something special.
          </p>
          <Link
            href="/shop"
            id="surprise-shop-cta"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-brand-deep font-bold rounded-2xl hover:shadow-gold hover:-translate-y-0.5 transition-all"
          >
            Send a Surprise Gift
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* ── Feature pills ── */}
      <div className="relative z-20 max-w-3xl mx-auto px-4 -mt-6 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: <EyeOff className="w-4 h-4 text-brand" />, label: "Stay anonymous" },
            { icon: <MapPin className="w-4 h-4 text-brand" />, label: "They pin their location" },
            { icon: <Camera className="w-4 h-4 text-brand" />, label: "Photo proof sent to you" },
            { icon: <Zap className="w-4 h-4 text-brand" />, label: "Same-day delivery" },
          ].map((pill, i) => (
            <div key={i} className="bg-white rounded-2xl p-3.5 border border-black/6 shadow-sm flex items-center gap-2.5">
              <div className="w-8 h-8 bg-brand/8 rounded-xl flex items-center justify-center flex-shrink-0">
                {pill.icon}
              </div>
              <span className="text-[11px] font-semibold text-brand-deep leading-tight">{pill.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── How it works ── */}
      <div className="max-w-3xl mx-auto px-4 mb-16">
        <div className="text-center mb-8">
          <p className="text-[11px] font-semibold text-brand/60 uppercase tracking-wider mb-2">Step by step</p>
          <h3 className="font-display text-2xl md:text-3xl font-bold text-brand-deep">How it works</h3>
        </div>

        <div className="space-y-4">
          {steps.map((step, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 border border-black/6 shadow-sm flex items-start gap-5"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                {step.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-brand-muted/60 uppercase tracking-widest">{step.number}</span>
                  <span className="text-[10px] font-semibold bg-brand/8 text-brand px-2 py-0.5 rounded-full">{step.tag}</span>
                </div>
                <h4 className="font-display font-bold text-brand-deep mb-1.5">{step.title}</h4>
                <p className="text-sm text-brand-muted leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Trust strip ── */}
      <div className="bg-white border-y border-black/5 py-8 px-4 mb-16">
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />, title: "Price hidden", desc: "The recipient never sees what you paid" },
            { icon: <Package className="w-5 h-5 text-brand" />, title: "Beautifully wrapped", desc: "Every gift is boxed and ribboned before delivery" },
            { icon: <Clock className="w-5 h-5 text-gold-dark" />, title: "Same-day Nairobi", desc: "Same-day delivery across Nairobi" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-black/5">
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-brand-deep">{item.title}</p>
                <p className="text-xs text-brand-muted leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FAQs ── */}
      <div className="max-w-2xl mx-auto px-4 mb-16">
        <h3 className="font-display text-xl font-bold text-brand-deep mb-6 text-center">Common questions</h3>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl border border-black/6 overflow-hidden shadow-sm">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-sm font-semibold text-brand-deep pr-4">{faq.q}</span>
                <ChevronRight
                  className={`w-4 h-4 text-brand-muted flex-shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-90" : ""}`}
                />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 border-t border-black/5">
                  <p className="text-sm text-brand-muted leading-relaxed pt-3">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Final CTA ── */}
      <div className="max-w-3xl mx-auto px-4 pb-16">
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-dark via-brand to-brand-light rounded-3xl p-8 md:p-10 text-center">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-12 -translate-y-12" />
          <div className="relative z-10">
            <CheckCircle className="w-10 h-10 text-gold mx-auto mb-4" />
            <h3 className="font-display text-2xl font-bold text-white mb-2">Ready to surprise someone?</h3>
            <p className="text-white/60 text-sm mb-6 max-w-sm mx-auto">
              Browse our curated gifts and let us handle the rest — wrapping, delivery, and the perfect surprise.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-brand-deep font-bold rounded-2xl hover:shadow-gold hover:-translate-y-0.5 transition-all"
            >
              Browse Gifts
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
