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
import { isGuest } from "@/lib/guest";

const ADMIN_PREFIXES = ["/admin", "/admin-access-2026"];

export type SessionUser = {
  email?: string | null;
  phone?: string | null;
  is_anonymous?: boolean;
  user_metadata?: Record<string, unknown>;
} | null;

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = ADMIN_PREFIXES.some((p) => pathname.startsWith(p));
  const [user, setUser] = useState<SessionUser>(null);
  const [guest, setGuestFlag] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  // Single auth lookup for the whole chrome — Header used to run its own
  // getUser() + onAuthStateChange on top of this one.
  useEffect(() => {
    const supabase = createClient();

    const apply = (u: SessionUser) => {
      setUser(u);
      if (!u) {
        setGuestFlag(isGuest());
        setUserName(null);
        return;
      }
      const meta = u.user_metadata ?? {};
      setUserName(
        (meta.full_name as string) ||
          (meta.name as string) ||
          u.email?.split("@")[0] ||
          null
      );
    };

    supabase.auth.getUser().then(({ data }) => apply(data.user));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      apply(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header user={user} guest={guest} />
      <main className="flex-1 pb-20 md:pb-0 relative z-0">
        {/* Fixed header spacer — pushes page content below the header on all pages except the
            homepage hero, which manages its own top padding internally. */}
        <div className="hidden md:block h-[130px]" aria-hidden="true" />
        {children}
      </main>
      <Footer />
      <BottomNav />
      <WhatsAppFloat />
      <GiftChatWidget />
      {/* Mood-aware presence toast — watches idle time and tab switching */}
      <MoodPresenceToast userName={userName} />
    </>
  );
}
