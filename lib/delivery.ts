// Delivery fee calculation by area.
// Zone-based pricing: Nairobi city, Nairobi suburbs, nationwide.

export interface DeliveryZone {
  name: string;
  fee: number;
  timeframe: string;
}

const NAIROBI_CITIES = [
  "nairobi",
  "westlands",
  "kilian",
  "lavington",
  "kileleshwa",
  "kilimani",
  "hurlingham",
  "upper hill",
  "cbd",
  "downtown",
  "south b",
  "south c",
  "langata",
  "karen",
  "runda",
  "muthaiga",
  "parklands",
  "eastleigh",
  "pangani",
  "parkland",
];

export function getDeliveryZone(
  landmark: string,
  lat?: number | null,
  lng?: number | null
): DeliveryZone {
  const lower = landmark.toLowerCase();

  // Check if it's in Nairobi by landmark keywords
  const isNairobi = NAIROBI_CITIES.some((area) => lower.includes(area));

  if (isNairobi) {
    return {
      name: "Nairobi",
      fee: 350,
      timeframe: "Same-day (order before 2pm)",
    };
  }

  // If we have coordinates, rough check if within Nairobi metro
  if (lat && lng) {
    // Nairobi rough bounds: lat -1.4 to -1.2, lng 36.6 to 37.0
    if (lat >= -1.45 && lat <= -1.15 && lng >= 36.55 && lng <= 37.05) {
      return {
        name: "Nairobi Metro",
        fee: 500,
        timeframe: "Same-day or next-day",
      };
    }
  }

  // Default: nationwide
  return {
    name: "Nationwide",
    fee: 600,
    timeframe: "Next-day delivery",
  };
}

export function formatDeliveryFee(fee: number): string {
  return fee === 0 ? "Free" : `KSh ${fee.toLocaleString("en-KE")}`;
}
