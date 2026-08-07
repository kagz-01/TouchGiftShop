"use client";

import { useState, useEffect } from "react";
import { cn, formatKsh } from "@/lib/utils";

type PriceAlertProps = {
  productId: string;
  productName: string;
  currentPrice: number;
};

const ALERTS_KEY = "touchgift_price_alerts";

export default function PriceAlertButton({ productId, productName, currentPrice }: PriceAlertProps) {
  const [isWatching, setIsWatching] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(ALERTS_KEY);
      if (stored) {
        const alerts: Array<{ id: string }> = JSON.parse(stored);
        setIsWatching(alerts.some((a) => a.id === productId));
      }
    } catch {}
  }, [productId]);

  const toggleAlert = () => {
    if (isWatching) {
      // Remove alert
      try {
        const stored = localStorage.getItem(ALERTS_KEY);
        if (stored) {
          const alerts = JSON.parse(stored).filter((a: { id: string }) => a.id !== productId);
          localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
        }
      } catch {}
      setIsWatching(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } else {
      setShowModal(true);
    }
  };

  const saveAlert = () => {
    try {
      const stored = localStorage.getItem(ALERTS_KEY);
      const alerts = stored ? JSON.parse(stored) : [];
      alerts.push({
        id: productId,
        name: productName,
        currentPrice,
        targetPrice: targetPrice ? parseInt(targetPrice) : Math.floor(currentPrice * 0.8),
        email,
        createdAt: Date.now(),
      });
      localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
      setIsWatching(true);
      setShowModal(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  };

  return (
    <>
      <button
        onClick={toggleAlert}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
          isWatching
            ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
            : "bg-surface text-brand-muted hover:bg-brand/5 border border-transparent"
        )}
      >
        {isWatching ? (
          <>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
            Watching
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Price Alert
          </>
        )}
      </button>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-brand-deep text-white px-4 py-2.5 rounded-xl shadow-xl text-sm font-medium animate-fade-in z-50">
          🔔 Price alert removed
        </div>
      )}

      {/* Saved toast */}
      {saved && (
        <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm font-medium animate-fade-in z-50">
          🔔 Price alert set! We&apos;ll notify you.
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowModal(false)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-white rounded-2xl p-6 z-50 animate-fade-in shadow-xl">
            <h3 className="font-display text-lg font-bold mb-2">Set Price Alert</h3>
            <p className="text-sm text-brand-muted mb-4">
              Get notified when <strong>{productName}</strong> drops in price.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">Target price (optional)</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-brand-muted">KSh</span>
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder={`Current: ${currentPrice.toLocaleString()}`}
                    className="flex-1 px-3 py-2 rounded-lg border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </div>
                <p className="text-[10px] text-brand-muted mt-1">
                  Default: 20% off ({formatKsh(Math.floor(currentPrice * 0.8))})
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Email for notifications</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 rounded-lg border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={saveAlert}
                className="flex-1 px-4 py-2.5 rounded-xl bg-brand text-white font-semibold text-sm hover:bg-brand-deep transition-all"
              >
                Set Alert 🔔
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-brand-muted hover:bg-surface transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
