"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Step = "form" | "submitting" | "error";

export default function CreatePoolPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStep("submitting");
    setErrorMessage("");

    const form = new FormData(e.currentTarget);
    const title = form.get("title") as string;
    const targetAmount = Number(form.get("targetAmount"));
    const expiresAt = form.get("expiresAt") as string;

    const res = await fetch("/api/pools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        targetAmount,
        expiresAt: new Date(expiresAt).toISOString(),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setStep("error");
      setErrorMessage(
        data.error?.formErrors?.join(", ") ?? data.error ?? "Something went wrong."
      );
      return;
    }

    router.push(`/gift-lab/pool/${data.pool.slug}`);
  }

  // Default expiry: 7 days from now
  const defaultExpiry = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  )
    .toISOString()
    .split("T")[0];

  return (
    <div className="px-4 md:px-8 py-6 max-w-lg mx-auto space-y-4">
      <h1 className="text-xl font-semibold">Pool a Gift</h1>
      <p className="text-sm text-brand-muted">
        Start a group fund. Share the link with friends and family — everyone
        contributes via M-Pesa. Once the target is hit, the gift is ordered
        automatically.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {step === "error" && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {errorMessage}
          </p>
        )}

        <div>
          <label className="text-sm font-medium">Pool title</label>
          <input
            name="title"
            required
            minLength={3}
            placeholder="e.g. Amina's Wedding Gift"
            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Target amount (KSh)</label>
          <input
            name="targetAmount"
            type="number"
            min={100}
            required
            placeholder="e.g. 15000"
            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Closes on</label>
          <input
            name="expiresAt"
            type="date"
            required
            defaultValue={defaultExpiry}
            min={new Date().toISOString().split("T")[0]}
            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
          />
        </div>

        <button
          type="submit"
          disabled={step === "submitting"}
          className="w-full rounded-lg bg-brand text-white py-3 font-medium disabled:opacity-50"
        >
          {step === "submitting" ? "Creating..." : "Create pool & get shareable link"}
        </button>
      </form>
    </div>
  );
}
