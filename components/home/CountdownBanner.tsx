// Shows "Order in the next Xh Ym for same-day Nairobi delivery."
// TODO: wire to real delivery cutoff config (per city/area) from the backend.
export default function CountdownBanner() {
  return (
    <div className="rounded-lg bg-brand text-white text-sm px-4 py-2">
      Order in the next <strong>-- h -- m</strong> for same-day delivery in
      Nairobi.
    </div>
  );
}
