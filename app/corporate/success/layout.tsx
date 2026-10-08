import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Confirmed | TouchGift Corporate",
  description: "Your bulk corporate gift order is confirmed. Download your magic links or track your CSV blast.",
  openGraph: {
    title: "Corporate Order Confirmed | TouchGift",
    description: "Your bulk gift order is confirmed. Magic links are ready.",
    type: "website",
  },
};

export default function CorporateSuccessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
