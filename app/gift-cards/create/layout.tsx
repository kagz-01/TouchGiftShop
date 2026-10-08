import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create a Gift Card | TouchGift",
  description: "Design a premium digital gift card with a personal voice note. Delivered as a magical unboxing experience.",
  openGraph: {
    title: "Create a Gift Card | TouchGift",
    description: "Design a premium digital gift card with a personal voice note.",
    type: "website",
  },
};

export default function CreateGiftCardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
