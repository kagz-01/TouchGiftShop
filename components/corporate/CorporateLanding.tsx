"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Candy, Coffee, Flame, Cake as CakeIcon, Package, Gift, Zap, Banknote, Palette, FileSpreadsheet, Trophy, HeartHandshake, Tent, TreePine, Hand, Heart, ClipboardList, CreditCard, Building2 } from "lucide-react";
import BackToHome from "@/components/ui/BackToHome";

/* ─── Scroll reveal hook ─── */
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function Reveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "scale";
}) {
  const { ref, visible } = useInView(0.15);
  const transforms: Record<string, string> = {
    up: visible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0",
    left: visible ? "translate-x-0 opacity-100" : "-translate-x-16 opacity-0",
    right: visible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0",
    scale: visible ? "scale-100 opacity-100" : "scale-90 opacity-0",
  };
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${transforms[direction]} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION 1: HERO — Corporate landing hero
   ══════════════════════════════════════════════════════════ */
function CorporateHero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setLoaded(true); }, []);

  return (
    <section className="relative min-h-[80vh] flex items-center bg-transparent overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-brand/10 shape-premium-button blur-[120px] animate-pulse-soft" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold/10 shape-premium-button blur-[100px] animate-pulse-soft" style={{ animationDelay: "1s" }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />

      <div className="relative z-10 w-full page-container-capped py-20">
        <div className="mb-4">
          <BackToHome className="text-brand-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 xl:gap-12 items-center">
          {/* Left: Content */}
          <div>
            <div className={`inline-flex items-center gap-2 bg-gold/10 border border-gold/20 shape-premium-button px-4 py-2 mb-6 transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <span className="text-gold text-sm font-semibold"><Building2 className="w-4 h-4"/> Corporate Gifting</span>
            </div>

            <h1 className={`font-display italic section-heading font-bold text-brand-deep leading-[1.05] mb-6 transition-all duration-700 delay-200 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              Impress your team.
              <br />
              <span className="text-gradient bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
                Delight your clients.
              </span>
            </h1>

            <p className={`body-fluid text-brand-muted max-w-lg mb-8 leading-relaxed transition-all duration-700 delay-400 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              Curated gift hampers for employee appreciation, client thank-yous,
              and event giveaways. Bulk orders with same-day Nairobi delivery.
            </p>

            <div className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-500 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <Link
                href="/corporate/build"
                className="group px-8 py-4 bg-gradient-to-r from-gold to-gold-light text-brand-deep font-bold shape-premium-card text-lg transition-all duration-300 hover:shadow-gold hover:-translate-y-1 text-center"
              >
                <span className="flex items-center justify-center gap-2">
                  Build a Corporate Hamper
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              <a
                href="https://wa.me/254142677898?text=Hi%20TouchGift!%20I%27m%20interested%20in%20corporate%20gifting"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-white/60 backdrop-blur-md text-brand-deep font-semibold shape-premium-card text-lg border border-surface-border hover:bg-white shadow-sm transition-all duration-300 text-center"
              >
                Talk to Us
              </a>
            </div>
          </div>

          {/* Right: Visual — hamper showcase */}
          <div className={`hidden lg:block transition-all duration-700 delay-300 ${loaded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-16"}`}>
            <div className="relative">
              {/* Main card */}
              <div className="bg-white/60 backdrop-blur-md border border-surface-border shape-premium-card p-8 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 shape-premium-button blur-3xl" />
                <div className="relative z-10">
                  <div className="text-6xl mb-4 text-brand"><Gift className="w-12 h-12" /></div>
                  <h3 className="font-display italic text-2xl font-bold text-brand-deep mb-2">Custom Hamper</h3>
                  <p className="text-brand-muted text-sm mb-6">Pick items, add your branding, send to any number of recipients</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[<Candy key="1"/>, <Coffee key="2"/>, <Flame key="3"/>, <CakeIcon key="4"/>, <Package key="5"/>, <Gift key="6"/>].map((e, i) => (
                      <div key={i} className="bg-white/50 border border-surface-border shape-premium-card p-3 text-center text-2xl text-brand hover:bg-white hover:shadow-sm transition-all cursor-pointer">
                        {e}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating stats cards */}
              <div className="absolute -top-4 -right-4 bg-brand-deep shape-premium-card px-4 py-3 shadow-xl animate-float border border-white/10">
                <p className="text-white font-bold text-lg">500+</p>
                <p className="text-white/70 text-xs">Corporate orders</p>
              </div>
              <div className="absolute -bottom-3 -left-3 bg-gold shape-premium-card px-4 py-3 shadow-xl animate-float border border-gold-light" style={{ animationDelay: "1s" }}>
                <p className="text-brand-deep font-bold text-lg">24hrs</p>
                <p className="text-on-theme text-xs">Turnaround</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION 2: TRUST BAR — Key benefits
   ══════════════════════════════════════════════════════════ */
function TrustBar() {
  const benefits = [
    { icon: <Zap className="w-8 h-8 mx-auto text-brand" />, title: "Same-day delivery", desc: "Fast delivery by evening across Nairobi" },
    { icon: <Banknote className="w-8 h-8 mx-auto text-gold" />, title: "Bulk discounts", desc: "10+ gifts = 10% off. 50+ = 15% off. Custom quotes for 100+" },
    { icon: <Palette className="w-8 h-8 mx-auto text-coral" />, title: "Custom branding", desc: "Add your company logo, branded cards, and custom packaging" },
    { icon: <FileSpreadsheet className="w-8 h-8 mx-auto text-success" />, title: "CSV upload", desc: "Upload a spreadsheet of recipients — names, phones, notes" },
  ];

  return (
    <section className="py-12 bg-transparent">
      <div className="w-full page-container-capped">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {benefits.map((b, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="text-center group">
                <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">{b.icon}</span>
                <p className="font-semibold text-sm mb-1">{b.title}</p>
                <p className="text-brand-muted text-xs leading-relaxed">{b.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION 3: USE CASES — Why corporate gifting
   ══════════════════════════════════════════════════════════ */
function UseCases() {
  const cases = [
    {
      icon: <Trophy className="w-6 h-6 text-white" />,
      title: "Employee Appreciation",
      desc: "Reward hard work with a curated gift that shows genuine appreciation. Milestones, work anniversaries, top performers.",
      color: "from-brand to-brand-light",
    },
    {
      icon: <HeartHandshake className="w-6 h-6 text-white" />,
      title: "Client Thank-Yous",
      desc: "Strengthen relationships with a thoughtful gift after closing a deal, onboarding a new client, or during holidays.",
      color: "from-gold to-gold-light",
    },
    {
      icon: <Tent className="w-6 h-6 text-white" />,
      title: "Event Giveaways",
      desc: "Branded gift bags for conferences, launches, and corporate events. Leave a lasting impression.",
      color: "from-coral to-coral-light",
    },
    {
      icon: <TreePine className="w-6 h-6 text-white" />,
      title: "Holiday & Seasonal",
      desc: "Christmas, New Year, Ramadan, Easter — send seasonal gifts to your entire team or client list.",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: <Hand className="w-6 h-6 text-white" />,
      title: "Welcome & Onboarding Kits",
      desc: "Make new hires feel valued from day one with a branded welcome hamper.",
      color: "from-violet-500 to-purple-500",
    },
    {
      icon: <Heart className="w-6 h-6 text-white" />,
      title: "Thank You & Apology",
      desc: "A meaningful gesture after a project wrap, partnership milestone, or to make things right.",
      color: "from-blue-500 to-cyan-500",
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-transparent">
      <div className="w-full page-container-capped">
        <Reveal>
          <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-4 text-center">
            Use Cases
          </p>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="font-display italic section-heading font-bold text-center mb-4">
            Why companies choose TouchGift
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <p className="body-fluid text-brand-muted text-center max-w-xl mx-auto mb-16">
            Whether it&apos;s 5 gifts or 500, we handle curation, packaging,
            and delivery — so you can focus on your business.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((c, i) => (
            <Reveal key={i} delay={300 + i * 100}>
              <div className="bg-white/80 backdrop-blur-sm shape-premium-card border-white/20 p-6 border border-surface-border hover:shadow-card-hover transition-all duration-500 group hover:-translate-y-1">
                <div className={`w-14 h-14 bg-gradient-to-br ${c.color} shape-premium-card flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                  {c.icon}
                </div>
                <h3 className="font-display italic text-lg font-bold mb-2">{c.title}</h3>
                <p className="text-brand-muted text-sm leading-relaxed">{c.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION 4: HOW IT WORKS — 4-step corporate flow
   ══════════════════════════════════════════════════════════ */
function CorporateHowItWorks() {
  const steps = [
    {
      num: "01",
      icon: <Gift className="w-8 h-8" />,
      title: "Pick your gift",
      desc: "Choose from curated hampers or build a custom one. Browse our catalog or let us suggest based on your budget.",
      color: "from-brand to-brand-light",
    },
    {
      num: "02",
      icon: <ClipboardList className="w-8 h-8" />,
      title: "Add recipients",
      desc: "Upload a CSV spreadsheet or add recipients manually. Include names, phone numbers, and personal notes.",
      color: "from-gold to-gold-light",
    },
    {
      num: "03",
      icon: <Palette className="w-8 h-8" />,
      title: "Customize (optional)",
      desc: "Add your company logo to cards, choose branded packaging, or include a custom message for all recipients.",
      color: "from-coral to-coral-light",
    },
    {
      num: "04",
      icon: <CreditCard className="w-8 h-8" />,
      title: "Pay & deliver",
      desc: "One M-Pesa payment for all gifts. We handle individual delivery with photo proof for each recipient.",
      color: "from-success to-emerald-400",
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-transparent">
      <div className="w-full page-container-capped">
        <Reveal>
          <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-4 text-center">
            Simple as 1-2-3-4
          </p>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="font-display italic section-heading font-bold text-center mb-16">
            How corporate gifting works
          </h2>
        </Reveal>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-brand via-gold to-success -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
            {steps.map((step, i) => (
              <Reveal key={i} delay={200 + i * 150}>
                <div className="relative bg-white/80 backdrop-blur-sm shape-premium-card border-white/20 p-6 border border-surface-border shadow-card hover:shadow-card-hover transition-all duration-500 group hover:-translate-y-2">
                  <div className={`absolute -top-4 -left-2 w-12 h-12 bg-gradient-to-br ${step.color} shape-premium-card flex items-center justify-center text-white font-display italic font-bold text-lg shadow-ribbon group-hover:scale-110 transition-transform`}>
                    {step.num}
                  </div>
                  <div className="pt-4">
                    <span className="text-4xl mb-3 block group-hover:animate-wiggle">{step.icon}</span>
                    <h3 className="font-display italic text-lg font-bold mb-2">{step.title}</h3>
                    <p className="text-brand-muted text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION 5: PRICING TIERS — Volume discounts
   ══════════════════════════════════════════════════════════ */
function PricingTiers() {
  const tiers = [
    {
      range: "1–9 gifts",
      discount: "Standard",
      price: "From KSh 1,500/each",
      features: ["Free delivery in Nairobi", "Photo proof for each", "Digital gift card"],
      popular: false,
    },
    {
      range: "10–49 gifts",
      discount: "10% OFF",
      price: "From KSh 1,350/each",
      features: ["Everything in Standard", "Dedicated account rep", "Custom branded cards", "Priority delivery"],
      popular: true,
    },
    {
      range: "50+ gifts",
      discount: "15% OFF",
      price: "Custom quote",
      features: ["Everything in Premium", "Custom packaging with logo", "CSV upload support", "Invoice payment terms", "Dedicated delivery coordinator"],
      popular: false,
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-transparent">
      <div className="w-full page-container-capped">
        <Reveal>
          <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-4 text-center">
            Volume Pricing
          </p>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="font-display italic section-heading font-bold text-center mb-4">
            The more you send, the more you save
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <p className="body-fluid text-brand-muted text-center max-w-xl mx-auto mb-16">
            Transparent pricing with built-in volume discounts. No hidden fees, no surprises.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {tiers.map((tier, i) => (
            <Reveal key={i} delay={300 + i * 150}>
              <div className={`relative shape-premium-card p-6 border transition-all duration-500 group hover:-translate-y-2 ${
                tier.popular
                  ? "bg-brand-deep text-white border-brand shadow-glow scale-105"
                  : "bg-white border-surface-border hover:shadow-card-hover"
              }`}>
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-brand-deep text-xs font-bold px-3 py-1 shape-premium-button">
                    MOST POPULAR
                  </div>
                )}
                <p className={`text-sm font-semibold mb-1 ${tier.popular ? "text-gold" : "text-brand"}`}>{tier.range}</p>
                <p className={`text-3xl font-display italic font-bold mb-1 ${tier.popular ? "text-white" : ""}`}>{tier.discount}</p>
                <p className={`text-sm mb-6 ${tier.popular ? "text-white/60" : "text-brand-muted"}`}>{tier.price}</p>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${tier.popular ? "text-gold" : "text-success"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={tier.popular ? "text-white/80" : "text-brand-muted"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/corporate/build"
                  className={`block text-center py-3 shape-premium-card font-semibold transition-all duration-300 ${
                    tier.popular
                      ? "bg-gold text-brand-deep hover:bg-gold-light"
                      : "bg-brand/10 text-brand hover:bg-brand hover:text-white"
                  }`}
                >
                  Get Started
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION 6: TESTIMONIALS — Corporate social proof
   ══════════════════════════════════════════════════════════ */
function CorporateTestimonials() {
  return (
    <section className="py-24 md:py-32 bg-transparent">
      <div className="w-full page-container-capped">
        <Reveal>
          <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-4 text-center">
            Trusted by Companies
          </p>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="font-display italic section-heading font-bold text-center mb-12">
            What corporate clients say
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Sarah M.",
              role: "HR Director, Tech Co.",
              text: "We sent 45 welcome kits to new hires across Nairobi. TouchGift handled everything — the branded packaging was beautiful and every kit arrived on time.",
              count: "45 gifts",
            },
            {
              name: "James K.",
              role: "Sales Manager, Consultancy",
              text: "End-of-year client gifts used to be a nightmare. Now we just upload a CSV and TouchGift delivers. Our clients love the hampers.",
              count: "120 gifts",
            },
            {
              name: "Grace W.",
              role: "Events Coordinator, Bank",
              text: "Conference gift bags for 200 attendees, customized with our logo. Flawless execution. Will use again for our next event.",
              count: "200 gifts",
            },
          ].map((t, i) => (
            <Reveal key={i} delay={200 + i * 150}>
              <div className="bg-gradient-warm shape-premium-card p-6 border border-surface-border hover:shadow-card transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-brand/10 shape-premium-button flex items-center justify-center text-brand font-bold text-sm">
                    {t.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-brand-muted text-xs">{t.role}</p>
                  </div>
                  <span className="ml-auto bg-brand/10 text-brand text-xs font-bold px-2 py-1 shape-premium-button">{t.count}</span>
                </div>
                <p className="text-sm leading-relaxed">&ldquo;{t.text}&rdquo;</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION 7: FINAL CTA
   ══════════════════════════════════════════════════════════ */
function CorporateCTA() {
  return (
    <section className="py-24 md:py-32 bg-brand-deep relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-[20%] w-72 h-72 bg-brand/30 shape-premium-button blur-[100px] animate-pulse-soft" />
        <div className="absolute bottom-10 right-[20%] w-64 h-64 bg-gold/20 shape-premium-button blur-[80px] animate-pulse-soft" style={{ animationDelay: "1s" }} />
      </div>

      <div className="page-container text-center relative z-10 max-w-4xl mx-auto">
        <Reveal direction="scale">
          <span className="text-6xl mb-6 block animate-float">🏢</span>
        </Reveal>

        <Reveal delay={200}>
          <h2 className="font-display italic text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to impress?
          </h2>
        </Reveal>

        <Reveal delay={300}>
          <p className="text-xl text-white/50 max-w-lg mx-auto mb-10">
            Start with as few as 1 gift. Scale to 500+. Same-day delivery,
            custom branding, one simple checkout.
          </p>
        </Reveal>

        <Reveal delay={400}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/corporate/build"
              className="group px-10 py-5 bg-gradient-to-r from-gold to-gold-light text-brand-deep font-bold shape-premium-card text-lg transition-all duration-300 hover:shadow-gold hover:-translate-y-1"
            >
              <span className="flex items-center gap-2">
                Build a Corporate Hamper
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
            <a
              href="https://wa.me/254142677898?text=Hi%20TouchGift!%20I%27d%20like%20a%20custom%20corporate%20quote"
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-5 bg-white/60 backdrop-blur-md text-brand-deep font-semibold shape-premium-card text-lg border border-surface-border hover:bg-white shadow-sm transition-all duration-300"
            >
              Get a Custom Quote
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   EXPORT — Full corporate landing page
   ══════════════════════════════════════════════════════════ */
export default function CorporateLanding() {
  return (
    <div>
      <CorporateHero />
      <TrustBar />
      <UseCases />
      <CorporateHowItWorks />
      <PricingTiers />
      <CorporateTestimonials />
      <CorporateCTA />
    </div>
  );
}
