export type LoyaltyTierName = "bronze" | "silver" | "gold" | "platinum";

export interface LoyaltyTierInfo {
  name: string;
  color: string;
  discount: number;
  minOrders: number;
  minSpend: number;
  perks: string[];
}

export const LOYALTY_TIERS: Record<LoyaltyTierName, LoyaltyTierInfo> = {
  bronze: {
    name: "Bronze",
    color: "#CD7F32",
    discount: 0,
    minOrders: 0,
    minSpend: 0,
    perks: ["Earn 1 point per KSh 10 spent"],
  },
  silver: {
    name: "Silver",
    color: "#C0C0C0",
    discount: 5,
    minOrders: 5,
    minSpend: 10000,
    perks: ["5% off all orders", "Earn 1.5x points", "Early access to new gifts"],
  },
  gold: {
    name: "Gold",
    color: "#FFD700",
    discount: 10,
    minOrders: 15,
    minSpend: 50000,
    perks: ["10% off all orders", "Earn 2x points", "Free gift wrapping", "Priority support"],
  },
  platinum: {
    name: "Platinum",
    color: "#E5E4E2",
    discount: 15,
    minOrders: 30,
    minSpend: 150000,
    perks: ["15% off all orders", "Earn 3x points", "Free express delivery", "Dedicated account manager", "Exclusive gifts"],
  },
};

const TIER_ORDER: LoyaltyTierName[] = ["bronze", "silver", "gold", "platinum"];

export const TIER_LIST: LoyaltyTierInfo[] = TIER_ORDER.map((t) => LOYALTY_TIERS[t]);

export function getLoyaltyTier(totalOrders: number, totalSpend: number): LoyaltyTierInfo {
  if (totalOrders >= LOYALTY_TIERS.platinum.minOrders && totalSpend >= LOYALTY_TIERS.platinum.minSpend) {
    return LOYALTY_TIERS.platinum;
  }
  if (totalOrders >= LOYALTY_TIERS.gold.minOrders && totalSpend >= LOYALTY_TIERS.gold.minSpend) {
    return LOYALTY_TIERS.gold;
  }
  if (totalOrders >= LOYALTY_TIERS.silver.minOrders && totalSpend >= LOYALTY_TIERS.silver.minSpend) {
    return LOYALTY_TIERS.silver;
  }
  return LOYALTY_TIERS.bronze;
}

export function getNextTier(totalOrders: number, totalSpend: number): LoyaltyTierInfo | null {
  const current = getLoyaltyTier(totalOrders, totalSpend);
  const currentIdx = TIER_ORDER.findIndex((t) => LOYALTY_TIERS[t].name === current.name);
  if (currentIdx < TIER_ORDER.length - 1) {
    return LOYALTY_TIERS[TIER_ORDER[currentIdx + 1]];
  }
  return null;
}

export function calculateLoyaltyDiscount(subtotal: number, tier: LoyaltyTierInfo): number {
  return Math.round(subtotal * (tier.discount / 100));
}
