import Link from "next/link";
import { formatKsh } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Awaiting payment",
  processing: "Processing",
  wrapped: "Wrapped & ready",
  dispatched: "Out for delivery",
  delivered: "Delivered",
  failed: "Payment failed",
};

const STATUS_COLORS: Record<string, string> = {
  pending_payment: "text-yellow-600",
  processing: "text-blue-600",
  wrapped: "text-purple-600",
  dispatched: "text-orange-600",
  delivered: "text-green-600",
  failed: "text-red-600",
};

interface Order {
  id: string;
  total_amount: number;
  status: string;
  recipient_name: string;
  created_at: string;
  pre_dispatch_photo_url: string | null;
  quantity: number;
}

async function getOrders(phone: string): Promise<Order[]> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/orders?phone=${phone}`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const { orders } = await res.json();
  return orders ?? [];
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string }>;
}) {
  const params = await searchParams;
  const phone = params.phone ?? "";

  if (!phone) {
    return (
      <div className="px-4 md:px-8 py-6 max-w-lg mx-auto space-y-4">
        <h1 className="text-xl font-semibold">Your orders</h1>
        <p className="text-sm text-brand-muted">
          Enter your phone number to see your orders.
        </p>
        <form className="space-y-3">
          <input
            name="phone"
            placeholder="07XX XXX XXX"
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-brand text-white py-3 text-sm font-medium"
          >
            Find my orders
          </button>
        </form>
      </div>
    );
  }

  const orders = await getOrders(phone);

  return (
    <div className="px-4 md:px-8 py-6 max-w-lg mx-auto space-y-4">
      <h1 className="text-xl font-semibold">Your orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-8 space-y-2">
          <p className="text-sm text-brand-muted">
            No orders found for {phone}.
          </p>
          <Link href="/" className="text-sm underline">
            Browse gifts
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block rounded-lg border border-gray-200 p-4 hover:border-gray-400 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    To: {order.recipient_name}
                  </p>
                  <p className="text-xs text-brand-muted">
                    {new Date(order.created_at).toLocaleDateString("en-KE", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {order.quantity > 1 ? ` • ${order.quantity}x` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {formatKsh(order.total_amount)}
                  </p>
                  <p
                    className={`text-xs ${STATUS_COLORS[order.status] ?? "text-brand-muted"}`}
                  >
                    {STATUS_LABELS[order.status] ?? order.status}
                  </p>
                </div>
              </div>
              {order.pre_dispatch_photo_url && (
                <p className="text-xs text-green-600 mt-2">
                  Photo proof attached
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
