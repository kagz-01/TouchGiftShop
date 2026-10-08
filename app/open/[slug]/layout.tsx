import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unbox Your Gift | TouchGift",
  description: "Someone sent you a gift! Tap to unbox your surprise and enter your delivery address.",
  openGraph: {
    title: "You have a gift! 🎁 | TouchGift",
    description: "Tap to unbox your magical gift and enter your delivery address.",
    type: "website",
  },
};

export default function OpenGiftLayout({ children }: { children: React.ReactNode }) {
  return children;
}
