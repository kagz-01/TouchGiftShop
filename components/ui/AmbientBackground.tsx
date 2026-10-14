"use client";

import { useTheme } from "@/components/ui/ThemeProvider";
import { usePathname } from "next/navigation";
import { Gift, Heart, Sparkles, Star } from "lucide-react";

/* Two palettes. The storefront runs plum/pink; /corporate runs the steel-navy
   + gold identity declared in globals.css [data-mood="corporate"], so the
   falling gifts read as the same brand on both rather than a pink consumer
   page bleeding into a B2B one. */
const PALETTE = {
  consumer: {
    baseDark:  "linear-gradient(180deg, #1A002A 0%, #0F0014 100%)",
    baseLight: "linear-gradient(180deg, #FFF9F0 0%, #FDF5EE 50%, #FDECD5 100%)",
    trailDark: "rgba(255, 180, 220, 0.8)",  trailLight: "rgba(215, 115, 145, 0.65)",
    iconDark:  "#FFF",                        iconLight:  "#C45B78",
    glowDark:  "rgba(224, 96, 168, 0.8)",    glowLight:  "rgba(196, 91, 120, 0.5)",
    particleDark: "rgba(255, 180, 220, 0.7)", particleLight: "rgba(215, 115, 145, 0.6)",
    particleGlowDark: "0 0 6px 1px rgba(224, 96, 168, 0.4)",
    particleGlowLight: "0 0 5px 1px rgba(196, 91, 120, 0.3)",
    hangTrailDark: "rgba(255, 180, 220, 0.6)", hangTrailLight: "rgba(215, 115, 145, 0.5)",
    monochromeDark: "grayscale(1) sepia(1) hue-rotate(290deg) saturate(3) brightness(0.85) contrast(1.2)",
    monochromeLight: "grayscale(1) sepia(1) hue-rotate(330deg) saturate(2) brightness(1.1) contrast(1.1)",
  },
  corporate: {
    // #0F2027 -> #081216 is the mood's own page gradient; #2C5364 is its
    // gradient end-stop, and gold #D4AF37 is --color-gold.
    baseDark:  "linear-gradient(180deg, #0F2027 0%, #081216 100%)",
    baseLight: "linear-gradient(180deg, #F7F9FB 0%, #EDF2F7 100%)",
    trailDark: "rgba(126, 178, 224, 0.75)", trailLight: "rgba(44, 83, 100, 0.6)",
    iconDark:  "#CFE3F2",                     iconLight:  "#2C5364",
    glowDark:  "rgba(212, 175, 55, 0.65)",    glowLight:  "rgba(44, 83, 100, 0.4)",
    particleDark: "rgba(212, 175, 55, 0.65)", particleLight: "rgba(44, 83, 100, 0.55)",
    particleGlowDark: "0 0 6px 1px rgba(212, 175, 55, 0.35)",
    particleGlowLight: "0 0 5px 1px rgba(44, 83, 100, 0.3)",
    hangTrailDark: "rgba(126, 178, 224, 0.55)", hangTrailLight: "rgba(44, 83, 100, 0.45)",
    monochromeDark: "grayscale(1) sepia(1) hue-rotate(155deg) saturate(2.2) brightness(0.9) contrast(1.15)",
    monochromeLight: "grayscale(1) sepia(1) hue-rotate(155deg) saturate(1.8) brightness(1.05) contrast(1.05)",
  },
} as const;

