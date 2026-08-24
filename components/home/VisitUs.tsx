"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { SHOP_LOCATION } from "@/lib/delivery";

export default function VisitUs() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [SHOP_LOCATION.lat, SHOP_LOCATION.lng],
      zoom: 16,
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: false,
    });

    L.control.zoom({ position: "topright" }).addTo(map);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Custom pin icon
    const pinIcon = L.divIcon({
      className: "shop-pin",
      html: `<div style="
        width: 40px; height: 40px;
        background: #9B1B5A;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 16px rgba(155,27,90,0.4);
        display: flex; align-items: center; justify-content: center;
      "><span style="transform: rotate(45deg); color: white; font-size: 16px; font-weight: bold;">🎁</span></div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });

    L.marker([SHOP_LOCATION.lat, SHOP_LOCATION.lng], { icon: pinIcon })
      .addTo(map)
      .bindPopup(
        `<div style="text-align:center; padding:4px;">
          <strong style="font-size:14px;">TouchGift</strong><br/>
          <span style="font-size:12px; color:#666;">${SHOP_LOCATION.name}</span>
        </div>`
      )
      .openPopup();

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return (
    <section className="bg-gradient-to-b from-white to-brand/5">
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 bg-brand/10 text-brand text-xs font-bold uppercase tracking-wider rounded-full mb-4">
            Visit Us
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-deep mb-3">
            Come say hello
          </h2>
          <p className="text-brand-muted max-w-lg mx-auto">
            Drop by our shop in Park Towers to see our gift collections in person,
            or chat with us about custom corporate orders.
          </p>
        </div>

        {/* Map + Info grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Map — takes 3 columns */}
          <div className="lg:col-span-3 rounded-3xl overflow-hidden border border-surface-border shadow-sm">
            <div ref={mapRef} className="w-full h-[350px] lg:h-[420px]" />
          </div>

          {/* Info card — takes 2 columns */}
          <div className="lg:col-span-2 space-y-4">
            {/* Address */}
            <div className="bg-white rounded-2xl border border-surface-border p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <p className="text-sm font-bold text-brand-deep">Address</p>
                  <p className="text-sm text-brand-muted">
                    Park Towers, Utalii Street<br />
                    Nairobi, Kenya
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <p className="text-sm font-bold text-brand-deep">Hours</p>
                  <p className="text-sm text-brand-muted">
                    Mon – Fri: 8:00 AM – 6:00 PM<br />
                    Sat: 9:00 AM – 4:00 PM<br />
                    Sun: Closed
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <p className="text-sm font-bold text-brand-deep">Phone</p>
                  <a href="tel:+254142677898" className="text-sm text-brand hover:underline">
                    +254 142 677 898
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <p className="text-sm font-bold text-brand-deep">Email</p>
                  <a href="mailto:info@touchgiftshop.co.ke" className="text-sm text-brand hover:underline">
                    info@touchgiftshop.co.ke
                  </a>
                </div>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="space-y-3">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${SHOP_LOCATION.lat},${SHOP_LOCATION.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-brand text-white rounded-xl font-semibold text-sm hover:bg-brand-deep transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Get Directions
              </a>
              <a
                href="https://wa.me/254142677898?text=Hi%20TouchGift!%20I%27d%20like%20to%20visit%20your%20shop."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] text-white rounded-xl font-semibold text-sm hover:bg-[#1fb855] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
