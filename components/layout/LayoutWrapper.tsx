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

  /* The client portal is its own quiet surface — a floating chat bubble and an
     AI mascot on every screen is not "calm and unhurried", and they cover the
     primary action on a phone. The portal offers the same help by name. */
  /* The portal and a shared gift pool are quiet surfaces: someone opening them
     is either working or contributing to a colleague's gift, and a floating
     chat bubble on top of the primary action helps neither. */
  const isPortal =
    pathname.startsWith("/corporate/portal") || pathname.startsWith("/corporate/pool");

  if (isAdmin || pathname.startsWith("/corporate")) {
    return (
      <main className="flex-1 relative z-0">
        {children}
        {!isAdmin && !isPortal && <WhatsAppFloat />}
        {!isAdmin && !isPortal && <GiftChatWidget />}
      </main>
    );
  }

  return (
    <>
      <Header user={user} guest={guest} />
      <main className="flex-1 pb-20 md:pb-0 relative z-0">
        {/* Fixed header spacer — pushes page content below the header on all pages except the
            homepage hero, which manages its own top padding internally.
            Height comes from --header-h, published by Header's ResizeObserver.
            It used to hardcode 130px against an actual 196px shell, so every
            non-home page slid 66px up underneath the nav. */}
        <div className="hidden md:block h-[var(--header-h,130px)]" aria-hidden="true" />
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
