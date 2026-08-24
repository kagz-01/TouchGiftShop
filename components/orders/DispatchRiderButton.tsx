"use client";

import { useState } from "react";
import { Truck, Copy, CheckCircle2, Share2, ExternalLink } from "lucide-react";

interface DispatchRiderButtonProps {
  orderId: string;
  currentStatus: string;
}

export default function DispatchRiderButton({
  orderId,
  currentStatus,
}: DispatchRiderButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [riderUrl, setRiderUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [dispatched, setDispatched] = useState(false);

  const isDispatchable = ["processing", "wrapped", "pending_payment"].includes(currentStatus);

  if (!isDispatchable && !dispatched) return null;

  const handleDispatch = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/orders/${orderId}/dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminKey: "" }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to dispatch");
        return;
      }

      setRiderUrl(data.riderUrl);
      setDispatched(true);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(riderUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(`Copy this link: ${riderUrl}`);
    }
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `🛵 Delivery time!\n\nOpen this link to start sharing your GPS location:\n\n${riderUrl}\n\nThe customer will see you on the map in real-time.`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  // After dispatch — show the rider link
  if (dispatched && riderUrl) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-3xl p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Truck className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-blue-800">Rider link ready</p>
            <p className="text-xs text-blue-600">Share with the delivery rider</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleWhatsApp}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#25D366] text-white rounded-xl text-xs font-bold hover:bg-[#1fb855] transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            Send via WhatsApp
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white border border-blue-200 rounded-xl text-xs font-bold text-blue-700 hover:bg-blue-50 transition-colors"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    );
  }

  // Before dispatch — show the dispatch button
  return (
    <div className="space-y-2">
      <button
        onClick={handleDispatch}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-2xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Dispatching...
          </span>
        ) : (
          <>
            <Truck className="w-4 h-4" />
            Assign Rider & Dispatch
          </>
        )}
      </button>
      {error && (
        <p className="text-xs text-red-600 text-center">{error}</p>
      )}
    </div>
  );
}
