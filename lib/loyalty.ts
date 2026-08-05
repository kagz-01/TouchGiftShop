// Loyalty tier system based on order count and total spend.

export interface LoyaltyTier {
  name: string;
  minOrders: number;
  minSpend: number;
  discount: number; // percentage
  color: string;
  benefits: string[];
}

export const LOYALTY_TIERS: LoyaltyTier[] = [
  {
    name: "Bronze",
    minOrders: 0,
    minSpend: 0,
    discount: 0,
    color: "#CD7F32",
    benefits: ["Free gift wrapping", "Birthday reminder"],
  },
  {
    name: "Silver",
    minOrders: 3,
    minSpend: 5000,
    discount: 5,
    color: "#C0C0C0",
    benefits: ["5% off all orders", "Priority delivery", "Free gift wrapping"],
  },
  {
    name: "Gold",
    minOrders: 8,
    minSpend: 15000,
    discount: 10,
    color: "#FFD700",
    benefits: [
      "10% off all orders",
      "Free same-day delivery",
      "Priority support",
      "Free gift wrapping",
    ],
  },
  {
    name: "Platinum",
    minOrders: 15,
    minSpend: 40000,
    discount: 15,
    color: "#E5E4E2",
    benefits: [
      "15% off all orders",
      "Free same-day delivery",
      "Dedicated account manager",
      "Early access to new products",
      "Free gift wrapping",
    ],
  },
];

export function getLoyaltyTier(
  orderCount: number,
  totalSpend: number
): LoyaltyTier {
  let tier = LOYALTY_TIERS[0];
  for (const t of LOYALTY_TIERS) {
    if (orderCount >= t.minOrders && totalSpend >= t.minSpend) {
      tier = t;
    }
  }
  return tier;
}

export function getNextTier(
  orderCount: number,
  totalSpend: number
): LoyaltyTier | null {
  const current = getLoyaltyTier(orderCount, totalSpend);
  const currentIdx = LOYALTY_TIERS.findIndex((t) => t.name === current.name);
  if (currentIdx < LOYALTY_TIERS.length - 1) {
    return LOYALTY_TIERS[currentIdx + 1];
  }
  return null;
}
