import PoolProgressBar from "@/components/gift-lab/PoolProgressBar";
import PoolContributeForm from "@/components/gift-lab/PoolContributeForm";
import PoolShareLink from "@/components/gift-lab/PoolShareLink";
import PoolContributors from "@/components/gift-lab/PoolContributors";
import { formatKsh } from "@/lib/utils";

async function getPool(slug: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/pools/${slug}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function PoolPage({
  params,
}: {
  params: { slug: string };
}) {
  const data = await getPool(params.slug);

  if (!data || !data.pool) {
    return (
      <div className="px-4 md:px-8 py-6 text-center">
        <p className="text-brand-muted">Pool not found.</p>
      </div>
    );
  }

  const { pool, contributions } = data;
  const isExpired = new Date(pool.expires_at) < new Date();
  const isComplete = pool.status === "completed" || pool.current_balance >= pool.target_amount;

  return (
    <div className="px-4 md:px-8 py-6 max-w-lg mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">{pool.title}</h1>
        <p className="text-sm text-brand-muted">
          {isComplete
            ? "Target reached! Gift will be ordered automatically."
            : isExpired
            ? "This pool has closed."
            : `Closes ${new Date(pool.expires_at).toLocaleDateString("en-KE", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}`}
        </p>
      </div>

      <PoolProgressBar current={pool.current_balance} target={pool.target_amount} />

      <div className="flex items-center justify-between text-sm">
        <span className="text-brand-muted">
          {contributions.length} contribution{contributions.length !== 1 ? "s" : ""}
        </span>
        <span className="font-medium">
          {formatKsh(pool.target_amount - pool.current_balance)} to go
        </span>
      </div>

      {!isComplete && !isExpired && (
        <PoolContributeForm slug={pool.slug} />
      )}

      <PoolShareLink slug={pool.slug} />

      {contributions.length > 0 && (
        <PoolContributors contributions={contributions} />
      )}
    </div>
  );
}
