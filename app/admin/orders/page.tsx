"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatKsh } from "@/lib/utils";
import {
  Search, Filter, Truck, CheckCircle, Clock,
  Package, AlertCircle, MapPin, ExternalLink,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending_payment: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-700" },
  wrapped: { label: "Ready", color: "bg-purple-100 text-purple-700" },
  dispatched: { label: "Dispatched", color: "bg-orange-100 text-orange-700" },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-700" },
  failed: { label: "Failed", color: "bg-red-100 text-red-700" },
};

const STATUS_FILTERS = [
  "all",
  "pending_payment",
  "processing",
  "wrapped",
  "dispatched",
  "delivered",
  "failed",
];

interface Order {
  id: string;
  status: string;
  recipient_name: string;
  recipient_phone: string;
  total_amount: number;
  shipping_fee: number;
  created_at: string;
  recipient_pin_requested: boolean;
  delivery_lat: number | null;
  rider_token: string | null;
  products: { name: string; image_url: string | null } | null;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("limit", "50");
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (search) params.set("search", search);

    try {
      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Nav */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-display text-lg font-bold text-brand-deep">
              TouchGift Admin
            </Link>
            <nav className="flex items-center gap-1">
              <Link href="/admin" className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
                Dashboard
              </Link>
              <Link href="/admin/orders" className="px-3 py-1.5 rounded-lg text-sm font-medium bg-brand/10 text-brand">
                Orders
              </Link>
              <Link href="/admin/reviews" className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
                Reviews
              </Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-sm text-gray-500">{total} total orders</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, or order ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand"
            />
          </div>
        </div>

        {/* Status filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s
                  ? "bg-brand text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {s === "all" ? "All" : STATUS_CONFIG[s]?.label || s}
            </button>
          ))}
        </div>

        {/* Orders table */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse h-20" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Order</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Recipient</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Product</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Amount</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Flags</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => {
                    const config = STATUS_CONFIG[order.status];
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-gray-500">
                            {order.id.slice(0, 8)}...
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{order.recipient_name}</p>
                          <p className="text-xs text-gray-500">{order.recipient_phone}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {order.products?.name || "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          {formatKsh(order.total_amount)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config?.color || "bg-gray-100 text-gray-600"}`}>
                            {config?.label || order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {order.recipient_pin_requested && !order.delivery_lat && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 text-purple-600">
                                <MapPin className="w-2.5 h-2.5" /> Pin pending
                              </span>
                            )}
                            {order.rider_token && order.status === "dispatched" && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-orange-100 text-orange-600">
                                <Truck className="w-2.5 h-2.5" /> Rider active
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleDateString("en-KE", {
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                          >
                            View <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
