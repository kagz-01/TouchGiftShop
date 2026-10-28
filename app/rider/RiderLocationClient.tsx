"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Play, 
  Square, 
  Navigation, 
  CheckCircle2, 
  AlertTriangle, 
  Smartphone, 
  MapPin, 
  Sparkles, 
  Phone, 
  MessageCircle, 
  ExternalLink, 
  ShieldAlert, 
  Package, 
  ChevronDown, 
  ChevronUp,
  Clock
} from "lucide-react";
import { getWhatsAppPhone } from "@/lib/phone";

interface RiderDeliveryDetails {
  recipientName: string;
  recipientPhone?: string | null;
  landmark?: string | null;
  timeWindow?: string | null;
  isAnonymous?: boolean;
  dontCallRecipient?: boolean;
  giftNote?: string | null;
  packageName?: string | null;
  packageQuantity?: number;
  packageImage?: string | null;
  senderName?: string | null;
}

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
  const [orderDetails, setOrderDetails] = useState<RiderDeliveryDetails | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showCredentials, setShowCredentials] = useState(!urlOrderId || !urlToken);

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
              recipientPhone: data.recipientPhone,
              landmark: data.deliveryPin?.landmark || data.landmark || data.timeWindow || "Nairobi",
              timeWindow: data.timeWindow,
              isAnonymous: data.isAnonymous,
              dontCallRecipient: data.dontCallRecipient,
              giftNote: data.giftNote,
              packageName: data.packageName,
              packageQuantity: data.packageQuantity,
              packageImage: data.packageImage,
              senderName: data.senderName,
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

    // First try standard high accuracy with a 15-second timeout
    navigator.geolocation.getCurrentPosition(onPosition, onError, {
      enableHighAccuracy: true,
      timeout: 15_000,
      maximumAge: 5_000,
    });

    // Then continuously watch position every 5-8 seconds
    const wid = navigator.geolocation.watchPosition(onPosition, onError, {
      enableHighAccuracy: true,
      maximumAge: 5_000,
      timeout: 15_000,
    });

    watchIdRef.current = wid;
  };

  // Stop sharing location
  const stopSharing = () => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    setSharing(false);
    setIsSimulating(false);
    setSuccess("Location sharing paused.");
  };

  // Realistic Nairobi delivery simulation (for desktop testing or demonstration)
  const startSimulation = () => {
    const id = orderId.trim();
    const t = token.trim();
    if (!id || !t) {
      setError("Enter order ID and rider token to test");
      return;
    }

    stopSharing();
    setError("");
    setSharing(true);
    setIsSimulating(true);

    // Realistic delivery path across Nairobi (Westlands -> Kileleshwa -> Kilimani -> Karen)
    const nairobiPath = [
      { lat: -1.2683, lng: 36.8049 }, // Westlands Hub
      { lat: -1.2755, lng: 36.8090 }, // Chiromo
      { lat: -1.2842, lng: 36.8155 }, // University Way
      { lat: -1.2918, lng: 36.8249 }, // CBD
      { lat: -1.2975, lng: 36.7905 }, // Kilimani
      { lat: -1.3030, lng: 36.7640 }, // Jamhuri
      { lat: -1.3190, lng: 36.7320 }, // Karen Road
    ];

    let step = 0;
    const postStep = () => {
      const point = nairobiPath[step % nairobiPath.length];
      const jitterLat = point.lat + (Math.random() - 0.5) * 0.0008;
      const jitterLng = point.lng + (Math.random() - 0.5) * 0.0008;
      postLocation(id, t, jitterLat, jitterLng);
      step++;
    };

    postStep();
    simIntervalRef.current = setInterval(postStep, 5000);
  };

  // Format WhatsApp and Tel contacts
  const cleanPhone = orderDetails?.recipientPhone ? orderDetails.recipientPhone.trim() : null;
  const whatsappPhone = cleanPhone ? getWhatsAppPhone(cleanPhone) : null;

  return (
    <div className="min-h-screen bg-gradient-warm px-4 py-8">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Navigation className="w-6 h-6 text-brand animate-pulse" />
          </div>
          <h1 className="font-display text-2xl font-bold text-brand-deep">
            TouchGift Courier Portal
          </h1>
          <p className="text-xs text-brand-muted max-w-xs mx-auto">
            Live delivery broadcast & recipient coordination
          </p>
        </div>

        {/* Recipient & Delivery Information Card */}
        {orderDetails?.recipientName && (
          <div className="bg-white rounded-3xl border border-brand/10 shadow-sm p-5 space-y-4">
            <div>
              <span className="text-[10px] font-bold text-brand uppercase tracking-wider bg-brand/5 px-2.5 py-1 rounded-full border border-brand/15">
                Delivering Gift To
              </span>
              <h2 className="text-xl font-bold text-brand-deep mt-2">
                {orderDetails.recipientName}
              </h2>
            </div>

            {/* Recipient Contact Buttons */}
            {cleanPhone && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold text-brand-muted">Recipient Contact:</p>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${cleanPhone}`}
                    className="py-2.5 px-3 bg-brand text-white hover:bg-brand-dark rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call ({cleanPhone})
                  </a>
                  {whatsappPhone && (
                    <a
                      href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
                        `Hello ${orderDetails.recipientName}! I am your TouchGift delivery rider with your gift parcel. Please confirm if you are available at your delivery location.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 bg-[#25D366] text-white hover:bg-[#1fb855] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Drop-off Landmark / Address */}
            {orderDetails.landmark && (
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-deep">
                  <MapPin className="w-4 h-4 text-brand shrink-0" />
                  <span>Drop-Off Landmark / Area:</span>
                </div>
                <p className="text-xs text-gray-700 pl-5.5 font-medium leading-relaxed">
                  {orderDetails.landmark}
                </p>
                <div className="pt-1 pl-5.5">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(orderDetails.landmark)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-brand hover:underline font-bold"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Open in Google Maps Navigation</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                </div>
              </div>
            )}

            {/* Surprise / Confidentiality Warning */}
            {orderDetails.isAnonymous ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <p className="font-bold uppercase tracking-wide text-[11px]">Surprise Gift — Confidential</p>
                  <p className="text-[11px] opacity-90 mt-0.5">
                    The sender requested complete anonymity. Please do not mention sender identity or invoice prices upon handover.
                  </p>
                </div>
              </div>
            ) : orderDetails.senderName ? (
              <p className="text-xs text-brand-muted italic">
                From: <span className="font-semibold text-brand-deep">{orderDetails.senderName}</span>
              </p>
            ) : null}

            {/* Package Contents */}
            <div className="border-t border-black/5 pt-3 flex items-center gap-3">
              {orderDetails.packageImage ? (
                <img
                  src={orderDetails.packageImage}
                  alt={orderDetails.packageName || "Gift"}
                  className="w-12 h-12 object-cover rounded-xl border border-black/5"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-brand/5 border border-brand/10 text-brand flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-brand-muted uppercase font-bold tracking-wider">Package Contents</p>
                <p className="text-xs font-bold text-brand-deep truncate">{orderDetails.packageName || "TouchGift Luxury Box"}</p>
                <p className="text-[11px] text-brand-muted">{orderDetails.packageQuantity || 1} parcel unit(s)</p>
              </div>
            </div>
          </div>
        )}

        {/* GPS Broadcast Console */}
        <div className="bg-white rounded-3xl border border-brand/10 shadow-sm p-6 space-y-4">
          {/* Active Status Display */}
          {sharing ? (
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
                  Coordinates: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                </p>
              )}

              <p className="text-[11px] opacity-80 leading-relaxed">
                The customer & dispatch desk can now see your moving scooter icon on their live tracking map.
              </p>
            </div>
          ) : (
            <div className="bg-brand/5 border border-brand/10 rounded-2xl p-4 text-center space-y-1">
              <p className="text-xs font-bold text-brand-deep">GPS Broadcast Ready</p>
              <p className="text-[11px] text-brand-muted">
                Tap below when you start riding towards the recipient.
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

          {/* Main Broadcast Action Buttons */}
          <div className="space-y-2.5">
            {!sharing ? (
              <button
                onClick={() => startSharing()}
                className="w-full flex items-center justify-center gap-2 py-4 bg-brand hover:bg-brand-dark text-white rounded-2xl font-bold text-sm shadow-md transition-all active:scale-[0.98]"
              >
                <Play className="w-4 h-4 fill-white" />
                Start Sharing Location
              </button>
            ) : (
              <button
                onClick={stopSharing}
                className="w-full flex items-center justify-center gap-2 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-sm shadow-md transition-all active:scale-[0.98]"
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

          {/* Expandable Order Credentials (collapsed by default if URL provided) */}
          <div className="border-t border-black/5 pt-3">
            <button
              type="button"
              onClick={() => setShowCredentials(!showCredentials)}
              className="w-full flex items-center justify-between text-xs text-brand-muted hover:text-brand transition-colors py-1"
            >
              <span>Security Token & Credentials</span>
              {showCredentials ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showCredentials && (
              <div className="space-y-2.5 pt-2 animate-in fade-in duration-200">
                <div>
                  <label className="text-[10px] font-bold text-brand-deep uppercase tracking-wider">
                    Order ID
                  </label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="Order UUID"
                    disabled={sharing}
                    className="w-full bg-gray-50 border border-black/10 rounded-xl px-3 py-2 text-xs font-mono mt-0.5 focus:outline-none focus:border-brand disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-brand-deep uppercase tracking-wider">
                    Rider Security Token
                  </label>
                  <input
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="••••••••"
                    disabled={sharing}
                    className="w-full bg-gray-50 border border-black/10 rounded-xl px-3 py-2 text-xs font-mono mt-0.5 focus:outline-none focus:border-brand disabled:opacity-60"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Device Tips */}
        <div className="text-center text-xs text-brand-muted space-y-1 max-w-xs mx-auto">
          <p className="flex items-center justify-center gap-1.5 font-medium">
            <Smartphone className="w-3.5 h-3.5" />
            Designed for courier mobile phones
          </p>
          <p className="text-[11px] opacity-75">
            Keep this screen active while riding to broadcast continuous live position updates to the customer.
          </p>
        </div>
      </div>
    </div>
  );
}
