"use client";

import { useState } from "react";

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
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleToggle = async (checked: boolean) => {
    setUsePinDrop(checked);
    onPinDropToggle?.(checked);

    if (checked && recipientPhone && recipientName) {
      setSending(true);
      setError("");

      try {
        const res = await fetch("/api/pin-drop/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // orderId will be set after order creation; for now we just show the flow
            // The actual send happens after payment confirmation
          }),
        });
        // We just show the UI — actual sending happens after order is created
        setSending(false);
      } catch {
        setSending(false);
      }
    }
  };

  return (
    <div className="space-y-3">
      <label className="flex items-start gap-3 p-4 rounded-2xl border-2 border-surface-border hover:border-brand/30 cursor-pointer transition-all has-[:checked]:border-brand has-[:checked]:bg-brand/5">
        <input
          type="checkbox"
          checked={usePinDrop}
          onChange={(e) => handleToggle(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand"
        />
        <div className="flex-1">
          <p className="text-sm font-semibold flex items-center gap-2">
            <span className="text-lg">📍</span>
            I don&apos;t know their exact location
          </p>
          <p className="text-xs text-brand-muted mt-1">
            We&apos;ll send them a link to drop their own delivery pin. They choose
            the exact spot and a time window — no price shown.
          </p>
        </div>
      </label>

      {usePinDrop && (
        <div className="bg-brand/5 border border-brand/20 rounded-2xl p-4 space-y-2 animate-fade-in">
          <div className="flex items-center gap-2">
            {sent ? (
              <span className="text-brand-forest">✓</span>
            ) : sending ? (
              <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="text-brand">📨</span>
            )}
            <p className="text-xs font-medium">
              {sent
                ? "Link will be sent after payment"
                : sending
                ? "Preparing link..."
                : "Link will be sent to recipient after payment"}
            </p>
          </div>
          <p className="text-[11px] text-brand-muted">
            {recipientName
              ? `${recipientName} will receive a WhatsApp message with a map link.`
              : "The recipient will receive a WhatsApp message with a map link."}
          </p>
          {error && (
            <p className="text-xs text-brand-coral">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
