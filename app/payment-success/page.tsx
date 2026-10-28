import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import PaymentSuccessCard from "@/components/payment/PaymentSuccessCard";
import PaymentSuccessPinDrop from "@/components/pin-drop/PaymentSuccessPinDrop";
import GuestClaimNudge from "@/components/auth/GuestClaimNudge";
import dynamic from "next/dynamic";

const PaymentStatusPoller = dynamic(
  () => import("@/components/payment/PaymentStatusPoller"),
  { ssr: false }
);

async function getOrder(id: string) {
  try {
    const cleanId = id.startsWith("multi-") ? id.replace("multi-", "").split(",")[0]?.trim() : id;
    if (!cleanId) return null;

    const { data } = await supabaseAdmin
      .from("orders")
      .select("id, status, total_amount, recipient_name, recipient_phone, recipient_pin_requested, mpesa_receipt_number, created_at")
      .eq("id", cleanId)
      .maybeSingle();

    return data;
  } catch (e) {
    console.error("Error fetching order in payment-success:", e);
    return null;
  }
}

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; reference?: string; trxref?: string }>;
}) {
  const params = await searchParams;
  // Paystack returns either 'ref', 'reference', or 'trxref'
  const ref = params.ref || params.reference || params.trxref;

  // Gift card purchases use "giftcard-{cardId}" as the reference
  const isGiftCard = ref?.startsWith("giftcard-");
  // Pool contributions use "pool-{contributionId}" as the reference
  const isPool = ref?.startsWith("pool-");

  let order = null;
  let isPinDrop = false;

  if (ref && !isGiftCard && !isPool) {
    order = await getOrder(ref);
    isPinDrop = order?.recipient_pin_requested ?? false;
  }

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-10 relative z-10">
      <PaymentSuccessCard
        orderId={ref}
        isGiftCard={isGiftCard}
        isPool={isPool}
        initialOrder={order}
      />

      {/* Recipient pin drop modal if requested */}
      {!isGiftCard && isPinDrop && ref && (
        <div className="w-full max-w-xl mx-auto px-4 mt-2">
          <PaymentSuccessPinDrop orderId={ref} />
        </div>
      )}

      {/* Guest member conversion / claim nudge */}
      {!isGiftCard && !isPool && (
        <div className="w-full max-w-xl mx-auto px-4 mt-2">
          <GuestClaimNudge />
        </div>
      )}

      {/* Realtime verification feedback badge if still confirming */}
      {!isGiftCard && ref && (
        <div className="w-full max-w-xl mx-auto px-4 mt-2">
          <PaymentStatusPoller trackingId={ref} />
        </div>
      )}
    </div>
  );
}
