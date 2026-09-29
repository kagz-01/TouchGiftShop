"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* The block idles while off-screen so the eight loops cost nothing. */

const SCENE = "relative rounded-xl overflow-hidden flex-none bg-gradient-to-br from-brand/[0.06] to-gold/[0.04] dark:from-brand/[0.12] dark:to-gold/[0.06]";

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

/* 1 — Pool a Gift */
function PoolScene() {
  return (
    <div className={`${SCENE} h-[140px]`}>
      <svg viewBox="0 0 180 140" className="w-full h-full" aria-hidden>
        {/* avatars */}
        <circle cx="30" cy="28" r="13" fill="#9B1B5A" opacity="0.9"/>
        <text x="30" y="32" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">W</text>
        <circle cx="90" cy="22" r="13" fill="#D4A853" opacity="0.9"/>
        <text x="90" y="26" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">B</text>
        <circle cx="150" cy="28" r="13" fill="#E87B5A" opacity="0.9"/>
        <text x="150" y="32" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">G</text>
        {/* coins dropping */}
        <circle cx="30" cy="50" r="5" fill="#9B1B5A" className="sp-coin1-svg"/>
        <circle cx="90" cy="44" r="5" fill="#D4A853" className="sp-coin2-svg"/>
        <circle cx="150" cy="50" r="5" fill="#E87B5A" className="sp-coin3-svg"/>
        {/* gift box */}
        <rect x="65" y="90" width="50" height="38" rx="5" fill="white" stroke="#9B1B5A" strokeWidth="1.5"/>
        <rect x="65" y="90" width="50" height="13" rx="3" fill="#9B1B5A" opacity="0.15"/>
        {/* ribbon vertical */}
        <line x1="90" y1="90" x2="90" y2="128" stroke="#D4A853" strokeWidth="2.5"/>
        {/* ribbon horizontal */}
        <line x1="65" y1="103" x2="115" y2="103" stroke="#D4A853" strokeWidth="2.5"/>
        {/* ribbon bow */}
        <path d="M82 90 Q85 83 90 87 Q95 83 98 90" fill="none" stroke="#D4A853" strokeWidth="2" strokeLinecap="round"/>
        {/* fill bar */}
        <rect x="70" y="115" width="40" height="5" rx="2.5" fill="rgba(0,0,0,0.08)"/>
        <rect x="70" y="115" width="0" height="5" rx="2.5" fill="url(#poolGrad)" className="sp-potfill-svg"/>
        <defs>
          <linearGradient id="poolGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#9B1B5A"/>
            <stop offset="100%" stopColor="#D4A853"/>
          </linearGradient>
        </defs>
        {/* sparkle on complete */}
        <text x="90" y="88" textAnchor="middle" fontSize="14" className="sp-potgift-svg">🎁</text>
      </svg>
    </div>
  );
}

/* 2 — Build a Hamper */
function HamperScene() {
  return (
    <div className={`${SCENE} h-[140px]`}>
      <svg viewBox="0 0 180 140" className="w-full h-full" aria-hidden>
        {/* basket body */}
        <path d="M55 95 Q55 128 90 128 Q125 128 125 95 Z" fill="white" stroke="#9B1B5A" strokeWidth="1.8"/>
        {/* basket weave lines */}
        <path d="M60 105 Q90 110 120 105" fill="none" stroke="#9B1B5A" strokeWidth="0.8" opacity="0.3"/>
        <path d="M58 115 Q90 121 122 115" fill="none" stroke="#9B1B5A" strokeWidth="0.8" opacity="0.3"/>
        {/* basket handle */}
        <path d="M68 97 Q68 75 90 75 Q112 75 112 97" fill="none" stroke="#9B1B5A" strokeWidth="2" strokeLinecap="round"/>
        {/* item 1 - candle/rectangle */}
        <rect x="76" y="55" width="11" height="15" rx="2" fill="#9B1B5A" className="sp-hi1"/>
        {/* item 2 - circle/bottle */}
        <circle cx="90" cy="60" r="7" fill="#D4A853" className="sp-hi2"/>
        {/* item 3 - small box */}
        <rect x="103" y="57" width="10" height="10" rx="2" fill="#E87B5A" className="sp-hi3"/>
        {/* ribbon draws itself */}
        <line x1="90" y1="95" x2="90" y2="128" stroke="#D4A853" strokeWidth="2.5" className="sp-ribbon-v"/>
        <line x1="65" y1="108" x2="115" y2="108" stroke="#D4A853" strokeWidth="2.5" className="sp-ribbon-h"/>
        <path d="M82 96 Q85 88 90 92 Q95 88 98 96" fill="none" stroke="#D4A853" strokeWidth="2" strokeLinecap="round" className="sp-ribbon-bow"/>
      </svg>
    </div>
  );
}

