import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import LiveTrackingClient from "./LiveTrackingClient";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function LiveTrackingPage({
  params,
  searchParams,
}: {
  params: { orderId: string };
  searchParams: { token?: string };
}) {
  const token = searchParams.token;

  if (!token) return notFound();

  // Verify the token is valid for this order
  const { data: order } = await supabase
    .from("orders")
    .select("id, status, recipient_pin_requested")
    .eq("id", params.orderId)
    .eq("track_token", token)
    .single();

  if (!order) return notFound();

  return (
    <LiveTrackingClient
      orderId={params.orderId}
      token={token}
    />
  );
}
