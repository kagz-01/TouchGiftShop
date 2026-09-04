"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
  Package, ShoppingCart, Truck, CheckCircle, Clock,
  AlertCircle, MapPin, TrendingUp, Users, ArrowRight,
} from "lucide-react";

interface Stats {
  totalOrders: number;
  todayOrders: number;
  weekOrders: number;
  monthRevenue: number;
  statusCounts: Record<string, number>;
  activeRiders: number;
  pendingPinDrops: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending_payment: { label: "Pending Payment", color: "text-yellow-600 bg-yellow-50", icon: <Clock className="w-4 h-4" /> },
  processing: { label: "Processing", color: "text-blue-600 bg-blue-50", icon: <Package className="w-4 h-4" /> },
  wrapped: { label: "Wrapped & Ready", color: "text-purple-600 bg-purple-50", icon: <Package className="w-4 h-4" /> },
  dispatched: { label: "Dispatched", color: "text-orange-600 bg-orange-50", icon: <Truck className="w-4 h-4" /> },
  delivered: { label: "Delivered", color: "text-green-600 bg-green-50", icon: <CheckCircle className="w-4 h-4" /> },
  failed: { label: "Failed", color: "text-red-600 bg-red-50", icon: <AlertCircle className="w-4 h-4" /> },
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Real-time: listen for order changes and refresh stats
    if (typeof window === "undefined" || !("WebSocket" in window)) return;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let channel: ReturnType<typeof supabase.channel> | null = null;
    try {
      channel = supabase
        .channel("admin-dashboard")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "orders" },
          () => {
            // Re-fetch stats when any order changes
            fetch("/api/admin/stats")
              .then((r) => r.json())
              .then((data) => setStats(data))
              .catch(() => {});
          }
        )
        .subscribe();
    } catch {
      // skip realtime if not available
    }

    return () => {
      if (channel) {
        try { supabase.removeChannel(channel); } catch { /* ignore */ }
      }
    };
  }, []);

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
              <Link href="/admin" className="px-3 py-1.5 rounded-lg text-sm font-medium bg-brand/10 text-brand">
                Dashboard
              </Link>
              <Link href="/admin/orders" className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
                Orders
              </Link>
              <Link href="/admin/products" className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
                Products
              </Link>
              <Link href="/admin/bundles" className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
                Bundles
              </Link>
              <Link href="/admin/templates" className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
                Templates
              </Link>
              <Link href="/admin/reviews" className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
                Reviews
              </Link>
            </nav>
          </div>
          <button
            onClick={async () => {
              await fetch("/api/admin/auth", { method: "DELETE" });
              window.location.href = "/admin-access-2026";
            }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse h-28" />
            ))}
          </div>
        ) : stats ? (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <StatCard
                label="Today's Orders"
                value={stats.todayOrders}
                icon={<ShoppingCart className="w-5 h-5 text-blue-500" />}
                link="/admin/orders"
              />
              <StatCard
                label="This Week"
                value={stats.weekOrders}
                icon={<TrendingUp className="w-5 h-5 text-green-500" />}
                link="/admin/orders"
              />
              <StatCard
                label="Active Riders"
                value={stats.activeRiders}
                icon={<Truck className="w-5 h-5 text-orange-500" />}
                link="/admin/orders?status=dispatched"
                alert={stats.activeRiders > 0}
              />
              <StatCard
                label="Pending Pin-Drops"
                value={stats.pendingPinDrops}
                icon={<MapPin className="w-5 h-5 text-purple-500" />}
                link="/admin/orders"
                alert={stats.pendingPinDrops > 0}
              />
            </div>

            {/* Revenue */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Monthly Revenue (Delivered)
              </h2>
              <p className="text-3xl font-bold text-gray-900">
                KSh {stats.monthRevenue.toLocaleString("en-KE")}
              </p>
            </div>

            {/* Status Breakdown */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Orders by Status
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(stats.statusCounts).map(([status, count]) => {
                  const config = STATUS_CONFIG[status];
                  if (!config) return null;
                  return (
                    <Link
                      key={status}
                      href={`/admin/orders?status=${status}`}
                      className={`flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors`}
                    >
                      <div className={`p-2 rounded-lg ${config.color}`}>
                        {config.icon}
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{count}</p>
                        <p className="text-xs text-gray-500">{config.label}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/admin/orders?status=processing"
                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Needs Processing</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link
                href="/admin/orders?status=wrapped"
                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200 hover:border-purple-300 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Ready to Dispatch</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link
                href="/admin/orders?status=dispatched"
                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200 hover:border-orange-300 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Out for Delivery</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
            </div>
          </>
        ) : (
          <p className="text-gray-500">Failed to load stats.</p>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  link,
  alert,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  link: string;
  alert?: boolean;
}) {
  return (
    <Link
      href={link}
      className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-gray-300 transition-colors relative"
    >
      {alert && (
        <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
      )}
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <span className="text-sm font-medium text-gray-500">{label}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </Link>
  );
}
