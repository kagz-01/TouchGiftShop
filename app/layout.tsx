import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "TouchGift — Send a gift in Kenya",
  description:
    "Same-day gift delivery in Nairobi, next-day nationwide. Group gifting, recipient-led delivery, and wishlists — no guessing what to send.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white text-gray-900">
        <Header />
        {/* pb-16 reserves space for the fixed BottomNav on mobile */}
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
