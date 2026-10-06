"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

// ── Mood types ──────────────────────────────────────────────────────────────
export type Mood = "default" | "corporate" | "flowers" | "liquor" | "perfumes" | "hampers" | "romantic" | "apology" | "celebratory" | "custom" | "corp_appreciation" | "corp_milestone" | "corp_welcome";

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
  // ── HERO SHOWCASE MOODS (shown in pill tabs on homepage) ─────────────────
  {
    id: "default",
    emoji: "✨",
    label: "I Want to Wow Them",
    tagline: "The Full TouchGift Experience",
    heroTitle: "Elevate the art of gifting",
    heroSub: "Beautifully curated gifts for every occasion. Find the perfect gift here, and we'll route you to the official partner stores for a seamless checkout.",
    cta: "Shop All Gifts",
  },
  {
    id: "corporate",
    emoji: "🤝",
    label: "It's Business, But Personal",
    tagline: "For Corporate & Teams",
    heroTitle: "Make business feel personal",
    heroSub: "Executive gifting and branded merchandise that leaves a lasting impression on clients and teams alike.",
    cta: "View Corporate",
  },
  {
    id: "flowers",
    emoji: "🌹",
    label: "Words Aren't Enough",
    tagline: "When only flowers will do",
    heroTitle: "Say more without saying more",
    heroSub: "Breathtaking floral arrangements designed to feel intimate, intentional and completely unforgettable.",
    cta: "Send Flowers",
  },
  {
    id: "liquor",
    emoji: "🥂",
    label: "We're Celebrating",
    tagline: "Pop the champagne",
    heroTitle: "Raise a glass to the milestone",
    heroSub: "Premium spirits, champagne, and curated boxes to mark the moments that truly matter.",
    cta: "Shop Spirits",
  },
  {
    id: "perfumes",
    emoji: "💜",
    label: "Leave a Lasting Memory",
    tagline: "A scent they'll never forget",
    heroTitle: "A memory in a bottle",
    heroSub: "Authentic designer fragrances and beauty curations for the ultimate, deeply personal sensory gift.",
    cta: "Shop Fragrances",
  },
  {
    id: "hampers",
    emoji: "🧺",
    label: "Give Them Everything",
    tagline: "Generosity, beautifully packed",
    heroTitle: "Generosity, beautifully packaged",
    heroSub: "Overflowing hampers of fresh fruits, artisan treats, and bespoke gifts they'll unbox in pure delight.",
    cta: "Shop Hampers",
  },
  // ── EMOTIONAL SITUATION MOODS ────────────────────────────────────────────
  {
    id: "romantic",
    emoji: "💕",
    label: "I'm in Love",
    tagline: "For the one who has your heart",
    heroTitle: "Love, delivered",
    heroSub: "From first bloom to forever — curated pieces that say everything you mean but can't quite find the words to.",
    cta: "Send Love",
  },
  {
    id: "apology",
    emoji: "🙏",
    label: "I Messed Up",
    tagline: "Fix it before it's too late",
    heroTitle: "We've got you covered",
    heroSub: "Heartfelt gifts, delivered in hours. Because some moments can't wait until tomorrow.",
    cta: "Fix It Now",
    urgencyBadge: "Same-day delivery available",
  },
  {
    id: "celebratory",
    emoji: "🎉",
    label: "This Calls for Champagne",
    tagline: "Let's make it unforgettable",
    heroTitle: "Let's celebrate!",
    heroSub: "Bold, vibrant, impossible to ignore. Give them a moment they'll be talking about for years.",
    cta: "Shop Celebrations",
  },
  // ── CORPORATE CONTEXT MOODS ───────────────────────────────────────────────
  {
    id: "corp_appreciation",
    emoji: "🤝",
    label: "Thank You for Your Business",
    tagline: "Client gifts that build loyalty",
    heroTitle: "Appreciation they'll remember",
    heroSub: "Show your clients they matter with curated, premium hampers that say thank you in the most elegant way.",
    cta: "Shop Client Gifts",
  },
  {
    id: "corp_milestone",
    emoji: "🏆",
    label: "They Crushed It",
    tagline: "For the team that delivered",
    heroTitle: "Recognize the hard work",
    heroSub: "Reward your team for hitting targets and going above and beyond. Great gifts drive great culture.",
    cta: "Shop Team Gifts",
  },
  {
    id: "corp_welcome",
    emoji: "👋",
    label: "Welcome to the Team",
    tagline: "Make a first impression that lasts",
    heroTitle: "First impressions, perfected",
    heroSub: "Onboarding hampers that make new hires feel valued, excited, and proud to be part of your team from day one.",
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

export type CustomVibeMeta = {
  id: string;
  label: string;
  emoji: string;
  tagline?: string;
  gradient?: string;
  glow?: string;
};

// ── Context ─────────────────────────────────────────────────────────────────
interface MoodContextValue {
  mood: Mood;
  moodMeta: MoodMeta;
  customMood: CustomVibeMeta | null;
  customMoods: CustomVibeMeta[];
  activeCustomId: string | null;
  /** selectedByUser distinguishes a deliberate tap from hero auto-rotation.
   *  Only deliberate selections persist and recolour the site — otherwise simply
   *  visiting the homepage would pin a palette for the whole session. */
  selectedByUser: boolean;
  setMood: (mood: Mood, selectedByUser?: boolean) => void;
  clearMood: () => void;
  setCustomMood: (label: string, emoji: string, tagline?: string, gradient?: string, glow?: string) => void;
  setActiveCustomId: (id: string) => void;
  removeCustomMood: (id: string) => void;
}

const MoodContext = createContext<MoodContextValue>({
  mood: "default",
  moodMeta: MOODS[0],
  customMood: null,
  customMoods: [],
  activeCustomId: null,
  selectedByUser: false,
  setMood: () => {},
  clearMood: () => {},
  setCustomMood: () => {},
  setActiveCustomId: () => {},
  removeCustomMood: () => {},
});

const STORAGE_KEY = "tg_mood";
const STORAGE_CUSTOM_KEY = "tg_mood_custom";

export function MoodProvider({ children }: { children: React.ReactNode }) {
  const [mood, setMoodState] = useState<Mood>("default");
  const [selectedByUser, setSelectedByUser] = useState(false);
  const [customMoods, setCustomMoods] = useState<CustomVibeMeta[]>([]);
  const [activeCustomId, setActiveCustomIdState] = useState<string | null>(null);

  const customMood = customMoods.find(m => m.id === activeCustomId) || null;

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Mood | null;
      const savedCustom = localStorage.getItem(STORAGE_CUSTOM_KEY);
      const savedActiveId = localStorage.getItem("tg_active_custom_id");

      if (saved && (MOODS.find((m) => m.id === saved) || saved === "custom")) {
        setMoodState(saved);
        setSelectedByUser(true);
      }
      
      if (savedCustom) {
        const parsed = JSON.parse(savedCustom);
        if (Array.isArray(parsed)) {
          setCustomMoods(parsed);
        } else if (parsed.label) {
          // Migrate old single object
          const migrated: CustomVibeMeta = { id: "custom_legacy", ...parsed };
          setCustomMoods([migrated]);
          if (saved === "custom" && !savedActiveId) {
            setActiveCustomIdState("custom_legacy");
          }
        }
      }

      if (savedActiveId) {
        setActiveCustomIdState(savedActiveId);
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
        // Use user-defined colors if available, fallback to keyword matching
        const palette = (customMood.gradient && customMood.glow) 
          ? { gradient: customMood.gradient, glow: customMood.glow } 
          : getCustomPalette(customMood.label);
        root.style.setProperty("--mood-gradient", palette.gradient);
        root.style.setProperty("--mood-glow", palette.glow);
      } else {
        root.style.removeProperty("--mood-gradient");
        root.style.removeProperty("--mood-glow");
      }
    }
    // Auto-rotation must never stick. Leaving the hero should not leave the
    // visitor with a palette they did not choose.
    try {
      if (selectedByUser) localStorage.setItem(STORAGE_KEY, mood);
    } catch {}
  }, [mood, customMood, selectedByUser]);

  const setMood = useCallback((m: Mood, byUser = false) => {
    setMoodState(m);
    if (byUser) setSelectedByUser(true);
    if (!byUser) {
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
    }
  }, []);

  const clearMood = useCallback(() => {
    setMoodState("default");
    setSelectedByUser(false);
    setActiveCustomIdState(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("tg_active_custom_id");
    } catch {}
  }, []);

  const setCustomMood = useCallback((label: string, emoji: string, tagline?: string, gradient?: string, glow?: string) => {
    const newId = "custom_" + Date.now();
    const data: CustomVibeMeta = { id: newId, label, emoji, tagline, gradient, glow };
    
    setCustomMoods(prev => {
      const updated = [...prev, data];
      try { localStorage.setItem(STORAGE_CUSTOM_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
    
    setActiveCustomIdState(newId);
    setMoodState("custom");
    setSelectedByUser(true);
    try { localStorage.setItem("tg_active_custom_id", newId); } catch {}
  }, []);

  const setActiveCustomId = useCallback((id: string) => {
    setActiveCustomIdState(id);
    setMoodState("custom");
    try { localStorage.setItem("tg_active_custom_id", id); } catch {}
  }, []);

  const removeCustomMood = useCallback((id: string) => {
    setCustomMoods(prev => {
      const updated = prev.filter(m => m.id !== id);
      try { localStorage.setItem(STORAGE_CUSTOM_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
    if (activeCustomId === id) {
      setMoodState("default");
      setSelectedByUser(false);
      setActiveCustomIdState(null);
      try { localStorage.removeItem("tg_active_custom_id"); } catch {}
    }
  }, [activeCustomId]);

  // Build effective moodMeta
  const moodMeta: MoodMeta = mood === "custom" && customMood
    ? {
        id: "custom",
        emoji: customMood.emoji || "✨",
        label: customMood.label || "My Vibe",
        tagline: customMood.tagline || customMood.label,
        heroTitle: "Just for you",
        heroSub: "A unique curation tailored specifically to your custom vibe.",
        cta: "Shop Custom Vibe",
        customLabel: customMood.label,
        customEmoji: customMood.emoji,
      }
    : (MOODS.find((m) => m.id === mood) || MOODS[0]);

  return (
    <MoodContext.Provider value={{ mood, moodMeta, customMood, customMoods, activeCustomId, selectedByUser, setMood, clearMood, setCustomMood, setActiveCustomId, removeCustomMood }}>
      {children}
    </MoodContext.Provider>
  );
}

export function useMood() {
  return useContext(MoodContext);
}
