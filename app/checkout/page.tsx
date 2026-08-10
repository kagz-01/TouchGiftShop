import CheckoutForm from "@/components/checkout/CheckoutForm";
import BackToHome from "@/components/ui/BackToHome";

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
      <div className="max-w-lg mx-auto px-4 md:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-4xl block mb-3">🛒</span>
          <h1 className="font-display text-2xl font-bold">Checkout</h1>
          <p className="text-sm text-brand-muted mt-1">Complete your gift order</p>
        </div>

        <CheckoutForm
          productId={params.productId ?? ""}
          amount={Number(params.amount ?? 0)}
          quantity={Number(params.qty ?? 1)}
          engraving={params.engraving ?? ""}
          giftNote={params.note ?? ""}
        />

        {/* Back to Home button */}
        <div className="mt-6">
          <BackToHome label="Back to Home" />
        </div>
      </div>
    </div>
  );
}
