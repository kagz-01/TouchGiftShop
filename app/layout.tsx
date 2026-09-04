import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import AmbientBackground from "@/components/ui/AmbientBackground";
import ParallaxProvider from "@/components/ui/ParallaxProvider";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { SubscriptionProvider } from "@/components/reminders/SubscriptionProvider";
import { CartProvider } from "@/lib/cart";
import dynamic from "next/dynamic";

const ReferralCapture = dynamic(() => import("@/components/referrals/ReferralCapture"), { ssr: false });
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://touchgiftshop.co.ke";

export const metadata: Metadata = {
  title: {
    template: "%s | TouchGift",
    default: "TouchGift — Send a gift in Kenya",
  },
  description:
    "Same-day gift delivery in Nairobi, next-day nationwide. Group gifting, recipient-led delivery, and wishlists — no guessing what to send.",
  manifest: "/manifest.json",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "TouchGift — Send a gift in Kenya",
    description:
      "Same-day gift delivery in Nairobi, next-day nationwide. Group gifting, recipient-led delivery, and wishlists.",
    siteName: "TouchGift",
    type: "website",
    locale: "en_KE",
    url: SITE_URL,
    images: [
      {
        url: "/logo/logo.webp",
        width: 1200,
        height: 630,
        alt: "TouchGift — Send a gift in Kenya",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TouchGift — Send a gift in Kenya",
    description:
      "Same-day gift delivery in Nairobi, next-day nationwide. Group gifting, recipient-led delivery, and wishlists.",
    images: ["/logo/logo.webp"],
  },
  icons: {
    icon: [
      { url: "/logo/favicon.svg", type: "image/svg+xml" },
      { url: "/logo/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/logo/favicon.ico", sizes: "any" },
    ],
    apple: "/logo/apple-touch-icon.png",
  },
  alternates: {
    canonical: SITE_URL,
  },
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
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col font-sans overflow-x-hidden" style={{ background: "var(--bg-base)", color: "var(--text-primary)", transition: "background 0.4s ease, color 0.4s ease" }}>
        <ThemeProvider>
          <CartProvider>
            <ReferralCapture />
            <ParallaxProvider />
            <AmbientBackground />
            <Analytics />
            <SpeedInsights />
            <SubscriptionProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
            </SubscriptionProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
