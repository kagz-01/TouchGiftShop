import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    template: "%s | TouchGift",
    default: "TouchGift — Send a gift in Kenya",
  },
  description:
    "Same-day gift delivery in Nairobi, next-day nationwide. Group gifting, recipient-led delivery, and wishlists — no guessing what to send.",
  manifest: "/manifest.json",
  openGraph: {
    title: "TouchGift — Send a gift in Kenya",
    description:
      "Same-day gift delivery in Nairobi, next-day nationwide. Group gifting, recipient-led delivery, and wishlists.",
    siteName: "TouchGift",
    type: "website",
    locale: "en_KE",
  },
  twitter: {
    card: "summary_large_image",
    title: "TouchGift — Send a gift in Kenya",
    description:
      "Same-day gift delivery in Nairobi, next-day nationwide. Group gifting, recipient-led delivery, and wishlists.",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#B8336A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">
        <Header />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
