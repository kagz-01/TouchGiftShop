import type { Metadata } from "next";
import CorporateHero from "@/components/corporate/CorporateHero";
import { sellerConfig } from "@/lib/invoicing";

export const metadata: Metadata = {
  title: "Corporate Gifting | TouchGift — Reward Your Team at Scale",
  description:
    "Curated corporate gifts for clients, teams and milestones. Branded when it matters, delivered when it counts.",
  openGraph: {
    title: "TouchGift Corporate — Reward Your Team at Scale",
    description:
      "Curated corporate gifts for clients, teams and milestones. Branded when it matters, delivered when it counts.",
    url: "https://touchgiftshop.co.ke/corporate",
  },
};

/* The corporate landing is a real B2B page again, not a redirect.
 *
 * Clicking "Corporate" in the storefront header used to land staff directly in
 * the ops dashboard, which meant a first-time corporate buyer never saw the
 * range, the quote path, or the portal sign-in. The dashboard is a working
 * surface for people who already have an account; /corporate is the front door.
 */
export default function CorporateHomePage() {
  /* Pack prices are retail, so the calculator needs the same VAT flag the
     invoice and proforma use. Passing it down keeps the three surfaces from
     disagreeing about whether tax is included. */
  const { vatRegistered, vatRate } = sellerConfig();
  return <CorporateHero vatRegistered={vatRegistered} vatRate={vatRate} />;
}
