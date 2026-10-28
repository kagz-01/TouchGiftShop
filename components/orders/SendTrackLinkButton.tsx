"use client";

import { useState, useEffect } from "react";
import { MessageCircle, CheckCircle2, Share2, Loader2, Copy, Check, Phone, AlertCircle, RefreshCw } from "lucide-react";
import { validatePhone, getWhatsAppPhone, formatPhoneDisplay } from "@/lib/phone";

interface SendTrackLinkButtonProps {
  orderId: string;
  recipientPhone: string;
  recipientName: string;
}

export default function SendTrackLinkButton({
  orderId,
  recipientPhone: initialPhone,
  recipientName,
}: SendTrackLinkButtonProps) {
  const [phone, setPhone] = useState(initialPhone || "");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [trackUrl, setTrackUrl] = useState("");
  const [error, setError] = useState("");

  // Live phone validation
  const validation = validatePhone(phone);

  const getOrCreateTrackUrl = async (): Promise<string | null> => {
    if (!validation.isValid) {
      setError(validation.error || "Please enter a valid phone number");
      return null;
    }

    try {
      const tokenRes = await fetch(`/api/orders/${orderId}/recipient`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientPhone: validation.normalized, purpose: "track" }),
      });

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok) {
        setError(tokenData.error || "Failed to generate tracking link");
        return null;
      }

      const baseUrl = window.location.origin;
      const url = `${baseUrl}/track/${orderId}?token=${tokenData.token}`;
      setTrackUrl(url);
      return url;
    } catch {
      setError("Network error while generating link");
      return null;
    }
  };

  const handleSendWhatsApp = async () => {
    setError("");
    setSending(true);

    const url = await getOrCreateTrackUrl();
    setSending(false);

    if (!url) return;

    const waPhone = getWhatsAppPhone(phone);
    const message = encodeURIComponent(
      `Hey ${recipientName}! 🎁\n\nSomeone sent you a surprise gift on TouchGift!\n\nTrack your gift status here:\n${url}\n\nYou can see when it is being hand-wrapped and out for delivery with our courier. 🎀`
    );

    const whatsappUrl = `https://wa.me/${waPhone}?text=${message}`;
    window.open(whatsappUrl, "_blank");
    setSent(true);
  };

  const handleCopy = async () => {
    setError("");
    setSending(true);

    let url = trackUrl;
    if (!url) {
      url = (await getOrCreateTrackUrl()) || "";
    }
    setSending(false);

    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setSent(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setError(`Copy link manually: ${url}`);
    }
  };

  const handleNativeShare = async () => {
    setError("");
    setSending(true);
    let url = trackUrl;
    if (!url) {
      url = (await getOrCreateTrackUrl()) || "";
    }
    setSending(false);

    if (!url || typeof navigator === "undefined" || !navigator.share) return;

    try {
      await navigator.share({
        title: `Gift for ${recipientName} — TouchGift`,
        text: `Track your surprise gift from TouchGift:`,
        url,
      });
      setSent(true);
    } catch {
      // User dismissed share sheet
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-brand/10 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand/10 rounded-2xl flex items-center justify-center flex-shrink-0 text-brand">
            <Share2 className="w-5 h-5 text-brand" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-brand-deep">
              Send Tracking Link to Recipient
            </h3>
            <p className="text-xs text-brand-muted mt-0.5">
              Let {recipientName} track their surprise on WhatsApp or SMS
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-600 leading-relaxed">
        They will see package photos and live delivery updates, but the <strong className="text-brand-deep font-semibold">gift price</strong> and <strong className="text-brand-deep font-semibold">sender details (if anonymous)</strong> remain completely hidden.
      </p>

      {/* Editable Phone Input & Validation Box */}
      <div className="space-y-1.5 pt-1">
        <label className="text-[11px] font-bold text-brand-deep uppercase tracking-wider flex items-center justify-between">
          <span>Recipient WhatsApp / Phone Number</span>
          {phone && (
            <span className={`text-[10px] font-semibold flex items-center gap-1 ${
              validation.isValid ? "text-emerald-600" : "text-amber-600"
            }`}>
              {validation.isValid ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Valid Number
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 text-amber-600" />
                  Check Digits
                </>
              )}
            </span>
          )}
        </label>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-muted">
            <Phone className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setError("");
            }}
            placeholder="e.g. 0712 345 678 or +254..."
            className={`w-full bg-gray-50 border rounded-xl pl-10 pr-4 py-2.5 text-xs text-brand-deep font-mono transition-all focus:outline-none focus:bg-white ${
              phone && !validation.isValid
                ? "border-amber-300 focus:border-amber-500 ring-2 ring-amber-100"
                : phone && validation.isValid
                ? "border-emerald-300 focus:border-emerald-500 ring-2 ring-emerald-100"
                : "border-black/10 focus:border-brand"
            }`}
          />
        </div>

        {phone && !validation.isValid && validation.error && (
          <p className="text-[11px] text-amber-700 font-medium pt-0.5">
            {validation.error}
          </p>
        )}

        {phone && validation.isValid && (
          <p className="text-[11px] text-emerald-700 font-medium pt-0.5 flex items-center gap-1">
            <span>Formatted for WhatsApp:</span>
            <span className="font-mono font-bold">{validation.display}</span>
          </p>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        <button
          type="button"
          onClick={handleSendWhatsApp}
          disabled={sending || (phone.length > 0 && !validation.isValid)}
          className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#1fb855] text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Preparing Link...
            </>
          ) : (
            <>
              <MessageCircle className="w-4 h-4" />
              Send via WhatsApp
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleCopy}
          disabled={sending || (phone.length > 0 && !validation.isValid)}
          className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700">Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-gray-600" />
              Copy Tracking Link
            </>
          )}
        </button>
      </div>

      {/* Sent Confirmation Pill */}
      {sent && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Tracking link ready! Recipient can now follow gift progress.</span>
          </div>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Resend
          </button>
        </div>
      )}
    </div>
  );
}
