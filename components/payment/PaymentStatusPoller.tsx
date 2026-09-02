"use client";

import React, { useEffect, useState } from "react";
import { createClient as createSupabaseClient } from "@/lib/supabase-browser";

type Props = {
  // `trackingId` may be either the PesaPal `orderTrackingId` or our local
  // merchant reference (order id). The poller will attempt to resolve the
  // PesaPal tracking id by querying our `/api/orders/:id` endpoint first.
  trackingId: string;
  pollIntervalMs?: number;
  timeoutMs?: number;
};

export default function PaymentStatusPoller({
  trackingId,
  pollIntervalMs = 2000,
  timeoutMs = 30000,
}: Props) {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!trackingId) return;
    let mounted = true;
    const start = Date.now();
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let supabaseChannel: any = null;

    // Resolve a PesaPal orderTrackingId: try fetching our order record first.
    const resolveTracking = async (): Promise<string> => {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(trackingId)}`, { cache: "no-store" });
        if (!res.ok) return trackingId; // fallback to original value
        const data = await res.json();
        // Prefer stored payment_tracking_id if available
        return data.order?.payment_tracking_id || trackingId;
      } catch (e) {
        return trackingId;
      }
    };

    const fetchStatus = async (tid: string) => {
      try {
        const res = await fetch(`/api/payment/status?trackingId=${encodeURIComponent(tid)}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch payment status");
        const data: any = await res.json();
        if (!mounted) return;
        setStatus(data?.status ?? null);
        if (data?.status === "completed" || data?.status === "failed") {
          // final state — stop polling
          if (intervalId) clearInterval(intervalId);
        }
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message ?? "Error checking payment status");
      }
    };

    (async () => {
      const tid = await resolveTracking();

      // Attempt Supabase realtime subscription as a fast fallback if env is present
      try {
        if (typeof window === "undefined" || !("WebSocket" in window)) {
          // WebSocket not available in this environment — skip realtime
        } else {
          const supabase = createSupabaseClient();
          if (supabase) {
            supabaseChannel = supabase
              .channel(`orders:${trackingId}`)
            .on(
              "postgres_changes",
              {
                event: "*",
                schema: "public",
                table: "orders",
                filter: `id=eq.${trackingId}`,
              },
              (payload: any) => {
                if (!mounted) return;
                // If order row updated with a payment status or payment_tracking_id
                const newRow = payload.new || {};
                if (newRow.payment_tracking_id && newRow.payment_tracking_id !== tid) {
                  // switch to the canonical tracking id
                  fetchStatus(newRow.payment_tracking_id);
                }
                if (newRow.status) {
                  setStatus(newRow.status);
                  if (newRow.status === "processing" || newRow.status === "completed") {
                    if (intervalId) clearInterval(intervalId);
                  }
                }
              }
            )
            .subscribe();
        }
      } catch (e) {
        // ignore realtime setup failures — we'll rely on polling
      }

      // initial fetch and polling
      await fetchStatus(tid);
      intervalId = setInterval(() => {
        if (Date.now() - start >= timeoutMs) {
          if (intervalId) clearInterval(intervalId);
          return;
        }
        fetchStatus(tid);
      }, pollIntervalMs);
    })();

    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
      try {
        if (supabaseChannel && typeof window !== "undefined" && ("WebSocket" in window)) {
          const supabase = createSupabaseClient();
          supabase.removeChannel(supabaseChannel);
        }
      } catch (e) {
        // ignore
      }
    };
  }, [trackingId, pollIntervalMs, timeoutMs]);

  return (
    <div className="mt-4 text-sm text-center">
      <p className="text-xs text-brand-muted mb-1">Payment status</p>
      {error ? (
        <p className="text-red-600">{error}</p>
      ) : status ? (
        <p className={status === "completed" ? "text-green-600" : "text-yellow-600"}>
          {status}
        </p>
      ) : (
        <p className="text-gray-500">Checking…</p>
      )}
    </div>
  );
}
