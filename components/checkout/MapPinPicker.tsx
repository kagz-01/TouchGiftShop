"use client";

import { useState } from "react";
import { MapPin, CheckCircle2 } from "lucide-react";

interface MapPinPickerProps {
  recipientPhone?: string;
  recipientName?: string;
  onPinDropToggle?: (enabled: boolean) => void;
}

export default function MapPinPicker({
  recipientPhone,
  recipientName,
  onPinDropToggle,
}: MapPinPickerProps) {
  const [usePinDrop, setUsePinDrop] = useState(false);

  const handleToggle = (checked: boolean) => {
    setUsePinDrop(checked);
    onPinDropToggle?.(checked);
  };

  return (
    <div className="space-y-3">
      {/* Toggle card */}
      <label
        className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
          usePinDrop
            ? "border-brand bg-brand/4 shadow-sm"
            : "border-black/8 hover:border-brand/30 bg-gray-50"
        }`}
      >
        {/* Custom checkbox */}
        <div
          className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
            usePinDrop ? "border-brand bg-brand" : "border-black/15 bg-white"
          }`}
        >
          {usePinDrop && <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
        </div>
        <input
          type="checkbox"
          checked={usePinDrop}
          onChange={(e) => handleToggle(e.target.checked)}
          className="sr-only"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className={`w-4 h-4 flex-shrink-0 ${usePinDrop ? "text-brand" : "text-brand-muted"}`} />
            <p className={`text-sm font-semibold ${usePinDrop ? "text-brand" : "text-brand-deep"}`}>
              I don&apos;t know their exact location
            </p>
          </div>
          <p className="text-xs text-brand-muted leading-relaxed">
            We&apos;ll WhatsApp them a secure link to drop their own delivery pin — no address, no awkwardness.
          </p>
        </div>
      </label>

      {/* Confirmation when toggled on */}
      {usePinDrop && (
        <div className="bg-brand/5 border border-brand/15 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 bg-brand/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
            <MapPin className="w-4 h-4 text-brand" />
          </div>
          <div>
            <p className="text-xs font-semibold text-brand-deep mb-0.5">Pin drop link will be sent after payment</p>
            <p className="text-[11px] text-brand-muted leading-relaxed">
              {recipientName
                ? `${recipientName} will receive a WhatsApp message with a map link to drop their delivery pin.`
                : "The recipient will receive a WhatsApp message with a map link to drop their delivery pin."}
              {" "}No price or sender info is shown.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
