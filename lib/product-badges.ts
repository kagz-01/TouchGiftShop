export type Badge = {
  label: string;
  emoji: string;
  color: string; // Tailwind classes
  priority: number; // Lower = shown first
};

// Badges assigned based on product position, price, or category
export function getProductBadges(
  product: { price: number; is_personalizable?: boolean; in_stock?: boolean },
  index: number,
  categorySlug?: string,
): Badge[] {
  const badges: Badge[] = [];

  // Best Seller — top 8 products on homepage
  if (index < 8) {
    badges.push({
      label: "Best Seller",
      emoji: "🔥",
      color: "bg-orange-500 text-white",
      priority: 1,
    });
  }

  // Premium Pick — items over KSh 8,000
  if (product.price >= 8000) {
    badges.push({
      label: "Premium",
      emoji: "✨",
      color: "bg-gradient-to-r from-amber-500 to-yellow-500 text-white",
      priority: 2,
    });
  }

  // Budget Friendly — items under KSh 2,000
  if (product.price < 2000) {
    badges.push({
      label: "Under 2K",
      emoji: "💰",
      color: "bg-emerald-500 text-white",
      priority: 3,
    });
  }

  // Personalizable
  if (product.is_personalizable) {
    badges.push({
      label: "Personalizable",
      emoji: "✨",
      color: "bg-violet-500 text-white",
      priority: 4,
    });
  }

  // Category-specific badges
  if (categorySlug === "hampers" || categorySlug === "hampers-gift-sets") {
    badges.push({
      label: "Gift Ready",
      emoji: "🎁",
      color: "bg-brand text-white",
      priority: 2,
    });
  }

  if (categorySlug === "experience-gifts" || categorySlug?.includes("experience")) {
    badges.push({
      label: "Experience",
      emoji: "🌟",
      color: "bg-sky-500 text-white",
      priority: 2,
    });
  }

  if (categorySlug === "personalised" || categorySlug?.includes("personaliz")) {
    badges.push({
      label: "One of a Kind",
      emoji: "💎",
      color: "bg-pink-500 text-white",
      priority: 2,
    });
  }

  // Sort by priority and return max 2
  return badges.sort((a, b) => a.priority - b.priority).slice(0, 2);
}
