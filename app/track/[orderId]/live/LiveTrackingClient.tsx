"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, Clock, RefreshCw } from "lucide-react";
import { SHOP_LOCATION } from "@/lib/delivery";

type Leaflet = typeof import("leaflet");
type LMap = import("leaflet").Map;
type LMarker = import("leaflet").Marker;
type LPolyline = import("leaflet").Polyline;
type LDivIcon = import("leaflet").DivIcon;

interface RiderLocation {
  lat: number;
  lng: number;
  updatedAt: string;
}

interface DeliveryPin {
  lat: number;
  lng: number;
  landmark: string | null;
}

interface TrackingData {
  orderId: string;
  status: string;
  recipientName: string;
  timeWindow: string | null;
  riderLocation: RiderLocation | null;
  deliveryPin: DeliveryPin | null;
}

export default function LiveTrackingClient({
  orderId,
  token,
}: {
  orderId: string;
  token: string;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LMap | null>(null);
  const riderMarkerRef = useRef<LMarker | null>(null);
  const riderTrailRef = useRef<LPolyline | null>(null);
  const leafletRef = useRef<Leaflet | null>(null);
  const iconsRef = useRef<{
    rider: LDivIcon;
    delivery: LDivIcon;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<TrackingData | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [riderStale, setRiderStale] = useState(false);

  // Initialize map (client-only — Leaflet touches window at import)
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !mapRef.current || mapInstanceRef.current) return;

      const riderIcon = L.divIcon({
        className: "rider-pin",
        html: `<div style="
          width: 36px; height: 36px;
          background: #2563eb;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 12px rgba(37,99,235,0.5);
          display: flex; align-items: center; justify-content: center;
          animation: pulse 2s infinite;
        "><span style="color: white; font-size: 16px;">🛵</span></div>
        <style>@keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); } }</style>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const deliveryIcon = L.divIcon({
        className: "delivery-pin",
        html: `<div style="
          width: 32px; height: 32px;
          background: #e11d48;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
        "><span style="transform: rotate(45deg); color: white; font-size: 14px;">📍</span></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const shopIcon = L.divIcon({
        className: "shop-pin",
        html: `<div style="
          width: 30px; height: 30px;
          background: #9B1B5A;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(155,27,90,0.4);
          display: flex; align-items: center; justify-content: center;
        "><span style="transform: rotate(45deg); color: white; font-size: 12px;">🎁</span></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      });

      leafletRef.current = L;
      iconsRef.current = { rider: riderIcon, delivery: deliveryIcon };

      const map = L.map(mapRef.current, {
        center: [SHOP_LOCATION.lat, SHOP_LOCATION.lng],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: "topright" }).addTo(map);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Add shop marker
      L.marker([SHOP_LOCATION.lat, SHOP_LOCATION.lng], { icon: shopIcon })
        .addTo(map)
        .bindPopup("TouchGift HQ");

      // Add rider trail line
      riderTrailRef.current = L.polyline([], {
        color: "#2563eb",
        weight: 3,
        opacity: 0.6,
        dashArray: "8,8",
      }).addTo(map);

      mapInstanceRef.current = map;
    })();

    return () => {
      cancelled = true;
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Fetch tracking data
  const fetchTrackingData = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/tracking/${orderId}/live?token=${token}`
      );
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Failed to load tracking");
        return;
      }

      setData(json);
      setLastUpdate(new Date());

      // Check if rider location is stale (> 2 minutes old)
      if (json.riderLocation?.updatedAt) {
        const age = Date.now() - new Date(json.riderLocation.updatedAt).getTime();
        setRiderStale(age > 120_000);
      }

      // Update map markers
      const map = mapInstanceRef.current;
      const L = leafletRef.current;
      const icons = iconsRef.current;
      if (!map || !L || !icons) return;

      // Delivery pin
      if (json.deliveryPin) {
        const { lat, lng, landmark } = json.deliveryPin;
        L.marker([lat, lng], { icon: icons.delivery })
          .addTo(map)
          .bindPopup(landmark || "Delivery location");
      }

      // Rider marker
      if (json.riderLocation) {
        const { lat, lng } = json.riderLocation;

        if (riderMarkerRef.current) {
          riderMarkerRef.current.setLatLng([lat, lng]);
        } else {
          riderMarkerRef.current = L.marker([lat, lng], {
            icon: icons.rider,
          })
            .addTo(map)
            .bindPopup("Rider location");
        }

        // Add to trail
        riderTrailRef.current?.addLatLng([lat, lng]);

        // Fit map to show rider + delivery pin
        const bounds = L.latLngBounds([]);
        bounds.extend([lat, lng]);
        if (json.deliveryPin) {
          bounds.extend([json.deliveryPin.lat, json.deliveryPin.lng]);
        }
        bounds.extend([SHOP_LOCATION.lat, SHOP_LOCATION.lng]);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      } else if (json.deliveryPin) {
        // No rider yet, just show delivery pin + shop
        map.fitBounds(
          [
            [SHOP_LOCATION.lat, SHOP_LOCATION.lng],
            [json.deliveryPin.lat, json.deliveryPin.lng],
          ],
          { padding: [50, 50], maxZoom: 15 }
        );
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [orderId, token]);

  // Initial fetch + polling
  useEffect(() => {
    fetchTrackingData();
    const interval = setInterval(fetchTrackingData, 10_000); // Poll every 10s
    return () => clearInterval(interval);
  }, [fetchTrackingData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-brand-muted">Loading live tracking...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <span className="text-5xl block mb-4">😔</span>
          <p className="font-display text-xl font-bold mb-2">Tracking unavailable</p>
          <p className="text-sm text-brand-muted">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-warm flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-surface-border px-4 py-3 safe-area-top">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-display text-sm font-bold text-brand-deep">
              Live Tracking
            </h1>
            <p className="text-[11px] text-brand-muted">
              {data?.recipientName}&apos;s gift
            </p>
          </div>
          <div className="flex items-center gap-2">
            {riderStale && (
              <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                Stale
              </span>
            )}
            <button
              onClick={fetchTrackingData}
              className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center"
            >
              <RefreshCw className="w-3.5 h-3.5 text-brand" />
            </button>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" />

        {/* Status overlay */}
        <div className="absolute bottom-4 left-4 right-4 z-[1000]">
          <div className="bg-white rounded-2xl shadow-lg border border-surface-border p-4 space-y-3">
            {/* Status indicator */}
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                data?.status === "dispatched"
                  ? "bg-blue-500 animate-pulse"
                  : data?.status === "delivered"
                  ? "bg-green-500"
                  : "bg-gray-400"
              }`} />
              <div>
                <p className="text-sm font-bold text-brand-deep">
                  {data?.status === "dispatched"
                    ? "Rider is on the way"
                    : data?.status === "delivered"
                    ? "Delivered!"
                    : `Status: ${data?.status?.replace("_", " ")}`}
                </p>
                {lastUpdate && (
                  <p className="text-[10px] text-brand-muted">
                    Updated {lastUpdate.toLocaleTimeString("en-KE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </div>

            {/* Delivery details */}
            {data?.deliveryPin && (
              <div className="flex items-center gap-2 text-xs text-brand-muted">
                <MapPin className="w-3.5 h-3.5" />
                <span>
                  {data.deliveryPin.landmark || "Pin on map"}
                  {data.timeWindow && ` · ${data.timeWindow}`}
                </span>
              </div>
            )}

            {/* ETA / distance info */}
            {data?.riderLocation && data?.deliveryPin && (
              <div className="flex items-center gap-2 text-xs text-brand-muted">
                <Navigation className="w-3.5 h-3.5" />
                <span>Rider is nearby — keep your phone handy</span>
              </div>
            )}

            {!data?.riderLocation && data?.status === "dispatched" && (
              <div className="flex items-center gap-2 text-xs text-brand-muted">
                <Clock className="w-3.5 h-3.5" />
                <span>Waiting for rider to start sharing location...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
