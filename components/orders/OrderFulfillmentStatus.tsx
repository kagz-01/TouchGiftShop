"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Package, 
  Gift, 
  Truck, 
  CheckCircle2, 
  MessageCircle, 
  Phone, 
  MapPin, 
  ExternalLink,
  Sparkles,
  Clock,
  Navigation
} from "lucide-react";

interface OrderFulfillmentStatusProps {
  orderId: string;
  status: string;
  recipientName: string;
  recipientPhone: string;
  trackToken?: string | null;
  riderToken?: string | null;
  deliveryLandmark?: string | null;
  deliveryTimeWindow?: string | null;
}

export default function OrderFulfillmentStatus({
  orderId,
  status,
  recipientName,
  recipientPhone,
  trackToken,
  riderToken,
  deliveryLandmark,
  deliveryTimeWindow,
}: OrderFulfillmentStatusProps) {
  const shortId = orderId.slice(0, 8);
  
  // Clean phone number for WhatsApp
  const shopPhone = "254183172111";
  const whatsappCoordinationMsg = encodeURIComponent(
    `Hi TouchGift! Regarding my Order #${shortId} for ${recipientName} (ID: ${orderId}): I would like to coordinate delivery / arrange my own rider pickup.`
  );
  const whatsappUrl = `https://wa.me/${shopPhone}?text=${whatsappCoordinationMsg}`;

  // Live tracking URL if dispatched and trackToken exists
  const liveTrackingUrl = trackToken ? `/track/${orderId}/live?token=${trackToken}` : null;

  return (
    <div className="space-y-4">
      {/* ── Status Fulfillment Card ── */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-brand/10 shadow-sm transition-all">
        {/* Status Header */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-black/5">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              {status !== "delivered" && status !== "failed" && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${
                status === "delivered" ? "bg-emerald-500" :
                status === "failed" ? "bg-red-500" :
                "bg-emerald-500"
              }`} />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-deep">
              Fulfillment Status
            </span>
          </div>

          <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
            status === "delivered"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : status === "dispatched"
              ? "bg-amber-50 text-amber-700 border border-amber-200"
              : "bg-brand/5 text-brand border border-brand/15"
          }`}>
            {status === "processing" ? "In Preparation" :
             status === "wrapped" ? "Ready for Courier" :
             status === "dispatched" ? "Out for Delivery" :
             status === "delivered" ? "Delivered" :
             status.replace("_", " ")}
          </span>
        </div>

        {/* Dynamic Status Details */}
        {status === "processing" && (
          <div className="space-y-3">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5 text-brand" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900">
                  Curation & Luxury Packaging
                </h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Our Nairobi concierges are preparing, inspecting, and ribbon-wrapping your gift. Once sealed and ready, our dispatch team assigns a courier for delivery.
                </p>
              </div>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-3.5 text-xs text-amber-900 flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Courier assignment is handled automatically by our operations desk upon wrapping.</span>
            </div>
          </div>
        )}

        {status === "wrapped" && (
          <div className="space-y-3">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0 mt-0.5">
                <Gift className="w-5 h-5 text-brand" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900">
                  Wrapped & Staged for Pickup
                </h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Your gift is hand-wrapped in our signature packaging and staged at our fulfillment hub. A dedicated courier is being dispatched.
                </p>
              </div>
            </div>
          </div>
        )}

        {status === "dispatched" && (
          <div className="space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Truck className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900">
                  On the Road — Rider En Route!
                </h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  A rider has been assigned and is heading towards {recipientName}. You can track their progress live on the map.
                </p>
              </div>
            </div>

            {liveTrackingUrl && (
              <Link
                href={liveTrackingUrl}
                className="w-full py-3 px-4 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Navigation className="w-4 h-4" />
                Track Courier on Live Map
                <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
              </Link>
            )}
          </div>
        )}

        {status === "delivered" && (
          <div className="space-y-3">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900">
                  Delivered with Care 🎉
                </h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  This gift was safely handed over to {recipientName}. Thank you for gifting with TouchGift!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Concierge & Self-Rider Coordination Card ── */}
      {status !== "delivered" && status !== "failed" && (
        <div className="bg-gradient-to-br from-brand/5 via-white to-gold/5 rounded-3xl p-5 border border-brand/15 shadow-sm space-y-3.5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-brand-deep flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-brand" />
                Sending Your Own Rider or Prefer Pickup?
              </p>
              <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                Want to send your personal courier (Uber Package, Bolt, Fargo) or pick up directly from our hub? Connect directly with our dispatch concierge.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#25D366] hover:bg-[#1fb855] text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </a>

            <a
              href={`tel:+${shopPhone}`}
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-gray-600" />
              Call Dispatch Hub
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

