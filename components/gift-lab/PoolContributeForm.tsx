"use client";

import { useState } from "react";
import { formatKsh } from "@/lib/utils";

type Step = "form" | "awaiting_payment" | "error" | "success";

export default function PoolContributeForm({ slug }: { slug: string }) {
  const [step, setStep] = useState<Step>("form");
  const [errorMessage, setErrorMessage] = useState("");
  const [amount, setAmount] = useState<number>(0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStep("awaiting_payment");
    setErrorMessage("");

    const form = new FormData(e.currentTarget);
    const contributorAmount = Number(form.get("amount"));

    const res = await fetch(`/api/pools/${slug}/contribute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contributorName: form.get("name"),
        contributorPhone: form.get("phone"),
        amount: contributorAmount,
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

    // Poll until contribution is verified (M-Pesa callback confirms)
    pollUntilVerified(slug, data.contribution.id);
  }

  async function pollUntilVerified(slug: string, contributionId: string) {
    const start = Date.now();
    const TIMEOUT_MS = 90_000;

    const check = async () => {
      const res = await fetch(`/api/pools/${slug}`, { cache: "no-store" });
      const data = await res.json();
      const contribution = data.contributions?.find(
        (c: { id: string }) => c.id === contributionId
      );

      if (contribution?.is_verified) {
        setStep("success");
        return;
      }
      if (Date.now() - start > TIMEOUT_MS) {
        setStep("error");
        setErrorMessage(
          "We didn't receive confirmation in time. Check your phone for a missed M-Pesa prompt."
        );
        return;
      }
      setTimeout(check, 3000);
    };

    check();
  }

  if (step === "success") {
    return (
      <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-center space-y-2">
        <p className="font-medium text-green-800">Thank you!</p>
        <p className="text-sm text-green-700">
          Your contribution of {formatKsh(amount)} has been recorded.
        </p>
        <button
          onClick={() => {
            setStep("form");
            setAmount(0);
          }}
          className="text-sm underline text-green-700"
        >
          Contribute again
        </button>
      </div>
    );
  }

  if (step === "awaiting_payment") {
    return (
      <div className="rounded-lg border border-gray-200 p-6 text-center space-y-2">
        <p className="font-medium">Check your phone</p>
        <p className="text-sm text-brand-muted">
          Enter your M-Pesa PIN on the prompt sent to your phone.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <h3 className="font-medium mb-3">Contribute</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        {step === "error" && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {errorMessage}
          </p>
        )}

        <input
          name="name"
          required
          placeholder="Your name"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
        <input
          name="phone"
          required
          placeholder="Your M-Pesa phone number"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
        <input
          name="amount"
          type="number"
          min={100}
          required
          placeholder="Amount (KSh)"
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-brand text-white py-3 text-sm font-medium"
        >
          Contribute {amount > 0 ? formatKsh(amount) : ""} via M-Pesa
        </button>
      </form>
    </div>
  );
}
