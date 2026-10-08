import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | TouchGift",
  description: "Complete your gift purchase securely. Blind gifting mode: your recipient enters their own delivery address.",
  openGraph: {
    title: "Checkout | TouchGift",
    description: "Complete your gift purchase securely. Blind gifting mode.",
    type: "website",
  },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
