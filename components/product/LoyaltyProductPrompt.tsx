"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

export default function LoyaltyProductPrompt({ total }: { total: number }) {
  const [multiplier, setMultiplier] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user && !data.user.is_anonymous) {
        setIsSignedIn(true);
        fetch("/api/loyalty")
          .then((r) => r.json())
          .then((res) => {
            if (res.tierConfig?.pointsMultiplier) {
              setMultiplier(res.tierConfig.pointsMultiplier);
            }
            setLoading(false);
          })
          .catch(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });
  }, []);

  if (loading) return null;

  const points = Math.floor(total / 10) * multiplier;
  if (points <= 0) return null;

  return (
    <div className="flex items-center justify-center gap-1.5 py-2.5 bg-brand/5 border-t border-brand/10 text-brand-deep text-xs font-medium">
      <Sparkles className="w-3.5 h-3.5 text-brand" />
      {isSignedIn ? (
        <span>
          Earn{" "}
          <strong className="text-brand">{points.toLocaleString()} points</strong>{" "}
          with this purchase
        </span>
      ) : (
        <span>
          Sign in to earn{" "}
          <strong className="text-brand">{points.toLocaleString()} points</strong>
        </span>
      )}
    </div>
  );
}
