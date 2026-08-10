"use client";

import { useState, useCallback } from "react";
import MapPinPicker from "./MapPinPicker";
import SurpriseToggle from "./SurpriseToggle";
import { formatKsh, cn } from "@/lib/utils";
import { CardIcon, MobileMoneyIcon, SecureIcon } from "@/components/ui/icons/PaymentIcons";

type CheckoutStep = "sender" | "recipient" | "delivery" | "payment";
type FormStatus = "idle" | "redirecting" | "error";

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
  const [activeStep, setActiveStep] = useState<CheckoutStep>("sender");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  // Form Data State
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [landmark, setLandmark] = useState("");
  const [usePinDrop, setUsePinDrop] = useState(false);
  const [finalGiftNote, setFinalGiftNote] = useState(giftNote);
  
  const [safeguards, setSafeguards] = useState({
    anonymous: false,
    dontCall: false,
  });
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone | null>(null);

  const lookupDelivery = useCallback(async (value: string) => {
    setLandmark(value);
    if (value.length < 3) {
      setDeliveryZone(null);
      return;
    }
    try {
      const res = await fetch(`/api/delivery?landmark=${encodeURIComponent(value)}`);
      const data = await res.json();
      setDeliveryZone(data.zone);
    } catch {
      setDeliveryZone(null);
    }
  }, []);

  const total = amount * quantity + (usePinDrop ? 0 : (deliveryZone?.fee ?? 0));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    setRedirectUrl(null);
    setStatus("redirecting");

    try {
      // 1. Create order
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          totalAmount: total,
          senderName,
          senderPhone,
          recipientName,
          recipientPhone,
          isAnonymous: safeguards.anonymous,
          dontCallRecipient: safeguards.dontCall,
          deliveryLandmark: usePinDrop ? "" : landmark,
          giftNote: finalGiftNote,
          engraving: engraving || undefined,
          quantity,
          shippingFee: usePinDrop ? 0 : (deliveryZone?.fee ?? 0),
          recipientPinRequested: usePinDrop,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error?.formErrors?.join(", ") ?? orderData.error ?? "Something went wrong.");

      const orderId = orderData.order.id;

      // 2. Create PesaPal checkout
      const paymentRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          merchantReference: orderId,
          description: `TouchGift order #${orderId.slice(0, 8)}`,
          phoneNumber: senderPhone,
        }),
      });

      const paymentData = await paymentRes.json();
      if (!paymentRes.ok) throw new Error(paymentData.error ?? "Failed to start payment.");

      // 3. Pin drop
      if (usePinDrop) {
        try {
          const pinRes = await fetch("/api/pin-drop/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId }),
          });
          const pinData = await pinRes.json();
          if (pinData.whatsappUrl) window.open(pinData.whatsappUrl, "_blank");
        } catch { }
      }

      setRedirectUrl(paymentData.redirectUrl ?? null);
      try {
        if (paymentData.redirectUrl) window.location.href = paymentData.redirectUrl;
      } catch { }
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err?.message ?? "Payment flow failed.");
    }
  }

  if (status === "redirecting") {
    return (
      <div className="rounded-3xl bg-white border border-surface-border p-8 text-center space-y-4 shadow-card">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-display font-semibold text-lg">Redirecting to payment…</p>
        <p className="text-sm text-brand-muted">
          You&apos;ll be taken to our secure portal to complete your {formatKsh(total)} payment.
        </p>
        {redirectUrl && (
          <div className="mt-6 p-4 bg-surface-secondary rounded-2xl space-y-3">
            <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Browser blocked the pop-up?</p>
            <div className="flex items-center justify-center space-x-2">
              <button onClick={() => window.open(redirectUrl, "_blank")} className="btn-brand text-xs">
                Open Payment Page
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <div className="rounded-3xl bg-white border border-surface-border p-6 shadow-sm">
        <h3 className="font-display font-bold text-lg mb-4 text-brand-deep border-b border-surface-border pb-3">Order Summary</h3>
        <div className="space-y-2 text-sm text-brand-deep">
          <div className="flex justify-between">
            <span className="text-brand-muted">{quantity > 1 ? `${quantity}x items` : "1x item"}</span>
            <span className="font-medium">{formatKsh(amount * quantity)}</span>
          </div>
          {deliveryZone && !usePinDrop && (
            <div className="flex justify-between">
              <span className="text-brand-muted">Delivery ({deliveryZone.name})</span>
              <span className="font-medium">{formatKsh(deliveryZone.fee)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg pt-3 mt-3 border-t border-surface-border text-brand-deep">
            <span>Total to pay</span>
            <span>{formatKsh(total)}</span>
          </div>
        </div>
      </div>

      {status === "error" && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Step 1: Sender Details */}
        <div className={cn("rounded-3xl border transition-all duration-300", activeStep === "sender" ? "bg-white border-brand shadow-card p-6" : "bg-surface-secondary border-transparent p-5 cursor-pointer opacity-70 hover:opacity-100")} onClick={() => activeStep !== "sender" && setActiveStep("sender")}>
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-brand-deep">1. Your Details</h3>
            {activeStep !== "sender" && senderName && <span className="text-xs font-semibold text-brand bg-blush px-3 py-1 rounded-full">Completed</span>}
          </div>
          {activeStep === "sender" && (
            <div className="mt-5 space-y-4 animate-fade-in">
              <div>
                <label className="text-sm font-semibold text-brand-deep">Full Name</label>
                <input value={senderName} onChange={(e) => setSenderName(e.target.value)} required placeholder="e.g. John Doe" className="w-full border-2 border-surface-border focus:border-brand rounded-xl px-4 py-3 mt-1 outline-none transition-colors" />
              </div>
              <div>
                <label className="text-sm font-semibold text-brand-deep">Phone Number</label>
                <input value={senderPhone} onChange={(e) => setSenderPhone(e.target.value)} required placeholder="07XX XXX XXX" className="w-full border-2 border-surface-border focus:border-brand rounded-xl px-4 py-3 mt-1 outline-none transition-colors" />
              </div>
              <button type="button" onClick={() => senderName && senderPhone && setActiveStep("recipient")} className="btn-brand w-full mt-2" disabled={!senderName || !senderPhone}>Continue</button>
            </div>
          )}
        </div>

        {/* Step 2: Recipient Details */}
        <div className={cn("rounded-3xl border transition-all duration-300", activeStep === "recipient" ? "bg-white border-brand shadow-card p-6" : "bg-surface-secondary border-transparent p-5 cursor-pointer opacity-70 hover:opacity-100")} onClick={() => activeStep !== "recipient" && setActiveStep("recipient")}>
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-brand-deep">2. Recipient Details</h3>
            {activeStep !== "recipient" && recipientName && <span className="text-xs font-semibold text-brand bg-blush px-3 py-1 rounded-full">Completed</span>}
          </div>
          {activeStep === "recipient" && (
            <div className="mt-5 space-y-4 animate-fade-in">
              <div>
                <label className="text-sm font-semibold text-brand-deep">Recipient's Name</label>
                <input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} required placeholder="e.g. Jane Doe" className="w-full border-2 border-surface-border focus:border-brand rounded-xl px-4 py-3 mt-1 outline-none transition-colors" />
              </div>
              <div>
                <label className="text-sm font-semibold text-brand-deep">Recipient's Phone Number</label>
                <input value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} required placeholder="07XX XXX XXX" className="w-full border-2 border-surface-border focus:border-brand rounded-xl px-4 py-3 mt-1 outline-none transition-colors" />
              </div>
              <SurpriseToggle onChange={setSafeguards} />
              <button type="button" onClick={() => recipientName && recipientPhone && setActiveStep("delivery")} className="btn-brand w-full mt-2" disabled={!recipientName || !recipientPhone}>Continue</button>
            </div>
          )}
        </div>

        {/* Step 3: Delivery & Options */}
        <div className={cn("rounded-3xl border transition-all duration-300", activeStep === "delivery" ? "bg-white border-brand shadow-card p-6" : "bg-surface-secondary border-transparent p-5 cursor-pointer opacity-70 hover:opacity-100")} onClick={() => activeStep !== "delivery" && setActiveStep("delivery")}>
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-brand-deep">3. Delivery & Options</h3>
            {activeStep !== "delivery" && (landmark || usePinDrop) && <span className="text-xs font-semibold text-brand bg-blush px-3 py-1 rounded-full">Completed</span>}
          </div>
          {activeStep === "delivery" && (
            <div className="mt-5 space-y-5 animate-fade-in">
              <MapPinPicker onPinDropToggle={setUsePinDrop} />
              
              {!usePinDrop && (
                <div>
                  <label className="text-sm font-semibold text-brand-deep">Delivery Area / Landmark</label>
                  <input value={landmark} onChange={(e) => lookupDelivery(e.target.value)} placeholder="e.g. Karen, near Shell station" className="w-full border-2 border-surface-border focus:border-brand rounded-xl px-4 py-3 mt-1 outline-none transition-colors" />
                  {deliveryZone && (
                    <div className="mt-3 p-3 bg-blush rounded-xl border border-gold/20 flex items-start gap-3">
                      <span className="text-lg">🚚</span>
                      <div>
                        <p className="text-sm font-semibold text-brand-deep">{deliveryZone.name} — {formatKsh(deliveryZone.fee)}</p>
                        <p className="text-xs text-brand-muted">{deliveryZone.timeframe}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-brand-deep">Gift Note (Optional)</label>
                <textarea value={finalGiftNote} onChange={(e) => setFinalGiftNote(e.target.value)} placeholder="Write a message to attach with the gift..." rows={2} className="w-full border-2 border-surface-border focus:border-brand rounded-xl px-4 py-3 mt-1 outline-none transition-colors resize-none" />
              </div>

              <button type="button" onClick={() => (usePinDrop || landmark) && setActiveStep("payment")} className="btn-brand w-full mt-2" disabled={!usePinDrop && !landmark}>Proceed to Payment</button>
            </div>
          )}
        </div>

        {/* Step 4: Payment */}
        <div className={cn("rounded-3xl border transition-all duration-300", activeStep === "payment" ? "bg-white border-brand shadow-card p-6" : "bg-surface-secondary border-transparent p-5 cursor-pointer opacity-70 hover:opacity-100")} onClick={() => activeStep !== "payment" && setActiveStep("payment")}>
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-brand-deep">4. Payment</h3>
          </div>
          {activeStep === "payment" && (
            <div className="mt-5 space-y-5 animate-fade-in">
              <div className="flex items-center justify-center gap-6 text-xs text-brand-muted font-semibold bg-surface-secondary rounded-xl py-4">
                <div className="flex items-center gap-2"><CardIcon /><span>Card</span></div>
                <div className="flex items-center gap-2"><MobileMoneyIcon /><span>M-Pesa</span></div>
                <div className="flex items-center gap-2"><SecureIcon /><span>Secure</span></div>
              </div>

              <button type="submit" disabled={status !== "idle" || !senderName || !recipientName || (!landmark && !usePinDrop)} className="w-full rounded-2xl bg-brand hover:bg-brand-dark text-white py-4 font-semibold text-lg transition-colors shadow-button disabled:opacity-50">
                Pay securely {formatKsh(total)}
              </button>
              
              <div className="flex flex-col items-center gap-2 mt-4 opacity-70">
                <div className="flex items-center gap-2 text-xs text-brand-muted font-medium"><span className="text-gold">✓</span> On-time delivery guarantee</div>
                <div className="flex items-center gap-2 text-xs text-brand-muted font-medium"><span className="text-gold">✓</span> Photo proof before dispatch</div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
