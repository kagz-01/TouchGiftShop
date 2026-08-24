import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppFloat from "@/components/ui/WhatsAppFloat";
import AmbientBackground from "@/components/ui/AmbientBackground";
import GiftChatWidget from "@/components/ai/GiftChatWidget";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { SubscriptionProvider } from "@/components/reminders/SubscriptionProvider";
import { CartProvider } from "@/lib/cart";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://touch-gift-shop.vercel.app"),
};

export const viewport: Viewport = {
  themeColor: "#9B1B5A",
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
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans overflow-x-hidden">
        <ThemeProvider>
          <CartProvider>
            <AmbientBackground />
            <Analytics />
            <SpeedInsights />
            <SubscriptionProvider>
              <Header />
              <main className="flex-1 pb-20 md:pb-0 relative z-0">
                {children}
              </main>
              <Footer />
              <BottomNav />
              <WhatsAppFloat />
              <GiftChatWidget />
            </SubscriptionProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
