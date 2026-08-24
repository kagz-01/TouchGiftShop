"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Play, Square, Navigation, CheckCircle2 } from "lucide-react";

export default function RiderLocationPage() {
  const [orderId, setOrderId] = useState("");
  const [token, setToken] = useState("");
  const [sharing, setSharing] = useState(false);
  const [lastSent, setLastSent] = useState<Date | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const watchIdRef = useRef<number | null>(null);

  const startSharing = () => {
    if (!orderId.trim() || !token.trim()) {
      setError("Enter order ID and your rider token");
      return;
    }

    if (!navigator.geolocation) {
      setError("Geolocation not supported on this device");
      return;
    }

    setError("");
    setSuccess("");
    setSharing(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch("/api/tracking/rider-location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: orderId.trim(),
              lat: latitude,
              lng: longitude,
              token: token.trim(),
            }),
          });

          if (res.ok) {
            setLastSent(new Date());
            setSuccess(`Location sent: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
          } else {
            const data = await res.json();
            setError(data.error || "Failed to send location");
          }
        } catch {
          setError("Network error — location not sent");
        }
      },
      (err) => {
        setError(`Location error: ${err.message}`);
        setSharing(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 5_000,
      }
    );
  };

  const stopSharing = () => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setSharing(false);
    setSuccess("Location sharing stopped");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center">
          <span className="text-4xl block mb-3">🛵</span>
          <h1 className="font-display text-xl font-bold text-brand-deep">
            Rider Location Sharing
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            Share your GPS so the customer can see you on the map
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl border border-surface-border p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
              Order ID
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
              disabled={sharing}
              className="w-full bg-gray-50 border border-surface-border rounded-xl px-4 py-3 text-sm mt-1 focus:outline-none focus:border-brand disabled:opacity-50"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
              Rider Token
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Your rider authentication token"
              disabled={sharing}
              className="w-full bg-gray-50 border border-surface-border rounded-xl px-4 py-3 text-sm mt-1 focus:outline-none focus:border-brand disabled:opacity-50"
            />
          </div>

          {/* Status */}
          {sharing && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                <p className="text-sm font-bold text-blue-800">Sharing location</p>
              </div>
              {lastSent && (
                <p className="text-xs text-blue-600">
                  Last sent: {lastSent.toLocaleTimeString("en-KE")}
                </p>
              )}
              {success && (
                <p className="text-xs text-blue-600">{success}</p>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>
          )}

          {/* Buttons */}
          {!sharing ? (
            <button
              onClick={startSharing}
              className="w-full flex items-center justify-center gap-2 py-3 bg-brand text-white rounded-xl font-semibold text-sm hover:bg-brand-deep transition-colors"
            >
              <Play className="w-4 h-4" />
              Start Sharing Location
            </button>
          ) : (
            <button
              onClick={stopSharing}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-500 text-white rounded-xl font-semibold text-sm hover:bg-red-600 transition-colors"
            >
              <Square className="w-4 h-4" />
              Stop Sharing
            </button>
          )}
        </div>

        {/* Info */}
        <div className="text-center text-xs text-brand-muted space-y-1">
          <p>Your GPS updates are sent every 5 seconds</p>
          <p>The customer sees your position on their tracking page</p>
        </div>
      </div>
    </div>
  );
}
