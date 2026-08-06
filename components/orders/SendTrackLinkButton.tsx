"use client";

import { useState } from "react";

interface SendTrackLinkButtonProps {
  orderId: string;
  recipientPhone: string;
  recipientName: string;
}

export default function SendTrackLinkButton({
  orderId,
  recipientPhone,
  recipientName,
}: SendTrackLinkButtonProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    setSending(true);
    setError("");

    try {
      // 1. Generate token
      const tokenRes = await fetch(`/api/orders/${orderId}/recipient`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientPhone }),
      });

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok) {
        setError(tokenData.error || "Failed to generate link");
        setSending(false);
        return;
      }

      const baseUrl = window.location.origin;
      const trackUrl = `${baseUrl}/track/${orderId}?token=${tokenData.token}`;

      // 2. Send via WhatsApp
      const message = encodeURIComponent(
        `Hey ${recipientName}! 🎁\n\nSomeone sent you a gift on TouchGift! Track your gift status here:\n\n${trackUrl}\n\nYou'll see when it's being prepared, wrapped, and out for delivery. 🎀`
      );
      const whatsappUrl = `https://wa.me/${recipientPhone.replace(/[^0-9]/g, "")}?text=${message}`;

      window.open(whatsappUrl, "_blank");
      setSent(true);
    } catch {
      setError("Something went wrong");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-brand-forest/5 border border-brand-forest/20 rounded-2xl p-4 flex items-center gap-3">
        <span className="text-xl">✅</span>
        <div>
          <p className="text-xs font-semibold text-brand-forest">Tracking link sent!</p>
          <p className="text-xs text-brand-muted">
            {recipientName} can now track their gift via WhatsApp.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-surface-border">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📱</span>
        <p className="text-sm font-semibold">Send tracking link to {recipientName}</p>
      </div>
      <p className="text-xs text-brand-muted mb-4">
        Let them track their gift status — without seeing the price or your identity (if anonymous mode is on).
      </p>
      {error && (
        <p className="text-xs text-brand-coral mb-3">{error}</p>
      )}
      <button
        onClick={handleSend}
        disabled={sending}
        className="w-full py-2.5 bg-[#25D366] text-white rounded-xl text-xs font-semibold hover:bg-[#1fb855] transition-colors disabled:opacity-50"
      >
        {sending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Sending...
          </span>
        ) : (
          "Send via WhatsApp"
        )}
      </button>
    </div>
  );
}
