import OrderStatusTimeline from "@/components/orders/OrderStatusTimeline";
import { formatKsh } from "@/lib/utils";

const STATUS_STEP: Record<string, number> = {
  pending_payment: -1,
  processing: 0,
  wrapped: 1,
  dispatched: 2,
  delivered: 3,
  failed: -1,
};

async function getOrder(id: string, base: string) {
  const res = await fetch(`${base}/api/orders/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  const { order } = await res.json();
  return order;
}

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const order = await getOrder(params.id, base);

  if (!order) {
    return (
      <div className="px-4 md:px-8 py-6">
        <p className="text-sm text-brand-muted">Order not found.</p>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 space-y-4">
      <h1 className="text-xl font-semibold">
        Order #{order.id.slice(0, 8)}
      </h1>
      <p className="text-sm text-brand-muted">
        {formatKsh(order.total_amount)} · to {order.recipient_name}
      </p>
      <OrderStatusTimeline currentStep={STATUS_STEP[order.status] ?? -1} />
      <div className="rounded-lg border border-gray-200 p-4 text-sm text-brand-muted">
        {order.pre_dispatch_photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={order.pre_dispatch_photo_url}
            alt="Gift before dispatch"
            className="rounded-md w-full"
          />
        ) : (
          "Pre-dispatch photo will appear here once your gift is packed."
        )}
      </div>
    </div>
  );
}
