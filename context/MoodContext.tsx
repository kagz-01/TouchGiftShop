"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

// ── Mood types ──────────────────────────────────────────────────────────────
export type Mood = "default" | "romantic" | "apology" | "celebratory" | "corporate" | "custom" | "corp_appreciation" | "corp_milestone" | "corp_welcome";

export interface MoodMeta {
  id: Mood;
  label: string;
  emoji: string;
  tagline: string;
  heroTitle: string;
  heroSub: string;
  cta: string;
  urgencyBadge?: string;
  // Custom mood fields
  customLabel?: string;
  customEmoji?: string;
  customGradient?: string; // CSS gradient string
  customGlow?: string;     // rgba color
}

export const MOODS: MoodMeta[] = [
  {
    id: "default",
    emoji: "🎁",
    label: "All Vibes",
    tagline: "Find the perfect gift",
    heroTitle: "Finding the perfect gift",
    heroSub: "We're here to make the experience as beautiful as the gesture itself.",
    cta: "Shop All Gifts",
  },
  {
    id: "romantic",
    emoji: "💕",
    label: "Romantic",
    tagline: "Express what words can't",
    heroTitle: "Love, delivered",
    heroSub: "From first bloom to forever — curated pieces that say everything you mean.",
    cta: "Send Love",
  },
  {
    id: "apology",
    emoji: "🙏",
    label: "Making Up",
    tagline: "Save the day, beautifully",
    heroTitle: "We've got you covered",
    heroSub: "Heartfelt gifts, delivered in hours. Because some moments can't wait until tomorrow.",
    cta: "Fix It Now",
    urgencyBadge: "Same-day delivery available",
  },
  {
    id: "celebratory",
    emoji: "🎉",
    label: "Celebrating",
    tagline: "Make it unforgettable",
    heroTitle: "Let's celebrate!",
    heroSub: "Bold, vibrant, impossible to ignore. Give them a moment they'll talk about forever.",
    cta: "Shop Celebrations",
  },
  {
    id: "corporate",
    emoji: "🏢",
    label: "Corporate",
    tagline: "Professional gifting, elevated",
    heroTitle: "Impress without compromise",
    heroSub: "Curated corporate gifts that reflect your brand's values — delivered on schedule.",
    cta: "View Corporate",
  },
  {
    id: "corp_appreciation",
    emoji: "🤝",
    label: "Client Appreciation",
    tagline: "Build lasting loyalty",
    heroTitle: "Thank you for your business",
    heroSub: "Show your clients they matter with curated, premium hampers.",
    cta: "Shop Client Gifts",
  },
  {
    id: "corp_milestone",
    emoji: "🏆",
    label: "Team Milestones",
    tagline: "Celebrate your team's success",
    heroTitle: "Recognize the hard work",
    heroSub: "Reward your team for hitting targets and going above and beyond.",
    cta: "Shop Team Gifts",
  },
  {
    id: "corp_welcome",
    emoji: "👋",
    label: "Welcome Kits",
    tagline: "Start them off right",
    heroTitle: "Welcome to the team",
    heroSub: "Onboarding hampers that make new hires feel valued from day one.",
    cta: "Shop Onboarding",
  },
];

// ── Custom mood palette presets — pick based on keyword matching ────────────
export const CUSTOM_PALETTE_PRESETS = [
  { keywords: ["love","heart","care","crush","miss"],     gradient: "linear-gradient(135deg,#e91e63,#f06292)", glow: "rgba(233,30,99,0.35)" },
  { keywords: ["friend","bff","bestie","sister","bro"],   gradient: "linear-gradient(135deg,#ff9800,#ffb74d)", glow: "rgba(255,152,0,0.35)" },
  { keywords: ["mum","mom","dad","parent","family"],      gradient: "linear-gradient(135deg,#7b1fa2,#ba68c8)", glow: "rgba(123,31,162,0.35)" },
  { keywords: ["sad","lonely","heal","grief","comfort"],  gradient: "linear-gradient(135deg,#0288d1,#4fc3f7)", glow: "rgba(2,136,209,0.35)" },
  { keywords: ["boss","work","team","office","client"],   gradient: "linear-gradient(135deg,#455a64,#90a4ae)", glow: "rgba(69,90,100,0.35)" },
  { keywords: ["party","fun","wild","epic","hype"],       gradient: "linear-gradient(135deg,#f57f17,#ffd600)", glow: "rgba(245,127,23,0.40)" },
  { keywords: ["zen","calm","peace","relax","breathe"],   gradient: "linear-gradient(135deg,#2e7d32,#81c784)", glow: "rgba(46,125,50,0.35)" },
  { keywords: ["surprise","secret","mystery","anon"],     gradient: "linear-gradient(135deg,#4a148c,#9c27b0)", glow: "rgba(74,20,140,0.35)" },
  // Default fallback
  { keywords: [],                                         gradient: "linear-gradient(135deg,#9b1b5a,#d4a853)", glow: "rgba(155,27,90,0.35)" },
];

