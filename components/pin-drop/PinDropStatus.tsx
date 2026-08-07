"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const PinPreviewMap = dynamic(() => import("./PinPreviewMap"), { ssr: false });

interface PinDropStatusProps {
  orderId: string;
  recipientName: string;
  deliveryLat: number | null;
  deliveryLng: number | null;
  deliveryLandmark: string | null;
  deliveryTimeWindow: string | null;
  pinDropToken: string | null;
  pinRequested: boolean;
}

const TIME_LABELS: Record<string, string> = {
  morning: "8 AM – 12 PM",
  afternoon: "12 PM – 4 PM",
  evening: "4 PM – 7 PM",
};

export default function PinDropStatus({
  recipientName,
  deliveryLat,
  deliveryLng,
  deliveryLandmark,
  deliveryTimeWindow,
  pinRequested,
}: PinDropStatusProps) {
  const [showMap, setShowMap] = useState(false);

  const hasPin = deliveryLat !== null && deliveryLng !== null;

  if (!pinRequested) return null;

  return (
    <div className="bg-white rounded-2xl border border-surface-border overflow-hidden">
      {/* Header */}
      <div className={`px-5 py-4 ${hasPin ? "bg-brand-forest/5 border-b border-brand-forest/10" : "bg-brand/5 border-b border-brand/10"}`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{hasPin ? "✅" : "📍"}</span>
          <div>
            <p className="text-sm font-semibold">
              {hasPin ? "Pin dropped" : "Waiting for pin"}
            </p>
            <p className="text-xs text-brand-muted">
              {hasPin
                ? `${recipientName} has shared their delivery location.`
                : `${recipientName} hasn't dropped their pin yet.`}
            </p>
          </div>
        </div>
      </div>

      {/* Pin details */}
      {hasPin && (
        <div className="px-5 py-4 space-y-3">
          {/* Landmark */}
          {deliveryLandmark && (
            <div className="flex items-start gap-3">
              <svg className="w-4 h-4 text-brand mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p className="text-xs text-brand-muted">Landmark</p>
                <p className="text-sm font-medium">{deliveryLandmark}</p>
              </div>
            </div>
          )}

          {/* Time window */}
          {deliveryTimeWindow && (
            <div className="flex items-start gap-3">
              <svg className="w-4 h-4 text-brand mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-xs text-brand-muted">Preferred time</p>
                <p className="text-sm font-medium">
                  {deliveryTimeWindow.charAt(0).toUpperCase() + deliveryTimeWindow.slice(1)}
                  {TIME_LABELS[deliveryTimeWindow] && ` (${TIME_LABELS[deliveryTimeWindow]})`}
                </p>
              </div>
            </div>
          )}

          {/* Coordinates */}
          <div className="flex items-start gap-3">
            <svg className="w-4 h-4 text-brand mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <div>
              <p className="text-xs text-brand-muted">Coordinates</p>
              <p className="text-sm font-medium">
                {deliveryLat.toFixed(6)}, {deliveryLng.toFixed(6)}
              </p>
            </div>
          </div>

          {/* Map toggle */}
          <button
            onClick={() => setShowMap(!showMap)}
            className="w-full mt-2 py-2.5 bg-gray-50 hover:bg-gray-100 border border-surface-border rounded-xl text-xs font-semibold text-brand transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            {showMap ? "Hide map" : "View on map"}
          </button>

          {/* Map preview */}
          {showMap && (
            <div className="rounded-xl overflow-hidden border border-surface-border h-48">
              <PinPreviewMap lat={deliveryLat} lng={deliveryLng} />
            </div>
          )}
        </div>
      )}

      {/* Waiting state */}
      {!hasPin && (
        <div className="px-5 py-4">
          <div className="bg-brand/5 rounded-xl p-4 text-center">
            <p className="text-xs text-brand-muted mb-2">
              The pin-drop link has been sent. Waiting for {recipientName} to share their location.
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-brand/40 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-brand">Waiting...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
