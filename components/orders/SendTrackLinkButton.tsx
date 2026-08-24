"use client";

import { useState } from "react";
import { MessageCircle, CheckCircle, Share2, Loader2 } from "lucide-react";


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
        body: JSON.stringify({ recipientPhone, purpose: "track" }),
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
      <div className="bg-[#25D366]/10 border border-[#25D366]/20 rounded-3xl p-5 flex items-start gap-4">
        <CheckCircle className="w-5 h-5 text-[#25D366] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-brand-deep">Tracking link sent!</p>
          <p className="text-xs text-brand-muted mt-1">
            {recipientName} can now track their gift status via WhatsApp.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-5 border border-black/6 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-brand/5 rounded-full flex items-center justify-center flex-shrink-0">
          <Share2 className="w-5 h-5 text-brand" />
        </div>
        <div>
          <p className="text-sm font-bold text-brand-deep">Send Tracking Link</p>
          <p className="text-xs text-brand-muted mt-0.5">Let {recipientName} track their gift</p>
        </div>
      </div>
      <p className="text-xs text-brand-muted mb-5 leading-relaxed">
        They will see the gift status and package photo, but the price and your identity (if anonymous) remain hidden.
      </p>
      
      {error && (
        <p className="text-xs text-red-600 mb-3 bg-red-50 p-2 rounded-lg font-medium">{error}</p>
      )}
      
      <button
        onClick={handleSend}
        disabled={sending}
        className="w-full py-3 bg-[#25D366] text-white rounded-xl text-sm font-bold shadow-sm hover:bg-[#1fb855] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
      >
        {sending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <MessageCircle className="w-4 h-4" />
            Send via WhatsApp
          </>
        )}
      </button>
    </div>
  );
}
