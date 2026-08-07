/**
 * Smart sorting rules by category.
 * Defines default sort order for each category to maximize relevance.
 *
 * Used by /api/products to auto-sort based on category context.
 */

export type SortOption = {
  field: string;
  ascending: boolean;
};

export const CATEGORY_SORT: Record<string, SortOption> = {
  birthdays: { field: "price", ascending: true }, // budget-friendly first
  "just-because": { field: "price", ascending: true }, // impulse buys
  corporate: { field: "price", ascending: false }, // premium first
  hampers: { field: "price", ascending: false }, // premium first
  milestone: { field: "price", ascending: false }, // premium first
  weddings: { field: "price", ascending: false }, // premium first
  "date-night": { field: "price", ascending: true }, // accessible
  "self-care": { field: "price", ascending: true }, // accessible
};

export function getDefaultSort(category: string | null): SortOption | null {
  if (!category) return null;
  return CATEGORY_SORT[category] ?? null;
}
