import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unbox Your Gift Card | TouchGift",
  description: "Claim your digital gift card and add it to your TouchGift Wallet instantly.",
  openGraph: {
    title: "You received a gift card! 💳 | TouchGift",
    description: "Tap to unbox your gift card and claim the funds to your wallet.",
    type: "website",
  },
};

export default function OpenGiftCardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
