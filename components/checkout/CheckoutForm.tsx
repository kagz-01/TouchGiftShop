"use client";

import { useState, useCallback } from "react";
import MapPinPicker from "./MapPinPicker";
import SurpriseToggle from "./SurpriseToggle";
import { formatKsh } from "@/lib/utils";
import { CardIcon, MobileMoneyIcon, SecureIcon } from "@/components/ui/icons/PaymentIcons";

type Step = "form" | "redirecting" | "error";

interface DeliveryZone {
  name: string;
  fee: number;
  timeframe: string;
}

export default function CheckoutForm({
  productId,
  amount,
  quantity = 1,
  engraving = "",
  giftNote = "",
}: {
  productId: string;
  amount: number;
  quantity?: number;
  engraving?: string;
  giftNote?: string;
}) {
  const [step, setStep] = useState<Step>("form");
  const [errorMessage, setErrorMessage] = useState("");
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [safeguards, setSafeguards] = useState({
    anonymous: false,
    dontCall: false,
  });
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone | null>(null);
  const [landmark, setLandmark] = useState("");
  const [usePinDrop, setUsePinDrop] = useState(false);

  const lookupDelivery = useCallback(async (value: string) => {
    setLandmark(value);
    if (value.length < 3) {
      setDeliveryZone(null);
      return;
    }
    try {
      const res = await fetch(
        `/api/delivery?landmark=${encodeURIComponent(value)}`
      );
      const data = await res.json();
      setDeliveryZone(data.zone);
    } catch {
      setDeliveryZone(null);
    }
  }, []);

  const total = amount + (deliveryZone?.fee ?? 0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    setRedirectUrl(null);
    setStep("redirecting");

    const form = new FormData(e.currentTarget);

    try {
      // 1. Create order in our DB
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          totalAmount: total,
          senderName: form.get("senderName"),
          senderPhone: form.get("senderPhone"),
          recipientName: form.get("recipientName"),
          recipientPhone: form.get("recipientPhone"),
          isAnonymous: safeguards.anonymous,
          dontCallRecipient: safeguards.dontCall,
          deliveryLandmark: usePinDrop ? "" : landmark,
          giftNote: form.get("giftNote") || giftNote,
          engraving: engraving || undefined,
          quantity,
          shippingFee: usePinDrop ? 0 : (deliveryZone?.fee ?? 0),
          recipientPinRequested: usePinDrop,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(
          orderData.error?.formErrors?.join(", ") ?? orderData.error ?? "Something went wrong."
        );
      }

      const orderId = orderData.order.id;

      // 2. Create PesaPal checkout session
      const paymentRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          merchantReference: orderId,
          description: `TouchGift order #${orderId.slice(0, 8)}`,
          phoneNumber: form.get("senderPhone"),
        }),
      });

      const paymentData = await paymentRes.json();

      if (!paymentRes.ok) {
        throw new Error(paymentData.error ?? "Failed to start payment.");
      }

      // 3. Send pin drop link if requested
      if (usePinDrop) {
        try {
          const pinRes = await fetch("/api/pin-drop/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId }),
          });
          const pinData = await pinRes.json();
          if (pinData.whatsappUrl) {
            window.open(pinData.whatsappUrl, "_blank");
          }
        } catch {
          // Pin drop link send failed — admin can resend from order detail
        }
      }

      // 4. Set redirect URL and keep the spinner view with a manual open/copy fallback
      setRedirectUrl(paymentData.redirectUrl ?? null);
      // Attempt automatic navigation as a best-effort; users with blockers can open the link below
      try {
        if (paymentData.redirectUrl) window.location.href = paymentData.redirectUrl;
      } catch {
        // ignore — fallback UI will allow manual open
      }
    } catch (err: any) {
      setStep("error");
      setErrorMessage(err?.message ?? "Payment flow failed.");
    }
  }

  if (step === "redirecting") {
    return (
      <div className="rounded-lg border border-gray-200 p-6 text-center space-y-2">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-medium">Redirecting to payment…</p>
        <p className="text-sm text-brand-muted">
          You&apos;ll be taken to PesaPal to complete your {formatKsh(total)} payment.
        </p>
        {redirectUrl && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-brand-muted">Didn't redirect? Open the payment page manually:</p>
            <div className="flex items-center justify-center space-x-2">
              <button
                type="button"
                onClick={() => window.open(redirectUrl, "_blank")}
                className="rounded-md bg-brand text-white px-3 py-2 text-sm"
              >
                Open payment page
              </button>
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(redirectUrl)}
                className="rounded-md border border-gray-200 px-3 py-2 text-sm"
              >
                Copy link
              </button>
            </div>
            <p className="text-xs text-brand-muted break-all">{redirectUrl}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 text-sm space-y-1">
        <p className="font-medium">Order summary</p>
        <div className="flex justify-between">
          <span className="text-brand-muted">
            {quantity > 1 ? `${quantity}x item` : "1 item"}
          </span>
          <span>{formatKsh(amount)}</span>
        </div>
        {deliveryZone && (
          <div className="flex justify-between">
            <span className="text-brand-muted">
              Delivery ({deliveryZone.name})
            </span>
            <span>{formatKsh(deliveryZone.fee)}</span>
          </div>
        )}
        <div className="flex justify-between font-medium border-t border-gray-200 pt-1 mt-1">
          <span>Total</span>
          <span>{formatKsh(total)}</span>
        </div>
        {deliveryZone && (
          <p className="text-xs text-brand-muted">{deliveryZone.timeframe}</p>
        )}
        {engraving && (
          <p className="text-brand-muted">
            Engraving: &ldquo;{engraving}&rdquo;
          </p>
        )}
      </div>

      {step === "error" && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {errorMessage}
        </p>
      )}

      <div>
        <label className="text-sm font-medium">Your name</label>
        <input
          name="senderName"
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Your phone number</label>
        <input
          name="senderPhone"
          required
          placeholder="07XX XXX XXX"
          className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Recipient name</label>
        <input
          name="recipientName"
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Recipient phone number</label>
        <input
          name="recipientPhone"
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
        />
      </div>
      <MapPinPicker
        onPinDropToggle={setUsePinDrop}
      />
      <div>
        <label className="text-sm font-medium">Delivery area / landmark</label>
        <input
          name="deliveryLandmark"
          placeholder="e.g. Karen, near Shell station"
          value={landmark}
          onChange={(e) => lookupDelivery(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
        />
        {deliveryZone && (
          <p className="text-xs text-brand-muted mt-1">
            {deliveryZone.name} — delivery fee: {formatKsh(deliveryZone.fee)} ({deliveryZone.timeframe})
          </p>
        )}
      </div>
      <div>
        <label className="text-sm font-medium">Gift note</label>
        <textarea
          name="giftNote"
          defaultValue={giftNote}
          placeholder="Write a message to attach with the gift..."
          className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
        />
      </div>
      <SurpriseToggle onChange={setSafeguards} />
      <div className="flex items-center justify-center gap-6 text-xs text-brand-muted mb-2">
        <div className="flex items-center gap-2">
          <CardIcon />
          <span>Card</span>
        </div>
        <div className="flex items-center gap-2">
          <MobileMoneyIcon />
          <span>Mobile money</span>
        </div>
        <div className="flex items-center gap-2">
          <SecureIcon />
          <span>Secure</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={step !== "form"}
        className="w-full rounded-lg bg-brand text-white py-3 font-medium disabled:opacity-50"
      >
        Pay {formatKsh(total)}
      </button>
      <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-xs text-center text-brand-muted space-y-1">
        <p>On-time delivery or it&apos;s free</p>
        <p>Photo proof before dispatch</p>
        <p>Your identity stays private unless you choose to reveal it</p>
      </div>
    </form>
  );
}
