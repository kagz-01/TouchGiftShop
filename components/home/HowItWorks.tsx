import Link from "next/link";

const STEPS = [
  {
    icon: "🎁",
    title: "Pick a Gift",
    description: "Browse our curated collection or let AI find the perfect one for you.",
    cta: { label: "Browse Gifts", href: "/" },
  },
  {
    icon: "📍",
    title: "We Deliver",
    description: "Same-day in Nairobi, next-day nationwide. Recipient drops their own pin.",
    cta: { label: "How Delivery Works", href: "/delivery" },
  },
  {
    icon: "✨",
    title: "They Smile",
    description: "Photo proof before dispatch. Your identity stays private if you want.",
    cta: { label: "Surprise Safeguard", href: "/returns" },
  },
];

export default function HowItWorks() {
  return (
    <section className="py-12 md:py-16 bg-surface-secondary">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center mb-10">
          <span className="text-xs text-brand font-semibold uppercase tracking-wider">Simple as 1-2-3</span>
          <h2 className="font-display text-2xl md:text-3xl font-bold mt-2">How TouchGift Works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((step, i) => (
            <div key={i} className="relative">
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[calc(50%+40px)] right-[calc(-50%+40px)] h-0.5 bg-gradient-to-r from-brand/20 to-brand/5 z-0" />
              )}

              <div className="relative bg-white rounded-2xl p-6 border border-surface-border text-center space-y-3 hover:shadow-card-hover transition-all duration-300 group">
                {/* Step number */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-brand text-white text-xs font-bold flex items-center justify-center shadow-ribbon">
                  {i + 1}
                </div>

                <div className="text-4xl mt-2 group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>

                <h3 className="font-display font-bold text-lg">{step.title}</h3>

                <p className="text-sm text-brand-muted leading-relaxed">
                  {step.description}
                </p>

                <Link
                  href={step.cta.href}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-dark transition-colors"
                >
                  {step.cta.label}
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
