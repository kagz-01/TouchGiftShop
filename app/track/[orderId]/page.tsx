import TrackOrderClient from "./TrackOrderClient";

export default async function TrackOrderPage({
  params,
  searchParams,
}: {
  params: { orderId: string };
  searchParams: { token?: string };
}) {
  const token = searchParams.token || "";

  return <TrackOrderClient orderId={params.orderId} token={token} />;
}
