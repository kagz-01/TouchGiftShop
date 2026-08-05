"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";

export default function ReferralSection() {
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const meta = data.user?.user_metadata ?? {};
      const code = meta.referral_code;
      if (code) {
        setReferralCode(code);
      } else {
        // Generate a referral code from user ID
        const newCode = `TG-${data.user?.id?.slice(0, 8).toUpperCase() ?? "FRIEND"}`;
        setReferralCode(newCode);
        supabase.auth.updateUser({ data: { referral_code: newCode } });
      }
    });
  }, []);

  async function copyCode() {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}?ref=${referralCode}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!referralCode) return null;

  return (
    <section>
      <h2 className="font-medium mb-2">Refer a friend</h2>
      <div className="rounded-lg border border-gray-200 p-4 space-y-2">
        <p className="text-sm text-brand-muted">
          Share your code and both of you get a discount on your next order.
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm font-mono">
            {referralCode}
          </code>
          <button
            onClick={copyCode}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm shrink-0"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </section>
  );
}
