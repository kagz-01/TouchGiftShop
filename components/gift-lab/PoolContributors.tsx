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
    <div className="space-y-2">
      <h2 className="text-sm font-medium">Contributors</h2>
      <div className="space-y-2">
        {contributions.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between text-sm border-b border-gray-100 pb-2"
          >
            <div>
              <span className="font-medium">{c.contributor_name}</span>
              {!c.is_verified && (
                <span className="text-xs text-yellow-600 ml-2">pending</span>
              )}
            </div>
            <span className="text-brand-muted">{formatKsh(c.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
