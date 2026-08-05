import CheckoutForm from "@/components/checkout/CheckoutForm";

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
    <div className="px-4 md:px-8 py-6 max-w-lg mx-auto">
      <h1 className="text-xl font-semibold mb-4">Checkout</h1>
      <CheckoutForm
        productId={params.productId ?? ""}
        amount={Number(params.amount ?? 0)}
        quantity={Number(params.qty ?? 1)}
        engraving={params.engraving ?? ""}
        giftNote={params.note ?? ""}
      />
    </div>
  );
}
