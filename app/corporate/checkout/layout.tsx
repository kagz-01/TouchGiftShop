import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Corporate Checkout | TouchGift",
  description: "Bulk gifting checkout for enterprise teams. Pay via M-Pesa, Airtel Money or Bank Transfer.",
  openGraph: {
    title: "Corporate Checkout | TouchGift",
    description: "Complete your bulk corporate gift order.",
    type: "website",
  },
};

export default function CorporateCheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