/* 3 — AI Gift Finder */
function FinderScene() {
  return (
    <div className={`${SCENE} h-[140px]`}>
      <svg viewBox="0 0 180 140" className="w-full h-full" aria-hidden>
        {/* chat bubble */}
        <rect x="14" y="18" width="90" height="30" rx="8" fill="white" className="sp-qbubble-svg" filter="url(#shadow1)"/>
        <path d="M22 48 L16 56 L30 48" fill="white" className="sp-qbubble-svg"/>
        <text x="59" y="38" textAnchor="middle" fill="#221512" fontSize="9" fontWeight="600" className="sp-qbubble-svg">Who's it for? 🤔</text>
        {/* budget chip */}
        <rect x="14" y="62" width="62" height="20" rx="10" fill="#9B1B5A" className="sp-chip-svg"/>
        <text x="45" y="76" textAnchor="middle" fill="white" fontSize="9" fontWeight="600" className="sp-chip-svg">Under Ksh 3,000</text>
        {/* result card */}
        <rect x="130" y="20" width="44" height="58" rx="8" fill="white" stroke="#9B1B5A" strokeWidth="1.2" className="sp-result-svg" filter="url(#shadow1)"/>
        <text x="152" y="54" textAnchor="middle" fontSize="20" className="sp-result-svg">🎁</text>
        <rect x="136" y="66" width="32" height="5" rx="2.5" fill="#D4A853" opacity="0.6" className="sp-result-svg"/>
        {/* check */}
        <circle cx="152" cy="100" r="10" fill="#22c55e" className="sp-rcheck-svg"/>
        <text x="152" y="104" textAnchor="middle" fill="white" fontSize="11" fontWeight="800" className="sp-rcheck-svg">✓</text>
        <defs>
          <filter id="shadow1" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.1"/>
          </filter>
        </defs>
      </svg>
    </div>
  );
}

/* 4 — Send Anonymously */
function AnonScene() {
  return (
    <div className={`${SCENE} h-[140px]`}>
      <svg viewBox="0 0 180 140" className="w-full h-full" aria-hidden>
        {/* toggle */}
        <rect x="16" y="16" width="38" height="20" rx="10" fill="rgba(0,0,0,0.1)" stroke="#9B1B5A" strokeWidth="1.2"/>
        <circle cx="44" cy="26" r="8" fill="#9B1B5A" className="sp-knob-svg"/>
        <text x="27" y="21" fill="#9B1B5A" fontSize="6.5" fontWeight="600">OFF</text>
        <text x="21" y="32" fill="#fff" fontSize="6" fontWeight="600" className="sp-onanon">ON</text>
        {/* label card */}
        <rect x="14" y="50" width="90" height="36" rx="6" fill="white" stroke="rgba(0,0,0,0.08)" strokeWidth="1"/>
        <text x="24" y="65" fill="#9B1B5A" fontSize="7" fontWeight="700">FROM:</text>
        <text x="24" y="77" fill="#221512" fontSize="8.5" fontWeight="600" className="sp-nametag-svg">Wanjiku M.</text>
        {/* redact bar */}
        <rect x="24" y="69" width="0" height="11" rx="2" fill="#221512" className="sp-redact-svg"/>
        {/* anon gift */}
        <text x="136" y="90" textAnchor="middle" fontSize="36" className="sp-anongift-svg">🎁</text>
        <text x="136" y="116" textAnchor="middle" fontSize="9" fill="#9B1B5A" fontWeight="700" className="sp-anongift-svg">Anonymous ✓</text>
      </svg>
    </div>
  );
}

