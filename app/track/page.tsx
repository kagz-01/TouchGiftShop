"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Truck, Search, ArrowLeft, Package } from "lucide-react";

export default function TrackPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState("");

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const id = orderId.trim();
    if (!id) {
      setError("Enter your order number to continue");
      return;
    }
    router.push(`/track/${encodeURIComponent(id)}`);
  };

  return (
    <div className="min-h-screen section-theme-f flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-brand-muted hover:text-brand transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8 text-brand" />
          </div>
          <h1 className="font-display text-2xl font-bold text-brand-deep">
            Track Your Delivery
          </h1>
          <p className="text-sm text-brand-muted mt-2">
            Enter the order number from your confirmation message
          </p>
        </div>

        <form
          onSubmit={handleTrack}
          className="bg-white rounded-3xl border border-black/6 shadow-sm p-6 space-y-4"
        >
          <div>
            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
              Order Number
            </label>
            <div className="relative mt-1.5">
              <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
              <input
                type="text"
                value={orderId}
                onChange={(e) => {
                  setOrderId(e.target.value);
                  setError("");
                }}
                placeholder="e.g. TG-XXXX-XXXX"
                autoFocus
                className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-black/8 rounded-2xl text-sm font-mono focus:outline-none focus:border-brand focus:bg-white transition-all"
              />
            </div>
            {error && (
              <p className="text-xs text-red-500 mt-2">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-gold to-gold-light text-brand-deep font-bold rounded-2xl shadow-gold hover:shadow-gold-lg hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            <Search className="w-4 h-4" />
            Track Order
          </button>
        </form>

        <p className="text-xs text-brand-muted text-center mt-4">
          Lost your order number?{" "}
          <Link href="/orders" className="text-brand font-medium hover:underline">
            View all your orders
          </Link>
        </p>
      </div>
    </div>
  );
}
