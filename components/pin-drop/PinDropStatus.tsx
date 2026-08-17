"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Navigation, Clock, CheckCircle, Map } from "lucide-react";

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
    <div className="bg-white rounded-3xl border border-black/6 shadow-sm overflow-hidden">
      {/* Header */}
      <div className={`px-5 py-4 ${hasPin ? "bg-green-50 border-b border-green-100" : "bg-brand/5 border-b border-brand/10"}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${hasPin ? "bg-green-100" : "bg-brand/10"}`}>
            {hasPin ? <CheckCircle className="w-5 h-5 text-green-600" /> : <MapPin className="w-5 h-5 text-brand" />}
          </div>
          <div>
            <p className="text-sm font-bold text-brand-deep">
              {hasPin ? "Pin dropped" : "Waiting for pin"}
            </p>
            <p className="text-xs text-brand-muted mt-0.5">
              {hasPin
                ? `${recipientName} has shared their delivery location.`
                : `${recipientName} hasn't dropped their pin yet.`}
            </p>
          </div>
        </div>
      </div>

      {/* Pin details */}
      {hasPin && (
        <div className="px-5 py-5 space-y-4">
          {/* Landmark */}
          {deliveryLandmark && (
            <div className="flex items-start gap-3">
              <Navigation className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">Landmark</p>
                <p className="text-sm font-medium text-brand-deep mt-0.5">{deliveryLandmark}</p>
              </div>
            </div>
          )}

          {/* Time window */}
          {deliveryTimeWindow && (
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">Preferred time</p>
                <p className="text-sm font-medium text-brand-deep mt-0.5">
                  {deliveryTimeWindow.charAt(0).toUpperCase() + deliveryTimeWindow.slice(1)}
                  {TIME_LABELS[deliveryTimeWindow] && ` (${TIME_LABELS[deliveryTimeWindow]})`}
                </p>
              </div>
            </div>
          )}

          {/* Coordinates */}
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">Coordinates</p>
              <p className="text-sm font-medium text-brand-deep mt-0.5">
                {deliveryLat.toFixed(6)}, {deliveryLng.toFixed(6)}
              </p>
            </div>
          </div>

          {/* Map toggle */}
          <button
            onClick={() => setShowMap(!showMap)}
            className="w-full mt-2 py-3 bg-gray-50 hover:bg-gray-100 border border-black/5 rounded-xl text-xs font-bold text-brand-deep transition-all flex items-center justify-center gap-2"
          >
            <Map className="w-4 h-4" />
            {showMap ? "Hide map" : "View on map"}
          </button>

          {/* Map preview */}
          {showMap && (
            <div className="rounded-xl overflow-hidden border border-black/5 h-48 shadow-sm">
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
