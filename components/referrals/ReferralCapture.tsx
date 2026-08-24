"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function ReferralCapture() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  useEffect(() => {
    if (!ref) return;
    // Store for later if user isn't logged in yet
    localStorage.setItem("touchgift_referral", ref);
  }, [ref]);

  useEffect(() => {
    const stored = localStorage.getItem("touchgift_referral");
    if (!stored) return;

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return; // Not logged in yet, keep stored

      // Logged in — apply the referral
      fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralCode: stored }),
      })
        .then(() => localStorage.removeItem("touchgift_referral"))
        .catch(() => {}); // Keep stored for retry
    });
  }, []);

  return null;
}
