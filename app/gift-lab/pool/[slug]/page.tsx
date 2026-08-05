import PoolProgressBar from "@/components/gift-lab/PoolProgressBar";
import PoolContributeForm from "@/components/gift-lab/PoolContributeForm";

// TODO: fetch pool by params.slug from /api/pools/[slug]
export default function PoolPage({ params }: { params: { slug: string } }) {
  return (
    <div className="px-4 md:px-8 py-6 space-y-4">
      <h1 className="text-xl font-semibold">Pool: {params.slug}</h1>
      <PoolProgressBar current={0} target={10000} />
      <PoolContributeForm slug={params.slug} />
    </div>
  );
}
