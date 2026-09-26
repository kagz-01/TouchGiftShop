"use client";
import React, { useState } from "react";
import GiftCardPreview from "@/components/gift-cards/GiftCardPreview";

type Props = {};

const PRESETS = [1000, 2000, 3000, 5000, 10000, 15000];

export default function GiftCardForm({}: Props) {
  const [amount, setAmount] = useState<number>(2000);
  const [custom, setCustom] = useState<string>("");
  const [recipientName, setRecipientName] = useState<string>("");
  const [recipientPhone, setRecipientPhone] = useState<string>("");
  const [recipientEmail, setRecipientEmail] = useState<string>("");
  const [senderName, setSenderName] = useState<string>("");
  const [alias, setAlias] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [delivery, setDelivery] = useState<{ email: boolean; sms: boolean; whatsapp: boolean }>({
    email: true,
    sms: false,
    whatsapp: false,
  });
  const [deliveryMode, setDeliveryMode] = useState<"instant" | "schedule" | "send">("instant");
  const [sendDate, setSendDate] = useState<string | null>(null);
  const [template, setTemplate] = useState<string>("premium");
  const [loading, setLoading] = useState(false);

  function pickPreset(v: number) {
    setAmount(v);
    setCustom("");
  }

  function applyCustom(val: string) {
    setCustom(val);
    const n = Number(val.replace(/\D/g, ""));
    if (!isNaN(n) && n >= 500) setAmount(n);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        amount,
        recipientEmail,
        recipientName,
        recipientPhone,
        senderName: isAnonymous ? null : senderName,
        alias: isAnonymous ? alias : null,
        isAnonymous,
        message,
        delivery: Object.keys(delivery).filter((k) => (delivery as any)[k]),
        deliveryMode,
        sendDate,
        template,
      };

      const res = await fetch("/api/gift-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        alert(data.error || "Payment init failed");
      }
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium">Choose amount</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => pickPreset(p)}
              className={`px-4 py-2 rounded-md border ${p === amount ? "bg-pink-700 text-white" : "bg-white text-gray-800"}`}
            >
              KSh {p}
            </button>
          ))}
        </div>

        <div className="mt-3">
          <label className="block text-xs text-gray-600">Custom amount (KSh)</label>
          <input
            value={custom}
            onChange={(e) => applyCustom(e.target.value)}
            placeholder="Enter amount"
            className="mt-1 block w-full rounded-md border px-3 py-2"
          />
          <div className="text-xs text-gray-500 mt-1">Minimum KSh 500</div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Recipient</label>
        <input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Recipient name" className="mt-1 block w-full rounded-md border px-3 py-2" />
        <input value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} placeholder="Recipient phone" className="mt-2 block w-full rounded-md border px-3 py-2" />
        <input value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="Recipient email (optional)" className="mt-2 block w-full rounded-md border px-3 py-2" />
      </div>

      <div>
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
          <span className="text-sm">Send anonymously</span>
        </label>

        {!isAnonymous ? (
          <input value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="Your name" className="mt-2 block w-full rounded-md border px-3 py-2" />
        ) : (
          <input value={alias} onChange={(e) => setAlias(e.target.value)} placeholder="Send as (alias) — optional" className="mt-2 block w-full rounded-md border px-3 py-2" />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Message (optional)</label>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} maxLength={200} className="mt-1 block w-full rounded-md border px-3 py-2" placeholder="Type your message here..."></textarea>
      </div>

      <div>
        <label className="block text-sm font-medium">Delivery options</label>
        <div className="mt-2 flex gap-3">
          <label className="flex-1 p-3 rounded-lg border cursor-pointer" onClick={() => setDeliveryMode("instant")}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-300 flex items-center justify-center">⚡</div>
              <div>
                <div className="text-sm font-semibold">Instant delivery</div>
                <div className="text-xs text-gray-500">To recipient now</div>
              </div>
            </div>
          </label>

          <label className="flex-1 p-3 rounded-lg border cursor-pointer" onClick={() => setDeliveryMode("schedule")}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center">📅</div>
              <div>
                <div className="text-sm font-semibold">Schedule</div>
                <div className="text-xs text-gray-500">Pick a date</div>
              </div>
            </div>
          </label>

          <label className="flex-1 p-3 rounded-lg border cursor-pointer" onClick={() => setDeliveryMode("send")}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">✉️</div>
              <div>
                <div className="text-sm font-semibold">Send to recipient</div>
                <div className="text-xs text-gray-500">They receive it</div>
              </div>
            </div>
          </label>
        </div>

        {deliveryMode === "schedule" && (
          <div className="mt-3">
            <label className="block text-xs text-gray-600">Delivery date</label>
            <input type="date" value={sendDate ?? ""} onChange={(e) => setSendDate(e.target.value || null)} className="mt-1 block w-full rounded-md border px-3 py-2" />
          </div>
        )}

        <div className="mt-3 flex gap-3 items-center">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={delivery.email} onChange={(e) => setDelivery({ ...delivery, email: e.target.checked })} />
            <span className="text-sm">Email</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={delivery.sms} onChange={(e) => setDelivery({ ...delivery, sms: e.target.checked })} />
            <span className="text-sm">SMS</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={delivery.whatsapp} onChange={(e) => setDelivery({ ...delivery, whatsapp: e.target.checked })} />
            <span className="text-sm">WhatsApp</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Template</label>
        <select value={template} onChange={(e) => setTemplate(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2">
          <option value="premium">Premium Gold</option>
          <option value="classic">Classic</option>
          <option value="minimal">Minimal</option>
        </select>
      </div>

      <div>
        <div className="hidden md:block">
          <GiftCardPreview
            amount={amount}
            recipientName={recipientName || "Recipient Name"}
            senderName={isAnonymous ? (alias || "Anonymous") : senderName || "A friend"}
            isAnonymous={isAnonymous}
            alias={alias}
            code={undefined}
          />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-pink-700 text-white px-4 py-2 rounded-md">
          {loading ? "Processing…" : "Continue to payment"}
        </button>
      </div>
    </form>
    </div>
  );
}
