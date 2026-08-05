import Image from "next/image";
import Link from "next/link";
import { formatKsh } from "@/lib/utils";
import OrderStatusTimeline from "@/components/orders/OrderStatusTimeline";

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
      <div className="px-4 md:px-8 py-6 text-center">
        <p className="text-brand-muted">Order not found.</p>
        <Link href="/orders" className="text-sm underline mt-2 inline-block">
          Back to orders
        </Link>
      </div>
    );
  }

  const stepIndex = STATUS_MAP[order.status] ?? 0;
  const isFailed = order.status === "failed";

  return (
    <div className="px-4 md:px-8 py-6 max-w-lg mx-auto space-y-6">
      <Link href="/orders" className="text-sm text-brand-muted underline">
        &larr; All orders
      </Link>

      <div className="space-y-1">
        <h1 className="text-xl font-semibold">
          {isFailed ? "Payment failed" : `Order to ${order.recipient_name}`}
        </h1>
        <p className="text-sm text-brand-muted">
          {new Date(order.created_at).toLocaleDateString("en-KE", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      {!isFailed && <OrderStatusTimeline currentStep={stepIndex} />}

      {isFailed && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm">
          <p className="text-red-800 font-medium">Payment not completed</p>
          <p className="text-red-700 mt-1">
            The M-Pesa payment was not confirmed. You can try ordering again.
          </p>
          <Link
            href="/"
            className="inline-block mt-2 text-red-800 underline text-sm"
          >
            Browse gifts
          </Link>
        </div>
      )}

      {order.pre_dispatch_photo_url && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Package photo</p>
          <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden relative">
            <Image
              src={order.pre_dispatch_photo_url}
              alt="Package before dispatch"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <p className="text-xs text-brand-muted">
            This is your sealed package before it left for delivery.
          </p>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 p-4 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-brand-muted">Amount</span>
          <span className="font-medium">{formatKsh(order.total_amount)}</span>
        </div>
        {order.quantity > 1 && (
          <div className="flex justify-between">
            <span className="text-brand-muted">Quantity</span>
            <span>{order.quantity}x</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-brand-muted">Recipient</span>
          <span>{order.recipient_name}</span>
        </div>
        {order.recipient_phone && (
          <div className="flex justify-between">
            <span className="text-brand-muted">Recipient phone</span>
            <span>{order.recipient_phone}</span>
          </div>
        )}
        {order.delivery_landmark && (
          <div className="flex justify-between">
            <span className="text-brand-muted">Landmark</span>
            <span>{order.delivery_landmark}</span>
          </div>
        )}
        {order.gift_note && (
          <div className="border-t border-gray-100 pt-3">
            <p className="text-brand-muted mb-1">Gift note</p>
            <p className="italic">&ldquo;{order.gift_note}&rdquo;</p>
          </div>
        )}
        {order.engraving && (
          <div className="border-t border-gray-100 pt-3">
            <p className="text-brand-muted mb-1">Engraving</p>
            <p className="italic">&ldquo;{order.engraving}&rdquo;</p>
          </div>
        )}
      </div>
    </div>
  );
}
