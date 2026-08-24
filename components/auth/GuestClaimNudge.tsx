"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import { isGuest } from "@/lib/guest";
import { Sparkles } from "lucide-react";

/**
 * Shows on payment success for guests: creating an account keeps their
 * order history, earns loyalty points on this purchase's future orders,
 * and unlocks referral earnings.
 */
export default function GuestClaimNudge() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user && isGuest()) setShow(true);
    });
  }, []);

  if (!show) return null;

  return (
    <div className="max-w-md mx-auto mt-6 bg-brand/5 border border-brand/15 rounded-2xl p-5 text-center">
      <Sparkles className="w-6 h-6 text-brand mx-auto mb-2" />
      <p className="font-display font-bold text-brand-deep text-sm">Keep this order — and earn points</p>
      <p className="text-xs text-brand-muted mt-1 mb-4">
        Create an account with the same phone number to save your order history and start earning points on every gift.
      </p>
      <div className="flex gap-2 justify-center">
        <Link
          href="/login?mode=signup&next=/orders"
          className="px-4 py-2.5 bg-brand text-white rounded-xl text-xs font-semibold hover:bg-brand-deep transition-colors"
        >
          Create account
        </Link>
        <Link
          href="/login?next=/orders"
          className="px-4 py-2.5 border border-brand/30 text-brand rounded-xl text-xs font-semibold hover:bg-brand/5 transition-colors"
        >
          I have an account
        </Link>
      </div>
    </div>
  );
}
