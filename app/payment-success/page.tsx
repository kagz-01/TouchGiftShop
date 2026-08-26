import Link from "next/link";
import PaymentSuccessPinDrop from "@/components/pin-drop/PaymentSuccessPinDrop";
import BackToHome from "@/components/ui/BackToHome";
import GuestClaimNudge from "@/components/auth/GuestClaimNudge";
import dynamic from "next/dynamic";

const PaymentStatusPoller = dynamic(
  () => import("@/components/payment/PaymentStatusPoller"),
  { ssr: false }
);

async function getOrder(id: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://touchgiftshop.co.ke";
  const res = await fetch(`${base}/api/orders/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  const { order } = await res.json();
  return order;
}

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const params = await searchParams;
  const ref = params.ref;

  // Gift card purchases use "giftcard-{cardId}" as the reference
  const isGiftCard = ref?.startsWith("giftcard-");
  // Pool contributions use "pool-{contributionId}" as the reference
  const isPool = ref?.startsWith("pool-");

  // Check if this is a pin-drop order
  let isPinDrop = false;
  let giftCardCode: string | null = null;

  if (isGiftCard) {
    // For gift cards, we don't have the code yet in the success page
    // The card will be activated via IPN
  } else if (ref && !isPool) {
    const order = await getOrder(ref);
    isPinDrop = order?.recipient_pin_requested ?? false;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="text-6xl mb-4">{isGiftCard ? "🎁" : "🎉"}</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {isGiftCard ? "Gift card purchased!" : "Payment received!"}
      </h1>
      <p className="text-gray-500 mb-2 max-w-sm">
        {isGiftCard
          ? "Your gift card has been created. The recipient will receive the code shortly."
          : isPool
            ? "Thank you for your contribution! The pool balance has been updated."
            : "Thank you for your order. We'll start preparing your gift right away."}
      </p>
      {ref && (
        <p className="text-xs text-gray-400 mb-6">
          Reference: {ref}
        </p>
      )}
      
      <div className="flex gap-3">
        {isGiftCard ? (
          <Link
            href="/gift-cards"
            className="px-6 py-3 bg-brand text-white rounded-lg font-medium hover:bg-brand-dark transition-colors"
          >
            View Gift Cards
          </Link>
        ) : isPool ? (
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
        <BackToHome label="Back to Home" />
      </div>

      {/* Guest nudge — claim the order by creating an account */}
      {!isGiftCard && !isPool && <GuestClaimNudge />}

      {!isGiftCard && isPinDrop && ref && (
        <PaymentSuccessPinDrop orderId={ref} />
      )}
      {!isGiftCard && ref && (
        <div className="w-full max-w-md mt-6">
          <PaymentStatusPoller trackingId={ref} />
        </div>
      )}
    </div>
  );
}
