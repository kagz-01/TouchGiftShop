"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatKsh } from "@/lib/utils";
import {
  ArrowLeft, Package, Truck, CheckCircle, Clock,
  MapPin, Phone, User, Gift, Copy, CheckCircle2,
  Share2, AlertCircle, Send,
} from "lucide-react";

const STATUSES = [
  { value: "processing", label: "Processing", icon: <Package className="w-4 h-4" />, color: "bg-blue-500" },
  { value: "wrapped", label: "Wrapped & Ready", icon: <Gift className="w-4 h-4" />, color: "bg-purple-500" },
  { value: "dispatched", label: "Dispatched", icon: <Truck className="w-4 h-4" />, color: "bg-orange-500" },
  { value: "delivered", label: "Delivered", icon: <CheckCircle className="w-4 h-4" />, color: "bg-green-500" },
  { value: "failed", label: "Failed", icon: <AlertCircle className="w-4 h-4" />, color: "bg-red-500" },
];

const STATUS_INDEX: Record<string, number> = {
  pending_payment: 0,
  processing: 1,
  wrapped: 2,
  dispatched: 3,
  delivered: 4,
  failed: -1,
};

interface Order {
  id: string;
  status: string;
  recipient_name: string;
  recipient_phone: string;
  total_amount: number;
  shipping_fee: number;
  created_at: string;
  gift_note: string | null;
  recipient_pin_requested: boolean;
  delivery_lat: number | null;
  delivery_lng: number | null;
  delivery_landmark: string | null;
  delivery_time_window: string | null;
  rider_token: string | null;
  pre_dispatch_photo_url: string | null;
  products: { name: string; image_url: string | null } | null;
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [riderUrl, setRiderUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      setOrder(data.order);
    } catch {
      setError("Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update");
        return;
      }
      setOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    } catch {
      setError("Something went wrong");
    } finally {
      setUpdating(false);
    }
  };

  const dispatchRider = async () => {
    setUpdating(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${orderId}/dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to dispatch");
        return;
      }
      setRiderUrl(data.riderUrl);
      setOrder((prev) => prev ? { ...prev, status: "dispatched", rider_token: data.riderToken } : null);
    } catch {
      setError("Something went wrong");
    } finally {
      setUpdating(false);
    }
  };

  const copyRiderLink = async () => {
    try {
      await navigator.clipboard?.writeText(riderUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(`Copy: ${riderUrl}`);
    }
  };

  const shareRiderLink = () => {
    const msg = encodeURIComponent(`🛵 Delivery time!\n\nOpen to start sharing your GPS:\n\n${riderUrl}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Order not found</p>
      </div>
    );
  }

  const currentIdx = STATUS_INDEX[order.status] ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Nav */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-6">
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
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to orders
        </button>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-display text-xl font-bold text-gray-900">
              Gift for {order.recipient_name}
            </h1>
            <p className="text-sm text-gray-500 font-mono">{order.id}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            order.status === "delivered" ? "bg-green-100 text-green-700" :
            order.status === "dispatched" ? "bg-orange-100 text-orange-700" :
            order.status === "failed" ? "bg-red-100 text-red-700" :
            "bg-blue-100 text-blue-700"
          }`}>
            {order.status.replace("_", " ")}
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Timeline */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Order Status
              </h2>
              <div className="space-y-3">
                {STATUSES.map((s, i) => {
                  const isPast = currentIdx > i + 1;
                  const isCurrent = order.status === s.value;
                  const isNext = !isPast && !isCurrent && currentIdx <= i;

                  return (
                    <button
                      key={s.value}
                      onClick={() => !updating && updateStatus(s.value)}
                      disabled={updating}
                      className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all text-left ${
                        isCurrent
                          ? `${s.color} text-white shadow-md`
                          : isPast
                          ? "bg-green-50 text-green-700"
                          : isNext
                          ? "bg-gray-50 hover:bg-gray-100 text-gray-600 cursor-pointer"
                          : "bg-gray-50 text-gray-400 cursor-pointer"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isCurrent ? "bg-white/20" : isPast ? "bg-green-100" : "bg-gray-200"
                      }`}>
                        {isPast ? <CheckCircle className="w-4 h-4" /> : s.icon}
                      </div>
                      <span className="text-sm font-semibold">{s.label}</span>
                      {isCurrent && <span className="ml-auto text-xs opacity-75">Current</span>}
                      {isPast && <span className="ml-auto text-xs">Done</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rider Dispatch */}
            {order.status !== "delivered" && order.status !== "failed" && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Rider Dispatch
                </h2>

                {riderUrl || order.rider_token ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-xl">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium">Rider assigned</span>
                    </div>
                    {riderUrl && (
                      <div className="flex gap-2">
                        <button
                          onClick={shareRiderLink}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#25D366] text-white rounded-xl text-sm font-bold hover:bg-[#1fb855] transition-colors"
                        >
                          <Share2 className="w-3.5 h-3.5" /> Send via WhatsApp
                        </button>
                        <button
                          onClick={copyRiderLink}
                          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gray-100 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                          {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copied ? "Copied" : "Copy"}
                        </button>
                      </div>
                    )}
                    {riderUrl && (
                      <p className="text-xs text-gray-500 break-all bg-gray-50 p-2 rounded-lg">
                        {riderUrl}
                      </p>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={dispatchRider}
                    disabled={updating}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {updating ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Dispatching...
                      </span>
                    ) : (
                      <>
                        <Truck className="w-4 h-4" />
                        Assign Rider & Dispatch
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Order Info */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{order.recipient_name}</p>
                    <p className="text-gray-500">{order.recipient_phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Gift className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{order.products?.name || "Product"}</p>
                    <p className="text-gray-500">{formatKsh(order.total_amount)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-600">
                    {new Date(order.created_at).toLocaleString("en-KE", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            {order.delivery_lat && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Delivery Pin</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>{order.delivery_landmark || "Pin on map"}</span>
                </div>
                {order.delivery_time_window && (
                  <p className="text-xs text-gray-500">Time window: {order.delivery_time_window}</p>
                )}
                <a
                  href={`https://www.google.com/maps?q=${order.delivery_lat},${order.delivery_lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand hover:underline"
                >
                  View on Google Maps →
                </a>
              </div>
            )}

            {/* Gift Note */}
            {order.gift_note && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Gift Note</h3>
                <p className="text-sm text-gray-600 italic">&ldquo;{order.gift_note}&rdquo;</p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-2">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h3>
              <Link
                href={`/orders/${order.id}`}
                className="flex items-center gap-2 w-full p-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Package className="w-4 h-4" /> View customer order page
              </Link>
              <a
                href={`tel:${order.recipient_phone}`}
                className="flex items-center gap-2 w-full p-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Phone className="w-4 h-4" /> Call recipient
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
