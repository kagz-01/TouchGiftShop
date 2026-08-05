import OrderCard from "@/components/orders/OrderCard";

// Orders tab — Section 4/8.1. TODO: fetch real orders for the logged-in user.
export default function OrdersPage() {
  return (
    <div className="px-4 md:px-8 py-6 space-y-4">
      <h1 className="text-xl font-semibold">Your orders</h1>
      <OrderCard />
    </div>
  );
}
