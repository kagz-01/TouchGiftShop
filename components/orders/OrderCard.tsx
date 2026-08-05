import Link from "next/link";
import { formatKsh } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Awaiting payment",
  processing: "Processing",
  wrapped: "Wrapped",
  dispatched: "Out for delivery",
  delivered: "Delivered",
  failed: "Failed",
};

const STATUS_COLORS: Record<string, string> = {
  pending_payment: "text-yellow-600",
  processing: "text-blue-600",
  wrapped: "text-purple-600",
  dispatched: "text-orange-600",
  delivered: "text-green-600",
  failed: "text-red-600",
};

interface OrderCardProps {
  id: string;
  totalAmount: number;
  status: string;
  recipientName: string;
  createdAt: string;
}

export default function OrderCard({
  id,
  totalAmount,
  status,
  recipientName,
  createdAt,
}: OrderCardProps) {
  return (
    <Link
      href={`/orders/${id}`}
      className="block rounded-lg border border-gray-200 p-4 hover:border-gray-400 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium">To: {recipientName}</p>
          <p className="text-xs text-brand-muted">
            {new Date(createdAt).toLocaleDateString("en-KE", {
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{formatKsh(totalAmount)}</p>
          <p className={`text-xs ${STATUS_COLORS[status] ?? "text-brand-muted"}`}>
            {STATUS_LABELS[status] ?? status}
          </p>
        </div>
      </div>
    </Link>
  );
}
