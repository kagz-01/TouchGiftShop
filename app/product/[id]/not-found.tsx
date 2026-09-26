import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ProductNotFound() {
  return (
    <div className="min-h-screen section-theme-a flex items-center justify-center px-4">
      <div className="text-center">
        <span className="text-6xl block mb-4">🔍</span>
        <p className="font-display text-xl font-semibold mb-2">Product not found</p>
        <p className="text-brand-muted mb-6">This gift doesn&apos;t exist or has been removed.</p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-white font-semibold rounded-2xl hover:bg-brand-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </Link>
      </div>
    </div>
  );
}
