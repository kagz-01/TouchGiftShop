"use client";

import { useTheme } from "@/components/ui/ThemeProvider";
import { Gift, Heart, Sparkles, Star } from "lucide-react";

export default function AmbientBackground() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  // Configuration for 3D falling strings with attached icons
  // 'z' represents depth: higher z = closer (larger, sharper, brighter), lower z = farther (smaller, blurred, darker)
  const fallingItems = [
    { left: 2, delay: 0.2, duration: 12, z: 0.8, Icon: Gift },
    { left: 7, delay: 3.5, duration: 15, z: 0.5, Icon: Sparkles },
    { left: 12, delay: 1.1, duration: 10, z: 1.0, Icon: Heart },
    { left: 18, delay: 5.4, duration: 18, z: 0.3, Icon: Star },
    { left: 23, delay: 2.3, duration: 13, z: 0.7, Icon: Gift },
    { left: 28, delay: 6.8, duration: 11, z: 0.9, Icon: Heart },
    { left: 33, delay: 0.9, duration: 16, z: 0.4, Icon: Sparkles },
    { left: 38, delay: 4.2, duration: 14, z: 0.6, Icon: Gift },
    { left: 43, delay: 1.7, duration: 17, z: 0.4, Icon: Star },
    { left: 48, delay: 7.1, duration: 12, z: 0.8, Icon: Heart },
    { left: 53, delay: 8.5, duration: 19, z: 0.3, Icon: Sparkles },
    { left: 58, delay: 4.9, duration: 10, z: 1.0, Icon: Gift },
    { left: 63, delay: 2.8, duration: 14, z: 0.6, Icon: Heart },
    { left: 68, delay: 7.6, duration: 13, z: 0.7, Icon: Star },
    { left: 73, delay: 1.4, duration: 16, z: 0.4, Icon: Sparkles },
    { left: 78, delay: 9.2, duration: 11, z: 0.9, Icon: Gift },
    { left: 83, delay: 3.7, duration: 15, z: 0.5, Icon: Heart },
    { left: 88, delay: 6.3, duration: 12, z: 0.8, Icon: Sparkles },
    { left: 93, delay: 2.1, duration: 17, z: 0.3, Icon: Gift },
    { left: 98, delay: 8.9, duration: 10, z: 1.0, Icon: Star },
    
    // Additional 20 items to increase density
    { left: 4, delay: 4.1, duration: 14, z: 0.6, Icon: Star },
    { left: 14, delay: 7.3, duration: 11, z: 0.9, Icon: Gift },
    { left: 21, delay: 2.5, duration: 16, z: 0.4, Icon: Heart },
    { left: 26, delay: 9.8, duration: 13, z: 0.8, Icon: Sparkles },
    { left: 36, delay: 1.2, duration: 19, z: 0.2, Icon: Gift },
    { left: 41, delay: 5.7, duration: 12, z: 0.7, Icon: Star },
    { left: 49, delay: 8.4, duration: 15, z: 0.5, Icon: Heart },
    { left: 54, delay: 3.1, duration: 10, z: 1.0, Icon: Sparkles },
    { left: 61, delay: 6.9, duration: 17, z: 0.4, Icon: Gift },
    { left: 66, delay: 0.6, duration: 14, z: 0.6, Icon: Star },
    { left: 71, delay: 4.8, duration: 11, z: 0.9, Icon: Heart },
    { left: 76, delay: 2.2, duration: 18, z: 0.3, Icon: Sparkles },
    { left: 81, delay: 7.5, duration: 12, z: 0.8, Icon: Gift },
    { left: 86, delay: 1.9, duration: 16, z: 0.5, Icon: Star },
    { left: 91, delay: 5.3, duration: 13, z: 0.7, Icon: Heart },
    { left: 96, delay: 9.5, duration: 10, z: 1.0, Icon: Sparkles },
    { left: 9, delay: 3.8, duration: 15, z: 0.6, Icon: Gift },
    { left: 31, delay: 8.2, duration: 14, z: 0.5, Icon: Heart },
    { left: 59, delay: 1.5, duration: 17, z: 0.4, Icon: Star },
    { left: 89, delay: 6.4, duration: 11, z: 0.9, Icon: Sparkles },
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
        
        {/* Floating Gift Wraps (3D-like) */}
        {[
          { left: 15, top: 25, scale: 1.5, delay: 0 },
          { left: 35, top: 40, scale: 1.0, delay: 2 },
          { left: 65, top: 30, scale: 1.3, delay: 1 },
          { left: 85, top: 45, scale: 0.9, delay: 3 },
        ].map((gift, i) => (
          <div
            key={`giftbox-${i}`}
            className="absolute flex items-center justify-center drop-shadow-xl"
            style={{
              left: `${gift.left}%`,
              top: `${gift.top}%`,
              transform: `scale(${gift.scale})`,
              animation: `float-y 6s ease-in-out ${gift.delay}s infinite alternate`,
              opacity: isDark ? 0.9 : 0.8,
              filter: isDark ? "sepia(0.3) hue-rotate(290deg) brightness(0.8) contrast(1.2)" : "sepia(0.2) hue-rotate(330deg) brightness(0.95)", // Tints the emoji to match theme
            }}
          >
            <span style={{ fontSize: "2.5rem" }}>🎁</span>
          </div>
        ))}
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
