/**
 * Cross-category suggestion rules.
 * When a user views products in a category, suggest complementary categories.
 *
 * Used by CategorySuggestions component to boost cross-sell.
 */

export type CategorySuggestion = {
  label: string;
  slug: string;
  emoji: string;
  reason: string;
};

export const CATEGORY_SUGGESTIONS: Record<string, CategorySuggestion[]> = {
  condolences: [
    { label: "Flowers", slug: "flowers", emoji: "💐", reason: "Pair with flowers" },
    { label: "Greeting Cards", slug: "personalised", emoji: "💌", reason: "Add a sympathy card" },
  ],
  birthdays: [
    { label: "Chocolates", slug: "chocolates", emoji: "🍫", reason: "Add chocolates" },
    { label: "Flowers", slug: "flowers", emoji: "💐", reason: "Pair with flowers" },
    { label: "Beverages", slug: "beverages", emoji: "🍷", reason: "Celebrate with a drink" },
  ],
  anniversaries: [
    { label: "Jewellery", slug: "jewellery", emoji: "💎", reason: "Classic anniversary gift" },
    { label: "Flowers", slug: "flowers", emoji: "💐", reason: "Roses for romance" },
    { label: "Chocolates", slug: "chocolates", emoji: "🍫", reason: "Sweeten the moment" },
  ],
  weddings: [
    { label: "Hampers", slug: "hampers", emoji: "🧺", reason: "Gift a luxury hamper" },
    { label: "Personalised", slug: "personalised", emoji: "✨", reason: "Make it personal" },
  ],
  "just-because": [
    { label: "Flowers", slug: "flowers", emoji: "💐", reason: "Brighten their day" },
    { label: "Plants", slug: "plants", emoji: "🪴", reason: "A living reminder" },
    { label: "Beverages", slug: "beverages", emoji: "🍷", reason: "Cheers to nothing" },
  ],
  apology: [
    { label: "Flowers", slug: "flowers", emoji: "💐", reason: "Say it with flowers" },
    { label: "Personalised", slug: "personalised", emoji: "✨", reason: "A heartfelt touch" },
  ],
  "get-well": [
    { label: "Plants", slug: "plants", emoji: "🪴", reason: "A healing companion" },
    { label: "Beverages", slug: "beverages", emoji: "☕", reason: "Comfort drinks" },
  ],
  corporate: [
    { label: "Hampers", slug: "hampers", emoji: "🧺", reason: "Executive hampers" },
    { label: "Personalised", slug: "personalised", emoji: "✨", reason: "Branded gifts" },
  ],
  her: [
    { label: "Flowers", slug: "flowers", emoji: "💐", reason: "Classic for her" },
    { label: "Spa", slug: "spa", emoji: "🧖", reason: "Pamper her" },
    { label: "Jewellery", slug: "jewellery", emoji: "💎", reason: "Something sparkling" },
  ],
  him: [
    { label: "Drinks", slug: "drinks", emoji: "🥃", reason: "His favourite tipple" },
    { label: "Grooming", slug: "grooming", emoji: "🧴", reason: "Self-care for him" },
    { label: "Gadgets", slug: "gadgets", emoji: "📱", reason: "Tech he'll love" },
  ],
  beverages: [
    { label: "Chocolates", slug: "chocolates", emoji: "🍫", reason: "Perfect pairing" },
    { label: "Hampers", slug: "hampers", emoji: "🧺", reason: "Bundle it up" },
  ],
  plants: [
    { label: "Candles", slug: "candles", emoji: "🕯️", reason: "Complete the vibe" },
    { label: "Spa", slug: "spa", emoji: "🧖", reason: "Self-care combo" },
  ],
};

export function getSuggestions(category: string): CategorySuggestion[] {
  return CATEGORY_SUGGESTIONS[category] ?? [];
}
