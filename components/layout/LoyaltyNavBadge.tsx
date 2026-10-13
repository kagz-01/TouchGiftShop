"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { LoyaltyTierInfo } from "@/lib/loyalty";

interface LoyaltyData {
  tier: string;
  tierConfig: LoyaltyTierInfo;
  totalPoints: number;
}

export default function LoyaltyNavBadge({ user }: { user: any }) {
  const [loyalty, setLoyalty] = useState<LoyaltyData | null>(null);

  useEffect(() => {
    if (!user || user.is_anonymous) return;
    fetch("/api/loyalty")
      .then((r) => r.json())
      .then((data) => {
        if (data.tierConfig) setLoyalty(data);
      })
      .catch(() => {});
  }, [user]);

  if (!loyalty) return null;

  const getTierIcon = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "bronze": return "🥉";
      case "silver": return "🥈";
      case "gold": return "🥇";
      case "platinum": return "👑";
      default: return "💎";
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "bronze": return "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/50 dark:text-amber-400";
      case "silver": return "text-slate-700 bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700/50 dark:text-slate-300";
      case "gold": return "text-yellow-700 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800/50 dark:text-yellow-400";
      case "platinum": return "text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800/50 dark:text-purple-400";
      default: return "text-brand bg-brand/5 border-brand/20";
    }
  };

  return (
    <Link
      href="/loyalty"
      className={cn(
        "hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border transition-all duration-200 hover:shadow-sm",
        getTierColor(loyalty.tier)
      )}
      title={`${loyalty.tierConfig.name} Tier — ${loyalty.totalPoints.toLocaleString()} points`}
    >
      <span className="text-sm">{getTierIcon(loyalty.tier)}</span>
      <span>{loyalty.totalPoints.toLocaleString()} pts</span>
    </Link>
  );
}
