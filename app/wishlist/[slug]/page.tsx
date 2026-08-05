import WishlistView from "@/components/wishlist/WishlistView";

export default async function WishlistPage({
  params,
}: {
  params: { slug: string };
}) {
  return <WishlistView slug={params.slug} />;
}
