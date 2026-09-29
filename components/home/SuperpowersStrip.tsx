"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* The block idles while off-screen so the eight loops cost nothing. */
function useActiveScene() {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, on };
}

const SCENE =
  "relative h-[82px] rounded-xl overflow-hidden flex-none bg-brand/[0.07] dark:bg-white/[0.06]";

function Arrow() {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-3 h-3">
      <path d="M1 6h10M7 2l4 4-4 4" />
    </svg>
  );
}

function FeatureCard({
  title, desc, cta, href, delay, children,
}: { title: string; desc: string; cta: string; href: string; delay: number; children: React.ReactNode }) {
  return (
    <div className="h-full">
      <Link
        href={href}
        style={{ transitionDelay: `${delay}ms` }}
        className="sp-card card-theme shape-premium-card group flex h-full flex-col gap-3 p-4 pb-5 overflow-hidden transition-transform duration-500 hover:-translate-y-1.5"
      >
        {children}
        <h3 className="font-display text-[17px] font-semibold leading-snug text-theme-heading">
          {title}
        </h3>
        <p className="text-[12.5px] leading-relaxed text-theme-body">{desc}</p>
        <span className="sp-go mt-auto inline-flex items-center gap-1.5 text-[11.5px] font-semibold">
          {cta} <Arrow />
        </span>
      </Link>
    </div>
  );
}

/* 1 — Pool a Gift: contributors drop coins into a shared pot, gift lands at full */
function PoolScene() {
  return (
    <div className={SCENE}>
      <span className="sp-av sp-av1 bg-brand">W</span>
      <span className="sp-av sp-av2 bg-gold">B</span>
      <span className="sp-av sp-av3 bg-coral">G</span>
      <span className="sp-coin sp-coin1 bg-brand" />
      <span className="sp-coin sp-coin2 bg-brand" />
      <span className="sp-coin sp-coin3 bg-brand" />
      <div className="sp-pot">
        <div className="sp-potfill" />
      </div>
      <span className="sp-potgift">🎁</span>
    </div>
  );
}

/* 2 — Build a Hamper: pieces drop in, then the ribbon draws itself */
function HamperScene() {
  return (
    <div className={SCENE}>
      <span className="sp-hitem sp-h1 bg-brand" />
      <span className="sp-hitem sp-h2 bg-gold" />
      <span className="sp-hitem sp-h3 bg-coral" />
      <div className="sp-hbasket" />
      <svg className="sp-ribbon" viewBox="0 0 46 22" aria-hidden>
        <path d="M8 0v22M23 -4c-6 6 -6 10 0 14c6 -4 6 -8 0 -14z" />
      </svg>
    </div>
  );
}

/* 3 — AI Gift Finder: question, budget chip, then the match slides in */
function FinderScene() {
  return (
    <div className={SCENE}>
      <span className="sp-qbubble">Who&apos;s it for?</span>
      <span className="sp-chip bg-brand">Under 3k</span>
      <div className="sp-resultcard">🎁</div>
      <span className="sp-ok text-success">✓ Match</span>
    </div>
  );
}

/* 4 — Send Anonymously: one toggle wipes the sender name off the label */
function AnonScene() {
  return (
    <div className={SCENE}>
      <div className="sp-toggle">
        <span className="sp-knob bg-brand" />
      </div>
      <span className="sp-nametag">From: Wanjiku</span>
      <span className="sp-redact" />
      <span className="sp-anongift">🎁</span>
    </div>
  );
}

/* 5 — Photo Proof: shutter, flash, and the photograph notification lands */
function ProofScene() {
  return (
    <div className={SCENE}>
      <span className="sp-subject">📦</span>
      <div className="sp-shutter" />
      <div className="sp-flash" />
      <div className="sp-notif">
        📸 <span className="text-success font-extrabold">✓</span>
      </div>
    </div>
  );
}

/* 6 — Gift Cards: the card flips to reveal the code, then it flies out */
function CardsScene() {
  return (
    <div className={SCENE}>
      <div className="sp-flip3d">
        <div className="sp-face sp-front">GIFT</div>
        <div className="sp-face sp-back">#8K2Q</div>
      </div>
      <span className="sp-sendicon text-brand">➤</span>
      <span className="sp-phone">📱</span>
      <span className="sp-ok2 text-success">✓</span>
    </div>
  );
}

