"use client";

import { useTheme } from "@/components/ui/ThemeProvider";
import { Gift, Heart, Sparkles, Star } from "lucide-react";

export default function AmbientBackground() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
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
  const particles = Array.from({ length: 80 }).map((_, i) => {
    const left = Math.random() * 100;
    // Arch equation: highest in the middle (50%), lowest at the edges (0%, 100%)
    // Base top is ~30%. At edges it goes down to ~45%.
    const archOffset = Math.pow((left - 50) / 50, 2) * 15; // 0 at center, 15 at edges
    const top = 25 + archOffset + (Math.random() * 15 - 7.5); // Spread of 15vh
    const size = 1 + Math.random() * 4;
    return { left, top, size, delay: Math.random() * 5, dur: 2 + Math.random() * 4 };
  });

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none transition-colors duration-700 bg-[#120018]">
      {/* ── Base Background Gradient (Layer 0 — slowest) ── */}
      <div className="parallax-bg absolute inset-0">
      {isDark ? (
        <>
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg, #1A002A 0%, #0F0014 100%)",
          }} />
          <div style={{ position: "absolute", inset: 0, opacity: 0.15, backgroundImage: "var(--noise-texture)", mixBlendMode: "overlay" }} />
        </>
      ) : (
        <>
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg, #FFF9F0 0%, #FDF5EE 50%, #FDECD5 100%)",
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
        
        const trailColor = isDark 
          ? "rgba(255, 180, 220, 0.8)" 
          : "rgba(215, 115, 145, 0.65)";
        const iconColor = isDark ? "#FFF" : "#C45B78";
        const dropShadow = isDark 
          ? "drop-shadow(0 0 10px rgba(224, 96, 168, 0.8))" 
          : "drop-shadow(0 0 8px rgba(196, 91, 120, 0.5))";

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
        
        const trailColor = isDark 
          ? "rgba(255, 180, 220, 0.6)" 
          : "rgba(215, 115, 145, 0.5)";
        
        const monochromeFilter = isDark
          ? "grayscale(1) sepia(1) hue-rotate(290deg) saturate(3) brightness(0.85) contrast(1.2)"
          : "grayscale(1) sepia(1) hue-rotate(330deg) saturate(2) brightness(1.1) contrast(1.1)";
        
        const dropShadow = isDark 
          ? "drop-shadow(0 0 12px rgba(224, 96, 168, 0.6))" 
          : "drop-shadow(0 0 8px rgba(196, 91, 120, 0.4))";

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
              backgroundColor: isDark ? "rgba(255, 180, 220, 0.7)" : "rgba(215, 115, 145, 0.6)",
              boxShadow: isDark ? "0 0 6px 1px rgba(224, 96, 168, 0.4)" : "0 0 5px 1px rgba(196, 91, 120, 0.3)",
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>


    </div>
  );
}
