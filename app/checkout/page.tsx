import CheckoutForm from "@/components/checkout/CheckoutForm";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | TouchGift",
  description: "Complete your gift order securely with M-Pesa or card.",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{
    productId?: string;
    amount?: string;
    qty?: string;
    engraving?: string;
    note?: string;
    cart?: string;
    wrapping?: string;
    customizationImage?: string;
    hamperRef?: string;
  }>;
}) {
  const params = await searchParams;
  const isCart = params.cart === "true";
  const isHamper = !!params.hamperRef;

  return (
    <div className="min-h-screen section-theme-e">
      {/* ── Top bar ── */}
      <div className="bg-white border-b border-black/5 sticky top-0 z-30">
        <div className="page-container-capped py-3 flex items-center justify-between">
          <Link
            href={isCart ? "/cart" : isHamper ? "/gift-lab/build-hamper" : "/shop"}
            className="flex items-center gap-2 text-sm font-medium text-brand-muted hover:text-brand transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isCart ? "Back to Cart" : isHamper ? "Back to Hamper Builder" : "Back to Shop"}</span>
          </Link>

          {/* Breadcrumb */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-brand-muted">
            <span className="text-brand-deep font-semibold">{isCart ? "Cart" : "Cart"}</span>
            <span>/</span>
            <span className="text-brand font-semibold">Checkout</span>
            <span>/</span>
            <span>Payment</span>
          </div>

          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-brand-muted font-medium">Secured by PesaPal</span>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="page-container-capped py-6 md:py-10">
        <div className="mb-6">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-brand-deep">Complete your order</h1>
          <p className="text-sm text-brand-muted mt-1">Fill in the details below to send your gift.</p>
        </div>
        <CheckoutForm
          productId={params.productId ?? ""}
          amount={Number(params.amount ?? 0)}
          quantity={Number(params.qty ?? 1)}
          engraving={params.engraving ?? ""}
          giftNote={params.note ?? ""}
          customizationImageUrl={params.customizationImage ?? ""}
          hamperRef={params.hamperRef ?? ""}
        />
      </div>
    </div>
  );
}
