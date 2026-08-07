export type SubstitutionRule = {
  category: string;
  reason: "out-of-stock" | "discontinued" | "price-match" | "similar-vibe";
  alternatives: Array<{
    category: string;
    reason: string;
    priority: number; // 1 = best match
  }>;
};

export const SUBSTITUTION_RULES: SubstitutionRule[] = [
  {
    category: "flowers",
    reason: "similar-vibe",
    alternatives: [
      { category: "plant-pots-planters", reason: "Lasts longer than cut flowers", priority: 1 },
      { category: "candle-holders-lanterns", reason: "Same warm, romantic feeling", priority: 2 },
      { category: "bath-body-gifts", reason: "Self-care instead of flowers", priority: 3 },
    ],
  },
  {
    category: "chocolates-sweets-gifts",
    reason: "similar-vibe",
    alternatives: [
      { category: "gourmet-gifts", reason: "Same indulgence, different treat", priority: 1 },
      { category: "wine-whiskey-beverage-hampers", reason: "Sweet drinks instead of sweets", priority: 2 },
      { category: "baby-shower-gifts", reason: "If the recipient prefers non-food", priority: 3 },
    ],
  },
  {
    category: "wine-whiskey-beverage-hampers",
    reason: "similar-vibe",
    alternatives: [
      { category: "chocolates-sweets-gifts", reason: "Non-alcoholic indulgence", priority: 1 },
      { category: "hampers-gift-sets", reason: "Curated gift instead", priority: 2 },
      { category: "experience-gifts", reason: "Memory instead of material", priority: 3 },
    ],
  },
  {
    category: "jewelry-fine-pieces",
    reason: "price-match",
    alternatives: [
      { category: "personalized-gifts", reason: "Same thoughtfulness, lower price", priority: 1 },
      { category: "luxury-perfumes-fragrance-collection", reason: "Premium gift at different price point", priority: 2 },
      { category: "experience-gifts", reason: "Experience over material", priority: 3 },
    ],
  },
  {
    category: "baby-toys",
    reason: "out-of-stock",
    alternatives: [
      { category: "newborn-essentials", reason: "Practical gift instead", priority: 1 },
      { category: "baby-keepsakes", reason: "Memorable keepsake", priority: 2 },
      { category: "kids-baby-gifts", reason: "Broader age range", priority: 3 },
    ],
  },
  {
    category: "personalized-gifts",
    reason: "out-of-stock",
    alternatives: [
      { category: "engraved-gifts", reason: "Similar customization", priority: 1 },
      { category: "photo-gifts", reason: "Personal touch via photos", priority: 2 },
      { category: "custom-illustrated-gifts", reason: "Artistic personalization", priority: 3 },
    ],
  },
  {
    category: "experience-gifts",
    reason: "price-match",
    alternatives: [
      { category: "spa-experience-vouchers", reason: "Budget-friendly experience", priority: 1 },
      { category: "food-drink-vouchers", reason: "Different experience type", priority: 2 },
      { category: "day-trips-outdoor-activities", reason: "Adventure instead of luxury", priority: 3 },
    ],
  },
  {
    category: "greeting-cards-note-cards",
    reason: "out-of-stock",
    alternatives: [
      { category: "personalized-gifts", reason: "More impactful message", priority: 1 },
      { category: "flowers", reason: "Words + beauty", priority: 2 },
      { category: "chocolates-sweets-gifts", reason: "Sweet gesture instead", priority: 3 },
    ],
  },
];

export function getSubstitutions(
  category: string,
  reason: "out-of-stock" | "discontinued" | "price-match" | "similar-vibe" = "similar-vibe"
): Array<{ category: string; reason: string; priority: number }> {
  const rule = SUBSTITUTION_RULES.find((r) => r.category === category);

  if (!rule) {
    // Default fallback
    return [
      { category: "hampers-gift-sets", reason: "A curated hamper works for anyone", priority: 1 },
      { category: "personalized-gifts", reason: "Personal touch when the original isn't available", priority: 2 },
      { category: "gifts", reason: "Browse all gifts", priority: 3 },
    ];
  }

  // Filter by reason if specified
  if (reason === "price-match") {
    return rule.alternatives.filter(
      (a) => a.reason.toLowerCase().includes("price") || a.priority <= 2
    );
  }

  return rule.alternatives;
}

export function getSmartSubstituteMessage(category: string): string {
  const messages: Record<string, string> = {
    flowers: "Fresh flowers are beautiful but short-lived. Consider these lasting alternatives:",
    "chocolates-sweets-gifts": "Everyone loves chocolates! Here are similar indulgent options:",
    "wine-whiskey-beverage-hampers": "Not a drinker? These alternatives hit the same spot:",
    "jewelry-fine-pieces": "Fine jewellery is special. These alternatives are equally thoughtful:",
    "baby-toys": "Can't find the right toy? These baby gifts are just as special:",
    "personalized-gifts": "Personalised items take time. These are equally meaningful:",
    "experience-gifts": "Experience gifts are unique. Here are similar options:",
    "greeting-cards-note-cards": "A card is nice, but these alternatives make a bigger impact:",
  };

  return messages[category] || "Looking for something similar? Here are our suggestions:";
}

export function getBudgetAlternatives(category: string, maxPrice: number): string[] {
  const alternatives = getSubstitutions(category, "price-match");
  return alternatives.map((a) => a.category);
}
