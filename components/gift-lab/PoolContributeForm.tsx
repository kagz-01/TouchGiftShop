"use client";

import { useState } from "react";
import { formatKsh } from "@/lib/utils";

type Step = "form" | "redirecting" | "error";

const PRESET_AMOUNTS = [500, 1000, 2000, 3000, 5000];

export default function PoolContributeForm({ slug }: { slug: string }) {
  const [step, setStep] = useState<Step>("form");
  const [errorMessage, setErrorMessage] = useState("");
  const [amount, setAmount] = useState<number>(0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStep("redirecting");
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

    const contributionId = data.contribution.id;

    const paymentRes = await fetch("/api/payment/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: contributorAmount,
        merchantReference: `pool-${contributionId}`,
        description: `Pool contribution — ${data.poolSlug}`,
        phoneNumber: form.get("phone"),
        callbackUrl: `${window.location.origin}/gift-lab/pool/${slug}?paid=true`,
      }),
    });

    const paymentData = await paymentRes.json();

    if (!paymentRes.ok) {
      setStep("error");
      setErrorMessage(paymentData.error ?? "Failed to start payment.");
      return;
    }

    window.location.href = paymentData.redirectUrl;
  }

  if (step === "redirecting") {
    return (
      <div className="bg-white rounded-2xl p-6 border border-surface-border text-center space-y-3">
        <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-semibold text-sm">Redirecting to payment...</p>
        <p className="text-xs text-brand-muted">
          You&apos;ll complete your contribution on PesaPal via M-Pesa.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-surface-border">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">💰</span>
        <h3 className="text-sm font-semibold">Contribute to this pool</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {step === "error" && (
          <div className="bg-brand-coral/10 border border-brand-coral/30 rounded-xl p-3 text-xs text-brand-coral">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-5 gap-2">
          {PRESET_AMOUNTS.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setAmount(amt)}
              className={`py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                amount === amt
                  ? "border-brand bg-brand/5 text-brand"
                  : "border-surface-border text-brand-muted hover:border-brand/30"
              }`}
            >
              {amt >= 1000 ? `${amt / 1000}k` : amt}
            </button>
          ))}
        </div>

        <div>
          <input
            name="name"
            required
            placeholder="Your name"
            className="w-full bg-gray-50 border border-surface-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors"
          />
        </div>

        <div>
          <input
            name="phone"
            required
            placeholder="M-Pesa phone number"
            className="w-full bg-gray-50 border border-surface-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors"
          />
        </div>

        <div>
          <input
            name="amount"
            type="number"
            min={100}
            required
            value={amount || ""}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="Amount (KSh)"
            className="w-full bg-gray-50 border border-surface-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={!amount}
          className="w-full py-3 bg-gradient-to-r from-gold to-gold-light text-brand-deep rounded-xl font-bold text-sm shadow-gold hover:shadow-gold-lg transition-all disabled:opacity-50"
        >
          Contribute {amount > 0 ? formatKsh(amount) : ""}
        </button>

        <p className="text-[10px] text-brand-muted text-center">
          You&apos;ll be redirected to PesaPal to pay via M-Pesa, card, or Airtel Money
        </p>
      </form>
    </div>
  );
}
