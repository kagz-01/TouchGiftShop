import { NextResponse } from "next/server";
import { getDeliveryZone } from "@/lib/delivery";

// GET /api/delivery?landmark=Karen&lat=-1.3&lng=36.7
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const landmark = searchParams.get("landmark") ?? "";
  const lat = searchParams.get("lat") ? Number(searchParams.get("lat")) : null;
  const lng = searchParams.get("lng") ? Number(searchParams.get("lng")) : null;

  const zone = getDeliveryZone(landmark, lat, lng);

  return NextResponse.json({ zone });
}
