"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const PinMap = dynamic(() => import("./PinMap"), { ssr: false });

const TIME_WINDOWS = [
  { id: "morning", label: "Morning", desc: "8 AM – 12 PM", emoji: "🌅" },
  { id: "afternoon", label: "Afternoon", desc: "12 PM – 4 PM", emoji: "☀️" },
  { id: "evening", label: "Evening", desc: "4 PM – 7 PM", emoji: "🌆" },
];

interface PinDropPageProps {
  orderId: string;
  token: string;
}

export default function PinDropClient({ orderId, token }: PinDropPageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [alreadyPinned, setAlreadyPinned] = useState(false);

  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [landmark, setLandmark] = useState("");
  const [timeWindow, setTimeWindow] = useState("");
  const [step, setStep] = useState<"map" | "time" | "done">("map");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/pin-drop/${orderId}?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setRecipientName(data.recipientName);
          if (data.alreadyPinned) {
            setAlreadyPinned(true);
            setSelectedCoords({ lat: data.deliveryLat, lng: data.deliveryLng });
            setLandmark(data.deliveryLandmark || "");
            setTimeWindow(data.deliveryTimeWindow || "");
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Something went wrong. Please try the link again.");
        setLoading(false);
      });
  }, [orderId, token]);

  const handleSubmit = async () => {
    if (!selectedCoords || !timeWindow) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/pin-drop/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          lat: selectedCoords.lat,
          lng: selectedCoords.lng,
          landmark,
          timeWindow,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setStep("done");
      } else {
        setError("Failed to save. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-brand-muted">Loading your gift...</p>
        </div>
      </div>
    );
  }

  if (error && !recipientName) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <span className="text-5xl block mb-4">😔</span>
          <p className="font-display text-xl font-semibold mb-2">Link not valid</p>
          <p className="text-sm text-brand-muted">{error}</p>
        </div>
      </div>
    );
  }

  if (success || alreadyPinned) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center px-4">
        <div className="text-center max-w-sm animate-pop">
          <span className="text-6xl block mb-4">📍</span>
          <h1 className="font-display text-2xl font-bold mb-2">
            {alreadyPinned ? "You already dropped your pin!" : "Pin dropped!"}
          </h1>
          <p className="text-brand-muted mb-6">
            {alreadyPinned
              ? `Your delivery location is set. Expected window: ${timeWindow}`
              : `Thanks ${recipientName}! Your gift is on its way.`}
          </p>
          <div className="bg-white rounded-2xl p-5 border border-surface-border space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-brand-muted">Location</span>
              <span className="font-medium">{landmark || "Pin on map"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Time window</span>
              <span className="font-medium">{timeWindow}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-warm flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-surface-border px-4 py-4 safe-area-top">
        <div className="max-w-lg mx-auto">
          <span className="text-2xl block mb-1">🎁</span>
          <h1 className="font-display text-lg font-bold">
            Hey {recipientName}!
          </h1>
          <p className="text-xs text-brand-muted">
            Someone sent you a gift. Drop your pin so we can deliver it to you.
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="bg-white border-b border-surface-border px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-center gap-3">
          {["map", "time"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s || (step === "done" && i < 2)
                  ? "bg-brand text-white"
                  : "bg-gray-200 text-brand-muted"
              }`}>
                {step === "done" && i < 2 ? "✓" : i + 1}
              </div>
              <span className={`text-xs font-medium ${step === s ? "text-brand" : "text-brand-muted"}`}>
                {i === 0 ? "Location" : "Time"}
              </span>
              {i < 1 && <div className={`w-8 h-0.5 ${step === "time" || step === "done" ? "bg-brand" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Map step */}
      {step === "map" && (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative">
            <PinMap
              onPinDrop={(lat, lng) => setSelectedCoords({ lat, lng })}
              initialPosition={selectedCoords}
            />
          </div>

          {/* Landmark input */}
          <div className="bg-white border-t border-surface-border px-4 py-4">
            <div className="max-w-lg mx-auto space-y-3">
              <div>
                <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
                  Nearby landmark (optional)
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near Shell Karen, blue gate"
                  className="w-full bg-gray-50 border border-surface-border rounded-xl px-4 py-3 text-sm mt-1 focus:outline-none focus:border-brand"
                />
              </div>
              <button
                onClick={() => selectedCoords && setStep("time")}
                disabled={!selectedCoords}
                className="w-full py-3 bg-brand text-white rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedCoords ? "Next — Pick time" : "Tap the map to drop your pin"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time step */}
      {step === "time" && (
        <div className="flex-1 bg-white">
          <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
            <div>
              <h2 className="font-display text-lg font-bold mb-1">When should we deliver?</h2>
              <p className="text-xs text-brand-muted">Pick a time window that works for you.</p>
            </div>

            <div className="space-y-3">
              {TIME_WINDOWS.map((tw) => (
                <button
                  key={tw.id}
                  onClick={() => setTimeWindow(tw.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                    timeWindow === tw.id
                      ? "border-brand bg-brand/5 shadow-ribbon"
                      : "border-surface-border hover:border-brand/30"
                  }`}
                >
                  <span className="text-2xl">{tw.emoji}</span>
                  <div>
                    <p className="font-semibold text-sm">{tw.label}</p>
                    <p className="text-xs text-brand-muted">{tw.desc}</p>
                  </div>
                  {timeWindow === tw.id && (
                    <div className="ml-auto w-6 h-6 rounded-full bg-brand flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {error && (
              <p className="text-sm text-brand-coral text-center">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep("map")}
                className="px-4 py-3 bg-gray-100 text-brand-muted rounded-xl font-semibold text-sm"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!timeWindow || submitting}
                className="flex-1 py-3 bg-gradient-to-r from-gold to-gold-light text-brand-deep rounded-xl font-semibold text-sm disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-brand-deep/30 border-t-brand-deep rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  "Confirm my pin 📍"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
