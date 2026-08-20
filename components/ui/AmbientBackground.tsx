"use client";

import { useTheme } from "@/components/ui/ThemeProvider";
import { Gift, Heart, Sparkles, Star } from "lucide-react";

export default function AmbientBackground() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  // Configuration for 3D falling strings with attached icons
  // 'z' represents depth: higher z = closer (larger, sharper, brighter), lower z = farther (smaller, blurred, darker)
  // Reduced to ~10 items and slowed down (duration * 2.5) as requested by user
  const fallingItems = [
    { left: 5, delay: 0.2, duration: 30, z: 0.8, Icon: Gift },
    { left: 25, delay: 1.1, duration: 25, z: 1.0, Icon: Heart },
    { left: 45, delay: 2.3, duration: 32, z: 0.7, Icon: Gift },
    { left: 62, delay: 0.9, duration: 40, z: 0.4, Icon: Sparkles },
    { left: 75, delay: 4.2, duration: 35, z: 0.6, Icon: Gift },
    { left: 85, delay: 1.7, duration: 42, z: 0.4, Icon: Star },
    { left: 18, delay: 4.9, duration: 25, z: 1.0, Icon: Gift },
    { left: 38, delay: 7.6, duration: 32, z: 0.7, Icon: Star },
    { left: 68, delay: 3.7, duration: 37, z: 0.5, Icon: Heart },
    { left: 98, delay: 8.9, duration: 25, z: 1.0, Icon: Star },
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
      {/* ── Base Background Gradient ── */}
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

      {/* ── Falling Strings with Attached Icons ── */}
      {fallingItems.map((item, i) => {
        const Icon = item.Icon;
        // Depth variables based on 'z'
        const scale = 0.5 + (item.z * 0.7); // 0.5 to 1.2
        const opacity = 0.2 + (item.z * 0.6); // 0.2 to 0.8
        const blur = (1 - item.z) * 4; // 0px to 4px
        const trailHeight = 15 + (item.z * 25); // 15vh to 40vh
        const trailWidth = item.z > 0.7 ? "2px" : "1px";
        
        const trailColor = isDark 
          ? "rgba(255, 180, 220, 0.8)" 
          : "rgba(215, 115, 145, 0.65)"; // Darker, warmer rose-gold for light mode visibility
        const iconColor = isDark ? "#FFF" : "#C45B78"; // Deeper rose-gold for the icon
        const dropShadow = isDark 
          ? "drop-shadow(0 0 10px rgba(224, 96, 168, 0.8))" 
          : "drop-shadow(0 0 8px rgba(196, 91, 120, 0.5))"; // Softer but visible shadow

        return (
          <div
            key={`falling-${i}`}
            style={{
              position: "absolute",
              left: `${item.left}%`,
              top: 0,
              width: trailWidth,
              height: `${trailHeight}vh`,
              // The glowing string gradient
              background: `linear-gradient(to bottom, transparent, ${trailColor}, ${iconColor})`,
              opacity,
              filter: `blur(${blur}px)`,
              transform: `translateY(-10vh)`, // Initial state before animation
              animation: `star-fall ${item.duration}s linear ${item.delay}s infinite`,
            }}
          >
            {/* The attached Gift/Icon at the tip of the string */}
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

      {/* ── Central Arching Particle Cluster (From Inspiration) ── */}
      <div className="absolute inset-0">
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

      {/* ── Floating 3D Gift Wraps (From Inspiration) ── */}
      {/* We use emojis because they closely mimic the 3D rendered boxes seen in the reference image */}
      <div className="absolute inset-0">
        {[
          { left: 10, top: 22, emoji: "🛍️", size: "2rem", delay: 0 },
          { left: 20, top: 32, emoji: "🎁", size: "3rem", delay: 1.5 },
          { left: 35, top: 20, emoji: "🛍️", size: "1.5rem", delay: 0.5 },
          { left: 48, top: 25, emoji: "🎁", size: "2.5rem", delay: 2.2 },
          { left: 65, top: 28, emoji: "🎁", size: "3.5rem", delay: 1.1 },
          { left: 75, top: 18, emoji: "🛍️", size: "1.8rem", delay: 0.8 },
          { left: 88, top: 35, emoji: "🎁", size: "2.8rem", delay: 2.6 },
        ].map((item, i) => (
          <div
            key={`emoji-gift-${i}`}
            className="absolute flex items-center justify-center drop-shadow-2xl"
            style={{
              left: `${item.left}%`,
              top: `${item.top}%`,
              fontSize: item.size,
              animation: `float-y 5s ease-in-out ${item.delay}s infinite alternate`,
              // Apply filters to make the emoji blend perfectly into the color scheme
              filter: isDark 
                ? "sepia(0.4) hue-rotate(270deg) brightness(0.8) contrast(1.2) drop-shadow(0 0 15px rgba(224, 96, 168, 0.5))"
                : "sepia(0.2) hue-rotate(330deg) brightness(1.05) contrast(1.1) drop-shadow(0 0 10px rgba(196, 91, 120, 0.3))",
            }}
          >
            {item.emoji}
          </div>
        ))}
      </div>
    </div>
  );
}
