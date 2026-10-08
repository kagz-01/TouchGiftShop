import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gift Ready! | TouchGift",
  description: "Your gift has been secured. Share the magic unboxing link with your recipient.",
  openGraph: {
    title: "Gift Ready! | TouchGift",
    description: "Your gift has been secured. Share the magic unboxing link with your recipient.",
    type: "website",
  },
};

export default function GiftReadyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