// Deterministic PRNG. These values are computed during render, so Math.random()
// made server HTML differ from client HTML and React discarded the server
// output on hydration — re-rendering all 96 particles on every page load.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function AmbientBackground() {
  const { theme } = useTheme();
  const pathname = usePathname();
  const isDark = theme === "dark";
  /* Corporate is the one route with its own identity. /admin stays on the
     consumer palette because it's an internal tool, not a branded surface. */
  const isCorporate = pathname?.startsWith("/corporate") ?? false;
  const P = isCorporate ? PALETTE.corporate : PALETTE.consumer;
  const pick = <T,>(dark: T, light: T) => (isDark ? dark : light);
  
  // Configuration for 3D falling strings (just glowing lines that fall straight down with small icons)
  const fallingItems = [
    { left: 5, delay: 0.2, duration: 30, length: 25, z: 0.8, Icon: Gift },
    { left: 25, delay: 1.1, duration: 25, length: 15, z: 1.0, Icon: Heart },
    { left: 45, delay: 2.3, duration: 32, length: 35, z: 0.7, Icon: Gift },
    { left: 62, delay: 0.9, duration: 40, length: 45, z: 0.4, Icon: Sparkles },
    { left: 75, delay: 4.2, duration: 35, length: 30, z: 0.6, Icon: Gift },
    { left: 85, delay: 1.7, duration: 42, length: 20, z: 0.4, Icon: Star },
    { left: 18, delay: 4.9, duration: 25, length: 40, z: 1.0, Icon: Gift },
    { left: 38, delay: 7.6, duration: 32, length: 25, z: 0.7, Icon: Heart },
    { left: 68, delay: 3.7, duration: 37, length: 18, z: 0.5, Icon: Gift },
    { left: 98, delay: 2.1, duration: 25, length: 32, z: 1.0, Icon: Star },
  ];

  // Configuration for swaying hanging gifts (hang from the top edge, don't fall, just sway)
  const hangingItems = [
    { left: 12, length: 25, z: 0.8, emoji: "🛍️", delay: 0.2 },
    { left: 28, length: 40, z: 1.0, emoji: "🎁", delay: 1.5 },
    { left: 42, length: 30, z: 0.7, emoji: "🛍️", delay: 0.7 },
    { left: 55, length: 45, z: 0.9, emoji: "🎁", delay: 2.1 },
    { left: 72, length: 35, z: 0.8, emoji: "🎁", delay: 1.1 },
    { left: 88, length: 28, z: 1.0, emoji: "🛍️", delay: 0.5 },
  ];

  // Dense central cluster of particles (forming a slightly arched band) to match inspiration
  const particles = (() => {
    const rand = mulberry32(0x7a3f9c1d);
    return Array.from({ length: 80 }).map(() => {
      const left = rand() * 100;
      // Arch equation: highest in the middle (50%), lowest at the edges (0%, 100%)
      // Base top is ~30%. At edges it goes down to ~45%.
      const archOffset = Math.pow((left - 50) / 50, 2) * 15; // 0 at center, 15 at edges
      const top = 25 + archOffset + (rand() * 15 - 7.5); // Spread of 15vh
      const size = 1 + rand() * 4;
      return { left, top, size, delay: rand() * 5, dur: 2 + rand() * 4 };
    });
  })();

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none transition-colors duration-700">
      {/* ── Base Background Gradient (Layer 0 — slowest) ── */}
      <div className="parallax-bg absolute inset-0">
      {isDark ? (
        <>
          <div style={{
            position: "absolute", inset: 0,
            background: P.baseDark,
          }} />
          <div style={{ position: "absolute", inset: 0, opacity: 0.15, backgroundImage: "var(--noise-texture)", mixBlendMode: "overlay" }} />
        </>
      ) : (
        <>
          <div style={{
            position: "absolute", inset: 0,
            background: P.baseLight,
          }} />
        </>
      )}
      </div>

      {/* ── Falling Glowing Strings (Layer 1 — medium depth) ── */}
      <div className="parallax-amb absolute inset-0">
      {fallingItems.map((item, i) => {
        const Icon = item.Icon;
        const scale = 0.5 + (item.z * 0.7); // 0.5 to 1.2
        const opacity = 0.2 + (item.z * 0.6); // 0.2 to 0.8
        const blur = (1 - item.z) * 4; // 0px to 4px
        const trailWidth = item.z > 0.7 ? "2px" : "1px";
        
        const trailColor = pick(P.trailDark, P.trailLight);
        const iconColor = pick(P.iconDark, P.iconLight);
        const dropShadow = `drop-shadow(0 0 ${isDark ? 10 : 8}px ${pick(P.glowDark, P.glowLight)})`;

        return (
          <div
            key={`falling-${i}`}
            style={{
              position: "absolute",
              left: `${item.left}%`,
              top: 0,
              width: trailWidth,
              height: `${item.length}vh`,
              opacity,
              filter: `blur(${blur}px)`,
              background: `linear-gradient(to bottom, transparent, ${trailColor}, ${iconColor})`,
              animation: `star-fall ${item.duration}s linear ${item.delay}s infinite`,
              transform: `translateY(-10vh)`, // Initial state before animation
            }}
          >
            {/* The attached Icon at the tip of the string */}
            <div style={{
              position: "absolute",
              bottom: "-12px",
              left: "50%",
              transform: `translateX(-50%) scale(${scale})`,
              color: iconColor,
              filter: dropShadow,
            }} className="flex items-center justify-center">
              <Icon size={24} strokeWidth={item.z > 0.7 ? 2 : 1.5} />
            </div>
          </div>
        );
      })}
      </div>

      {/* ── Swaying Hanging Gifts (Layer 1 — medium depth) ── */}
      <div className="parallax-amb absolute inset-0">
      {hangingItems.map((item, i) => {
        const scale = 0.5 + (item.z * 0.7);
        const opacity = 0.4 + (item.z * 0.6);
        const blur = (1 - item.z) * 3;
        const trailWidth = item.z > 0.7 ? "2px" : "1px";
        
        const trailColor = pick(P.hangTrailDark, P.hangTrailLight);
        
        const monochromeFilter = pick(P.monochromeDark, P.monochromeLight);
        
        const dropShadow = `drop-shadow(0 0 ${isDark ? 12 : 8}px ${pick(P.glowDark, P.glowLight)})`;

        return (
          <div
            key={`hanging-${i}`}
            style={{
              position: "absolute",
              left: `${item.left}%`,
              top: 0,
              width: trailWidth,
              height: `${item.length}vh`,
              opacity,
              filter: `blur(${blur}px)`,
              background: `linear-gradient(to bottom, transparent, ${trailColor})`,
              transformOrigin: "top center",
              animation: `sway 8s ease-in-out ${item.delay}s infinite`,
            }}
          >
            {/* The attached Emoji at the tip of the swaying string */}
            <div style={{
              position: "absolute",
              bottom: "-16px",
              left: "50%",
              transform: `translateX(-50%) scale(${scale})`,
              fontSize: "24px",
              filter: `${monochromeFilter} ${dropShadow}`,
            }} className="flex items-center justify-center">
              {item.emoji}
            </div>
          </div>
        );
      })}
      </div>

      {/* ── Central Arching Particle Cluster (Layer 1 — medium depth) ── */}
      <div className="parallax-amb absolute inset-0">
        {particles.map((p, i) => (
          <div
            key={`particle-${i}`}
            className="absolute rounded-full animate-pulse"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: pick(P.particleDark, P.particleLight),
              boxShadow: pick(P.particleGlowDark, P.particleGlowLight),
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>


    </div>
  );
}
