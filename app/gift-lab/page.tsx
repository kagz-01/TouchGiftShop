import Link from "next/link";

export default function GiftLabPage() {
  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-dark to-brand px-4 py-12 md:py-16">
        <div className="max-w-lg mx-auto text-center">
          <span className="text-5xl block mb-4">🔬</span>
          <h1 className="font-display text-3xl font-bold text-white mb-3">Gift Lab</h1>
          <p className="text-white/80 text-sm max-w-sm mx-auto">
            Two creative ways to make gifting easier — build a custom hamper or pool funds with friends.
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-lg mx-auto px-4 -mt-6 relative z-10 pb-12">
        <div className="space-y-4">
          {/* Build a Hamper */}
          <Link
            href="/gift-lab/build-hamper"
            className="block bg-white rounded-2xl p-6 border border-surface-border shadow-card hover:shadow-card-hover transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                🎁
              </div>
              <div className="flex-1">
                <h2 className="font-display font-bold text-lg mb-1 group-hover:text-brand transition-colors">
                  Build a Hamper
                </h2>
                <p className="text-sm text-brand-muted leading-relaxed">
                  Choose a box size and tap items to add. Perfect when you want to put together something personal and curated.
                </p>
                <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-brand">
                  Start building
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Pool a Gift */}
          <Link
            href="/gift-lab/pool"
            className="block bg-white rounded-2xl p-6 border border-surface-border shadow-card hover:shadow-card-hover transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                💰
              </div>
              <div className="flex-1">
                <h2 className="font-display font-bold text-lg mb-1 group-hover:text-brand transition-colors">
                  Pool a Gift
                </h2>
                <p className="text-sm text-brand-muted leading-relaxed">
                  Start a group fund and split the cost with friends via M-Pesa. Share a link — everyone contributes their own amount.
                </p>
                <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-brand">
                  Start a pool
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* How it works */}
        <div className="mt-10 text-center">
          <p className="text-xs text-brand-muted uppercase tracking-wider mb-4">Why Gift Lab?</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: "🎨", text: "Personal & creative" },
              { icon: "🤝", text: "Split the cost" },
              { icon: "✨", text: "Less guessing" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <span className="text-2xl block mb-2">{item.icon}</span>
                <p className="text-xs text-brand-muted">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
