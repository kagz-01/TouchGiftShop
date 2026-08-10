"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import MapPinPicker from "./MapPinPicker";
import SurpriseToggle from "./SurpriseToggle";
import { formatKsh, cn } from "@/lib/utils";
import { CardIcon, MobileMoneyIcon, SecureIcon } from "@/components/ui/icons/PaymentIcons";

type CheckoutStep = "sender" | "recipient" | "delivery" | "payment";
type FormStatus = "idle" | "redirecting" | "error";

const STEPS: { key: CheckoutStep; label: string; icon: React.ReactNode }[] = [
  { key: "sender", label: "Your Details", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
  { key: "recipient", label: "Recipient", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
  { key: "delivery", label: "Delivery", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  { key: "payment", label: "Payment", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
];

interface DeliveryZone {
  name: string;
  fee: number;
  timeframe: string;
}

interface ProductSummary {
  name: string;
  image_url: string | null;
  price: number;
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
  const [product, setProduct] = useState<ProductSummary | null>(null);

  // Form Data
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [landmark, setLandmark] = useState("");
  const [usePinDrop, setUsePinDrop] = useState(false);
  const [finalGiftNote, setFinalGiftNote] = useState(giftNote);
  const [safeguards, setSafeguards] = useState({ anonymous: false, dontCall: false });
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone | null>(null);

  // Fetch product summary for the order summary panel
  useEffect(() => {
    if (!productId) return;
    fetch(`/api/products/${productId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.product) {
          setProduct({
            name: data.product.name,
            image_url: data.product.image_url,
            price: data.product.price,
          });
        }
      })
      .catch(() => {});
  }, [productId]);

  const lookupDelivery = useCallback(async (value: string) => {
    setLandmark(value);
    if (value.length < 3) { setDeliveryZone(null); return; }
    try {
      const res = await fetch(`/api/delivery?landmark=${encodeURIComponent(value)}`);
      const data = await res.json();
      setDeliveryZone(data.zone);
    } catch { setDeliveryZone(null); }
  }, []);

  const deliveryFee = usePinDrop ? 0 : (deliveryZone?.fee ?? 0);
  const total = amount * quantity + deliveryFee;

  const stepIndex = STEPS.findIndex((s) => s.key === activeStep);

  const completedSteps = {
    sender: !!senderName && !!senderPhone,
    recipient: !!recipientName && !!recipientPhone,
    delivery: usePinDrop || !!landmark,
    payment: false,
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    setRedirectUrl(null);
    setStatus("redirecting");

    try {
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
          shippingFee: deliveryFee,
          recipientPinRequested: usePinDrop,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error?.formErrors?.join(", ") ?? orderData.error ?? "Something went wrong.");
      const orderId = orderData.order.id;

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
      if (paymentData.redirectUrl) window.location.href = paymentData.redirectUrl;
    } catch (err: unknown) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Payment flow failed.");
    }
  }

  /* ─── REDIRECTING STATE ───────────────────────────── */
  if (status === "redirecting") {
    return (
      <div className="max-w-md mx-auto rounded-3xl bg-white border border-surface-border p-10 text-center space-y-5 shadow-card">
        <div className="w-14 h-14 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-display font-bold text-xl">Redirecting to payment…</p>
        <p className="text-sm text-brand-muted">
          You'll be taken to our secure portal to complete your {formatKsh(total)} payment.
        </p>
        {redirectUrl && (
          <div className="mt-4 p-4 bg-surface-secondary rounded-2xl space-y-3">
            <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Browser blocked the pop-up?</p>
            <button onClick={() => window.open(redirectUrl, "_blank")} className="btn-brand text-sm px-6 py-2.5">
              Open Payment Page
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ─── STEP PROGRESS BAR ──────────────────────────── */
  const StepProgress = () => (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((step, idx) => {
        const isActive = step.key === activeStep;
        const isDone = completedSteps[step.key] && idx < stepIndex;
        return (
          <div key={step.key} className="flex items-center">
            <button
              type="button"
              onClick={() => setActiveStep(step.key)}
              className={cn(
                "flex flex-col items-center gap-1 group transition-all",
                isActive ? "opacity-100" : "opacity-50 hover:opacity-80"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all",
                isActive ? "bg-brand text-white border-brand shadow-button" :
                isDone ? "bg-green-500 text-white border-green-500" :
                "bg-white text-brand-muted border-surface-border"
              )}>
                {isDone ? "✓" : idx + 1}
              </div>
              <span className={cn("text-[10px] font-semibold hidden sm:block", isActive ? "text-brand" : "text-brand-muted")}>
                {step.label}
              </span>
            </button>
            {idx < STEPS.length - 1 && (
              <div className={cn(
                "h-0.5 w-12 md:w-20 mx-1 rounded-full transition-colors",
                idx < stepIndex ? "bg-brand" : "bg-surface-border"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );

  /* ─── ORDER SUMMARY PANEL ─────────────────────────── */
  const OrderSummary = () => (
    <div className="space-y-4">
      {/* Product card */}
      <div className="bg-white rounded-3xl border border-surface-border shadow-sm overflow-hidden">
        {product?.image_url && (
          <div className="relative h-48 bg-blush">
            <Image
              src={product.image_url}
              alt={product?.name ?? "Gift"}
              fill
              sizes="400px"
              className="object-contain p-4"
            />
          </div>
        )}
        <div className="p-5">
          <p className="font-display font-bold text-brand-deep line-clamp-2">
            {product?.name ?? "Loading gift…"}
          </p>
          {engraving && (
            <p className="text-xs text-brand-muted mt-1 italic">✏️ Engraving: "{engraving}"</p>
          )}
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-brand-muted">
              <span>{quantity > 1 ? `${quantity}x items` : "1x item"}</span>
              <span className="font-medium text-brand-deep">{formatKsh(amount * quantity)}</span>
            </div>
            {deliveryZone && !usePinDrop && (
              <div className="flex justify-between text-brand-muted">
                <span>Delivery ({deliveryZone.name})</span>
                <span className="font-medium text-brand-deep">{formatKsh(deliveryZone.fee)}</span>
              </div>
            )}
            {usePinDrop && (
              <div className="flex justify-between text-brand-muted">
                <span>Delivery (Pin Drop)</span>
                <span className="font-medium text-green-600">Calculated on drop</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-3 mt-2 border-t border-surface-border text-brand-deep">
              <span>Total</span>
              <span className="text-brand">{formatKsh(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active safeguards banner */}
      {(safeguards.anonymous || safeguards.dontCall) && (
        <div className="bg-brand-deep rounded-2xl p-4 space-y-2">
          <p className="text-xs font-bold text-white uppercase tracking-wider">Safeguards Active</p>
          {safeguards.anonymous && (
            <div className="flex items-center gap-2 text-sm text-white/80">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
              <span>Anonymous Mode — your name is hidden from the recipient</span>
            </div>
          )}
          {safeguards.dontCall && (
            <div className="flex items-center gap-2 text-sm text-white/80">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
              <span>No-contact delivery — rider won't call the recipient</span>
            </div>
          )}
        </div>
      )}

      {/* Gift note preview */}
      {finalGiftNote && (
        <div className="bg-blush rounded-2xl p-4 border border-gold/20">
          <p className="text-xs font-bold text-brand uppercase tracking-wider mb-1">Gift Note</p>
          <p className="text-sm text-brand-deep italic">"{finalGiftNote}"</p>
        </div>
      )}

      {/* Guarantees */}
      <div className="bg-gradient-dark rounded-2xl p-5 space-y-2.5">
        {[
          "On-time delivery or it's free",
          "Photo proof before dispatch",
          "Your identity stays private",
        ].map((g) => (
          <div key={g} className="flex items-center gap-3">
            <span className="text-gold text-sm">✓</span>
            <p className="text-white text-sm">{g}</p>
          </div>
        ))}
      </div>
    </div>
  );

  /* ─── STEP CONTENT ────────────────────────────────── */
  const renderStep = (stepKey: CheckoutStep, content: React.ReactNode) => {
    const step = STEPS.find((s) => s.key === stepKey)!;
    const isActive = activeStep === stepKey;
    const isDone = completedSteps[stepKey] && STEPS.findIndex(s => s.key === stepKey) < stepIndex;
    return (
      <div
        className={cn(
          "rounded-3xl border transition-all duration-300",
          isActive
            ? "bg-white border-brand shadow-card"
            : "bg-white/60 border-surface-border cursor-pointer hover:bg-white hover:shadow-sm"
        )}
        onClick={() => !isActive && setActiveStep(stepKey)}
      >
        <div className="flex items-center justify-between p-5 md:p-6">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
              isActive ? "bg-brand text-white" :
              isDone ? "bg-green-500 text-white" :
              "bg-surface-secondary text-brand-muted"
            )}>
              {isDone ? "✓" : STEPS.findIndex(s => s.key === stepKey) + 1}
            </div>
            <h3 className="font-display font-bold text-lg text-brand-deep">
              {step.icon} {step.label}
            </h3>
          </div>
          {isDone && !isActive && (
            <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-100 px-3 py-1 rounded-full">
              ✓ Done
            </span>
          )}
        </div>
        {isActive && <div className="px-5 md:px-6 pb-6 animate-fade-in">{content}</div>}
      </div>
    );
  };

  /* ─── MAIN RENDER ─────────────────────────────────── */
  return (
    <form onSubmit={handleSubmit}>
      <StepProgress />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* ── LEFT: Form Steps ── */}
        <div className="lg:col-span-3 space-y-4">
          {/* Error */}
          {status === "error" && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm font-medium">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Step 1 — Sender */}
          {renderStep("sender",
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-brand-deep block mb-1">Full Name</label>
                <input
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  required
                  placeholder="e.g. John Doe"
                  className="w-full border-2 border-surface-border focus:border-brand rounded-xl px-4 py-3 outline-none transition-colors text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-brand-deep block mb-1">Phone Number</label>
                <input
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  required
                  placeholder="07XX XXX XXX"
                  type="tel"
                  className="w-full border-2 border-surface-border focus:border-brand rounded-xl px-4 py-3 outline-none transition-colors text-sm"
                />
                <p className="text-xs text-brand-muted mt-1.5">M-Pesa STK push will be sent to this number</p>
              </div>
              <button
                type="button"
                onClick={() => senderName && senderPhone && setActiveStep("recipient")}
                disabled={!senderName || !senderPhone}
                className="w-full btn-brand py-3.5 rounded-xl font-bold text-base shadow-button disabled:opacity-40 mt-2"
              >
                Continue →
              </button>
            </div>
          )}

          {/* Step 2 — Recipient */}
          {renderStep("recipient",
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-brand-deep block mb-1">Recipient's Name</label>
                <input
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  required
                  placeholder="e.g. Jane Doe"
                  className="w-full border-2 border-surface-border focus:border-brand rounded-xl px-4 py-3 outline-none transition-colors text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-brand-deep block mb-1">Recipient's Phone</label>
                <input
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  required
                  placeholder="07XX XXX XXX"
                  type="tel"
                  className="w-full border-2 border-surface-border focus:border-brand rounded-xl px-4 py-3 outline-none transition-colors text-sm"
                />
                <p className="text-xs text-brand-muted mt-1.5">For delivery coordination only</p>
              </div>

              {/* Surprise Safeguard */}
              <SurpriseToggle onChange={setSafeguards} />

              <button
                type="button"
                onClick={() => recipientName && recipientPhone && setActiveStep("delivery")}
                disabled={!recipientName || !recipientPhone}
                className="w-full btn-brand py-3.5 rounded-xl font-bold text-base shadow-button disabled:opacity-40 mt-2"
              >
                Continue →
              </button>
            </div>
          )}

          {/* Step 3 — Delivery */}
          {renderStep("delivery",
            <div className="space-y-5">
              <MapPinPicker onPinDropToggle={setUsePinDrop} />

              {!usePinDrop && (
                <div>
                  <label className="text-sm font-semibold text-brand-deep block mb-1">Delivery Area / Landmark</label>
                  <input
                    value={landmark}
                    onChange={(e) => lookupDelivery(e.target.value)}
                    placeholder="e.g. Karen, near Shell station"
                    className="w-full border-2 border-surface-border focus:border-brand rounded-xl px-4 py-3 outline-none transition-colors text-sm"
                  />
                  {deliveryZone && (
                    <div className="mt-3 p-4 bg-blush rounded-xl border border-gold/20 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-brand-deep">{deliveryZone.name} — {formatKsh(deliveryZone.fee)}</p>
                        <p className="text-xs text-brand-muted">{deliveryZone.timeframe}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-brand-deep block mb-1">
                  Gift Note <span className="font-normal text-brand-muted">(optional)</span>
                </label>
                <textarea
                  value={finalGiftNote}
                  onChange={(e) => setFinalGiftNote(e.target.value)}
                  placeholder="Write a sweet message to attach with the gift…"
                  rows={3}
                  className="w-full border-2 border-surface-border focus:border-brand rounded-xl px-4 py-3 outline-none transition-colors resize-none text-sm"
                />
              </div>

              <button
                type="button"
                onClick={() => (usePinDrop || landmark) && setActiveStep("payment")}
                disabled={!usePinDrop && !landmark}
                className="w-full btn-brand py-3.5 rounded-xl font-bold text-base shadow-button disabled:opacity-40"
              >
                Proceed to Payment →
              </button>
            </div>
          )}

          {/* Step 4 — Payment */}
          {renderStep("payment",
            <div className="space-y-5">
              {/* Payment methods */}
              <div className="flex items-center justify-center gap-8 bg-surface-secondary rounded-2xl py-5 px-4">
                <div className="flex flex-col items-center gap-1 text-xs text-brand-muted font-semibold">
                  <MobileMoneyIcon />
                  <span>M-Pesa</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-xs text-brand-muted font-semibold">
                  <CardIcon />
                  <span>Card</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-xs text-brand-muted font-semibold">
                  <SecureIcon />
                  <span>Secure</span>
                </div>
              </div>

              {/* Order recap before paying */}
              <div className="bg-blush rounded-2xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-brand-muted">Gift</span>
                  <span className="font-medium text-brand-deep line-clamp-1 max-w-[180px] text-right">
                    {product?.name ?? "Your gift"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">Sending to</span>
                  <span className="font-medium text-brand-deep">
                    {safeguards.anonymous ? "Anonymous" : senderName} → {recipientName}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-gold/20">
                  <span>Total to pay</span>
                  <span className="text-brand">{formatKsh(total)}</span>
                </div>
              </div>

              {/* Active mode callouts */}
              {safeguards.anonymous && (
                <div className="flex items-center gap-3 bg-brand-deep/5 border border-brand-deep/10 rounded-xl px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-brand-deep/10 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-brand-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  </div>
                  <p className="text-sm font-semibold text-brand-deep">
                    Anonymous Mode: your name will NOT appear to the recipient
                  </p>
                </div>
              )}
              {safeguards.dontCall && (
                <div className="flex items-center gap-3 bg-brand/5 border border-brand/10 rounded-xl px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                  </div>
                  <p className="text-sm font-semibold text-brand-deep">
                    No-Contact: rider will not call the recipient before arriving
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={status !== "idle" || !senderName || !recipientName || (!landmark && !usePinDrop)}
                className="w-full rounded-2xl bg-brand hover:bg-brand-dark text-white py-4 font-bold text-lg transition-all shadow-button disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Pay securely — {formatKsh(total)}
              </button>

              <p className="text-center text-xs text-brand-muted">
                By proceeding you agree to our{" "}
                <a href="/terms" className="underline hover:text-brand">Terms of Service</a>
              </p>
            </div>
          )}
        </div>

        {/* ── RIGHT: Sticky Order Summary ── */}
        <div className="lg:col-span-2">
          <div className="sticky top-24">
            <OrderSummary />
          </div>
        </div>
      </div>
    </form>
  );
}
