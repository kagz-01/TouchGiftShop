"use client";

import { useTheme } from "@/components/ui/ThemeProvider";
import { Gift, Heart, Sparkles, Star } from "lucide-react";

export default function AmbientBackground() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  // Configuration for 3D falling strings with attached icons
  // 'z' represents depth: higher z = closer (larger, sharper, brighter), lower z = farther (smaller, blurred, darker)
  const fallingItems = [
    { left: 5, delay: 0.2, duration: 12, z: 0.8, Icon: Gift },
    { left: 15, delay: 3.5, duration: 15, z: 0.5, Icon: Sparkles },
    { left: 25, delay: 1.1, duration: 10, z: 1.0, Icon: Heart },
    { left: 32, delay: 5.4, duration: 18, z: 0.3, Icon: Star },
    { left: 45, delay: 2.3, duration: 13, z: 0.7, Icon: Gift },
    { left: 55, delay: 6.8, duration: 11, z: 0.9, Icon: Heart },
    { left: 62, delay: 0.9, duration: 16, z: 0.4, Icon: Sparkles },
    { left: 75, delay: 4.2, duration: 14, z: 0.6, Icon: Gift },
    { left: 85, delay: 1.7, duration: 17, z: 0.4, Icon: Star },
    { left: 95, delay: 7.1, duration: 12, z: 0.8, Icon: Heart },
    { left: 8, delay: 8.5, duration: 19, z: 0.3, Icon: Sparkles },
    { left: 18, delay: 4.9, duration: 10, z: 1.0, Icon: Gift },
    { left: 28, delay: 2.8, duration: 14, z: 0.6, Icon: Heart },
    { left: 38, delay: 7.6, duration: 13, z: 0.7, Icon: Star },
    { left: 48, delay: 1.4, duration: 16, z: 0.4, Icon: Sparkles },
    { left: 58, delay: 9.2, duration: 11, z: 0.9, Icon: Gift },
    { left: 68, delay: 3.7, duration: 15, z: 0.5, Icon: Heart },
    { left: 78, delay: 6.3, duration: 12, z: 0.8, Icon: Sparkles },
    { left: 88, delay: 2.1, duration: 17, z: 0.3, Icon: Gift },
    { left: 98, delay: 8.9, duration: 10, z: 1.0, Icon: Star },
  ];

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none transition-colors duration-700 bg-[#120018]">
      {/* ── Rich Multi-Point Background Gradient ── */}
      {isDark ? (
        <>
          {/* Base gradient layer */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg, #1A002A 0%, #120018 100%)",
          }} />
          {/* Glowing Orbs for a varied, complex background (Not one flat color) */}
          <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "70%", height: "70%", background: "radial-gradient(circle, rgba(90, 15, 60, 0.4) 0%, transparent 70%)", filter: "blur(60px)" }} />
          <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: "80%", height: "80%", background: "radial-gradient(circle, rgba(40, 5, 80, 0.4) 0%, transparent 70%)", filter: "blur(80px)" }} />
          <div style={{ position: "absolute", top: "20%", right: "10%", width: "50%", height: "50%", background: "radial-gradient(circle, rgba(155, 27, 90, 0.2) 0%, transparent 70%)", filter: "blur(50px)" }} />
          
          <div style={{ position: "absolute", inset: 0, opacity: 0.15, backgroundImage: "var(--noise-texture)", mixBlendMode: "overlay" }} />
        </>
      ) : (
        <>
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg, #FFF9F0 0%, #FDF5EE 100%)",
          }} />
          <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "70%", height: "70%", background: "radial-gradient(circle, rgba(255, 221, 232, 0.6) 0%, transparent 70%)", filter: "blur(60px)" }} />
          <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: "80%", height: "80%", background: "radial-gradient(circle, rgba(253, 230, 138, 0.4) 0%, transparent 70%)", filter: "blur(80px)" }} />
          <div style={{ position: "absolute", top: "20%", right: "10%", width: "50%", height: "50%", background: "radial-gradient(circle, rgba(250, 212, 224, 0.4) 0%, transparent 70%)", filter: "blur(50px)" }} />
        </>
      )}

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
          : "rgba(212, 168, 83, 0.6)";
        const iconColor = isDark ? "#FFF" : "#D4A853";
        const dropShadow = isDark ? "drop-shadow(0 0 10px rgba(224, 96, 168, 0.8))" : "drop-shadow(0 0 10px rgba(212, 168, 83, 0.6))";

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
