"use client";

import { useState } from "react";
import BackToHome from "@/components/ui/BackToHome";

export default function PinDropLandingPage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<any[]>([]);

  const handleLookup = async () => {
    if (!phone.trim()) return;
    setLoading(true);
    setError("");
    setOrders([]);

    try {
      const res = await fetch(`/api/pin-drop/lookup?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "No orders found for this number.");
        return;
      }

      setOrders(data.orders || []);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-warm flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-surface-border px-4 py-4 safe-area-top">
        <div className="max-w-lg mx-auto">
          <span className="text-2xl block mb-1">📍</span>
          <h1 className="font-display text-lg font-bold">Drop your delivery pin</h1>
          <p className="text-xs text-brand-muted">
            Enter the phone number used for the order to find your pin-drop link.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-4 pt-8">
        <div className="w-full max-w-sm space-y-6">
          {/* Phone lookup */}
          <div className="bg-white rounded-2xl p-5 border border-surface-border space-y-4">
            <div>
              <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
                Phone number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0712345678"
                className="w-full bg-gray-50 border border-surface-border rounded-xl px-4 py-3 text-sm mt-1 focus:outline-none focus:border-brand"
                onKeyDown={(e) => e.key === "Enter" && handleLookup()}
              />
            </div>

            {error && (
              <p className="text-xs text-brand-coral text-center">{error}</p>
            )}
            {error && error.includes("expired") && (
              <p className="text-xs text-brand-coral text-center mt-2">
                <button
                  onClick={() => setPhone("")}
                  className="text-xs text-brand underline cursor-pointer"
                >
                  Contact sender to resend link
                </button>
              </p>
            )}

            <button
              onClick={handleLookup}
              disabled={loading || !phone.trim()}
              className="w-full py-3 bg-brand text-white rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Looking up...
                </span>
              ) : (
                "Find my order"
              )}
            </button>
          </div>

          {/* Orders found */}
          {orders.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider px-1">
                Your orders
              </p>
              {orders.map((order) => (
                <a
                  key={order.id}
                  href={`/pin-drop/${order.id}?token=${order.pin_drop_token}`}
                  className="block bg-white rounded-2xl p-4 border border-surface-border hover:border-brand/30 hover:shadow-card transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🎁</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Gift for {order.recipient_name}</p>
                      <p className="text-xs text-brand-muted">
                        {order.already_pinned ? "Pin already dropped" : "Tap to drop your pin"}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          )}

          {/* Help text */}
          <div className="text-center">
            <p className="text-xs text-brand-muted">
              Got a link from WhatsApp? Open it directly — it has everything you need.
            </p>
          </div>

          {/* Back to Home */}
          <div className="text-center pb-8">
            <BackToHome label="Back to Home" />
          </div>
        </div>
      </div>
    </div>
  );
}
