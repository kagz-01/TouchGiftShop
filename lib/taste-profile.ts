export type TasteProfile = {
  recipientName: string;
  style: string[];       // minimal, luxury, quirky, classic, modern
  interests: string[];   // tech, fashion, food, wellness, art, etc.
  priceRange: "budget" | "mid" | "premium" | "luxury";
  colorPrefs: string[];
  avoidCategories: string[];
  notes: string;
  lastUpdated: string;
};

const TASTE_KEY = "touchgift_taste_profiles";

export function getTasteProfiles(): TasteProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(TASTE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function getTasteProfile(recipientName: string): TasteProfile | undefined {
  const profiles = getTasteProfiles();
  return profiles.find(
    (p) => p.recipientName.toLowerCase() === recipientName.toLowerCase()
  );
}

export function saveTasteProfile(profile: TasteProfile): void {
  const profiles = getTasteProfiles();
  const existing = profiles.findIndex(
    (p) => p.recipientName.toLowerCase() === profile.recipientName.toLowerCase()
  );

  profile.lastUpdated = new Date().toISOString();

  if (existing >= 0) {
    profiles[existing] = profile;
  } else {
    profiles.push(profile);
  }

  localStorage.setItem(TASTE_KEY, JSON.stringify(profiles));
}

export function deleteTasteProfile(recipientName: string): void {
  const profiles = getTasteProfiles();
  const filtered = profiles.filter(
    (p) => p.recipientName.toLowerCase() !== recipientName.toLowerCase()
  );
  localStorage.setItem(TASTE_KEY, JSON.stringify(filtered));
}

// Quiz questions
export type QuizQuestion = {
  id: string;
  question: string;
  type: "single" | "multi";
  options: Array<{ label: string; value: string; icon?: string }>;
};

export const TASTE_QUESTIONS: QuizQuestion[] = [
  {
    id: "style",
    question: "What's their style?",
    type: "multi",
    options: [
      { label: "Minimal", value: "minimal", icon: "◻️" },
      { label: "Luxury", value: "luxury", icon: "💎" },
      { label: "Quirky", value: "quirky", icon: "🎪" },
      { label: "Classic", value: "classic", icon: " timeless" },
      { label: "Modern", value: "modern", icon: "⚡" },
      { label: "Bohemian", value: "bohemian", icon: "🌸" },
    ],
  },
  {
    id: "interests",
    question: "What are they into?",
    type: "multi",
    options: [
      { label: "Tech & Gadgets", value: "tech", icon: "📱" },
      { label: "Fashion", value: "fashion", icon: "👗" },
      { label: "Food & Drinks", value: "food", icon: "🍷" },
      { label: "Wellness", value: "wellness", icon: "🧘" },
      { label: "Art & Design", value: "art", icon: "🎨" },
      { label: "Music", value: "music", icon: "🎵" },
      { label: "Sports", value: "sports", icon: "⚽" },
      { label: "Reading", value: "reading", icon: "📚" },
      { label: "Gaming", value: "gaming", icon: "🎮" },
      { label: "Cooking", value: "cooking", icon: "👨‍🍳" },
    ],
  },
  {
    id: "priceRange",
    question: "Typical budget?",
    type: "single",
    options: [
      { label: "Under KSh 2,000", value: "budget", icon: "💰" },
      { label: "KSh 2,000 - 5,000", value: "mid", icon: "💰💰" },
      { label: "KSh 5,000 - 15,000", value: "premium", icon: "💰💰💰" },
      { label: "KSh 15,000+", value: "luxury", icon: "💎" },
    ],
  },
  {
    id: "colorPrefs",
    question: "Colour preferences?",
    type: "multi",
    options: [
      { label: "Black & White", value: "black-white", icon: "⬛" },
      { label: "Earth Tones", value: "earth-tones", icon: "🟤" },
      { label: "Bright & Bold", value: "bright", icon: "🌈" },
      { label: "Pastels", value: "pastels", icon: "🩷" },
      { label: "Gold & Silver", value: "metallic", icon: "✨" },
      { label: "No preference", value: "any", icon: "🤷" },
    ],
  },
  {
    id: "avoid",
    question: "Anything they'd hate?",
    type: "multi",
    options: [
      { label: "Novelty items", value: "funny-novelties", icon: "🚫" },
      { label: "Alcohol", value: "wine-whiskey-beverage-hampers", icon: "🚫🍷" },
      { label: "Candles", value: "candle-holders-lanterns", icon: "🚫🕯️" },
      { label: "Chocolate", value: "chocolates-sweets-gifts", icon: "🚫🍫" },
      { label: "Flowers", value: "flowers", icon: "🚫💐" },
      { label: "Nothing off-limits", value: "none", icon: "✅" },
    ],
  },
];

// Map taste profile to recommended categories
export function getRecommendedCategories(profile: TasteProfile): string[] {
  const categories: string[] = [];

  // Style-based
  if (profile.style.includes("minimal")) {
    categories.push("personalized-gifts", "home-decor");
  }
  if (profile.style.includes("luxury")) {
    categories.push("jewelry-fine-pieces", "luxury-perfumes-fragrance-collection");
  }
  if (profile.style.includes("quirky")) {
    categories.push("funny-novelties", "books-magazines-gifts");
  }
  if (profile.style.includes("classic")) {
    categories.push("hampers-gift-sets", "watches-accessories");
  }
  if (profile.style.includes("modern")) {
    categories.push("experience-gifts", "tech-gadgets");
  }
  if (profile.style.includes("bohemian")) {
    categories.push("plant-pots-planters", "candle-holders-lanterns");
  }

  // Interest-based
  if (profile.interests.includes("tech")) {
    categories.push("gadgets", "phone-accessories-gifts");
  }
  if (profile.interests.includes("food")) {
    categories.push("gourmet-gifts", "wine-whiskey-beverage-hampers");
  }
  if (profile.interests.includes("wellness")) {
    categories.push("spa-experience-vouchers", "wellness-self-care-hampers");
  }
  if (profile.interests.includes("art")) {
    categories.push("custom-illustrated-gifts", "photo-gifts");
  }
  if (profile.interests.includes("music")) {
    categories.push("experience-gifts", "personalized-gifts");
  }
  if (profile.interests.includes("sports")) {
    categories.push("experience-gifts", "fitness");
  }
  if (profile.interests.includes("reading")) {
    categories.push("books-magazines-gifts", "personalized-gifts");
  }
  if (profile.interests.includes("cooking")) {
    categories.push("kitchen", "gourmet-gifts");
  }

  // Avoid
  const uniqueCategories = [...new Set(categories)].filter(
    (c) => !profile.avoidCategories.includes(c)
  );

  return uniqueCategories.slice(0, 8); // Top 8
}
