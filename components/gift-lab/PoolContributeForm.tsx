"use client";

// TODO: POST to /api/pools/[slug]/contribute, then trigger a per-contributor
// M-Pesa STK push (each contributor pays with their own number).
export default function PoolContributeForm({ slug }: { slug: string }) {
  return (
    <form className="space-y-3 max-w-sm">
      <input
        className="w-full border border-gray-300 rounded-md px-3 py-2"
        placeholder="Your name"
      />
      <input
        className="w-full border border-gray-300 rounded-md px-3 py-2"
        placeholder="Your M-Pesa phone number"
      />
      <input
        type="number"
        className="w-full border border-gray-300 rounded-md px-3 py-2"
        placeholder="Amount (KSh)"
      />
      <button
        type="submit"
        className="w-full rounded-lg bg-brand text-white py-3"
      >
        Contribute via M-Pesa
      </button>
    </form>
  );
}
