// Create-a-pool form. TODO: POST to /api/pools, then redirect to
// /gift-lab/pool/[slug] with the shareable link.
export default function CreatePoolPage() {
  return (
    <div className="px-4 md:px-8 py-6 space-y-4">
      <h1 className="text-xl font-semibold">Pool a Gift</h1>
      <form className="space-y-4 max-w-md">
        <div>
          <label className="text-sm font-medium">Pool title</label>
          <input
            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
            placeholder="e.g. Amina's Wedding Gift"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Target amount (KSh)</label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Closes on</label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-brand text-white py-3"
        >
          Create pool & get shareable link
        </button>
      </form>
    </div>
  );
}
