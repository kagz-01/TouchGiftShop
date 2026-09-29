import re

with open('components/home/StorytellingHome.tsx', 'r') as f:
    content = f.read()

# Replace DilemmaCard
dilemma_card = """function DilemmaCard({
  title, desc, delay, children,
}: { title: string; desc: string; delay: number; children: React.ReactNode }) {
  return (
    <Reveal delay={delay} className="h-full">
      <div className="gd-card card-theme shape-premium-card group flex h-full flex-col gap-3.5 overflow-hidden p-4 pb-5 transition-transform duration-500 hover:-translate-y-1.5">
        {children}
        <h3 className="font-display text-[17px] font-bold leading-snug text-theme-heading">{title}</h3>
        <p className="text-[12.5px] leading-relaxed text-theme-body">{desc}</p>
      </div>
    </Reveal>
  );
}"""

content = re.sub(r'function DilemmaCard\(\{.*?<\/Reveal>\n\}', dilemma_card, content, flags=re.DOTALL)

# Replace ProblemSection
problem_section = """export function ProblemSection() {
  return (
    <section className="py-10 md:py-14 section-theme-a relative overflow-hidden">
      <div className="w-full px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <div className="text-center max-w-2xl mx-auto mb-6">
          <Reveal>
            <p className="text-gold font-bold text-xs uppercase tracking-[0.2em] mb-4">
              The Gifting Dilemma
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="font-display section-heading font-bold text-theme-heading">
              Care shouldn&apos;t feel like <span className="italic text-gold">work.</span>
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <div className="w-10 h-px bg-gold/70 mx-auto mb-6 mt-4" />
            <p className="text-theme-body text-[15px] italic leading-relaxed">
              You want it to mean something. It shouldn&apos;t take all afternoon.
            </p>
          </Reveal>
        </div>

        <div className="gd grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DilemmaCard
            delay={0}
            title="The Racing Clock"
            desc="Same-day delivery across Nairobi for the moments that cannot wait."
          >
            <ClockScene />
          </DilemmaCard>

          <DilemmaCard
            delay={100}
            title="Uninspired Choices"
            desc="A tightly curated edit so you are never scrolling through filler."
          >
            <PickScene />
          </DilemmaCard>

          <DilemmaCard
            delay={200}
            title="Logistical Headaches"
            desc="No address? We can coordinate discreetly with your recipient."
          >
            <LogisticsScene />
          </DilemmaCard>

          <DilemmaCard
            delay={300}
            title="Unexpected Costs"
            desc="Clear pricing and transparent delivery from the start."
          >
            <CostScene />
          </DilemmaCard>
        </div>
      </div>

      <style jsx global>{`
        /* ── 1 · clock ── */
        .gd-road-svg { stroke-dashoffset: 0; }
        .group:hover .gd-road-svg { animation: gd-road-anim 2s linear infinite; }
        @keyframes gd-road-anim { to { stroke-dashoffset: -24; } }

        .gd-hand1-svg { transform-origin: 90px 60px; transform: rotate(0deg); }
        .group:hover .gd-hand1-svg { animation: gd-spin 3s linear infinite; }

        .gd-hand2-svg { transform-origin: 90px 60px; transform: rotate(0deg); }
        .group:hover .gd-hand2-svg { animation: gd-spin 12s linear infinite; }

        @keyframes gd-spin { to { transform: rotate(360deg); } }

        .gd-scooter-svg { opacity: 1; transform: translateX(65px); }
        .group:hover .gd-scooter-svg { animation: gd-scooter-anim 4s ease-in-out infinite; }
        @keyframes gd-scooter-anim {
          0% { opacity: 0; transform: translateX(-40px); }
          20%, 80% { opacity: 1; transform: translateX(65px); }
          100% { opacity: 0; transform: translateX(180px); }
        }

        /* ── 2 · conveyor ── */
        .gd-boxes-svg { transform: translateX(-40px); }
        .group:hover .gd-boxes-svg { animation: gd-belt-anim 4s ease-in-out infinite; }
        @keyframes gd-belt-anim {
          0% { transform: translateX(0); }
          30%, 70% { transform: translateX(-40px); }
          100% { transform: translateX(-80px); opacity: 0; }
        }

        .gd-perfect-svg { transform-origin: 118px 83px; transform: scale(1.1); }
        .group:hover .gd-perfect-svg { animation: gd-perfect-anim 4s ease-in-out infinite; }
        @keyframes gd-perfect-anim {
          0% { transform: scale(1); }
          30%, 70% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        .gd-sparkle-svg { opacity: 1; transform: scale(1); transform-origin: 143px 52px; }
        .group:hover .gd-sparkle-svg { animation: gd-sparkle-anim 4s ease-in-out infinite; }
        @keyframes gd-sparkle-anim {
          0%, 25% { opacity: 0; transform: scale(0); }
          35%, 65% { opacity: 1; transform: scale(1.3); }
          75%, 100% { opacity: 0; transform: scale(0); }
        }

        /* ── 3 · route ── */
        .gd-chaos-svg { opacity: 0; }
        .group:hover .gd-chaos-svg { animation: gd-chaos-anim 4s infinite; }
        @keyframes gd-chaos-anim { 0%, 30% { opacity: 1; } 40%, 100% { opacity: 0; } }

        .gd-smooth-svg { stroke-dashoffset: 0; }
        .group:hover .gd-smooth-svg { animation: gd-smooth-anim 4s infinite; }
        @keyframes gd-smooth-anim { 0%, 35% { stroke-dashoffset: 140; } 55%, 100% { stroke-dashoffset: 0; } }

        .gd-mappin-svg { opacity: 1; transform: translateY(0); }
        .group:hover .gd-mappin-svg { animation: gd-mappin-anim 4s infinite; }
        @keyframes gd-mappin-anim {
          0%, 55% { opacity: 0; transform: translateY(-20px); }
          65% { opacity: 1; transform: translateY(0); }
          75% { transform: translateY(-5px); }
          85%, 100% { opacity: 1; transform: translateY(0); }
        }

        /* ── 4 · receipt ── */
        .gd-receipt-svg { transform: translateY(0); }
        .group:hover .gd-receipt-svg { animation: gd-receipt-anim 4s ease-out infinite; }
        @keyframes gd-receipt-anim {
          0% { transform: translateY(60px); opacity: 0; }
          15%, 85% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-60px); opacity: 0; }
        }

        .gd-total-svg { fill: #22c55e; }
        .group:hover .gd-total-svg { animation: gd-total-anim 4s infinite; }
        @keyframes gd-total-anim { 0%, 30% { fill: #221512; } 35%, 100% { fill: #22c55e; } }

        .gd-stamp-svg { transform-origin: 90px 70px; opacity: 1; transform: scale(1); }
        .group:hover .gd-stamp-svg { animation: gd-stamp-anim 4s infinite; }
        @keyframes gd-stamp-anim {
          0%, 40% { opacity: 0; transform: scale(2); }
          50% { opacity: 1; transform: scale(0.9); }
          55%, 90% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          .gd * { animation: none !important; }
        }
      `}</style>
    </section>
  );
}"""