/* 7 — Gift Subscriptions: the date pulses, the cycle keeps turning */
function SubsScene() {
  return (
    <div className={SCENE}>
      <div className="sp-cal">
        <span className="sp-calmonth text-brand">MAR</span>
        <span className="sp-caldate">14</span>
      </div>
      <span className="sp-autoarrow text-brand">⟳</span>
      <span className="sp-microgift">🎁</span>
    </div>
  );
}

/* 8 — Rewards: the link fills, the invite flies, both sides earn */
function RewardsScene() {
  return (
    <div className={SCENE}>
      <span className="sp-person sp-p1">🙂</span>
      <span className="sp-person sp-p2">🙂</span>
      <div className="sp-link">
        <div className="sp-linkfill bg-brand" />
      </div>
      <span className="sp-plane text-brand">➤</span>
      <span className="sp-pts sp-pts1 text-brand">+1000</span>
      <span className="sp-pts sp-pts2 text-brand">+1000</span>
    </div>
  );
}

export default function SuperpowersStrip() {
  const { ref, on } = useActiveScene();

  return (
    <section className="py-10 md:py-14 section-theme-c">
      <div className="w-full page-container-capped">
        <div className="text-center mb-6">
          <p className="text-brand font-bold text-xs uppercase tracking-[0.2em] mb-3">
            TouchGift Exclusives
          </p>
          <h2 className="font-display text-2xl md:text-3xl text-theme-heading leading-tight heading-elegant">
            Your gifting{" "}
            <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
              superpowers
            </span>
          </h2>
          <p className="text-theme-body text-[15px] leading-relaxed max-w-xl mx-auto mt-3">
            Every tool here exists because a great gift shouldn&apos;t take guesswork, awkward
            logistics, or a wallet full of surprises.
          </p>
        </div>

        <div
          ref={ref}
          data-on={on ? "1" : "0"}
          className="sp grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <FeatureCard delay={0} href="/pool/create" title="Pool a Gift" cta="Pool a Gift"
            desc="Everyone chips in what they can — we combine it into one extraordinary gift.">
            <PoolScene />
          </FeatureCard>

          <FeatureCard delay={60} href="/gift-lab" title="Build a Hamper" cta="Start Building"
            desc="Pick each piece yourself — we arrange, wrap, and ribbon it into one bespoke gift.">
            <HamperScene />
          </FeatureCard>

          <FeatureCard delay={120} href="/gift-finder" title="AI Gift Finder" cta="Find a Gift"
            desc="Tell us who it's for and your budget — a 30-second quiz finds the match.">
            <FinderScene />
          </FeatureCard>

          <FeatureCard delay={180} href="/gift-cards" title="Gift Cards" cta="Buy a Gift Card"
            desc="Instant digital gifting — when the best choice is letting them choose.">
            <CardsScene />
          </FeatureCard>

          <FeatureCard delay={240} href="/surprise" title="Send Anonymously" cta="Explore"
            desc="Flip one switch and your name, price tag, and sender details all disappear.">
            <AnonScene />
          </FeatureCard>

          <FeatureCard delay={300} href="/delivery" title="Photo Proof" cta="How it works"
            desc="We photograph your wrapped gift and send it to you before it leaves for delivery.">
            <ProofScene />
          </FeatureCard>

          <FeatureCard delay={360} href="/subscriptions" title="Gift Subscriptions" cta="Set It Up"
            desc="Set the date once — we auto-send a gift every birthday and anniversary after.">
            <SubsScene />
          </FeatureCard>

          <FeatureCard delay={420} href="/referrals" title="Rewards" cta="Get Your Code"
            desc="Share your code — when a friend orders, you both earn 1,000 points toward a future gift.">
            <RewardsScene />
          </FeatureCard>
        </div>
      </div>

      <style jsx global>{`
        .sp[data-on="0"] * { animation-play-state: paused !important; }

        /* ── 1 · pool ── */
        .sp-av {
          position: absolute; top: 8px; width: 16px; height: 16px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 8px; font-weight: 700; color: #fff; line-height: 1;
        }        .sp-av1 { left: 14px; }
        .sp-av2 { left: 50%; margin-left: -8px; }
        .sp-av3 { right: 14px; }
        .sp-coin {
          position: absolute; top: 24px; width: 7px; height: 7px; border-radius: 50%;
          opacity: 0;
        }
        .sp-coin1 { left: 16px; animation: sp-coindrop 4s infinite; }
        .sp-coin2 { left: 50%; margin-left: -3.5px; animation: sp-coindrop 4s infinite .45s; }
        .sp-coin3 { right: 16px; animation: sp-coindrop 4s infinite .9s; }
        @keyframes sp-coindrop {
          0%, 4% { opacity: 0; transform: translateY(0); }
          10% { opacity: 1; transform: translateY(0); }
          22% { opacity: 1; transform: translateY(28px); }
          28%, 100% { opacity: 0; transform: translateY(28px); }
        }
        .sp-pot {
          position: absolute; bottom: 10px; left: 14px; right: 14px; height: 7px;
          border-radius: 4px; background: rgba(0, 0, 0, 0.1); overflow: hidden;
        }
        .sp-potfill {
          position: absolute; inset: 0; width: 0; border-radius: 4px;
          background: linear-gradient(90deg, #9B1B5A, #D4A853);
          animation: sp-potfill 4s infinite;
        }
        @keyframes sp-potfill {
          0%, 8% { width: 0; } 24% { width: 34%; } 52% { width: 64%; }
          80% { width: 100%; } 100% { width: 0; }
        }
        .sp-potgift {
          position: absolute; bottom: 20px; left: 50%; font-size: 13px;
          opacity: 0; transform: translate(-50%, 4px) scale(.6);
          animation: sp-potgift 4s infinite;
        }
        @keyframes sp-potgift {
          0%, 80% { opacity: 0; transform: translate(-50%, 4px) scale(.6); }
          88%, 96% { opacity: 1; transform: translate(-50%, -2px) scale(1); }
          100% { opacity: 0; transform: translate(-50%, 4px) scale(.6); }
        }

        /* ── 2 · hamper ── */
        .sp-hbasket {
          position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%);
          width: 46px; height: 22px; border: 1.6px solid #9B1B5A; border-top: none;
          border-radius: 0 0 8px 8px; opacity: .7;
        }
        .sp-hitem {
          position: absolute; top: 8px; width: 9px; height: 9px; border-radius: 2px; opacity: 0;
        }
        .sp-h1 { left: 50%; margin-left: -16px; animation: sp-hset 4s infinite; }
        .sp-h2 { left: 50%; margin-left: -4px; border-radius: 50%; animation: sp-hset 4s infinite .5s; }
        .sp-h3 { left: 50%; margin-left: 8px; animation: sp-hset 4s infinite 1s; }
        @keyframes sp-hset {
          0%, 6% { opacity: 0; transform: translateY(0); }
          16%, 74% { opacity: 1; transform: translateY(20px); }
          86%, 100% { opacity: 0; transform: translateY(20px); }
        }
        .sp-ribbon {
          position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%);
          width: 46px; height: 22px;
        }
        .sp-ribbon path {
          fill: none; stroke: #D4A853; stroke-width: 2; stroke-linecap: round;
          stroke-dasharray: 60; stroke-dashoffset: 60; animation: sp-ribbondraw 4s infinite;
        }
        @keyframes sp-ribbondraw {
          0%, 72% { stroke-dashoffset: 60; opacity: 0; }
          82% { opacity: 1; }
          92%, 96% { stroke-dashoffset: 0; opacity: 1; }
          100% { opacity: 0; }
        }

        /* ── 3 · finder ── */
        .sp-qbubble {
          position: absolute; top: 10px; left: 10px; background: #fff; color: #221512;
          border-radius: 8px 8px 8px 2px; padding: 3px 7px; font-size: 8px; font-weight: 600;
          opacity: 0; box-shadow: 0 2px 6px rgba(0, 0, 0, .08); animation: sp-qb 4s infinite;
        }
        @keyframes sp-qb {
          0%, 4% { opacity: 0; transform: translateY(4px); }
          12%, 36% { opacity: 1; transform: translateY(0); }
          44%, 100% { opacity: 0; transform: translateY(-4px); }
        }
        .sp-chip {
          position: absolute; top: 34px; left: 10px; color: #fff; border-radius: 99px;
          padding: 3px 8px; font-size: 8px; font-weight: 600; opacity: 0;
          animation: sp-chipin 4s infinite;
        }
        @keyframes sp-chipin {
          0%, 40% { opacity: 0; transform: scale(.7); }
          48%, 66% { opacity: 1; transform: scale(1); }
          74%, 100% { opacity: 0; transform: scale(.7); }
        }
        .sp-resultcard {
          position: absolute; top: 14px; right: -40px; width: 34px; height: 40px;
          background: #fff; border-radius: 6px; box-shadow: 0 4px 10px rgba(0, 0, 0, .12);
          display: flex; align-items: center; justify-content: center; font-size: 14px;
          animation: sp-resultin 4s infinite;
        }
        @keyframes sp-resultin {
          0%, 64% { right: -40px; opacity: 0; }
          76%, 94% { right: 8px; opacity: 1; }
          100% { right: 8px; opacity: 0; }
        }
        .sp-ok { position: absolute; bottom: 16px; right: 6px; font-size: 9px; font-weight: 800; opacity: 0; animation: sp-rcheck 4s infinite; }
        @keyframes sp-rcheck { 0%, 80% { opacity: 0; } 88%, 96% { opacity: 1; } 100% { opacity: 0; } }

        /* ── 4 · anonymous ── */
        .sp-toggle {
          position: absolute; top: 12px; left: 12px; width: 22px; height: 12px;
          border-radius: 99px; background: rgba(0, 0, 0, .1); border: 1px solid #9B1B5A;
        }
        .sp-knob {
          position: absolute; top: 1px; left: 1px; width: 8px; height: 8px; border-radius: 50%;
          animation: sp-knobmove 3.2s infinite;
        }
        @keyframes sp-knobmove { 0%, 15% { left: 1px; } 55%, 100% { left: 11px; } }
        .sp-nametag { position: absolute; top: 34px; left: 12px; font-size: 9px; font-weight: 600; color: #221512; }
        .sp-redact {
          position: absolute; top: 33px; left: 12px; height: 10px; width: 0;
          background: #221512; border-radius: 2px; animation: sp-redact 3.2s infinite;
        }
        @keyframes sp-redact { 0%, 55% { width: 0; } 75%, 100% { width: 38px; } }
        .sp-anongift { position: absolute; bottom: 10px; right: 14px; font-size: 18px; }

        /* ── 5 · photo proof ── */
        .sp-subject { position: absolute; bottom: 10px; left: 14px; font-size: 16px; }
        .sp-shutter {
          position: absolute; bottom: 6px; left: 6px; width: 26px; height: 26px;
          border-radius: 50%; border: 2px solid #9B1B5A; opacity: 0;
          animation: sp-shutterpulse 3.6s infinite;
        }
        @keyframes sp-shutterpulse {
          0%, 22% { opacity: 0; transform: scale(1); }
          30% { opacity: .9; transform: scale(.7); }
          38%, 100% { opacity: 0; transform: scale(1); }
        }
        .sp-flash { position: absolute; inset: 0; background: #fff; opacity: 0; animation: sp-flash 3.6s infinite; }
        @keyframes sp-flash { 0%, 28% { opacity: 0; } 32% { opacity: .9; } 40%, 100% { opacity: 0; } }
        .sp-notif {
          position: absolute; bottom: -30px; right: 8px; width: 34px; height: 26px;
          background: #fff; border-radius: 6px; box-shadow: 0 4px 10px rgba(0, 0, 0, .15);
          display: flex; align-items: center; justify-content: center; gap: 2px; font-size: 9px;
          animation: sp-notifup 3.6s infinite;
        }
        @keyframes sp-notifup {
          0%, 44% { bottom: -30px; opacity: 0; }
          58%, 88% { bottom: 8px; opacity: 1; }
          100% { bottom: 8px; opacity: 0; }
        }

        /* ── 6 · gift cards ── */
        .sp-flip3d { position: absolute; top: 16px; left: 14px; width: 34px; height: 22px; perspective: 200px; }
        .sp-face {
          position: absolute; inset: 0; border-radius: 5px; backface-visibility: hidden;
          display: flex; align-items: center; justify-content: center;
          font-size: 8px; font-weight: 700; color: #fff;
        }
        .sp-front { background: linear-gradient(135deg, #9B1B5A, #C4297A); animation: sp-flip 4s infinite; }
        .sp-back {
          background: linear-gradient(135deg, #8a5a2f, #D4A853);
          transform: rotateY(180deg); animation: sp-flipback 4s infinite;
        }
        @keyframes sp-flip { 0%, 20% { transform: rotateY(0); } 45%, 100% { transform: rotateY(180deg); } }
        @keyframes sp-flipback { 0%, 20% { transform: rotateY(180deg); } 45%, 100% { transform: rotateY(360deg); } }
        .sp-sendicon { position: absolute; top: 26px; left: 36px; font-size: 11px; opacity: 0; animation: sp-sendfly 4s infinite; }
        @keyframes sp-sendfly { 0%, 50% { opacity: 0; left: 36px; } 58% { opacity: 1; } 72%, 100% { opacity: 0; left: 64px; } }
        .sp-phone { position: absolute; bottom: 8px; right: 10px; font-size: 16px; }
        .sp-ok2 { position: absolute; bottom: 8px; right: 2px; font-size: 9px; font-weight: 800; opacity: 0; animation: sp-pcheck 4s infinite; }
        @keyframes sp-pcheck { 0%, 72% { opacity: 0; } 80%, 96% { opacity: 1; } 100% { opacity: 0; } }

        /* ── 7 · subscriptions ── */
        .sp-cal {
          position: absolute; top: 10px; left: 50%; transform: translateX(-50%);
          width: 36px; height: 32px; border: 1.5px solid #9B1B5A; border-radius: 5px; opacity: .85;
        }
        .sp-cal::before {
          content: ""; position: absolute; top: -2px; left: 0; right: 0; height: 8px;
          background: #9B1B5A; border-radius: 4px 4px 0 0; opacity: .25;
        }
        .sp-calmonth { position: absolute; top: 3px; left: 50%; transform: translateX(-50%); font-size: 6.5px; font-weight: 700; }
        .sp-caldate { position: absolute; top: 16px; left: 50%; transform: translateX(-50%); font-size: 12px; font-weight: 700; line-height: 1; color: #221512; animation: sp-datepulse 4s infinite; }
        @keyframes sp-datepulse {
          0%, 45% { transform: translateX(-50%) scale(1); }
          52% { transform: translateX(-50%) scale(1.3); }
          60%, 100% { transform: translateX(-50%) scale(1); }
        }
        .sp-autoarrow { position: absolute; top: 8px; right: 16px; font-size: 10px; opacity: .5; animation: sp-autospin 2s linear infinite; }
        @keyframes sp-autospin { to { transform: rotate(360deg); } }
        .sp-microgift { position: absolute; bottom: 10px; right: 16px; font-size: 13px; opacity: 0; animation: sp-submicro 4s infinite; }
        @keyframes sp-submicro {
          0%, 55% { opacity: 0; transform: translateY(4px) scale(.6); }
          64%, 84% { opacity: 1; transform: translateY(0) scale(1); }
          94%, 100% { opacity: 0; transform: translateY(-4px) scale(.6); }
        }

        /* ── 8 · rewards ── */
        .sp-person { position: absolute; bottom: 10px; font-size: 16px; }
        .sp-p1 { left: 12px; }
        .sp-p2 { right: 12px; }
        .sp-link {
          position: absolute; bottom: 20px; left: 32px; right: 32px; height: 1.6px;
          background: rgba(0, 0, 0, .1); border-radius: 2px; overflow: hidden;
        }
        .sp-linkfill { position: absolute; inset: 0; width: 0; animation: sp-linkfill 4s infinite; }
        @keyframes sp-linkfill { 0%, 10% { width: 0; } 55%, 100% { width: 100%; } }
        .sp-plane { position: absolute; bottom: 18px; left: 30px; font-size: 10px; opacity: 0; animation: sp-plane 4s infinite; }
        @keyframes sp-plane {
          0%, 10% { opacity: 0; left: 30px; }
          20% { opacity: 1; }
          55% { opacity: 1; left: calc(100% - 44px); }
          62%, 100% { opacity: 0; left: calc(100% - 44px); }
        }
        .sp-pts { position: absolute; top: 8px; font-size: 9px; font-weight: 700; opacity: 0; }
        .sp-pts1 { left: 8px; animation: sp-pts1 4s infinite; }
        .sp-pts2 { right: 8px; animation: sp-pts2 4s infinite; }
        @keyframes sp-pts1 {
          0%, 58% { opacity: 0; transform: translateY(4px); }
          68%, 90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-4px); }
        }
        @keyframes sp-pts2 {
          0%, 60% { opacity: 0; transform: translateY(4px); }
          70%, 92% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-4px); }
        }

        /* the "go" affordance is brand-coloured, so lift it in dark */
        .sp-go { color: #9B1B5A; }
        [data-theme="dark"] .sp-go { color: #F9A8C8; }
        [data-theme="dark"] .sp-go svg { stroke: #F9A8C8; }
        [data-theme="dark"] .sp-pot { background: rgba(255, 255, 255, .12); }
        [data-theme="dark"] .sp-toggle { background: rgba(255, 255, 255, .12); }
        [data-theme="dark"] .sp-link { background: rgba(255, 255, 255, .12); }
        [data-theme="dark"] .sp-nametag,
        [data-theme="dark"] .sp-caldate { color: #F5ECE3; }
        [data-theme="dark"] .sp-redact { background: #F5ECE3; }

        @media (prefers-reduced-motion: reduce) {
          .sp * { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
