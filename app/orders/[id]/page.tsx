import Image from "next/image";
import Link from "next/link";
import { formatKsh } from "@/lib/utils";
import OrderStatusTimeline from "@/components/orders/OrderStatusTimeline";
import SendTrackLinkButton from "@/components/orders/SendTrackLinkButton";
import ResendPinDropButton from "@/components/pin-drop/ResendPinDropButton";
import PinDropStatus from "@/components/pin-drop/PinDropStatus";
import PinDropNotification from "@/components/pin-drop/PinDropNotification";
import { ArrowLeft, CheckCircle, EyeOff, Camera, PhoneOff, Gift, SearchX, CreditCard } from "lucide-react";

async function getOrder(id: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
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
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center px-4">
        <div className="text-center">
          <SearchX className="w-16 h-16 text-brand-muted/30 mx-auto mb-4" />
          <p className="font-display text-xl font-bold text-brand-deep mb-2">Order not found</p>
          <p className="text-sm text-brand-muted mb-6">This order ID doesn't exist or you don't have access.</p>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-white font-semibold rounded-2xl hover:bg-brand-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
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
    <div className="min-h-screen bg-[#FAF8F5] pb-20">
      {/* Real-time pin-drop notification */}
      <PinDropNotification
        orderId={order.id}
        enabled={hasPinDrop && !hasPinData}
      />

      {/* ── Sticky Header ── */}
      <div className="bg-white border-b border-black/5 sticky top-0 z-30">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/orders"
            className="flex items-center gap-2 text-sm font-semibold text-brand-muted hover:text-brand transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
          {order.status === "delivered" && (
            <span className="bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
              Delivered
            </span>
          )}
        </div>
      </div>

      {/* ── Hero / Status ── */}
      <div className="bg-gradient-to-br from-brand-dark to-brand">
        <div className="max-w-xl mx-auto px-5 py-8 md:py-12">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-1.5">
            {isFailed ? "Payment failed" : `Gift for ${order.recipient_name}`}
          </h1>
          <p className="text-white/75 text-sm font-medium">
            Ordered {new Date(order.created_at).toLocaleDateString("en-KE", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-6 relative z-10 space-y-4">
        {/* Timeline */}
        {!isFailed && (
          <div className="bg-white rounded-3xl p-6 border border-black/6 shadow-sm">
            <OrderStatusTimeline currentStep={stepIndex} />
          </div>
        )}

        {/* Failed */}
        {isFailed && (
          <div className="bg-red-50 border border-red-100 rounded-3xl p-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                <CreditCard className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="font-bold text-red-700 mb-1">Payment not completed</p>
                <p className="text-sm text-red-600/80 mb-4">
                  The M-Pesa payment was not confirmed. Your order was not placed.
                </p>
                <Link
                  href="/shop"
                  className="inline-block px-5 py-2.5 bg-red-600 text-white font-semibold rounded-xl text-sm shadow-sm"
                >
                  Browse gifts to try again
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Surprise Safeguard Badges */}
        {(isAnonymous || dontCall) && (
          <div className="bg-white rounded-3xl p-5 border border-black/6 shadow-sm">
            <p className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider mb-3">Surprise Safeguard Active</p>
            <div className="flex flex-col gap-3">
              {dontCall && (
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-brand/8 flex items-center justify-center flex-shrink-0">
                    <PhoneOff className="w-4 h-4 text-brand" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-deep">No-contact delivery</p>
                    <p className="text-xs text-brand-muted">Rider will use landmarks instead of calling.</p>
                  </div>
                </div>
              )}
              {isAnonymous && (
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-brand/8 flex items-center justify-center flex-shrink-0">
                    <EyeOff className="w-4 h-4 text-brand" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-deep">Anonymous Sender</p>
                    <p className="text-xs text-brand-muted">The recipient won't see your name or price.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tracking Actions */}
        {!isFailed && !hasPinDrop && (
          <SendTrackLinkButton orderId={order.id} recipientPhone={order.recipient_phone} recipientName={order.recipient_name} />
        )}

        {hasPinDrop && (
          <ResendPinDropButton
            orderId={order.id}
            recipientName={order.recipient_name}
          />
        )}

        {/* Pin Drop Status */}
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
          <div className="bg-white rounded-3xl p-5 border border-black/6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-bold text-brand-deep">Package Photo</p>
                <p className="text-xs text-brand-muted mt-0.5">Your sealed package before dispatch</p>
              </div>
              <Camera className="w-5 h-5 text-brand" />
            </div>
            <div className="aspect-[4/3] bg-gray-50 rounded-2xl overflow-hidden relative border border-black/5">
              <Image
                src={order.pre_dispatch_photo_url}
                alt="Package before dispatch"
                fill
                sizes="(max-width: 600px) 100vw, 600px"
                className="object-cover"
              />
            </div>
          </div>
        )}

        {/* Order details */}
        <div className="bg-white rounded-3xl p-5 border border-black/6 shadow-sm">
          <p className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider mb-4">Order Details</p>

          {/* Product Row */}
          {order.products && (
            <div className="flex gap-4 pb-5 border-b border-black/5 mb-5">
              <div className="w-16 h-16 bg-blush rounded-2xl relative overflow-hidden flex-shrink-0 border border-black/5">
                {order.products.image_url ? (
                  <Image src={order.products.image_url} alt={order.products.name} fill className="object-contain p-2" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand/20">
                    <Gift className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-brand-deep text-sm mb-1 line-clamp-2">{order.products.name}</h4>
                <p className="text-brand font-bold">
                  {order.quantity > 1 ? `${order.quantity} × ` : ""}{formatKsh(order.total_amount)}
                </p>
              </div>
            </div>
          )}

          {/* Custom amount */}
          {!order.products && (
            <div className="space-y-3 pb-5 border-b border-black/5 mb-5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-brand-muted font-medium">Total Amount</span>
                <span className="font-bold text-brand-deep">{formatKsh(order.total_amount)}</span>
              </div>
              {order.quantity > 1 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-brand-muted font-medium">Quantity</span>
                  <span className="font-semibold text-brand-deep">{order.quantity}</span>
                </div>
              )}
            </div>
          )}

          {/* Logistics */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-brand-muted">Recipient</span>
              <span className="font-semibold text-brand-deep">{order.recipient_name}</span>
            </div>
            {order.delivery_landmark && (
              <div className="flex justify-between text-sm">
                <span className="text-brand-muted">Landmark</span>
                <span className="font-medium text-brand-deep text-right max-w-[60%]">{order.delivery_landmark}</span>
              </div>
            )}
            {order.delivery_time_window && (
              <div className="flex justify-between text-sm">
                <span className="text-brand-muted">Delivery Window</span>
                <span className="font-medium capitalize text-brand-deep">{order.delivery_time_window}</span>
              </div>
            )}
          </div>

          {/* Notes */}
          {(order.gift_note || order.engraving) && (
            <div className="mt-5 pt-5 border-t border-black/5 space-y-4">
              {order.gift_note && (
                <div className="bg-brand/5 p-4 rounded-2xl">
                  <p className="text-[10px] font-bold text-brand uppercase tracking-wider mb-1">Gift Note</p>
                  <p className="text-sm font-medium text-brand-deep italic">"{order.gift_note}"</p>
                </div>
              )}
              {order.engraving && (
                <div className="bg-gray-50 p-4 rounded-2xl border border-black/5">
                  <p className="text-[10px] font-bold text-brand-muted uppercase tracking-wider mb-1">Custom Engraving</p>
                  <p className="text-sm font-medium text-brand-deep">"{order.engraving}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Guarantees */}
        <div className="bg-gradient-to-br from-brand-dark to-brand rounded-3xl p-6 space-y-3 shadow-sm">
          {[
            "On-time delivery or it's free",
            "Photo proof before dispatch",
            "Identity stays private unless revealed",
          ].map((text, i) => (
            <div key={i} className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-gold flex-shrink-0" />
              <p className="text-sm text-white/90 font-medium">{text}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
