"use client";

import { useTheme } from "@/components/ui/ThemeProvider";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`
        relative w-14 h-7 rounded-full border transition-all duration-500 flex-shrink-0
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]
        ${isDark
          ? "bg-gradient-to-r from-[#3D0A6B] to-[#6D1340] border-[#9B1B5A]/50 shadow-[0_0_12px_rgba(155,27,90,0.5)]"
          : "bg-gradient-to-r from-[#FFF0E8] to-[#F5D9B5] border-[#D4A853]/50 shadow-[0_2px_8px_rgba(212,168,83,0.3)]"
        }
      `}
    >
      {/* Track fill */}
      <span className={`
        absolute inset-0.5 rounded-full transition-all duration-500
        ${isDark
          ? "bg-gradient-to-r from-[#2D0050]/60 to-[#5D0030]/60"
          : "bg-gradient-to-r from-[#FFF5EE]/60 to-[#FFEDCE]/60"
        }
      `} />

      {/* Thumb */}
      <span className={`
        absolute top-0.5 w-6 h-6 rounded-full transition-all duration-500 flex items-center justify-center shadow-md z-10
        ${isDark
          ? "translate-x-7 bg-gradient-to-br from-[#9B1B5A] to-[#4A148C]"
          : "translate-x-0.5 bg-gradient-to-br from-[#D4A853] to-[#C4884A]"
        }
      `}>
        {isDark
          ? <Moon className="w-3.5 h-3.5 text-white" />
          : <Sun className="w-3.5 h-3.5 text-white" />
        }
      </span>
    </button>
  );
}
