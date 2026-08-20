"use client";

import { useTheme } from "@/components/ui/ThemeProvider";
import { Gift, Heart, Sparkles, Star, ShoppingBag, Package } from "lucide-react";

export default function AmbientBackground() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  // Configuration for 3D falling strings with attached icons
  // 'z' represents depth: higher z = closer (larger, sharper, brighter), lower z = farther (smaller, blurred, darker)
  // Reduced to ~10 items and slowed down (duration * 2.5) as requested
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

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none transition-colors duration-700 bg-[#120018]">
      {/* ── Base Background Gradient (No Circular Orbs) ── */}
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

      {/* ── Central Floating Cluster (Sparkles & Gift Wraps) ── */}
      {/* This mimics the horizontal band of floating gifts and sparkles seen in the reference */}
      <div className="absolute top-[20%] left-0 right-0 h-[30vh] flex items-center justify-center opacity-60">
        {/* Floating Sparkles Cluster */}
        {[
          { left: 15, top: 40, size: 3, delay: 0.5, dur: 4 },
          { left: 22, top: 60, size: 5, delay: 1.2, dur: 5 },
          { left: 35, top: 25, size: 2, delay: 3.0, dur: 6 },
          { left: 45, top: 75, size: 4, delay: 2.1, dur: 3 },
          { left: 55, top: 30, size: 6, delay: 4.5, dur: 5 },
          { left: 65, top: 80, size: 3, delay: 0.8, dur: 7 },
          { left: 75, top: 45, size: 5, delay: 2.5, dur: 4 },
          { left: 85, top: 65, size: 2, delay: 1.7, dur: 5 },
          { left: 12, top: 85, size: 4, delay: 3.3, dur: 6 },
          { left: 28, top: 35, size: 7, delay: 0.9, dur: 4 },
          { left: 38, top: 50, size: 3, delay: 4.1, dur: 5 },
          { left: 48, top: 20, size: 5, delay: 2.8, dur: 7 },
          { left: 58, top: 70, size: 2, delay: 1.5, dur: 4 },
          { left: 68, top: 40, size: 4, delay: 3.7, dur: 6 },
          { left: 78, top: 55, size: 6, delay: 0.4, dur: 5 },
          { left: 88, top: 25, size: 3, delay: 2.2, dur: 4 },
          { left: 18, top: 55, size: 5, delay: 1.9, dur: 6 },
          { left: 32, top: 75, size: 2, delay: 4.8, dur: 5 },
          { left: 42, top: 45, size: 4, delay: 0.7, dur: 7 },
          { left: 52, top: 85, size: 6, delay: 2.6, dur: 4 },
          { left: 62, top: 30, size: 3, delay: 3.5, dur: 6 },
          { left: 72, top: 60, size: 5, delay: 1.1, dur: 5 },
          { left: 82, top: 35, size: 2, delay: 4.2, dur: 4 },
          { left: 92, top: 50, size: 4, delay: 0.3, dur: 7 },
          { left: 25, top: 80, size: 5, delay: 2.4, dur: 5 },
          { left: 45, top: 35, size: 3, delay: 3.9, dur: 6 },
          { left: 65, top: 65, size: 6, delay: 1.6, dur: 4 },
          { left: 85, top: 20, size: 4, delay: 4.7, dur: 5 },
          { left: 15, top: 30, size: 2, delay: 0.6, dur: 7 },
          { left: 50, top: 50, size: 5, delay: 2.9, dur: 4 },
        ].map((sparkle, i) => (
            <div
              key={`sparkle-${i}`}
              className="absolute rounded-full animate-pulse"
              style={{
                left: `${sparkle.left}%`,
                top: `${sparkle.top}%`,
                width: `${sparkle.size}px`,
                height: `${sparkle.size}px`,
                backgroundColor: isDark ? "rgba(255, 180, 220, 0.8)" : "rgba(215, 115, 145, 0.8)",
                boxShadow: isDark ? "0 0 8px 2px rgba(224, 96, 168, 0.5)" : "0 0 8px 2px rgba(196, 91, 120, 0.4)",
                animationDuration: `${sparkle.dur}s`,
                animationDelay: `${sparkle.delay}s`,
              }}
            />
          ))}
        
        {/* Floating Gift Wraps and Bags (using Lucide icons to avoid emojis) */}
        {[
          { left: 15, top: 25, scale: 1.5, delay: 0, Icon: Gift },
          { left: 35, top: 40, scale: 1.0, delay: 2, Icon: ShoppingBag },
          { left: 65, top: 30, scale: 1.3, delay: 1, Icon: Package },
          { left: 85, top: 45, scale: 0.9, delay: 3, Icon: Gift },
        ].map((item, i) => {
          const Icon = item.Icon;
          return (
            <div
              key={`giftbox-${i}`}
              className="absolute flex items-center justify-center drop-shadow-xl"
              style={{
                left: `${item.left}%`,
                top: `${item.top}%`,
                transform: `scale(${item.scale})`,
                animation: `float-y 6s ease-in-out ${item.delay}s infinite alternate`,
                opacity: isDark ? 0.9 : 0.8,
                color: isDark ? "rgba(255, 180, 220, 0.9)" : "rgba(215, 115, 145, 0.9)",
                filter: isDark ? "drop-shadow(0 0 12px rgba(224, 96, 168, 0.7))" : "drop-shadow(0 0 8px rgba(196, 91, 120, 0.5))",
              }}
            >
              <Icon size={40} strokeWidth={1.5} />
            </div>
          );
        })}
      </div>

      {/* ── Glowing Strings with Attached Gifts ── */}
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
            key={i}
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
              transform: `translateY(-100vh)`,
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
    </div>
  );
}
