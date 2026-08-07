export type BudgetSplit = {
  name: string;
  items: Array<{
    category: string;
    label: string;
    maxPrice: number;
    percentage: number;
  }>;
  total: number;
};

export function suggestBudgetSplit(budget: number, occasion: string): BudgetSplit {
  const splits: Record<string, BudgetSplit> = {
    birthday: {
      name: "Birthday Bundle",
      items: [
        { category: "gifts", label: "Main Gift", maxPrice: Math.floor(budget * 0.5), percentage: 50 },
        { category: "chocolates-sweets-gifts", label: "Treats", maxPrice: Math.floor(budget * 0.2), percentage: 20 },
        { category: "greeting-cards-note-cards", label: "Card", maxPrice: Math.floor(budget * 0.1), percentage: 10 },
        { category: "flowers", label: "Flowers", maxPrice: Math.floor(budget * 0.2), percentage: 20 },
      ],
      total: budget,
    },
    wedding: {
      name: "Wedding Gift",
      items: [
        { category: "home-lifestyle", label: "Home Gift", maxPrice: Math.floor(budget * 0.6), percentage: 60 },
        { category: "personalized-gifts", label: "Personalised Touch", maxPrice: Math.floor(budget * 0.25), percentage: 25 },
        { category: "greeting-cards-note-cards", label: "Card", maxPrice: Math.floor(budget * 0.15), percentage: 15 },
      ],
      total: budget,
    },
    anniversary: {
      name: "Anniversary Package",
      items: [
        { category: "jewelry-fine-pieces", label: "Jewellery", maxPrice: Math.floor(budget * 0.45), percentage: 45 },
        { category: "flowers", label: "Flowers", maxPrice: Math.floor(budget * 0.25), percentage: 25 },
        { category: "chocolates-sweets-gifts", label: "Chocolates", maxPrice: Math.floor(budget * 0.15), percentage: 15 },
        { category: "greeting-cards-note-cards", label: "Card", maxPrice: Math.floor(budget * 0.15), percentage: 15 },
      ],
      total: budget,
    },
    "baby-shower": {
      name: "Baby Shower Hamper",
      items: [
        { category: "newborn-essentials", label: "Essentials", maxPrice: Math.floor(budget * 0.4), percentage: 40 },
        { category: "baby-toys", label: "Toys", maxPrice: Math.floor(budget * 0.25), percentage: 25 },
        { category: "baby-keepsakes", label: "Keepsake", maxPrice: Math.floor(budget * 0.2), percentage: 20 },
        { category: "greeting-cards-note-cards", label: "Card", maxPrice: Math.floor(budget * 0.15), percentage: 15 },
      ],
      total: budget,
    },
    corporate: {
      name: "Corporate Gift",
      items: [
        { category: "hampers-gift-sets", label: "Hamper", maxPrice: Math.floor(budget * 0.6), percentage: 60 },
        { category: "personalized-gifts", label: "Branded Item", maxPrice: Math.floor(budget * 0.25), percentage: 25 },
        { category: "greeting-cards-note-cards", label: "Card", maxPrice: Math.floor(budget * 0.15), percentage: 15 },
      ],
      total: budget,
    },
    default: {
      name: "Gift Package",
      items: [
        { category: "gifts", label: "Main Gift", maxPrice: Math.floor(budget * 0.55), percentage: 55 },
        { category: "chocolates-sweets-gifts", label: "Treats", maxPrice: Math.floor(budget * 0.2), percentage: 20 },
        { category: "greeting-cards-note-cards", label: "Card", maxPrice: Math.floor(budget * 0.1), percentage: 10 },
        { category: "flowers", label: "Something Extra", maxPrice: Math.floor(budget * 0.15), percentage: 15 },
      ],
      total: budget,
    },
  };

  return splits[occasion] || splits.default;
}

export function formatBudgetSplit(split: BudgetSplit): string {
  return split.items
    .map((item) => `${item.label}: up to ${item.maxPrice.toLocaleString()} KSh`)
    .join("\n");
}