/* 5 — Photo Proof */
function ProofScene() {
  return (
    <div className={`${SCENE} h-[140px]`}>
      <svg viewBox="0 0 180 140" className="w-full h-full" aria-hidden>
        {/* package */}
        <text x="58" y="90" textAnchor="middle" fontSize="38">📦</text>
        {/* camera */}
        <rect x="90" y="50" width="52" height="40" rx="7" fill="#221512" opacity="0.85"/>
        <circle cx="116" cy="70" r="13" fill="none" stroke="white" strokeWidth="2" opacity="0.7"/>
        <circle cx="116" cy="70" r="8" fill="rgba(255,255,255,0.15)"/>
        <circle cx="116" cy="70" r="4" fill="rgba(255,255,255,0.5)" className="sp-shutter-svg"/>
        <rect x="126" y="54" width="10" height="7" rx="2" fill="white" opacity="0.5"/>
        {/* flash */}
        <rect x="0" y="0" width="180" height="140" fill="white" opacity="0" className="sp-flash-svg"/>
        {/* polaroid notification */}
        <rect x="108" y="85" width="62" height="48" rx="7" fill="white" className="sp-notif-svg" filter="url(#shadow2)"/>
        <rect x="114" y="91" width="50" height="30" rx="4" fill="#f0f0f0" className="sp-notif-svg"/>
        <text x="139" y="110" textAnchor="middle" fontSize="14" className="sp-notif-svg">📸</text>
        <text x="139" y="124" textAnchor="middle" fill="#22c55e" fontSize="8" fontWeight="800" className="sp-notif-svg">Delivered ✓</text>
        <defs>
          <filter id="shadow2" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.15"/>
          </filter>
        </defs>
      </svg>
    </div>
  );
}

