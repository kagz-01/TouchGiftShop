interface RatingDistributionProps {
  distribution: { rating: number; count: number; percentage: number }[];
  total: number;
}

export default function RatingDistribution({
  distribution,
  total,
}: RatingDistributionProps) {
  return (
    <div className="space-y-2">
      {distribution.map((d) => (
        <div key={d.rating} className="flex items-center gap-3">
          <span className="text-sm font-medium w-8 text-right">{d.rating}★</span>
          <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all duration-500"
              style={{ width: `${d.percentage}%` }}
            />
          </div>
          <span className="text-xs text-brand-muted w-12 text-right">
            {d.count}
          </span>
        </div>
      ))}
      <p className="text-xs text-brand-muted pt-1">
        {total} {total === 1 ? "review" : "reviews"} total
      </p>
    </div>
  );
}
