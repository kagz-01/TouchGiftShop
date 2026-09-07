"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import WhatsAppFloat from "@/components/ui/WhatsAppFloat";
import GiftChatWidget from "@/components/ai/GiftChatWidget";
import MoodPresenceToast from "@/components/ui/MoodPresenceToast";
import { createClient } from "@/lib/supabase-browser";

const ADMIN_PREFIXES = ["/admin", "/admin-access-2026"];

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = ADMIN_PREFIXES.some((p) => pathname.startsWith(p));
  const [userName, setUserName] = useState<string | null>(null);

  // Grab user's display name for the presence toast
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      if (!user) return;
      // Try display_name from metadata first, then email prefix
      const display =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        null;
      setUserName(display);
    });
  }, []);

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
      {/* Mood-aware presence toast — watches idle time and tab switching */}
      <MoodPresenceToast userName={userName} />
    </>
  );
}
