import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Portal · TouchGift",
  description: "Quotes, orders and spend for your TouchGift company account.",
  robots: { index: false, follow: false },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
