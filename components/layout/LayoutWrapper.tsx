"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import WhatsAppFloat from "@/components/ui/WhatsAppFloat";
import GiftChatWidget from "@/components/ai/GiftChatWidget";

const ADMIN_PREFIXES = ["/admin", "/admin-access-2026"];

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = ADMIN_PREFIXES.some((p) => pathname.startsWith(p));

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1 pb-20 md:pb-0 relative z-0">{children}</main>
      <Footer />
      <BottomNav />
      <WhatsAppFloat />
      <GiftChatWidget />
    </>
  );
}
