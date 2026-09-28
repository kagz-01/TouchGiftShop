import {
  Trophy, PenLine, Coffee, Backpack, Clock, Smartphone,
  KeyRound, Gift, Shirt, Flower2, Sparkles, Apple,
} from "lucide-react";

/**
 * Icon per taxonomy slug created in scripts/link_categories.py.
 * Slugs are permanent (they appear in every /shop?category=<slug> link).
 */
export const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "awards-trophies": <Trophy className="w-4 h-4" />,
  "stationery-office": <PenLine className="w-4 h-4" />,
  drinkware: <Coffee className="w-4 h-4" />,
  bags: <Backpack className="w-4 h-4" />,
  clocks: <Clock className="w-4 h-4" />,
  "tech-gadgets": <Smartphone className="w-4 h-4" />,
  accessories: <KeyRound className="w-4 h-4" />,
  "gift-sets": <Gift className="w-4 h-4" />,
  apparel: <Shirt className="w-4 h-4" />,
  flowers: <Flower2 className="w-4 h-4" />,
  perfumes: <Sparkles className="w-4 h-4" />,
  "fruits-edibles": <Apple className="w-4 h-4" />,
};

export function categoryIcon(slug: string): React.ReactNode {
  if (!slug) return <Sparkles className="w-4 h-4" />;
  return CATEGORY_ICONS[slug] ?? <Gift className="w-4 h-4" />;
}
