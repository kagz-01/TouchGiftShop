import Link from "next/link";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const params = await searchParams;
  const ref = params.ref;

  // Pool contributions use "pool-{contributionId}" as the reference
  const isPool = ref?.startsWith("pool-");

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="text-6xl mb-4">🎉</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment received!</h1>
      <p className="text-gray-500 mb-2 max-w-sm">
        {isPool
          ? "Thank you for your contribution! The pool balance has been updated."
          : "Thank you for your order. We'll start preparing your gift right away."}
      </p>
      {ref && (
        <p className="text-xs text-gray-400 mb-6">
          Reference: {ref}
        </p>
      )}
      <div className="flex gap-3">
        {isPool ? (
          <Link
            href="/gift-lab"
            className="px-6 py-3 bg-brand text-white rounded-lg font-medium hover:bg-brand-dark transition-colors"
          >
            View Gift Lab
          </Link>
        ) : (
          <Link
            href={ref ? `/orders/${ref}` : "/orders"}
            className="px-6 py-3 bg-brand text-white rounded-lg font-medium hover:bg-brand-dark transition-colors"
          >
            View Order
          </Link>
        )}
        <Link
          href="/"
          className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
