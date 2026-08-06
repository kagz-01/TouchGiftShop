"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import PoolProgressBar from "@/components/gift-lab/PoolProgressBar";
import PoolContributeForm from "@/components/gift-lab/PoolContributeForm";
import PoolShareLink from "@/components/gift-lab/PoolShareLink";
import PoolContributors from "@/components/gift-lab/PoolContributors";
import { formatKsh } from "@/lib/utils";

interface Pool {
  id: string;
  slug: string;
  title: string;
  current_balance: number;
  target_amount: number;
  status: string;
  expires_at: string;
}

interface Contribution {
  id: string;
  contributor_name: string;
  amount: number;
  is_verified: boolean;
  created_at: string;
}

export default function PoolPage({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const justPaid = searchParams.get("paid") === "true";

  const [pool, setPool] = useState<Pool | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPool = useCallback(async () => {
    try {
      const res = await fetch(`/api/pools/${slug}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setPool(data.pool);
        setContributions(data.contributions || []);
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  // Initial load
  useEffect(() => {
    fetchPool();
  }, [fetchPool]);

  // Auto-refresh after payment — poll 3 times over 6 seconds
  useEffect(() => {
    if (!justPaid) return;
    const timers = [
      setTimeout(fetchPool, 1000),
      setTimeout(fetchPool, 3000),
      setTimeout(fetchPool, 6000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [justPaid, fetchPool]);

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 max-w-lg mx-auto">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="px-4 md:px-8 py-6 text-center">
        <p className="text-brand-muted">Pool not found.</p>
      </div>
    );
  }

  const isExpired = new Date(pool.expires_at) < new Date();
  const isComplete = pool.status === "completed" || pool.current_balance >= pool.target_amount;

  return (
    <div className="px-4 md:px-8 py-6 max-w-lg mx-auto space-y-6">
      {justPaid && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-center text-sm text-green-800">
          Payment confirmed! Pool balance updated.
        </div>
      )}

      <div className="space-y-1">
        <h1 className="text-xl font-semibold">{pool.title}</h1>
        <p className="text-sm text-brand-muted">
          {isComplete
            ? "Target reached! Gift will be ordered automatically."
            : isExpired
            ? "This pool has closed."
            : `Closes ${new Date(pool.expires_at).toLocaleDateString("en-KE", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}`}
        </p>
      </div>

      <PoolProgressBar current={pool.current_balance} target={pool.target_amount} />

      <div className="flex items-center justify-between text-sm">
        <span className="text-brand-muted">
          {contributions.length} contribution{contributions.length !== 1 ? "s" : ""}
        </span>
        <span className="font-medium">
          {formatKsh(pool.target_amount - pool.current_balance)} to go
        </span>
      </div>

      {!isComplete && !isExpired && (
        <PoolContributeForm slug={pool.slug} />
      )}

      <PoolShareLink slug={pool.slug} />

      {contributions.length > 0 && (
        <PoolContributors contributions={contributions} />
      )}
    </div>
  );
}
