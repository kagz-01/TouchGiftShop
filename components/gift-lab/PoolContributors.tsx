import { formatKsh } from "@/lib/utils";

interface Contribution {
  id: string;
  contributor_name: string;
  amount: number;
  is_verified: boolean;
  created_at: string;
}

export default function PoolContributors({
  contributions,
}: {
  contributions: Contribution[];
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-surface-border">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">👥</span>
        <h2 className="text-sm font-semibold">
          Contributors ({contributions.length})
        </h2>
      </div>

      <div className="space-y-2">
        {contributions.map((c, i) => (
          <div
            key={c.id}
            className={`flex items-center justify-between py-2.5 ${
              i < contributions.length - 1 ? "border-b border-surface-border" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-xs font-bold text-brand">
                {c.contributor_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium">{c.contributor_name}</p>
                <p className="text-[10px] text-brand-muted">
                  {new Date(c.created_at).toLocaleDateString("en-KE", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-brand">{formatKsh(c.amount)}</p>
              {!c.is_verified && (
                <span className="text-[10px] text-gold font-medium">pending</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
