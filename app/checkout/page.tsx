import CheckoutForm from "@/components/checkout/CheckoutForm";
import Link from "next/link";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{
    productId?: string;
    amount?: string;
    qty?: string;
    engraving?: string;
    note?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Top bar */}
      <div className="bg-white border-b border-surface-border px-4 md:px-8 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-muted hover:text-brand transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Shop
        </Link>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span className="text-xs text-brand-muted font-medium">Secured by PesaPal</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 md:py-12">
        <CheckoutForm
          productId={params.productId ?? ""}
          amount={Number(params.amount ?? 0)}
          quantity={Number(params.qty ?? 1)}
          engraving={params.engraving ?? ""}
          giftNote={params.note ?? ""}
        />
      </div>
    </div>
  );
}
