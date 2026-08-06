import PinDropClient from "./PinDropClient";

export default async function PinDropPage({
  params,
  searchParams,
}: {
  params: { orderId: string };
  searchParams: { token?: string };
}) {
  const token = searchParams.token || "";

  return <PinDropClient orderId={params.orderId} token={token} />;
}
