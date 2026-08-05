import Link from "next/link";

// Gift Lab tab — Section 3.1 & 4. Two paths: Build a Hamper, Pool a Gift.
export default function GiftLabPage() {
  return (
    <div className="px-4 md:px-8 py-6 space-y-4">
      <h1 className="text-xl font-semibold">Gift Lab</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/gift-lab/build-hamper"
          className="rounded-lg border border-gray-200 p-6"
        >
          <p className="font-medium">Build a Hamper</p>
          <p className="text-sm text-brand-muted mt-1">
            Choose a box size and add items yourself.
          </p>
        </Link>
        <Link
          href="/gift-lab/pool"
          className="rounded-lg border border-gray-200 p-6"
        >
          <p className="font-medium">Pool a Gift</p>
          <p className="text-sm text-brand-muted mt-1">
            Start a group fund and split the cost with others via M-Pesa.
          </p>
        </Link>
      </div>
    </div>
  );
}
