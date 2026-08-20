"use client";

import { useTheme } from "@/components/ui/ThemeProvider";
import { Gift, Heart, Sparkles, Star, ShoppingBag, Package } from "lucide-react";

export default function AmbientBackground() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  // Configuration for 3D hanging strings with attached icons
  // 'z' represents depth: higher z = closer (larger, sharper, brighter), lower z = farther (smaller, blurred, darker)
  // Lengths in vh, they hang from the top edge and sway in the wind.
  const hangingItems = [
    { left: 5, delay: 0.2, length: 25, z: 0.8, Icon: Gift },
    { left: 25, delay: 1.1, length: 15, z: 1.0, Icon: ShoppingBag },
    { left: 45, delay: 2.3, length: 35, z: 0.7, Icon: Package },
    { left: 62, delay: 0.9, length: 45, z: 0.4, Icon: Star },
    { left: 75, delay: 4.2, length: 30, z: 0.6, Icon: ShoppingBag },
    { left: 85, delay: 1.7, length: 20, z: 0.4, Icon: Star },
    { left: 18, delay: 4.9, length: 40, z: 1.0, Icon: Gift },
    { left: 38, delay: 7.6, length: 25, z: 0.7, Icon: Heart },
    { left: 68, delay: 3.7, length: 18, z: 0.5, Icon: Package },
    { left: 98, delay: 2.1, length: 32, z: 1.0, Icon: Gift },
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

      {/* ── Swaying Hanging Strings with Attached Icons ── */}
      {hangingItems.map((item, i) => {
        const Icon = item.Icon;
        // Depth variables based on 'z'
        const scale = 0.5 + (item.z * 0.7); // 0.5 to 1.2
        const opacity = 0.2 + (item.z * 0.6); // 0.2 to 0.8
        const blur = (1 - item.z) * 4; // 0px to 4px
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
            key={`hanging-${i}`}
            style={{
              position: "absolute",
              left: `${item.left}%`,
              top: 0,
              width: trailWidth,
              height: `${item.length}vh`,
              // The glowing string gradient
              background: `linear-gradient(to bottom, transparent, ${trailColor}, ${iconColor})`,
              opacity,
              filter: `blur(${blur}px)`,
              transformOrigin: "top center",
              animation: `sway 8s ease-in-out ${item.delay}s infinite`,
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
              <Icon size={24} fill="currentColor" strokeWidth={item.z > 0.7 ? 1.5 : 1} />
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
      <div className="absolute inset-0">
        {[
          { left: 10, top: 22, Icon: ShoppingBag, size: 28, delay: 0 },
          { left: 20, top: 32, Icon: Gift, size: 42, delay: 1.5 },
          { left: 35, top: 20, Icon: ShoppingBag, size: 24, delay: 0.5 },
          { left: 48, top: 25, Icon: Package, size: 36, delay: 2.2 },
          { left: 65, top: 28, Icon: Gift, size: 48, delay: 1.1 },
          { left: 75, top: 18, Icon: ShoppingBag, size: 26, delay: 0.8 },
          { left: 88, top: 35, Icon: Package, size: 40, delay: 2.6 },
        ].map((item, i) => {
          const IconComp = item.Icon;
          return (
            <div
              key={`float-gift-${i}`}
              className="absolute flex items-center justify-center drop-shadow-2xl"
              style={{
                left: `${item.left}%`,
                top: `${item.top}%`,
                animation: `float-y 5s ease-in-out ${item.delay}s infinite alternate`,
                color: isDark ? "#FFF" : "#C45B78",
                filter: isDark 
                  ? "drop-shadow(0 0 15px rgba(224, 96, 168, 0.5))"
                  : "drop-shadow(0 0 10px rgba(196, 91, 120, 0.3))",
              }}
            >
              <IconComp size={item.size} fill="currentColor" strokeWidth={1} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
