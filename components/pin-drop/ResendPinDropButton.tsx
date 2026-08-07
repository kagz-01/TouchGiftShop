"use client";

import { useState } from "react";

interface ResendPinDropButtonProps {
  orderId: string;
  recipientName: string;
}

export default function ResendPinDropButton({
  orderId,
  recipientName,
}: ResendPinDropButtonProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleResend = async () => {
    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/pin-drop/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send link.");
        return;
      }

      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, "_blank");
      }
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-brand/5 border border-brand/10 rounded-2xl p-4 flex items-center gap-3">
        <span className="text-xl">✅</span>
        <div>
          <p className="text-xs font-semibold">Link resent</p>
          <p className="text-xs text-brand-muted">
            WhatsApp opened — tap send to deliver the pin-drop link to{" "}
            {recipientName}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand/5 border border-brand/10 rounded-2xl p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xl">📍</span>
          <div>
            <p className="text-xs font-semibold">Pin drop link sent</p>
            <p className="text-xs text-brand-muted">
              {recipientName} has been sent a link to drop their delivery pin.
            </p>
          </div>
        </div>
        <button
          onClick={handleResend}
          disabled={sending}
          className="shrink-0 px-3 py-1.5 text-xs font-semibold text-brand border border-brand/20 rounded-lg hover:bg-brand/5 transition-colors disabled:opacity-50"
        >
          {sending ? (
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
              Sending...
            </span>
          ) : (
            "Resend"
          )}
        </button>
      </div>
      {error && (
        <p className="text-xs text-brand-coral mt-2">{error}</p>
      )}
    </div>
  );
}
