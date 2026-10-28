"use client";

import { useTheme } from "@/components/ui/ThemeProvider";
import { Moon, Sun } from "lucide-react";

/**
 * Ever-present mobile theme switch — the desktop Header carries the full
 * toggle, but mobile has no site header, so this glass circle floats at the
 * top-right of every screen for a one-tap light/dark switch.
 */
export default function FloatingThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="md:hidden fixed top-3 right-3 z-[60] w-10 h-10 rounded-full border backdrop-blur-xl flex items-center justify-center shadow-lg transition-all duration-300 active:scale-90"
      style={
        isDark
          ? {
              background: "rgba(12,12,26,0.9)",
              borderColor: "rgba(255,255,255,0.15)",
              color: "#fff",
            }
          : {
              background: "rgba(255,255,255,0.92)",
              borderColor: "rgba(155,27,90,0.18)",
              color: "var(--heading-color)",
            }
      }
    >
      {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
    </button>
  );
}
