"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const STATUS_STEPS = [
  { key: "pending_payment", label: "Order placed", icon: "📋" },
  { key: "processing", label: "Being prepared", icon: "🎁" },
  { key: "wrapped", label: "Wrapped & ready", icon: "🎀" },
  { key: "dispatched", label: "On its way!", icon: "🚀" },
  { key: "delivered", label: "Delivered!", icon: "✅" },
];

const STATUS_INDEX: Record<string, number> = {
  pending_payment: 0,
  processing: 1,
  wrapped: 2,
  dispatched: 3,
  delivered: 4,
  failed: -1,
};

export default function TrackOrderClient({
  orderId,
  token,
}: {
  orderId: string;
  token: string;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<{
    orderId: string;
    recipientName: string;
    status: string;
    giftNote: string | null;
    preDispatchPhotoUrl: string | null;
    pinDropRequested: boolean;
    deliveryTimeWindow: string | null;
    createdAt: string;
    senderName: string | null;
    amount: number | null;
    isAnonymous: boolean;
  } | null>(null);

  useEffect(() => {
    fetch(`/api/orders/${orderId}/recipient?token=${token}&purpose=track`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setOrder(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Something went wrong. Please try the link again.");
        setLoading(false);
      });

    // Real-time: listen for order status changes from admin
    if (typeof window === "undefined" || !("WebSocket" in window)) return;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let channel: ReturnType<typeof supabase.channel> | null = null;
    try {
      channel = supabase
        .channel(`track-order-${orderId}`)
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
          (payload) => {
            const updated = payload.new as Record<string, unknown>;
            setOrder((prev) => prev ? {
              ...prev,
              status: updated.status as string,
              preDispatchPhotoUrl: (updated.pre_dispatch_photo_url as string) || prev.preDispatchPhotoUrl,
            } : prev);
          }
        )
        .subscribe();
    } catch {
      // skip realtime if not available
    }

    return () => {
      if (channel) {
        try { supabase.removeChannel(channel); } catch { /* ignore */ }
      }
    };
  }, [orderId, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-brand-muted">Loading your gift...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <span className="text-5xl block mb-4">😔</span>
          <p className="font-display text-xl font-semibold mb-2">Link not valid</p>
          <p className="text-sm text-brand-muted">{error}</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const statusIdx = STATUS_INDEX[order.status] ?? 0;
  const isAnonymous = order.isAnonymous;

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-dark to-brand px-4 py-10 md:py-14">
        <div className="max-w-lg mx-auto text-center">
          <span className="text-5xl block mb-4">🎁</span>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">
            {isAnonymous
              ? "Someone sent you a gift!"
              : `A gift from ${order.senderName || "someone special"}!`}
          </h1>
          <p className="text-white/80 text-sm">
            Hey {order.recipientName || "there"} — here&apos;s what&apos;s happening with your gift.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 -mt-4 relative z-10 pb-12">
        <div className="space-y-5">
          {/* Status timeline */}
          <div className="bg-white rounded-2xl p-6 border border-surface-border shadow-card">
            <h2 className="text-sm font-semibold mb-5">Gift status</h2>
            <div className="space-y-0">
              {STATUS_STEPS.map((step, i) => {
                const isActive = i === statusIdx;
                const isPast = i < statusIdx;
                return (
                  <div key={step.key} className="flex gap-3">
                    {/* Line + dot */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 transition-all ${
                          isActive
                            ? "bg-brand text-white shadow-ribbon scale-110"
                            : isPast
                            ? "bg-brand/20 text-brand"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {isPast ? "✓" : step.icon}
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div
                          className={`w-0.5 h-8 ${
                            isPast ? "bg-brand/30" : "bg-gray-100"
                          }`}
                        />
                      )}
                    </div>
                    {/* Label */}
                    <div className="pt-1.5">
                      <p
                        className={`text-sm font-medium ${
                          isActive ? "text-brand" : isPast ? "text-brand/70" : "text-brand-muted"
                        }`}
                      >
                        {step.label}
                      </p>
                      {isActive && (
                        <p className="text-xs text-brand-muted mt-0.5 animate-pulse">
                          In progress...
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gift note */}
          {order.giftNote && (
            <div className="bg-white rounded-2xl p-5 border border-surface-border">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">💌</span>
                <p className="text-sm font-semibold">Gift note</p>
              </div>
              <p className="text-sm text-brand-muted italic leading-relaxed">
                &ldquo;{order.giftNote}&rdquo;
              </p>
            </div>
          )}

          {/* Pre-dispatch photo */}
          {order.preDispatchPhotoUrl && (
            <div className="bg-white rounded-2xl p-5 border border-surface-border">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">📸</span>
                <p className="text-sm font-semibold">Package photo</p>
              </div>
              <div className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={order.preDispatchPhotoUrl}
                  alt="Package before dispatch"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs text-brand-muted mt-2">
                This is your sealed package before it left for delivery.
              </p>
            </div>
          )}

          {/* Delivery info */}
          {order.pinDropRequested && (
            <div className="bg-white rounded-2xl p-5 border border-surface-border">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">📍</span>
                <p className="text-sm font-semibold">Delivery details</p>
              </div>
              <div className="space-y-2 text-sm">
                {order.deliveryTimeWindow && (
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Time window</span>
                    <span className="font-medium capitalize">{order.deliveryTimeWindow}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Live tracking button */}
          {order.status === "dispatched" && (
            <Link
              href={`/track/${orderId}/live?token=${token}`}
              className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-2xl font-semibold text-sm hover:bg-blue-700 transition-colors"
            >
              <span className="text-lg">🛵</span>
              View Live Rider Tracking
            </Link>
          )}

          {/* No price shown for anonymous */}
          {isAnonymous && (
            <div className="bg-brand/5 border border-brand/10 rounded-2xl p-4 text-center">
              <p className="text-xs text-brand-muted">
                🤫 This gift is anonymous — sender identity and price are hidden.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-4">
            <Link
              href="/shop"
              className="text-xs text-brand hover:underline"
            >
              Browse TouchGift
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
