// Section 3.4 — Recipient Wishlist/Registry.
// TODO: fetch wishlist_items by params.slug from /api/wishlist/[slug]
export default function WishlistPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <div className="px-4 md:px-8 py-6 space-y-4">
      <h1 className="text-xl font-semibold">Wishlist: {params.slug}</h1>
      <p className="text-sm text-brand-muted">
        Items this person would actually like — pick one to send.
      </p>
      <div className="rounded-lg border border-gray-200 p-4 text-sm text-brand-muted">
        Wishlist item grid placeholder
      </div>
    </div>
  );
}
