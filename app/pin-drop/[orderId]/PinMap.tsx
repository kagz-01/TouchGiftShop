"use client";

import { useState, useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

interface PinMapProps {
  onPinDrop: (lat: number, lng: number) => void;
  initialPosition?: { lat: number; lng: number } | null;
}

export default function PinMap({ onPinDrop, initialPosition }: PinMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const markerRef = useRef<import("leaflet").Marker | null>(null);
  const [nairobiDefault] = useState({ lat: -1.2921, lng: 36.8219 });

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;

      // Fix Leaflet default icon issue
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;

      if (cancelled || !mapRef.current || mapInstanceRef.current) return;

      const pos = initialPosition || nairobiDefault;

      const map = L.map(mapRef.current, {
        center: [pos.lat, pos.lng],
        zoom: initialPosition ? 16 : 12,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Zoom control bottom-right
      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Attribution bottom-left
      L.control.attribution({ position: "bottomleft", prefix: "" }).addTo(map);

      // Custom pin icon
      const pinIcon = L.divIcon({
        className: "custom-pin",
        html: `<div style="
          width: 36px; height: 36px;
          background: #e11d48;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
        "><span style="transform: rotate(45deg); color: white; font-size: 16px;">📍</span></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      // Place initial marker if we have a position
      if (initialPosition) {
        markerRef.current = L.marker([pos.lat, pos.lng], { icon: pinIcon }).addTo(map);
      }

      // Click to drop pin
      map.on("click", (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
        }

        onPinDrop(lat, lng);
      });

      // Try to get user's current location
      if (!initialPosition && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            map.setView([latitude, longitude], 15);
            markerRef.current = L.marker([latitude, longitude], { icon: pinIcon }).addTo(map);
            onPinDrop(latitude, longitude);
          },
          () => {
            // User denied geolocation — stay at Nairobi default
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }

      mapInstanceRef.current = map;
    })();

    return () => {
      cancelled = true;
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />

      {/* Tap hint overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-card-hover border border-surface-border">
        <p className="text-xs font-semibold text-brand flex items-center gap-1.5">
          <span className="animate-pulse">👆</span>
          Tap anywhere to drop your pin
        </p>
      </div>
    </div>
  );
}
