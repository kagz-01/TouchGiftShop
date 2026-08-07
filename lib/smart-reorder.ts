import { getGiftHistory } from "./gift-history";

export type ReorderSuggestion = {
  recipient: string;
  occasion: string;
  lastGift: {
    productId: string;
    productName: string;
    price: number;
    date: string;
  };
  daysSinceLast: number;
  suggestedAction: "reorder" | "similar" | "upgrade";
  reason: string;
};

// Occasions that repeat yearly
const RECURRING_OCCASIONS = [
  "birthday",
  "anniversary",
  "valentines",
  "christmas",
  "mothers-day",
  "fathers-day",
];

export function getReorderSuggestions(): ReorderSuggestion[] {
  const history = getGiftHistory();
  const now = new Date();
  const suggestions: ReorderSuggestion[] = [];

  for (const recipient of history) {
    // Group gifts by occasion
    const occasionGroups = new Map<string, typeof recipient.gifts>();
    for (const gift of recipient.gifts) {
      const existing = occasionGroups.get(gift.occasion) || [];
      existing.push(gift);
      occasionGroups.set(gift.occasion, existing);
    }

    for (const [occasion, gifts] of occasionGroups) {
      // Only suggest for recurring occasions
      if (!RECURRING_OCCASIONS.includes(occasion)) continue;

      // Get the most recent gift for this occasion
      const sorted = [...gifts].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const lastGift = sorted[0];

      const daysSince = Math.floor(
        (now.getTime() - new Date(lastGift.date).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Suggest if it's been close to a year (300-400 days)
      if (daysSince >= 300 && daysSince <= 400) {
        suggestions.push({
          recipient: recipient.recipientName,
          occasion,
          lastGift: {
            productId: lastGift.productId,
            productName: lastGift.productName,
            price: lastGift.price,
            date: lastGift.date,
          },
          daysSinceLast: daysSince,
          suggestedAction: "reorder",
          reason: `${occasion.replace(/-/g, " ")} is coming up! Reorder last year's hit.`,
        });
      } else if (daysSince >= 365) {
        // More than a year — suggest similar or upgrade
        suggestions.push({
          recipient: recipient.recipientName,
          occasion,
          lastGift: {
            productId: lastGift.productId,
            productName: lastGift.productName,
            price: lastGift.price,
            date: lastGift.date,
          },
          daysSinceLast: daysSince,
          suggestedAction: "upgrade",
          reason: `Last year's ${occasion.replace(/-/g, " ")} gift was ${lastGift.productName}. Time for an upgrade?`,
        });
      } else if (daysSince >= 330) {
        // Close to a year — suggest similar
        suggestions.push({
          recipient: recipient.recipientName,
          occasion,
          lastGift: {
            productId: lastGift.productId,
            productName: lastGift.productName,
            price: lastGift.price,
            date: lastGift.date,
          },
          daysSinceLast: daysSince,
          suggestedAction: "similar",
          reason: `They loved ${lastGift.productName} last time. Want something similar?`,
        });
      }
    }
  }

  return suggestions;
}

export function shouldShowReorderBanner(): boolean {
  const suggestions = getReorderSuggestions();
  return suggestions.length > 0;
}

export function formatReorderMessage(suggestion: ReorderSuggestion): string {
  const daysUntil = 365 - suggestion.daysSinceLast;
  if (daysUntil <= 30) {
    return `Only ${daysUntil} days until ${suggestion.recipient}'s ${suggestion.occasion.replace(/-/g, " ")}.`;
  }
  return `${suggestion.recipient}'s ${suggestion.occasion.replace(/-/g, " ")} is ${daysUntil <= 0 ? "overdue" : `in ${daysUntil} days`}.`;
}
