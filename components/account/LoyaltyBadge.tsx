"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { getLoyaltyTier, getNextTier, LOYALTY_TIERS } from "@/lib/loyalty";

export default function LoyaltyBadge() {
  const [orderCount, setOrderCount] = useState(0);
  const [totalSpend, setTotalSpend] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user?.phone) {
        setLoading(false);
        return;
      }

      const res = await fetch(
        `/api/orders?phone=${encodeURIComponent(data.user.phone)}`
      );
      const { orders } = await res.json();

      if (orders) {
        setOrderCount(orders.length);
        setTotalSpend(
          orders.reduce(
            (sum: number, o: { total_amount: number }) => sum + o.total_amount,
            0
          )
        );
      }
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  const tier = getLoyaltyTier(orderCount, totalSpend);
  const nextTier = getNextTier(orderCount, totalSpend);

  return (
    <section>
      <h2 className="font-medium mb-2">Loyalty status</h2>
      <div className="rounded-lg border border-gray-200 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: tier.color }}
          >
            {tier.name[0]}
          </div>
          <div>
            <p className="text-sm font-medium">{tier.name} member</p>
            <p className="text-xs text-brand-muted">
              {orderCount} orders • KSh {totalSpend.toLocaleString("en-KE")} total
            </p>
          </div>
        </div>

        {nextTier && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-brand-muted">
              <span>{tier.name}</span>
              <span>{nextTier.name}</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  backgroundColor: tier.color,
                  width: `${Math.min(
                    100,
                    (orderCount / nextTier.minOrders) * 100
                  )}%`,
                }}
              />
            </div>
            <p className="text-xs text-brand-muted">
              {nextTier.minOrders - orderCount} more orders to{" "}
              {nextTier.name}
            </p>
          </div>
        )}

        <div className="space-y-1">
          {tier.benefits.map((b) => (
            <p key={b} className="text-xs text-brand-muted">
              • {b}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