content = re.sub(r'export function ProblemSection\(\) \{.*?\n    \}\n  \);\n\}', problem_section, content, flags=re.DOTALL)

# Replace the 4 Scenes
scenes = """const DILEMMA_SCENE = "relative h-[140px] rounded-xl overflow-hidden flex-none bg-gradient-to-br from-brand/[0.04] to-gold/[0.03] dark:from-brand/[0.08] dark:to-gold/[0.05] flex items-center justify-center";

/* 1 — The Racing Clock */
function ClockScene() {
  return (
    <div className={DILEMMA_SCENE}>
      <svg viewBox="0 0 180 140" className="w-full h-full" aria-hidden>
        <path d="M 0 110 Q 90 140 180 110" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="12" />
        <path d="M 0 110 Q 90 140 180 110" fill="none" stroke="#9B1B5A" strokeWidth="2" strokeDasharray="6 6" className="gd-road-svg" />
        <circle cx="90" cy="60" r="30" fill="white" stroke="#9B1B5A" strokeWidth="3" />
        <circle cx="90" cy="60" r="26" fill="url(#clockGrad)" />
        <line x1="90" y1="60" x2="90" y2="40" stroke="#9B1B5A" strokeWidth="3" strokeLinecap="round" className="gd-hand1-svg" />
        <line x1="90" y1="60" x2="105" y2="60" stroke="#D4A853" strokeWidth="3" strokeLinecap="round" className="gd-hand2-svg" />
        <circle cx="90" cy="60" r="4" fill="#9B1B5A" />
        <text x="20" y="115" fontSize="26" className="gd-scooter-svg">🛵</text>
        <defs>
          <linearGradient id="clockGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="100%" stopColor="#fdf8f9" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/* 2 — Uninspired Choices */
function PickScene() {
  return (
    <div className={DILEMMA_SCENE}>
      <svg viewBox="0 0 180 140" className="w-full h-full" aria-hidden>
        <rect x="0" y="100" width="180" height="6" fill="rgba(0,0,0,0.1)" />
        <g className="gd-boxes-svg">
          <rect x="20" y="70" width="30" height="30" rx="4" fill="#e5e5e5" stroke="#ccc" strokeWidth="1" />
          <rect x="60" y="70" width="30" height="30" rx="4" fill="#e5e5e5" stroke="#ccc" strokeWidth="1" />
          <rect x="100" y="65" width="36" height="36" rx="6" fill="url(#brandGrad)" filter="url(#glow)" className="gd-perfect-svg" />
          <path d="M 118 65 L 118 101" stroke="white" strokeWidth="2" opacity="0.5" className="gd-perfect-svg" />
          <path d="M 100 83 L 136 83" stroke="white" strokeWidth="2" opacity="0.5" className="gd-perfect-svg" />
          <rect x="146" y="70" width="30" height="30" rx="4" fill="#e5e5e5" stroke="#ccc" strokeWidth="1" />
          <rect x="186" y="70" width="30" height="30" rx="4" fill="#e5e5e5" stroke="#ccc" strokeWidth="1" />
        </g>
        <text x="135" y="60" fontSize="16" className="gd-sparkle-svg">✨</text>
        <defs>
          <linearGradient id="brandGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9B1B5A" />
            <stop offset="100%" stopColor="#D4A853" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
}

/* 3 — Logistical Headaches */
function LogisticsScene() {
  return (
    <div className={DILEMMA_SCENE}>
      <svg viewBox="0 0 180 140" className="w-full h-full" aria-hidden>
        <path d="M 30 70 Q 50 20, 80 80 T 120 40 T 150 70" fill="none" stroke="#ccc" strokeWidth="2" strokeDasharray="4 4" className="gd-chaos-svg" />
        <path d="M 30 70 Q 90 20 150 70" fill="none" stroke="#9B1B5A" strokeWidth="3" strokeDasharray="140" className="gd-smooth-svg" />
        <text x="30" y="80" textAnchor="middle" fontSize="24">🏠</text>
        <text x="150" y="80" textAnchor="middle" fontSize="24">🎁</text>
        <text x="150" y="45" textAnchor="middle" fontSize="24" className="gd-mappin-svg">📍</text>
      </svg>
    </div>
  );
}

/* 4 — Unexpected Costs */
function CostScene() {
  return (
    <div className={DILEMMA_SCENE}>
      <svg viewBox="0 0 180 140" className="w-full h-full" aria-hidden>
        <g className="gd-receipt-svg">
          <rect x="50" y="30" width="80" height="90" fill="white" filter="url(#shadow3)" />
          <path d="M 50 120 L 55 115 L 60 120 L 65 115 L 70 120 L 75 115 L 80 120 L 85 115 L 90 120 L 95 115 L 100 120 L 105 115 L 110 120 L 115 115 L 120 120 L 125 115 L 130 120" fill="white" />
          <rect x="60" y="45" width="40" height="4" fill="#ccc" rx="2" />
          <rect x="110" y="45" width="10" height="4" fill="#ccc" rx="2" />
          <rect x="60" y="60" width="30" height="4" fill="#ccc" rx="2" />
          <rect x="110" y="60" width="10" height="4" fill="#ccc" rx="2" />
          <line x1="60" y1="75" x2="120" y2="75" stroke="#eee" strokeWidth="2" />
          <rect x="60" y="85" width="20" height="6" fill="#221512" rx="2" />
          <rect x="100" y="85" width="20" height="6" fill="#221512" rx="2" className="gd-total-svg" />
        </g>
        <g className="gd-stamp-svg">
          <rect x="35" y="55" width="110" height="30" rx="4" fill="none" stroke="#22c55e" strokeWidth="3" transform="rotate(-15 90 70)" />
          <text x="90" y="76" textAnchor="middle" fill="#22c55e" fontSize="13" fontWeight="800" letterSpacing="1" transform="rotate(-15 90 70)">NO HIDDEN FEES</text>
        </g>
        <defs>
          <filter id="shadow3">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.1"/>
          </filter>
        </defs>
      </svg>
    </div>
  );
}"""

content = re.sub(r'const SCENE =.*?(?=\n\/\* ══════════════════════════════════════════════════════════)', scenes, content, flags=re.DOTALL)
content = re.sub(r'function useActiveScene\(\) \{.*?\n\}\n', '', content, flags=re.DOTALL)

with open('components/home/StorytellingHome.tsx', 'w') as f:
    f.write(content)

print("Replaced dilemma successfully")
