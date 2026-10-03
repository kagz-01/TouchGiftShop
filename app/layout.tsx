import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import AmbientBackground from "@/components/ui/AmbientBackground";
import ParallaxProvider from "@/components/ui/ParallaxProvider";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { MoodProvider } from "@/context/MoodContext";
import { SubscriptionProvider } from "@/components/reminders/SubscriptionProvider";
import { CartProvider } from "@/lib/cart";
import dynamic from "next/dynamic";

const ReferralCapture = dynamic(() => import("@/components/referrals/ReferralCapture"), { ssr: false });
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

/* Self-hosted rather than next/font/google. The Google fetch happened on every
   build with no cache, and this machine's route to fonts.gstatic.com is
   unreliable, so builds failed at random. These also remove the same risk from
   production deploys. Variable fonts, latin subset, 300-700. */
const cormorant = localFont({
  src: "./../public/fonts/CormorantGaramond-Variable.woff2",
  weight: "300 700",
  style: "normal",
  variable: "--font-display",
  display: "swap",
  fallback: ["Georgia", "serif"],
  adjustFontFallback: false,
});

const inter = localFont({
  src: "./../public/fonts/Inter-Variable.woff2",
  weight: "300 700",
  style: "normal",
  variable: "--font-sans",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
  adjustFontFallback: false,
});

/* Playfair Display, for the gift card. The card leans on it hard — the amount
   and the recipient's name are set in it — so the Georgia fallback is very
   visible. Weights 400-900 cover the card's 600 and 700. The italic face is
   static: the recipient name is set in italic 600, and a single static italic
   is synthesised up to 600 rather than dropping to a upright fallback. */
const playfair = localFont({
  src: [
    {
      path: "./../public/fonts/PlayfairDisplay-Variable.woff2",
      weight: "400 900",
      style: "normal",
    },
    {
      path: "./../public/fonts/PlayfairDisplay-Italic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-playfair",
  display: "swap",
  fallback: ["Georgia", "serif"],
  adjustFontFallback: false,
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
    <html lang="en" className={`${cormorant.variable} ${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen flex flex-col font-sans overflow-x-hidden" style={{ background: "var(--bg-base)", color: "var(--text-primary)", transition: "background 0.4s ease, color 0.4s ease" }}>
        <ThemeProvider>
          <MoodProvider>
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
          </MoodProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
