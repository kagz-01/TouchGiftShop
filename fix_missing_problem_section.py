import re

with open('components/home/StorytellingHome.tsx', 'r') as f:
    content = f.read()

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
}
"""

content = content.replace("/* ══════════════════════════════════════════════════════════\n   SECTION 3: THE SOLUTION — Brand reveal\n   ══════════════════════════════════════════════════════════ */", problem_section + "\n/* ══════════════════════════════════════════════════════════\n   SECTION 3: THE SOLUTION — Brand reveal\n   ══════════════════════════════════════════════════════════ */")

with open('components/home/StorytellingHome.tsx', 'w') as f:
    f.write(content)

print("Restored ProblemSection successfully")
