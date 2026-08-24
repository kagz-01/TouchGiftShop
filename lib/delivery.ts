// Delivery fee calculation — distance-based from our Park Towers shop.
// Fair pricing: closer = cheaper, no flat fees for short distances.

export interface DeliveryZone {
  name: string;
  fee: number;
  timeframe: string;
  distanceKm?: number;
}

// ── Shop location: Park Towers, Utalii Street, Nairobi ──
export const SHOP_LOCATION = {
  lat: -1.2833,
  lng: 36.8167,
  name: "Park Towers, Utalii Street, Nairobi",
} as const;

// ── Haversine distance between two coordinates (km) ──
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Fee by distance from shop (Nairobi metro, ≤25km) ──
// Fair: short distance = small fee, scales linearly
export function calculateFeeByDistance(distanceKm: number): number {
  if (distanceKm <= 0.5) return 0;       // Same building / next door — free
  if (distanceKm <= 1) return 50;         // Walking distance
  if (distanceKm <= 2) return 100;        // Short ride
  if (distanceKm <= 5) return 150;        // Within neighborhood
  if (distanceKm <= 10) return 250;       // Cross-city
  if (distanceKm <= 15) return 350;       // Nairobi outskirts
  if (distanceKm <= 25) return 450;       // Nairobi metro (Kitengela, Syokimau, Juja)
  return 500;                              // Cap for Nairobi metro
}

// ── Upcountry flat rates (handled by long-haul logistics) ──
export const UPCOUNTRY_RATES: Record<string, { fee: number; timeframe: string }> = {
  mombasa:    { fee: 600, timeframe: "2–3 business days" },
  kisumu:     { fee: 600, timeframe: "2–3 business days" },
  nakuru:     { fee: 500, timeframe: "1–2 business days" },
  eldoret:    { fee: 600, timeframe: "2–3 business days" },
  nyeri:      { fee: 500, timeframe: "1–2 business days" },
  thika:      { fee: 400, timeframe: "Next business day" },
  machakos:   { fee: 400, timeframe: "Next business day" },
  kitale:     { fee: 700, timeframe: "3–4 business days" },
  garissa:    { fee: 700, timeframe: "3–4 business days" },
  kisii:      { fee: 650, timeframe: "2–3 business days" },
  meru:       { fee: 550, timeframe: "2–3 business days" },
  webuye:     { fee: 750, timeframe: "3–4 business days" },
  lodwar:     { fee: 900, timeframe: "4–5 business days" },
  marsabit:   { fee: 900, timeframe: "4–5 business days" },
  wajir:      { fee: 900, timeframe: "4–5 business days" },
  lamu:       { fee: 850, timeframe: "4–5 business days" },
};

// ── Major Nairobi landmarks with approximate distances from shop ──
// Used as fallback when pin-drop coordinates aren't available
const LANDMARK_DISTANCES: Record<string, number> = {
  // <1km — walking distance
  "park towers": 0,
  "utallii": 0.1,
  "utalii": 0.1,
  "cbd": 0.8,
  "downtown": 1.0,
  "railway station": 0.5,
  "nyayo house": 0.7,
  "uhuru park": 0.9,

  // 1–3km — short ride
  "westlands": 2.5,
  "waiyaki way": 2.0,
  "highridge": 1.5,
  "parklands": 1.2,
  "ngara": 1.8,
  "pangani": 2.0,
  "eastleigh": 2.5,
  "ciamba": 1.0,

  // 3–7km — cross-city
  "kilimani": 4.5,
  "lavington": 4.0,
  "kileleshwa": 3.5,
  "hurlingham": 3.8,
  "upper hill": 2.5,
  "south b": 5.0,
  "south c": 5.5,
  "langata": 6.0,
  "karen": 8.0,
  "kawangware": 5.0,
  "dagoretti": 6.0,
  "kasarani": 7.0,
  "mwiki": 8.0,
  "kahawa": 9.0,

  // 7–15km — Nairobi outskirts
  "runda": 10.0,
  "muthaiga": 5.0,
  "kiambu": 12.0,
  "juja": 14.0,
  "thika": 18.0,
  "kitengela": 15.0,
  "syokimau": 14.0,
  "athi river": 16.0,
  "ruiru": 13.0,
  "kikuyu": 10.0,
  "limuru": 12.0,
  "ngong": 10.0,
  "ossen": 11.0,
};

// ── Get delivery zone by landmark text (fallback when no coordinates) ──
export function getDeliveryZone(
  landmark: string,
  lat?: number | null,
  lng?: number | null
): DeliveryZone {
  const lower = landmark.toLowerCase().trim();

  // ── Best case: we have pin-drop coordinates → exact distance ──
  if (lat != null && lng != null) {
    const distKm = haversineDistance(
      SHOP_LOCATION.lat,
      SHOP_LOCATION.lng,
      lat,
      lng
    );

    // Check if it's upcountry (beyond Nairobi metro)
    const isUpcountry = Object.keys(UPCOUNTRY_RATES).some((town) =>
      lower.includes(town)
    );

    if (isUpcountry) {
      const rate = UPCOUNTRY_RATES[
        Object.keys(UPCOUNTRY_RATES).find((town) => lower.includes(town))!
      ];
      return {
        name: `Upcountry (${landmark})`,
        fee: rate.fee,
        timeframe: rate.timeframe,
        distanceKm: distKm,
      };
    }

    // Nairobi metro — distance-based
    const fee = calculateFeeByDistance(distKm);
    return {
      name: distKm <= 1 ? "Nearby" : distKm <= 5 ? "Nairobi" : distKm <= 25 ? "Greater Nairobi" : "Nairobi Metro",
      fee,
      timeframe: distKm <= 5 ? "Same-day" : "Same-day or next-day",
      distanceKm: Math.round(distKm * 10) / 10,
    };
  }

  // ── No coordinates: try landmark lookup ──
  // Check upcountry towns first
  for (const [town, rate] of Object.entries(UPCOUNTRY_RATES)) {
    if (lower.includes(town)) {
      return {
        name: `Upcountry (${town})`,
        fee: rate.fee,
        timeframe: rate.timeframe,
      };
    }
  }

  // Check known Nairobi landmarks
  for (const [keyword, distKm] of Object.entries(LANDMARK_DISTANCES)) {
    if (lower.includes(keyword)) {
      const fee = calculateFeeByDistance(distKm);
      return {
        name: distKm <= 1 ? "Nearby" : distKm <= 5 ? "Nairobi" : "Greater Nairobi",
        fee,
        timeframe: distKm <= 5 ? "Same-day" : "Same-day or next-day",
        distanceKm: distKm,
      };
    }
  }

  // ── Unknown location — estimate as greater Nairobi ──
  return {
    name: "Nairobi (estimated)",
    fee: 250,
    timeframe: "Same-day or next-day",
  };
}

export function formatDeliveryFee(fee: number): string {
  return fee === 0 ? "Free" : `KSh ${fee.toLocaleString("en-KE")}`;
}
