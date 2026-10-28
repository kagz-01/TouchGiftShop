import { supabaseAdmin } from "@/lib/supabase";

/**
 * Id-based pre-filters for conditions Supabase can't express directly.
 *
 * Both must be resolved BEFORE the query's range() window: filtering rows in
 * JS after only 24 were fetched showed "Showing 0 of N — Nothing here yet"
 * while stock existed (On Sale did exactly that).
 *
 * Id lists go through `.in("id", [...])` (URL-encoded). That stays safe for
 * the realistic scale here (a few hundred discounted/rated items); if the shop
 * ever exceeds ~1k in either set, move these into an RPC/migration instead.
 */

/** Products whose sale_price exists and is strictly below price. */
export async function getOnSaleProductIds(): Promise<string[]> {
  try {
    const { data } = await supabaseAdmin
      .from("products")
      .select("id, price, sale_price")
      .not("sale_price", "is", null);

    if (!data) return [];
    return data
      .filter((r) => Number(r.sale_price) < Number(r.price))
      .map((r) => r.id as string);
  } catch {
    return [];
  }
}

/** Products whose average approved review rating is >= minR. */
export async function getRatedProductIds(minR: number): Promise<string[]> {
  try {
    const { data } = await supabaseAdmin
      .from("reviews")
      .select("product_id, rating")
      .eq("status", "approved");

    if (!data || data.length === 0) return [];

    const ratingMap = new Map<string, { sum: number; count: number }>();
    for (const r of data as { product_id: string; rating: unknown }[]) {
      const existing = ratingMap.get(r.product_id) || { sum: 0, count: 0 };
      existing.sum += Number(r.rating);
      existing.count += 1;
      ratingMap.set(r.product_id, existing);
    }

    const qualifying: string[] = [];
    for (const [pid, { sum, count }] of ratingMap) {
      if (sum / count >= minR) qualifying.push(pid);
    }
    return qualifying;
  } catch {
    return [];
  }
}
