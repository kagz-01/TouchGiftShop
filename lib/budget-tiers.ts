/**
 * Budget tier definitions for price filtering.
 * Maps user-friendly budget slugs to KSh price ranges.
 *
 * Used by /api/products?budget=<slug> and the price filter UI.
 */

export type BudgetTier = {
  slug: string;
  label: string;
  min: number;
  max: number | null; // null = no upper limit
};

export const BUDGET_TIERS: BudgetTier[] = [
  { slug: "under-5k", label: "Below KSh 5,000", min: 0, max: 5000 },
  { slug: "under-10k", label: "Below KSh 10,000", min: 0, max: 10000 },
  { slug: "under-20k", label: "Below KSh 20,000", min: 0, max: 20000 },
  { slug: "under-50k", label: "Below KSh 50,000", min: 0, max: 50000 },
  { slug: "premium", label: "Big Gestures", min: 50000, max: null },
];

export function getBudgetRange(slug: string): BudgetTier | null {
  return BUDGET_TIERS.find((t) => t.slug === slug) ?? null;
}
