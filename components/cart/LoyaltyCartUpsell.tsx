"use client";

import { useEffect, useState } from "react";
import { formatKsh } from "@/lib/utils";
import { Crown, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

export default function LoyaltyCartUpsell({ subtotal }: { subtotal: number }) {
  const [loyalty, setLoyalty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        setLoading(false);
        return;
      }
      fetch("/api/loyalty")
        .then((r) => r.json())
        .then((res) => {
          setLoyalty(res);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    });
  }, []);

  if (loading || !loyalty) return null;

  const multiplier = loyalty.tierConfig?.pointsMultiplier || 1;
  const pointsEarned = Math.floor(subtotal / 10) * multiplier;

  return (
    <div className="bg-gradient-to-r from-brand/5 to-brand/10 border border-brand/20 rounded-2xl p-4 flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Sparkles className="w-4 h-4 text-brand" />
      </div>
      <div>
        <p className="font-bold text-brand-deep text-sm flex items-center gap-1.5">
          {loyalty.tierConfig?.name} Member
          <Crown className="w-3.5 h-3.5 text-gold" />
        </p>
        <p className="text-brand-muted text-xs mt-1 leading-relaxed">
          You will earn{" "}
          <span className="font-bold text-brand">
            {pointsEarned.toLocaleString()} points
          </span>{" "}
          from this order
          {multiplier > 1 && (
            <span className="text-emerald-600"> ({multiplier}x bonus!)</span>
          )}
          .
        </p>
      </div>
    </div>
  );
}
