"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PinDropNotificationProps {
  orderId: string;
  enabled: boolean;
  onPinDropped?: (data: {
    delivery_lat: number;
    delivery_lng: number;
    delivery_landmark: string | null;
    delivery_time_window: string | null;
  }) => void;
}

export default function PinDropNotification({
  orderId,
  enabled,
  onPinDropped,
}: PinDropNotificationProps) {
  const [notification, setNotification] = useState<{
    type: "pin-dropped" | "error";
    message: string;
  } | null>(null);

  const handlePinDrop = useCallback(
    (payload: any) => {
      const newDelivery = payload.new;
      if (
        newDelivery.delivery_lat !== null &&
        newDelivery.delivery_lng !== null
      ) {
        setNotification({
          type: "pin-dropped",
          message: "The recipient has dropped their pin!",
        });
        onPinDropped?.({
          delivery_lat: newDelivery.delivery_lat,
          delivery_lng: newDelivery.delivery_lng,
          delivery_landmark: newDelivery.delivery_landmark,
          delivery_time_window: newDelivery.delivery_time_window,
        });
        // Auto-dismiss after 8 seconds
        setTimeout(() => setNotification(null), 8000);
      }
    },
    [onPinDropped]
  );

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        handlePinDrop
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, enabled, handlePinDrop]);

  if (!notification) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
      <div
        className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-card-hover border ${
          notification.type === "pin-dropped"
            ? "bg-brand-forest/10 border-brand-forest/20 text-brand-forest"
            : "bg-brand-coral/10 border-brand-coral/20 text-brand-coral"
        }`}
      >
        <span className="text-xl">
          {notification.type === "pin-dropped" ? "📍" : "⚠️"}
        </span>
        <div>
          <p className="text-sm font-semibold">{notification.message}</p>
          {notification.type === "pin-dropped" && (
            <button
              onClick={() => window.location.reload()}
              className="text-xs font-semibold underline opacity-70 hover:opacity-100"
            >
              Tap to refresh
            </button>
          )}
        </div>
        <button
          onClick={() => setNotification(null)}
          className="ml-2 opacity-50 hover:opacity-100 transition-opacity"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
