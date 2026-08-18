"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatKsh, cn } from "@/lib/utils";
import { ArrowLeft, Package } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Awaiting payment",
  processing: "Processing",
  wrapped: "Wrapped & ready",
  dispatched: "Out for delivery",
  delivered: "Delivered",
  failed: "Payment failed",
};

interface Order {
  id: string;
  total_amount: number;
  status: string;
  recipient_name: string;
  created_at: string;
  pre_dispatch_photo_url: string | null;
  quantity: number;
  product_id: string | null;
  products?: { name: string; image_url: string } | null;
}

export default function OrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const [activeTab, setActiveTab] = useState<"active" | "past">("active");

  const activeOrders = initialOrders.filter(
    (o) => o.status !== "delivered" && o.status !== "failed"
  );
  const pastOrders = initialOrders.filter(
    (o) => o.status === "delivered" || o.status === "failed"
  );

  const displayOrders = activeTab === "active" ? activeOrders : pastOrders;

  return (
    <div className="min-h-screen bg-transparent pb-20">
      {/* ── Sticky header ── */}
      <div className="bg-white border-b border-black/5 sticky top-0 z-30">
        <div className="page-container py-3 flex items-center gap-3">
          <Link
            href="/"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-brand-muted hover:bg-brand/5 hover:text-brand transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-display font-bold text-brand-deep text-sm leading-none">Your Orders</h1>
            <p className="text-[11px] text-brand-muted mt-0.5">Track and manage your gift deliveries</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="page-container">
          <div className="flex gap-6 border-b border-black/5">
            <button
              onClick={() => setActiveTab("active")}
              className={cn(
                "pb-3 text-sm font-bold transition-colors relative",
                activeTab === "active" ? "text-brand" : "text-brand-muted hover:text-brand-deep"
              )}
            >
              Active ({activeOrders.length})
              {activeTab === "active" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={cn(
                "pb-3 text-sm font-bold transition-colors relative",
                activeTab === "past" ? "text-brand" : "text-brand-muted hover:text-brand-deep"
              )}
            >
              Past ({pastOrders.length})
              {activeTab === "past" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-t-full" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="page-container mt-8 space-y-4">
        {displayOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-surface-border animate-fade-in">
            <svg className="w-12 h-12 mx-auto text-brand/30 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            <p className="font-display font-semibold mb-2">No {activeTab} orders</p>
            <p className="text-sm text-brand-muted max-w-sm mx-auto mb-4">
              {activeTab === "active" 
                ? "You don't have any ongoing deliveries at the moment." 
                : "You don't have any past orders yet."}
            </p>
            <Link href="/shop" className="btn-brand inline-flex items-center gap-2 text-sm">
              Browse gifts
            </Link>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {displayOrders.map((order) => {
              const isFailed = order.status === "failed";
              const isDelivered = order.status === "delivered";
              
              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block bg-white rounded-3xl border border-surface-border overflow-hidden hover:shadow-card transition-shadow"
                >
                  <div className="p-5 flex gap-5">
                    {/* Image */}
                    <div className="w-20 h-20 bg-blush rounded-2xl flex-shrink-0 relative overflow-hidden">
                      {order.products?.image_url ? (
                        <Image src={order.products.image_url} alt={order.products.name ?? "Product"} fill className="object-contain p-2" sizes="80px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-brand/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={cn(
                            "inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1",
                            isFailed ? "bg-red-50 text-red-600" : isDelivered ? "bg-green-50 text-green-600" : "bg-brand/10 text-brand"
                          )}>
                            {STATUS_LABELS[order.status] ?? order.status}
                          </span>
                          <h3 className="font-display font-bold text-lg text-brand-deep leading-tight">
                            {order.products?.name ?? "Custom Gift"}
                          </h3>
                          <p className="text-sm font-medium text-brand mt-1">
                            {formatKsh(order.total_amount)}
                          </p>
                        </div>
                        <div className="text-right">
                           {order.pre_dispatch_photo_url && (
                            <span className="bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                              📸 Photo
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-surface-border grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-brand-muted font-medium mb-0.5">Recipient</p>
                          <p className="font-semibold text-brand-deep">{order.recipient_name}</p>
                        </div>
                        <div>
                          <p className="text-brand-muted font-medium mb-0.5">Date</p>
                          <p className="font-semibold text-brand-deep">
                            {new Date(order.created_at).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
