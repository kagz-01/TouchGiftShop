import { supabaseAdmin } from "@/lib/supabase";
import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://touchgiftshop.co.ke";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/gift-quiz`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/gift-lab`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/gift-cards`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/referrals`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  // Fetch all published products
  const { data: products } = await supabaseAdmin
    .from("products")
    .select("id, updated_at")
    .eq("status", "published")
    .limit(5000);

  const productPages: MetadataRoute.Sitemap = (products || []).map((p) => ({
    url: `${SITE_URL}/product/${p.id}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Fetch all active categories
  const { data: categories } = await supabaseAdmin
    .from("categories")
    .select("slug, updated_at")
    .eq("status", "active")
    .limit(200);

  const categoryPages: MetadataRoute.Sitemap = (categories || []).map((c) => ({
    url: `${SITE_URL}/shop?category=${c.slug}`,
    lastModified: new Date(c.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...staticPages, ...productPages, ...categoryPages];
}
