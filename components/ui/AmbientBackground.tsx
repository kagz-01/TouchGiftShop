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
