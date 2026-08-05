export default function PoolProgressBar({
  current,
  target,
}: {
  current: number;
  target: number;
}) {
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  return (
    <div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full bg-brand" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-brand-muted mt-1">
        KSh {current.toLocaleString()} of {target.toLocaleString()} raised
      </p>
    </div>
  );
}
