import Link from "next/link";

// TODO: accept a real order prop once /api/orders is wired up.
export default function OrderCard() {
  return (
    <Link
      href="/orders/placeholder-id"
      className="block rounded-lg border border-gray-200 p-4"
    >
      <p className="text-sm font-medium">Order placeholder</p>
      <p className="text-xs text-brand-muted">Status: --</p>
    </Link>
  );
}
