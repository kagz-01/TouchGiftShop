import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const revalidate = 300;

type NavCategory = {
  id: string;
  name: string;
  slug: string;
  count: number;
};

/**
 * Categories that currently have at least one product, with counts.
 *
 * Drives the shop chips and the MegaMenu "Collections" panel, so a newly
 * imported product line (apparel, flowers, ...) shows up in the nav without
 * a code change. Empty categories are omitted — clicking one would render an
 * empty grid.
 */
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("id, name, slug, product_categories(count)")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const categories: NavCategory[] = ((data ?? []) as Array<{
    id: string;
    name: string;
    slug: string;
    product_categories?: Array<{ count: number }>;
  }>)
    .map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      count: c.product_categories?.[0]?.count ?? 0,
    }))
    .filter((c) => c.count > 0);

  return NextResponse.json(
    { categories },
    {
      headers: {
        "cache-control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
