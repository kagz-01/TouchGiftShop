import Image from "next/image";
import Link from "next/link";
import BackToHome from "@/components/ui/BackToHome";
import { formatKsh } from "@/lib/utils";
import OrderStatusTimeline from "@/components/orders/OrderStatusTimeline";
import SendTrackLinkButton from "@/components/orders/SendTrackLinkButton";
import ResendPinDropButton from "@/components/pin-drop/ResendPinDropButton";
import PinDropStatus from "@/components/pin-drop/PinDropStatus";
import PinDropNotification from "@/components/pin-drop/PinDropNotification";

async function getOrder(id: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/orders/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  const { order } = await res.json();
  return order;
}

const STATUS_MAP: Record<string, number> = {
  pending_payment: 0,
  processing: 1,
  wrapped: 2,
  dispatched: 3,
  delivered: 4,
  failed: -1,
};

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await getOrder(params.id);

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center px-4">
        <div className="text-center">
          <span className="text-5xl block mb-4">🔍</span>
          <p className="font-display text-xl font-semibold mb-2">Order not found</p>
          <Link href="/orders" className="text-sm text-brand hover:underline mt-4 inline-block">
            Back to orders
          </Link>
        </div>
      </div>
    );
  }

  const stepIndex = STATUS_MAP[order.status] ?? 0;
  const isFailed = order.status === "failed";
  const isAnonymous = order.is_anonymous;
  const dontCall = order.dont_call_recipient;
  const hasPinDrop = order.recipient_pin_requested;
  const hasPinData = order.delivery_lat !== null;

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Real-time pin-drop notification */}
      <PinDropNotification
        orderId={order.id}
        enabled={hasPinDrop && !hasPinData}
      />
      {/* Header */}
      <div className="bg-gradient-to-br from-brand-dark to-brand px-4 py-8 md:py-10">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between">
            <Link href="/orders" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            All orders
            </Link>
            <BackToHome className="text-white/80" />
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
            {isFailed ? "Payment failed" : `Gift for ${order.recipient_name}`}
          </h1>
          <p className="text-white/70 text-sm mt-1">
            {new Date(order.created_at).toLocaleDateString("en-KE", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 -mt-4 relative z-10 pb-12">
        <div className="space-y-5">
          {/* Status */}
          {!isFailed && (
            <div className="bg-white rounded-2xl p-6 border border-surface-border shadow-card">
              <OrderStatusTimeline currentStep={stepIndex} />
            </div>
          )}

          {/* Failed */}
          {isFailed && (
            <div className="bg-brand-coral/10 border border-brand-coral/30 rounded-2xl p-5">
              <p className="font-semibold text-brand-coral mb-1">Payment not completed</p>
              <p className="text-sm text-brand-muted mb-3">
                The M-Pesa payment was not confirmed. You can try ordering again.
              </p>
              <Link href="/" className="btn-brand inline-flex items-center gap-2 text-sm">
                Browse gifts
              </Link>
            </div>
          )}

          {/* Surprise status badges */}
          {(isAnonymous || dontCall) && (
            <div className="bg-white rounded-2xl p-5 border border-surface-border space-y-2">
              <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Surprise Safeguard</p>
              <div className="flex flex-wrap gap-2">
                {dontCall && (
                  <span className="inline-flex items-center gap-1.5 bg-brand/10 text-brand text-xs font-semibold px-3 py-1.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                    No-contact delivery
                  </span>
                )}
                {isAnonymous && (
                  <span className="inline-flex items-center gap-1.5 bg-brand/10 text-brand text-xs font-semibold px-3 py-1.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                    Anonymous sender
                  </span>
                )}
              </div>
              <p className="text-xs text-brand-muted">
                {isAnonymous
                  ? "The recipient won't see your name or the gift price."
                  : "Rider will use landmarks instead of calling the recipient."}
              </p>
            </div>
          )}

          {/* Send tracking link to recipient */}
          {!isFailed && !hasPinDrop && (
            <SendTrackLinkButton orderId={order.id} recipientPhone={order.recipient_phone} recipientName={order.recipient_name} />
          )}

          {hasPinDrop && (
            <ResendPinDropButton
              orderId={order.id}
              recipientName={order.recipient_name}
            />
          )}

          {/* Pin-drop status (shows location, time, map when pin is dropped) */}
          {hasPinDrop && (
            <PinDropStatus
              orderId={order.id}
              recipientName={order.recipient_name}
              deliveryLat={order.delivery_lat}
              deliveryLng={order.delivery_lng}
              deliveryLandmark={order.delivery_landmark}
              deliveryTimeWindow={order.delivery_time_window}
              pinDropToken={order.pin_drop_token}
              pinRequested={order.recipient_pin_requested}
            />
          )}

          {/* Pre-dispatch photo */}
          {order.pre_dispatch_photo_url && (
            <div className="bg-white rounded-2xl p-5 border border-surface-border">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">📸</span>
                <p className="text-sm font-semibold">Package photo</p>
              </div>
              <div className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden relative">
                <Image
                  src={order.pre_dispatch_photo_url}
                  alt="Package before dispatch"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <p className="text-xs text-brand-muted mt-2">
                Your sealed package before it left for delivery.
              </p>
            </div>
          )}

          {/* Order details */}
          <div className="bg-white rounded-2xl p-5 border border-surface-border space-y-3">
            <h3 className="text-sm font-semibold mb-3">Order details</h3>

            <div className="flex justify-between text-sm">
              <span className="text-brand-muted">Amount</span>
              <span className="font-bold text-brand">{formatKsh(order.total_amount)}</span>
            </div>

            {order.quantity > 1 && (
              <div className="flex justify-between text-sm">
                <span className="text-brand-muted">Quantity</span>
                <span>{order.quantity}x</span>
              </div>
            )}

            <div className="border-t border-surface-border pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-brand-muted">Recipient</span>
                <span className="font-medium">{order.recipient_name}</span>
              </div>
            </div>

            {order.delivery_landmark && (
              <div className="flex justify-between text-sm">
                <span className="text-brand-muted">Landmark</span>
                <span>{order.delivery_landmark}</span>
              </div>
            )}

            {order.delivery_time_window && (
              <div className="flex justify-between text-sm">
                <span className="text-brand-muted">Delivery window</span>
                <span className="capitalize">{order.delivery_time_window}</span>
              </div>
            )}

            {order.gift_note && (
              <div className="border-t border-surface-border pt-3">
                <p className="text-xs text-brand-muted mb-1">Gift note</p>
                <p className="text-sm italic">&ldquo;{order.gift_note}&rdquo;</p>
              </div>
            )}

            {order.engraving && (
              <div className="border-t border-surface-border pt-3">
                <p className="text-xs text-brand-muted mb-1">Engraving</p>
                <p className="text-sm italic">&ldquo;{order.engraving}&rdquo;</p>
              </div>
            )}
          </div>

          {/* Guarantees */}
          <div className="bg-gradient-dark text-white rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-gold">✓</span>
              <p className="text-sm">On-time delivery or it&apos;s free</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gold">✓</span>
              <p className="text-sm">Photo proof before dispatch</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gold">✓</span>
              <p className="text-sm">Your identity stays private unless you choose to reveal it</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