export function getCustomPalette(label: string) {
  const lower = label.toLowerCase();
  for (const preset of CUSTOM_PALETTE_PRESETS) {
    if (preset.keywords.some((kw) => lower.includes(kw))) return preset;
  }
  return CUSTOM_PALETTE_PRESETS[CUSTOM_PALETTE_PRESETS.length - 1];
}

// ── Context ─────────────────────────────────────────────────────────────────
interface MoodContextValue {
  mood: Mood;
  moodMeta: MoodMeta;
  customMood: { label: string; emoji: string } | null;
  setMood: (mood: Mood) => void;
  setCustomMood: (label: string, emoji: string) => void;
}

const MoodContext = createContext<MoodContextValue>({
  mood: "default",
  moodMeta: MOODS[0],
  customMood: null,
  setMood: () => {},
  setCustomMood: () => {},
});

const STORAGE_KEY = "tg_mood";
const STORAGE_CUSTOM_KEY = "tg_mood_custom";

export function MoodProvider({ children }: { children: React.ReactNode }) {
  const [mood, setMoodState] = useState<Mood>("default");
  const [customMood, setCustomMoodState] = useState<{ label: string; emoji: string } | null>(null);

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Mood | null;
      const savedCustom = localStorage.getItem(STORAGE_CUSTOM_KEY);
      if (saved && (MOODS.find((m) => m.id === saved) || saved === "custom")) {
        setMoodState(saved);
      }
      if (savedCustom) {
        setCustomMoodState(JSON.parse(savedCustom));
      }
    } catch {}
  }, []);

  // Apply to <html> as data-mood + custom CSS vars if custom
  useEffect(() => {
    const root = document.documentElement;
    if (mood === "default") {
      root.removeAttribute("data-mood");
      root.style.removeProperty("--mood-gradient");
      root.style.removeProperty("--mood-glow");
    } else {
      root.setAttribute("data-mood", mood);
      if (mood === "custom" && customMood) {
        const palette = getCustomPalette(customMood.label);
        root.style.setProperty("--mood-gradient", palette.gradient);
        root.style.setProperty("--mood-glow", palette.glow);
      } else {
        root.style.removeProperty("--mood-gradient");
        root.style.removeProperty("--mood-glow");
      }
    }
    try {
      localStorage.setItem(STORAGE_KEY, mood);
    } catch {}
  }, [mood, customMood]);

  const setMood = useCallback((m: Mood) => setMoodState(m), []);

  const setCustomMood = useCallback((label: string, emoji: string) => {
    const data = { label, emoji };
    setCustomMoodState(data);
    setMoodState("custom");
    try {
      localStorage.setItem(STORAGE_CUSTOM_KEY, JSON.stringify(data));
    } catch {}
  }, []);

  // Build effective moodMeta
  const moodMeta: MoodMeta = mood === "custom" && customMood
    ? {
        id: "custom",
        emoji: customMood.emoji || "✨",
        label: customMood.label || "My Vibe",
        tagline: customMood.label,
        heroTitle: `Gifting for: ${customMood.label}`,
        heroSub: `You know exactly what you're looking for. Let's find the perfect ${customMood.label.toLowerCase()} gift.`,
        cta: `Find ${customMood.label} Gifts`,
        customLabel: customMood.label,
        customEmoji: customMood.emoji,
      }
    : MOODS.find((m) => m.id === mood) ?? MOODS[0];

  return (
    <MoodContext.Provider value={{ mood, moodMeta, customMood, setMood, setCustomMood }}>
      {children}
    </MoodContext.Provider>
  );
}

export function useMood() {
  return useContext(MoodContext);
}
