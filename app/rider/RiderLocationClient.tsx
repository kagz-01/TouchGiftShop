"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Play, Square, Navigation, CheckCircle2, AlertTriangle, Smartphone, MapPin, Sparkles } from "lucide-react";

export default function RiderLocationClient() {
  const searchParams = useSearchParams();
  const urlOrderId = searchParams.get("orderId") || "";
  const urlToken = searchParams.get("token") || "";

  const [orderId, setOrderId] = useState(urlOrderId);
  const [token, setToken] = useState(urlToken);
  const [sharing, setSharing] = useState(false);
  const [lastSent, setLastSent] = useState<Date | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [orderDetails, setOrderDetails] = useState<{ recipientName?: string; landmark?: string } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const simIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Send coordinates to backend
  const postLocation = useCallback(async (id: string, tk: string, lat: number, lng: number) => {
    try {
      const res = await fetch("/api/tracking/rider-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: id,
          lat,
          lng,
          token: tk,
        }),
      });

      if (res.ok) {
        setCoords({ lat, lng });
        setLastSent(new Date());
        setSuccess(`Location sent: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        setError("");
        return true;
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update location");
        return false;
      }
    } catch {
      setError("Network connection issue — will retry in a moment");
      return false;
    }
  }, []);

  // Fetch delivery details for the rider
  useEffect(() => {
    if (urlOrderId && urlToken) {
      fetch(`/api/tracking/${urlOrderId}/live?token=${urlToken}`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.recipientName) {
            setOrderDetails({
              recipientName: data.recipientName,
              landmark: data.deliveryPin?.landmark || data.timeWindow || "Nairobi",
            });
          }
        })
        .catch(() => {});
    }
  }, [urlOrderId, urlToken]);

  // Start real GPS tracking with automatic fallback
  const startSharing = (oId?: string, tk?: string) => {
    const id = (oId || orderId).trim();
    const t = (tk || token).trim();

    if (!id || !t) {
      setError("Enter order ID and rider token");
      return;
    }

    if (typeof window === "undefined" || !navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      return;
    }

    setError("");
    setSuccess("");
    setSharing(true);
    setIsSimulating(false);

    const onPosition = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      postLocation(id, t, latitude, longitude);
    };

    const onError = (err: GeolocationPositionError) => {
      // If high-accuracy satellite failed (common on desktop/laptops or indoors), retry standard mode
      if (err.code === 2 || err.code === 3) {
        console.warn("High-accuracy GPS unavailable, falling back to standard positioning...");
        navigator.geolocation.getCurrentPosition(
          onPosition,
          (fallbackErr) => {
            setError(
              "GPS position unavailable on this device. For real delivery, open this link on a mobile phone (Android/iOS) with Location Services enabled."
            );
            setSharing(false);
          },
          { enableHighAccuracy: false, timeout: 15_000, maximumAge: 10_000 }
        );
      } else if (err.code === 1) {
        setError("Location permission denied. Please allow location access in your browser settings.");
        setSharing(false);
      } else {
        setError(`Location error: ${err.message}`);
        setSharing(false);
      }
    };

    // First attempt high accuracy
    watchIdRef.current = navigator.geolocation.watchPosition(
      onPosition,
      onError,
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
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    setSharing(false);
    setIsSimulating(false);
    setSuccess("Location sharing paused");
  };

  // Test simulation: sends simulated rider steps through Nairobi
  const startSimulation = () => {
    const id = orderId.trim();
    const t = token.trim();
    if (!id || !t) {
      setError("Enter order ID and token first");
      return;
    }

    stopSharing();
    setError("");
    setSharing(true);
    setIsSimulating(true);

    // Nairobi route coordinates (Westlands -> Parklands -> CBD)
    const route = [
      { lat: -1.2675, lng: 36.8120 },
      { lat: -1.2720, lng: 36.8150 },
      { lat: -1.2765, lng: 36.8185 },
      { lat: -1.2810, lng: 36.8210 },
      { lat: -1.2850, lng: 36.8235 },
      { lat: -1.2885, lng: 36.8250 },
      { lat: -1.2910, lng: 36.8240 },
    ];

    let step = 0;
    postLocation(id, t, route[0].lat, route[0].lng);

    simIntervalRef.current = setInterval(() => {
      step = (step + 1) % route.length;
      const current = route[step];
      postLocation(id, t, current.lat, current.lng);
    }, 4000);
  };

  // Auto-start on load if orderId & token are provided
  useEffect(() => {
    if (urlOrderId && urlToken) {
      setOrderId(urlOrderId);
      setToken(urlToken);
      startSharing(urlOrderId, urlToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlOrderId, urlToken]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FEFAF6] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-3xl bg-brand/10 text-brand flex items-center justify-center mx-auto mb-3 text-3xl shadow-sm">
            🛵
          </div>
          <h1 className="font-display text-2xl font-bold text-brand-deep">
            TouchGift Courier Portal
          </h1>
          <p className="text-xs text-brand-muted mt-1 max-w-xs mx-auto">
            Live GPS broadcast for order delivery
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-brand/10 shadow-sm p-6 space-y-4">
          {/* Order Details Preview */}
          {orderDetails?.recipientName && (
            <div className="bg-brand/5 border border-brand/10 rounded-2xl p-4 space-y-1">
              <p className="text-[10px] font-bold text-brand uppercase tracking-wider">
                Delivering Gift To
              </p>
              <p className="text-base font-bold text-brand-deep">
                {orderDetails.recipientName}
              </p>
              {orderDetails.landmark && (
                <p className="text-xs text-brand-muted flex items-center gap-1.5 pt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-brand" />
                  {orderDetails.landmark}
                </p>
              )}
            </div>
          )}

          {/* Inputs */}
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-brand-deep uppercase tracking-wider">
                Order ID
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Order UUID"
                disabled={sharing}
                className="w-full bg-gray-50 border border-black/10 rounded-xl px-3.5 py-2.5 text-xs font-mono mt-1 focus:outline-none focus:border-brand disabled:opacity-60"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-brand-deep uppercase tracking-wider">
                Rider Security Token
              </label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="••••••••"
                disabled={sharing}
                className="w-full bg-gray-50 border border-black/10 rounded-xl px-3.5 py-2.5 text-xs font-mono mt-1 focus:outline-none focus:border-brand disabled:opacity-60"
              />
            </div>
          </div>

          {/* Active Status Box */}
          {sharing && (
            <div className={`rounded-2xl p-4 border space-y-2 ${
              isSimulating 
                ? "bg-amber-50 border-amber-200 text-amber-900" 
                : "bg-emerald-50 border-emerald-200 text-emerald-900"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                  </span>
                  <p className="text-xs font-bold uppercase tracking-wider">
                    {isSimulating ? "Simulation Mode Active" : "Broadcasting Live GPS"}
                  </p>
                </div>
                {lastSent && (
                  <span className="text-[10px] opacity-75 font-mono">
                    {lastSent.toLocaleTimeString("en-KE")}
                  </span>
                )}
              </div>

              {coords && (
                <p className="text-xs font-mono">
                  Coordinates: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                </p>
              )}

              <p className="text-[11px] opacity-80 leading-relaxed">
                The customer can now see your moving icon on their live order tracking map.
              </p>
            </div>
          )}

          {/* Error Notice */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 text-xs text-red-700 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>Notice</span>
              </div>
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          {/* Main Controls */}
          <div className="pt-2 space-y-2.5">
            {!sharing ? (
              <button
                onClick={() => startSharing()}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold text-xs shadow-sm transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                Start Sharing Location
              </button>
            ) : (
              <button
                onClick={stopSharing}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs transition-colors"
              >
                <Square className="w-4 h-4 fill-white" />
                Stop Sharing Location
              </button>
            )}

            {/* Test Simulation Button */}
            {!sharing && (
              <button
                type="button"
                onClick={startSimulation}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-xs transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Test Route Simulation (Nairobi)
              </button>
            )}
          </div>
        </div>

        {/* Device note */}
        <div className="text-center text-xs text-brand-muted space-y-1 max-w-xs mx-auto">
          <p className="flex items-center justify-center gap-1.5 font-medium">
            <Smartphone className="w-3.5 h-3.5" />
            Designed for courier mobile phones
          </p>
          <p className="text-[11px] opacity-75">
            Keep this tab open while riding to maintain real-time updates.
          </p>
        </div>
      </div>
    </div>
  );
}
