"use client";

import { useState } from "react";

interface PinDropSendModalProps {
  orderId: string;
  recipientName: string;
  recipientPhone?: string;
  onSent?: () => void;
}

export default function PinDropSendModal({
  orderId,
  recipientName,
  recipientPhone,
  onSent,
}: PinDropSendModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  const fetchPinDropLink = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/pin-drop/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate link.");
        return null;
      }

      return data;
    } catch {
      setError("Something went wrong.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = async () => {
    const data = await fetchPinDropLink();
    if (!data) return;

    if (data.whatsappUrl) {
      window.open(data.whatsappUrl, "_blank");
    }
    setSent(true);
    onSent?.();
  };

  const handleCopyLink = async () => {
    const data = await fetchPinDropLink();
    if (!data) return;

    try {
      await navigator.clipboard?.writeText(data.pinDropUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setSent(true);
      onSent?.();
    } catch {
      // Fallback: show the URL for manual copy
      setError(`Copy this link: ${data.pinDropUrl}`);
    }
  };

  if (sent) {
    return (
      <div className="bg-brand/5 border border-brand/10 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">✅</span>
          <div>
            <p className="text-xs font-semibold">Link ready</p>
            <p className="text-xs text-brand-muted">
              {recipientName} can now drop their delivery pin.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-surface-border rounded-2xl p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Send pin-drop link</h3>
        <p className="text-xs text-brand-muted mt-1">
          Choose how to send the location link to {recipientName}.
        </p>
      </div>

      <div className="space-y-2">
        {/* WhatsApp */}
        <button
          onClick={handleWhatsApp}
          disabled={loading}
          className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-surface-border hover:border-[#25D366] hover:bg-[#25D366]/5 transition-all text-left disabled:opacity-50"
        >
          <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">WhatsApp</p>
            <p className="text-xs text-brand-muted">
              Open WhatsApp with pre-filled message
            </p>
          </div>
          <svg className="w-4 h-4 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          disabled={loading}
          className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-surface-border hover:border-brand/30 hover:bg-brand/5 transition-all text-left disabled:opacity-50"
        >
          <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">
              {copied ? "Copied!" : "Copy link"}
            </p>
            <p className="text-xs text-brand-muted">
              Copy the pin-drop URL to share anywhere
            </p>
          </div>
          {copied ? (
            <svg className="w-4 h-4 text-brand-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>

        {/* SMS (placeholder) */}
        <div className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-surface-border opacity-50 cursor-not-allowed">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">SMS</p>
            <p className="text-xs text-brand-muted">Coming soon</p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-2">
          <div className="w-4 h-4 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
          <span className="text-xs text-brand-muted">Generating link...</span>
        </div>
      )}

      {error && (
        <p className="text-xs text-brand-coral text-center">{error}</p>
      )}
    </div>
  );
}
