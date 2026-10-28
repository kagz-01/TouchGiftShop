import Image from "next/image";
import Link from "next/link";
import { formatKsh } from "@/lib/utils";
import OrderStatusTimeline from "@/components/orders/OrderStatusTimeline";
import OrderFulfillmentStatus from "@/components/orders/OrderFulfillmentStatus";
import SendTrackLinkButton from "@/components/orders/SendTrackLinkButton";
import ResendPinDropButton from "@/components/pin-drop/ResendPinDropButton";
import PinDropStatus from "@/components/pin-drop/PinDropStatus";
import PinDropNotification from "@/components/pin-drop/PinDropNotification";
import { 
  ArrowLeft, 
  CheckCircle, 
  EyeOff, 
  Camera, 
  PhoneOff, 
  Gift, 
  SearchX, 
  CreditCard,
  Copy,
  Check,
  ShieldCheck,
  Sparkles
} from "lucide-react";

async function getOrder(id: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://touchgiftshop.co.ke";
  const res = await fetch(`${base}/api/orders/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  const { order } = await res.json();
  return order;
}

const STATUS_MAP: Record<string, number> = {
  pending_payment: 0,
  processing: 0,
  wrapped: 1,
  dispatched: 2,
  delivered: 3,
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
      <div className="min-h-screen bg-transparent flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md bg-white/95 backdrop-blur-md rounded-3xl p-8 border border-brand/10 shadow-lg">
          <SearchX className="w-16 h-16 text-brand-muted/40 mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-brand-deep mb-2">Order Not Found</h1>
          <p className="text-sm text-brand-muted mb-6">
            We couldn&apos;t find this order. Please verify your link or check your orders list.
          </p>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-white font-semibold rounded-2xl hover:bg-brand-dark transition-colors shadow-sm"
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
  const shortId = order.id.slice(0, 8);

  return (
    <div className="min-h-screen bg-transparent pb-24">
      {/* Real-time pin-drop notification */}
      <PinDropNotification
        orderId={order.id}
        enabled={hasPinDrop && !hasPinData}
      />

      {/* ── Top Navigation Bar ── */}
      <div className="bg-white/80 backdrop-blur-md border-b border-black/5 sticky top-0 z-30">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/orders"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-muted hover:text-brand transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Orders
          </Link>
          
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
              #{shortId}
            </span>
            {order.status === "delivered" && (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" /> Delivered
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Luxury Hero Header ── */}
      <div className="bg-gradient-to-br from-brand-deep via-brand to-brand-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,168,83,0.15),transparent_50%)] pointer-events-none" />
        
        <div className="max-w-xl mx-auto px-5 pt-8 pb-12 relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-gold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>TouchGift Concierge Delivery</span>
          </div>

          <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
            {isFailed ? "Payment Failed" : `Gift for ${order.recipient_name}`}
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/80 font-medium">
            <span>
              Ordered {new Date(order.created_at).toLocaleDateString("en-KE", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span>•</span>
            <span className="font-bold text-white">
              Total: {formatKsh(order.total_amount)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Body Cards Stack ── */}
      <div className="max-w-xl mx-auto px-4 -mt-6 relative z-10 space-y-4">
        {/* Timeline */}
        {!isFailed && (
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-brand/10 shadow-sm">
            <OrderStatusTimeline currentStep={stepIndex} />
          </div>
        )}

        {/* Failed Banner */}
        {isFailed && (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-6 shadow-sm">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                <CreditCard className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="font-bold text-red-700 mb-1">Payment Not Completed</p>
                <p className="text-sm text-red-600/80 mb-4 leading-relaxed">
                  The transaction was not completed. Your gift was not scheduled for delivery.
                </p>
                <Link
                  href="/shop"
                  className="inline-block px-5 py-2.5 bg-red-600 text-white font-semibold rounded-xl text-sm shadow-sm hover:bg-red-700 transition-colors"
                >
                  Browse Gifts to Try Again
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Fulfillment Status & Concierge Coordination ── */}
        {!isFailed && (
          <OrderFulfillmentStatus
            orderId={order.id}
            status={order.status}
            recipientName={order.recipient_name}
            recipientPhone={order.recipient_phone}
            trackToken={order.track_token}
            riderToken={order.rider_token}
            deliveryLandmark={order.delivery_landmark}
            deliveryTimeWindow={order.delivery_time_window}
          />
        )}

        {/* Tracking link for recipient */}
        {!isFailed && !hasPinDrop && (
          <SendTrackLinkButton 
            orderId={order.id} 
            recipientPhone={order.recipient_phone} 
            recipientName={order.recipient_name} 
          />
        )}

        {/* Pin Drop Actions & Status */}
        {hasPinDrop && (
          <ResendPinDropButton
            orderId={order.id}
            recipientName={order.recipient_name}
          />
        )}

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

        {/* Surprise Safeguard Badges */}
        {(isAnonymous || dontCall) && (
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 border border-brand/10 shadow-sm">
            <p className="text-[11px] font-bold text-brand-deep uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand" />
              Surprise Safeguard Active
            </p>
            <div className="flex flex-col gap-3">
              {dontCall && (
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0">
                    <PhoneOff className="w-4 h-4 text-brand" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-deep">No-contact stealth delivery</p>
                    <p className="text-xs text-brand-muted">Our rider uses landmarks instead of calling to keep the surprise intact.</p>
                  </div>
                </div>
              )}
              {isAnonymous && (
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0">
                    <EyeOff className="w-4 h-4 text-brand" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-deep">Anonymous Gifter</p>
                    <p className="text-xs text-brand-muted">The recipient will not see your identity or the price paid.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pre-dispatch package photo */}
        {order.pre_dispatch_photo_url && (
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 border border-brand/10 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-bold text-brand-deep">Package Photo Proof</p>
                <p className="text-xs text-brand-muted mt-0.5">Your sealed package before courier dispatch</p>
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

        {/* Order details Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-brand/10 shadow-sm">
          <p className="text-[11px] font-bold text-brand-muted uppercase tracking-wider mb-4">
            Order Summary
          </p>

          {/* Product Row */}
          {order.products && (
            <div className="flex gap-4 pb-5 border-b border-black/5 mb-5">
              <div className="w-16 h-16 bg-blush rounded-2xl relative overflow-hidden flex-shrink-0 border border-black/5">
                {order.products.image_url ? (
                  <Image 
                    src={order.products.image_url} 
                    alt={order.products.name} 
                    fill 
                    className="object-contain p-2" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand/30">
                    <Gift className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-brand-deep text-sm mb-1 line-clamp-2">
                  {order.products.name}
                </h4>
                <p className="text-brand font-bold text-sm">
                  {order.quantity > 1 ? `${order.quantity} × ` : ""}{formatKsh(order.total_amount)}
                </p>
              </div>
            </div>
          )}

          {/* Logistics & Recipient Info */}
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-500 font-medium">Recipient</span>
              <span className="font-bold text-brand-deep">{order.recipient_name}</span>
            </div>
            {order.recipient_phone && (
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500 font-medium">Delivery Contact</span>
                <span className="font-mono text-gray-700">{order.recipient_phone}</span>
              </div>
            )}
            {order.delivery_landmark && (
              <div className="flex justify-between items-start py-1">
                <span className="text-gray-500 font-medium">Landmark</span>
                <span className="font-medium text-brand-deep text-right max-w-[65%]">
                  {order.delivery_landmark}
                </span>
              </div>
            )}
            {order.delivery_time_window && (
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500 font-medium">Preferred Window</span>
                <span className="font-medium capitalize text-brand-deep">
                  {order.delivery_time_window}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-black/5 font-bold text-sm">
              <span className="text-brand-deep">Amount Paid</span>
              <span className="text-brand">{formatKsh(order.total_amount)}</span>
            </div>
          </div>

          {/* Notes & Customization */}
          {(order.gift_note || order.engraving || order.customization_image_url) && (
            <div className="mt-5 pt-5 border-t border-black/5 space-y-3">
              {order.gift_note && (
                <div className="bg-brand/5 p-4 rounded-2xl border border-brand/10">
                  <p className="text-[10px] font-bold text-brand uppercase tracking-wider mb-1">
                    Personalized Gift Note
                  </p>
                  <p className="text-xs font-medium text-brand-deep italic leading-relaxed">
                    &ldquo;{order.gift_note}&rdquo;
                  </p>
                </div>
              )}
              {order.engraving && (
                <div className="bg-gray-50 p-4 rounded-2xl border border-black/5">
                  <p className="text-[10px] font-bold text-brand-muted uppercase tracking-wider mb-1">
                    Custom Engraving
                  </p>
                  <p className="text-xs font-medium text-brand-deep">
                    &ldquo;{order.engraving}&rdquo;
                  </p>
                </div>
              )}
              {order.customization_image_url && (
                <div className="bg-gray-50 p-4 rounded-2xl border border-black/5">
                  <p className="text-[10px] font-bold text-brand-muted uppercase tracking-wider mb-2">
                    Custom Artwork / Photo
                  </p>
                  <img
                    src={order.customization_image_url}
                    alt="Custom design"
                    className="w-28 h-28 object-cover rounded-xl border border-black/10"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Guarantees Box */}
        <div className="bg-gradient-to-br from-brand-deep to-brand rounded-3xl p-6 space-y-3 shadow-sm text-white">
          {[
            "On-time delivery or delivery fee refunded",
            "Photo proof before courier dispatch",
            "Discreet packaging with surprise safeguard",
          ].map((text, i) => (
            <div key={i} className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-gold flex-shrink-0" />
              <p className="text-xs text-white/90 font-medium">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
