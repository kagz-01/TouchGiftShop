import Link from "next/link";

export default function GiftLabPage() {
  return (
    <div className="px-4 md:px-8 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Gift Lab</h1>
        <p className="text-sm text-brand-muted mt-1">
          Two ways to make gifting easier.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/gift-lab/build-hamper"
          className="rounded-lg border border-gray-200 p-6 space-y-2 hover:border-gray-400 transition-colors"
        >
          <p className="font-medium">Build a Hamper</p>
          <p className="text-sm text-brand-muted">
            Choose a box size and tap items to add. Perfect when you want to
            put together something personal.
          </p>
        </Link>

        <Link
          href="/gift-lab/pool"
          className="rounded-lg border border-gray-200 p-6 space-y-2 hover:border-gray-400 transition-colors"
        >
          <p className="font-medium">Pool a Gift</p>
          <p className="text-sm text-brand-muted">
            Start a group fund and split the cost with others via M-Pesa.
            Share a link — everyone contributes their own amount.
          </p>
        </Link>
      </div>
    </div>
  );
}
