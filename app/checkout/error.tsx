"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen section-theme-e flex items-center justify-center px-4">
      <div className="text-center">
        <span className="text-6xl block mb-4">⚠️</span>
        <p className="font-display text-xl font-semibold mb-2">Checkout Error</p>
        <p className="text-brand-muted mb-6">
          Something went wrong with checkout. Please try again.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-6 py-3 bg-brand text-white font-semibold rounded-2xl hover:bg-brand-dark transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 border border-surface-border text-brand font-semibold rounded-2xl hover:bg-white/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
