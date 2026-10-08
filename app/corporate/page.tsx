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
    type: "website",
  },
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function CorporatePortalPage() {
  const { data: products } = await supabase
    .from("shop_products")
    .select("id, name, description, price, media_urls, vibe_tags")
    .contains("vibe_tags", ["Corporate"])
    .eq("is_active", true)
    .limit(12);

  return <CorporateHero products={products ?? []} />;
}