/* 6 — Gift Cards */
function CardsScene() {
  return (
    <div className={`${SCENE} h-[140px]`}>
      <svg viewBox="0 0 180 140" className="w-full h-full" aria-hidden>
        {/* gift card front */}
        <g className="sp-flip3d-svg" style={{ transformOrigin: "78px 70px" }}>
          <rect x="24" y="42" width="108" height="68" rx="10" fill="url(#cardGrad)"/>
          <text x="78" y="82" textAnchor="middle" fill="white" fontSize="14" fontWeight="700" letterSpacing="1">GIFT</text>
          <circle cx="38" cy="56" r="10" fill="rgba(255,255,255,0.2)"/>
          <circle cx="50" cy="56" r="10" fill="rgba(255,255,255,0.15)"/>
        </g>
        {/* gift card back (code) */}
        <g className="sp-flipback3d-svg" style={{ transformOrigin: "78px 70px" }}>
          <rect x="24" y="42" width="108" height="68" rx="10" fill="url(#cardGrad2)"/>
          <rect x="34" y="66" width="88" height="14" rx="3" fill="rgba(255,255,255,0.25)"/>
          <text x="78" y="77" textAnchor="middle" fill="white" fontSize="10" fontWeight="700" letterSpacing="2">#8K2Q-GIFT</text>
        </g>
        {/* send arrow */}
        <text x="152" y="74" fontSize="18" fill="#9B1B5A" className="sp-sendfly-svg">➤</text>
        {/* phone */}
        <text x="165" y="115" fontSize="22">📱</text>
        {/* check */}
        <circle cx="157" cy="106" r="9" fill="#22c55e" className="sp-pcheck-svg"/>
        <text x="157" y="110" textAnchor="middle" fill="white" fontSize="10" fontWeight="800" className="sp-pcheck-svg">✓</text>
        <defs>
          <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9B1B5A"/>
            <stop offset="100%" stopColor="#C4297A"/>
          </linearGradient>
          <linearGradient id="cardGrad2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8a5a2f"/>
            <stop offset="100%" stopColor="#D4A853"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/* 7 — Gift Subscriptions */
function SubsScene() {
  return (
    <div className={`${SCENE} h-[140px]`}>
      <svg viewBox="0 0 180 140" className="w-full h-full" aria-hidden>
        {/* Calendar */}
        <rect x="20" y="22" width="64" height="58" rx="7" fill="white" stroke="#9B1B5A" strokeWidth="1.5"/>
        <rect x="20" y="22" width="64" height="20" rx="7" fill="#9B1B5A"/>
        <rect x="20" y="35" width="64" height="7" fill="#9B1B5A"/>
        <text x="52" y="37" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">MARCH</text>
        {/* date dots */}
        <circle cx="30" cy="55" r="7" fill="rgba(0,0,0,0.06)" />
        <circle cx="52" cy="55" r="7" fill="#9B1B5A" />
        <circle cx="74" cy="55" r="7" fill="rgba(0,0,0,0.06)" />
        <circle cx="30" cy="71" r="7" fill="rgba(0,0,0,0.06)" />
        <circle cx="52" cy="71" r="7" fill="rgba(0,0,0,0.06)" />
        <circle cx="74" cy="71" r="7" fill="rgba(0,0,0,0.06)" />
        <text x="52" y="59" textAnchor="middle" fill="white" fontSize="9" fontWeight="700" className="sp-datepulse-svg">14</text>
        {/* auto-refresh arrow */}
        <text x="118" y="50" textAnchor="middle" fontSize="28" fill="#D4A853" className="sp-autospin-svg">⟳</text>
        {/* gift boxes */}
        <text x="118" y="95" textAnchor="middle" fontSize="20" className="sp-sub1-svg">🎁</text>
        <text x="148" y="95" textAnchor="middle" fontSize="20" className="sp-sub2-svg">🎁</text>
        <text x="133" y="125" textAnchor="middle" fontSize="11" fill="#9B1B5A" fontWeight="600">Auto-send</text>
      </svg>
    </div>
  );
}

/* 8 — Rewards */
function RewardsScene() {
  return (
    <div className={`${SCENE} h-[140px]`}>
      <svg viewBox="0 0 180 140" className="w-full h-full" aria-hidden>
        {/* person 1 */}
        <circle cx="32" cy="70" r="18" fill="url(#personGrad1)"/>
        <text x="32" y="76" textAnchor="middle" fontSize="18">🙂</text>
        {/* person 2 */}
        <circle cx="148" cy="70" r="18" fill="url(#personGrad2)"/>
        <text x="148" y="76" textAnchor="middle" fontSize="18">🙂</text>
        {/* link bar */}
        <rect x="50" y="68" width="80" height="4" rx="2" fill="rgba(0,0,0,0.08)"/>
        <rect x="50" y="68" width="0" height="4" rx="2" fill="url(#linkGrad)" className="sp-linkfill-svg"/>
        {/* plane */}
        <text x="50" y="74" fontSize="14" className="sp-plane-svg">➤</text>
        {/* points badges */}
        <rect x="10" y="28" width="46" height="20" rx="10" fill="#9B1B5A" className="sp-pts1-svg"/>
        <text x="33" y="42" textAnchor="middle" fill="white" fontSize="9" fontWeight="700" className="sp-pts1-svg">+1,000 pts</text>
        <rect x="124" y="28" width="46" height="20" rx="10" fill="#D4A853" className="sp-pts2-svg"/>
        <text x="147" y="42" textAnchor="middle" fill="white" fontSize="9" fontWeight="700" className="sp-pts2-svg">+1,000 pts</text>
        <defs>
          <linearGradient id="personGrad1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9B1B5A" stopOpacity="0.15"/>
            <stop offset="100%" stopColor="#9B1B5A" stopOpacity="0.05"/>
          </linearGradient>
          <linearGradient id="personGrad2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#D4A853" stopOpacity="0.15"/>
            <stop offset="100%" stopColor="#D4A853" stopOpacity="0.05"/>
          </linearGradient>
          <linearGradient id="linkGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#9B1B5A"/>
            <stop offset="100%" stopColor="#D4A853"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default function SuperpowersStrip() {

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
        /* ── 1 · pool ── */
        .sp-coin1-svg, .sp-coin2-svg, .sp-coin3-svg { opacity: 0; transform: translateY(-20px); }
        .group:hover .sp-coin1-svg { animation: sp-coindrop-svg 4s infinite; }
        .group:hover .sp-coin2-svg { animation: sp-coindrop-svg 4s infinite .45s; }
        .group:hover .sp-coin3-svg { animation: sp-coindrop-svg 4s infinite .9s; }
        @keyframes sp-coindrop-svg {
          0%, 4% { opacity: 0; transform: translateY(-20px); }
          10% { opacity: 1; transform: translateY(-20px); }
          22% { opacity: 1; transform: translateY(40px); }
          28%, 100% { opacity: 0; transform: translateY(40px); }
        }
        
        .sp-potfill-svg { width: 40px; }
        .group:hover .sp-potfill-svg { animation: sp-potfill-svg 4s infinite; }
        @keyframes sp-potfill-svg {
          0%, 8% { width: 0; } 24% { width: 14px; } 52% { width: 26px; }
          80% { width: 40px; } 100% { width: 0; }
        }
        
        .sp-potgift-svg { transform-origin: 90px 88px; opacity: 1; transform: scale(1.3); }
        .group:hover .sp-potgift-svg { animation: sp-potgift-svg 4s infinite; }
        @keyframes sp-potgift-svg {
          0%, 80% { opacity: 0; transform: scale(.6); }
          88%, 96% { opacity: 1; transform: scale(1.3); }
          100% { opacity: 0; transform: scale(.6); }
        }

        /* ── 2 · hamper ── */
        .sp-hi1, .sp-hi2, .sp-hi3 { opacity: 1; transform: translateY(40px); }
        .group:hover .sp-hi1 { animation: sp-hset-svg 4s infinite; }
        .group:hover .sp-hi2 { animation: sp-hset-svg 4s infinite .5s; }
        .group:hover .sp-hi3 { animation: sp-hset-svg 4s infinite 1s; }
        @keyframes sp-hset-svg {
          0%, 6% { opacity: 0; transform: translateY(-20px); }
          16%, 74% { opacity: 1; transform: translateY(40px); }
          86%, 100% { opacity: 0; transform: translateY(40px); }
        }
        
        .sp-ribbon-v, .sp-ribbon-h, .sp-ribbon-bow { stroke-dasharray: 100; stroke-dashoffset: 0; opacity: 1; }
        .group:hover .sp-ribbon-v, .group:hover .sp-ribbon-h, .group:hover .sp-ribbon-bow { animation: sp-ribbondraw-svg 4s infinite; }
        @keyframes sp-ribbondraw-svg {
          0%, 72% { stroke-dashoffset: 100; opacity: 0; }
          82% { opacity: 1; }
          92%, 96% { stroke-dashoffset: 0; opacity: 1; }
          100% { opacity: 0; }
        }

        /* ── 3 · finder ── */
        .sp-qbubble-svg { transform-origin: center; opacity: 1; transform: translateY(0); }
        .group:hover .sp-qbubble-svg { animation: sp-qb-svg 4s infinite; }
        @keyframes sp-qb-svg {
          0%, 4% { opacity: 0; transform: translateY(10px); }
          12%, 36% { opacity: 1; transform: translateY(0); }
          44%, 100% { opacity: 0; transform: translateY(-10px); }
        }
        
        .sp-chip-svg { transform-origin: 45px 72px; opacity: 1; transform: scale(1); }
        .group:hover .sp-chip-svg { animation: sp-chipin-svg 4s infinite; }
        @keyframes sp-chipin-svg {
          0%, 40% { opacity: 0; transform: scale(.7); }
          48%, 66% { opacity: 1; transform: scale(1); }
          74%, 100% { opacity: 0; transform: scale(.7); }
        }
        
        .sp-result-svg { transform-origin: center; opacity: 1; transform: translateX(0); }
        .group:hover .sp-result-svg { animation: sp-resultin-svg 4s infinite; }
        @keyframes sp-resultin-svg {
          0%, 64% { opacity: 0; transform: translateX(30px); }
          76%, 94% { opacity: 1; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(30px); }
        }
        
        .sp-rcheck-svg { opacity: 1; }
        .group:hover .sp-rcheck-svg { animation: sp-rcheck-svg 4s infinite; }
        @keyframes sp-rcheck-svg { 0%, 80% { opacity: 0; } 88%, 96% { opacity: 1; } 100% { opacity: 0; } }

        /* ── 4 · anonymous ── */
        .sp-knob-svg { transform: translateX(12px); }
        .group:hover .sp-knob-svg { animation: sp-knobmove-svg 3.2s infinite; }
        @keyframes sp-knobmove-svg { 0%, 15% { transform: translateX(0); } 55%, 100% { transform: translateX(12px); } }
        
        .sp-redact-svg { width: 54px; }
        .group:hover .sp-redact-svg { animation: sp-redact-svg 3.2s infinite; }
        @keyframes sp-redact-svg { 0%, 55% { width: 0; } 75%, 100% { width: 54px; } }
        
        .sp-anongift-svg { opacity: 1; transform: translateY(0); }
        .group:hover .sp-anongift-svg { animation: sp-anonin-svg 3.2s infinite; }
        @keyframes sp-anonin-svg { 0%, 55% { opacity: 0; transform: translateY(10px); } 75%, 100% { opacity: 1; transform: translateY(0); } }

        /* ── 5 · photo proof ── */
        .sp-shutter-svg { transform-origin: 116px 70px; opacity: 0; }
        .group:hover .sp-shutter-svg { animation: sp-shutterpulse-svg 3.6s infinite; }
        @keyframes sp-shutterpulse-svg {
          0%, 22% { opacity: 0; transform: scale(1); }
          30% { opacity: .9; transform: scale(.6); }
          38%, 100% { opacity: 0; transform: scale(1); }
        }
        
        .sp-flash-svg { opacity: 0; }
        .group:hover .sp-flash-svg { animation: sp-flash-svg 3.6s infinite; }
        @keyframes sp-flash-svg { 0%, 28% { opacity: 0; } 32% { opacity: .9; } 40%, 100% { opacity: 0; } }
        
        .sp-notif-svg { opacity: 1; transform: translateY(0); }
        .group:hover .sp-notif-svg { animation: sp-notifup-svg 3.6s infinite; }
        @keyframes sp-notifup-svg {
          0%, 44% { opacity: 0; transform: translateY(30px); }
          58%, 88% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(30px); }
        }

        /* ── 6 · gift cards ── */
        .sp-flip3d-svg { transform-style: preserve-3d; opacity: 1; transform: rotateY(0deg); }
        .group:hover .sp-flip3d-svg { animation: sp-flip-svg 4s infinite; }
        @keyframes sp-flip-svg { 0%, 20% { transform: rotateY(0deg); opacity: 1; } 45%, 100% { transform: rotateY(180deg); opacity: 0; } }
        
        .sp-flipback3d-svg { transform-style: preserve-3d; opacity: 0; transform: rotateY(-180deg); }
        .group:hover .sp-flipback3d-svg { animation: sp-flipback-svg 4s infinite; }
        @keyframes sp-flipback-svg { 0%, 20% { transform: rotateY(-180deg); opacity: 0; } 45%, 100% { transform: rotateY(0deg); opacity: 1; } }
        
        .sp-sendfly-svg { opacity: 0; }
        .group:hover .sp-sendfly-svg { animation: sp-sendfly-svg 4s infinite; }
        @keyframes sp-sendfly-svg { 0%, 50% { opacity: 0; transform: translateX(-20px); } 58% { opacity: 1; } 72%, 100% { opacity: 0; transform: translateX(30px); } }
        
        .sp-pcheck-svg { opacity: 1; }
        .group:hover .sp-pcheck-svg { animation: sp-pcheck-svg 4s infinite; }
        @keyframes sp-pcheck-svg { 0%, 72% { opacity: 0; } 80%, 96% { opacity: 1; } 100% { opacity: 0; } }

        /* ── 7 · subscriptions ── */
        .sp-datepulse-svg { transform-origin: 52px 55px; transform: scale(1); }
        .group:hover .sp-datepulse-svg { animation: sp-datepulse-svg 4s infinite; }
        @keyframes sp-datepulse-svg {
          0%, 45% { transform: scale(1); }
          52% { transform: scale(1.4); }
          60%, 100% { transform: scale(1); }
        }
        
        .sp-autospin-svg { transform-origin: 118px 43px; }
        .group:hover .sp-autospin-svg { animation: sp-autospin-svg 3s linear infinite; }
        @keyframes sp-autospin-svg { to { transform: rotate(360deg); } }
        
        .sp-sub1-svg, .sp-sub2-svg { opacity: 1; transform: translateY(0) scale(1); }
        .group:hover .sp-sub1-svg { animation: sp-submicro-svg 4s infinite; }
        .group:hover .sp-sub2-svg { animation: sp-submicro-svg 4s infinite .6s; }
        @keyframes sp-submicro-svg {
          0%, 45% { opacity: 0; transform: translateY(-10px) scale(.6); }
          55%, 75% { opacity: 1; transform: translateY(0) scale(1); }
          85%, 100% { opacity: 0; transform: translateY(10px) scale(.6); }
        }

        /* ── 8 · rewards ── */
        .sp-linkfill-svg { width: 80px; }
        .group:hover .sp-linkfill-svg { animation: sp-linkfill-svg 4s infinite; }
        @keyframes sp-linkfill-svg { 0%, 10% { width: 0; } 55%, 100% { width: 80px; } }
        
        .sp-plane-svg { opacity: 0; }
        .group:hover .sp-plane-svg { animation: sp-plane-svg 4s infinite; }
        @keyframes sp-plane-svg {
          0%, 10% { opacity: 0; transform: translateX(0); }
          20% { opacity: 1; }
          55% { opacity: 1; transform: translateX(65px); }
          62%, 100% { opacity: 0; transform: translateX(65px); }
        }
        
        .sp-pts1-svg, .sp-pts2-svg { opacity: 1; transform: translateY(0); }
        .group:hover .sp-pts1-svg { animation: sp-pts1-svg 4s infinite; }
        .group:hover .sp-pts2-svg { animation: sp-pts2-svg 4s infinite; }
        @keyframes sp-pts1-svg {
          0%, 58% { opacity: 0; transform: translateY(10px); }
          68%, 90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        @keyframes sp-pts2-svg {
          0%, 60% { opacity: 0; transform: translateY(10px); }
          70%, 92% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }

        /* the "go" affordance is brand-coloured, so lift it in dark */
        .sp-go { color: #9B1B5A; }
        [data-theme="dark"] .sp-go { color: #F9A8C8; }
        [data-theme="dark"] .sp-go svg { stroke: #F9A8C8; }

        @media (prefers-reduced-motion: reduce) {
          .sp * { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
