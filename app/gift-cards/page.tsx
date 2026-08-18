"use client";

import { useState } from "react";
import BackToHome from "@/components/ui/BackToHome";
import { formatKsh } from "@/lib/utils";

const PRESET_AMOUNTS = [1000, 2000, 3000, 5000];

type Step = "form" | "success";

export default function GiftCardsPage() {
  const [step, setStep] = useState<Step>("form");
  const [amount, setAmount] = useState(2000);
  const [customAmount, setCustomAmount] = useState("");
  const [form, setForm] = useState({
    senderName: "",
    recipientName: "",
    recipientPhone: "",
    message: "",
  });
  const [cardCode, setCardCode] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalAmount = customAmount ? Number(customAmount) : amount;

    const res = await fetch("/api/gift-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: finalAmount,
        senderName: form.senderName,
        recipientName: form.recipientName,
        recipientPhone: form.recipientPhone || undefined,
        message: form.message || undefined,
      }),
    });

    const data = await res.json();
    if (data.card) {
      setCardCode(data.card.code);
      setStep("success");
    }
  }

  const finalAmount = customAmount ? Number(customAmount) : amount;

  if (step === "success") {
    return (
      <div className="page-container py-6 max-w-md mx-auto space-y-6">
        <div className="rounded-lg bg-green-50 border border-green-200 p-6 text-center space-y-3">
          <p className="font-medium text-green-800">Gift card created!</p>
          <div className="bg-white rounded-lg border border-green-200 p-4">
            <p className="text-xs text-brand-muted mb-1">Code</p>
            <p className="text-lg font-mono font-bold tracking-wider">
              {cardCode}
            </p>
            <p className="text-sm text-brand-muted mt-1">
              {formatKsh(finalAmount)}
            </p>
          </div>
          <p className="text-sm text-green-700">
            Share this code with {form.recipientName}. They can redeem it at
            checkout.
          </p>
        </div>
        <button
          onClick={() => {
            setStep("form");
            setForm({ senderName: "", recipientName: "", recipientPhone: "", message: "" });
          }}
          className="w-full rounded-lg border border-gray-300 py-3 text-sm font-medium"
        >
          Buy another
        </button>
      </div>
    );
  }

  return (
    <div className="page-container py-6 max-w-md mx-auto space-y-6">
      <div className="mb-4">
        <BackToHome />
      </div>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Digital Gift Card</h1>
        <p className="text-sm text-brand-muted">
          Send a stored-value code instantly. The recipient can choose their
          own gift.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount (KSh)</label>
          <div className="grid grid-cols-4 gap-2">
            {PRESET_AMOUNTS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => {
                  setAmount(a);
                  setCustomAmount("");
                }}
                className={`rounded-lg border py-2 text-sm font-medium transition-colors ${
                  amount === a && !customAmount
                    ? "border-brand bg-brand text-white"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                {formatKsh(a)}
              </button>
            ))}
          </div>
          <input
            type="number"
            min={100}
            placeholder="Custom amount"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Your name</label>
          <input
            required
            value={form.senderName}
            onChange={(e) => setForm({ ...form, senderName: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Recipient&apos;s name</label>
          <input
            required
            value={form.recipientName}
            onChange={(e) =>
              setForm({ ...form, recipientName: e.target.value })
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">
            Recipient&apos;s phone (optional — to send the code via SMS)
          </label>
          <input
            type="tel"
            value={form.recipientPhone}
            onChange={(e) =>
              setForm({ ...form, recipientPhone: e.target.value })
            }
            placeholder="07XX XXX XXX"
            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Message (optional)</label>
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Happy birthday! Choose something you love."
            rows={2}
            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-brand text-white py-3 font-medium"
        >
          Pay {formatKsh(finalAmount)} with M-Pesa
        </button>
      </form>
    </div>
  );
}
