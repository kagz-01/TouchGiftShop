import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import type { Metadata } from "next";
import CorporateHero from "@/components/corporate/CorporateHero";

export const metadata: Metadata = {
  title: "Corporate Gifting | TouchGift — Reward Your Team at Scale",
  description:
    "Cinematic, effortless bulk gifting for modern teams. Send 50 or 5,000 gifts instantly via Magic Links or SMS.",
  openGraph: {
    title: "TouchGift Corporate — Reward Your Team at Scale",
    description:
      "Forget spreadsheets. Send branded gifts to your entire team in minutes.",
    url: "https://touchgiftshop.co.ke/corporate",
  },
};

/* This page no longer fetches anything itself.
 *
 * It used to query shop_products filtered on `vibe_tags contains ['Corporate']`.
 * That is a different table from `products` — the one the storefront and the
 * catalog actually read — and no import path anywhere writes that tag, so the
 * section fed by it ("Curated Team Packs") rendered an empty grid and duplicated
 * the branded-merchandise hub that sits below it. Both are gone.
 *
 * The range, the quote CTA and the portal links are all client-side now, so
 * this is a pure metadata + composition route. If the showcase later needs
 * server-rendered product data, fetch from `products` (not `shop_products`)
 * and key it to lib/corporate-merch.ts slugs.
 */
export default function CorporatePortalPage() {
  return <CorporateHero />;
}
