"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateWishlistPage() {
  const router = useRouter();
  const [ownerName, setOwnerName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ownerName }),
    });

    const data = await res.json();
    if (data.wishlist) {
      router.push(`/wishlist/${data.wishlist.slug}`);
    } else {
      setLoading(false);
    }
  }

  return (
    <div className="px-4 md:px-8 py-6 max-w-md mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Create a wishlist</h1>
        <p className="text-sm text-brand-muted">
          Add things you&apos;d actually love to receive. Share the link with
          friends and family so they never have to guess.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Your name</label>
          <input
            required
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder="e.g. Grace"
            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand text-white py-3 font-medium disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create wishlist"}
        </button>
      </form>
    </div>
  );
}
