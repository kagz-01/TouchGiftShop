"use client";

import { useState, useCallback, useEffect } from "react";
import MapPinPicker from "./MapPinPicker";
import SurpriseToggle from "./SurpriseToggle";
import CountrySelect from "@/components/ui/CountrySelect";
import { formatKsh } from "@/lib/utils";
import { CardIcon, MobileMoneyIcon, SecureIcon } from "@/components/ui/icons/PaymentIcons";
import { ShieldCheck, Package, Zap, ArrowLeft, ExternalLink, Copy, CheckCircle2 } from "lucide-react";

type Step = "form" | "redirecting" | "error";

interface DeliveryZone {
  name: string;
  fee: number;
  timeframe: string;
}

/* ── reusable input style ── */
const INPUT =
  "w-full bg-gray-50 border border-black/8 rounded-xl px-4 py-3 text-sm text-brand-deep placeholder:text-brand-muted/50 focus:outline-none focus:border-brand focus:bg-white transition-all";

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
  const [copied, setCopied] = useState(false);
  const [safeguards, setSafeguards] = useState({ anonymous: false, dontCall: false });
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone | null>(null);
  const [landmark, setLandmark] = useState("");
  const [usePinDrop, setUsePinDrop] = useState(false);
  const [senderPhone, setSenderPhone] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [senderCountry, setSenderCountry] = useState<string>("+254");
  const [recipientCountry, setRecipientCountry] = useState<string>("+254");
  const [recipientName, setRecipientName] = useState("");
  const [senderPhoneError, setSenderPhoneError] = useState<string | null>(null);
  const [recipientPhoneError, setRecipientPhoneError] = useState<string | null>(null);

  const lookupDelivery = useCallback(async (value: string) => {
    setLandmark(value);
    if (value.length < 3) { setDeliveryZone(null); return; }
    try {
      const res = await fetch(`/api/delivery?landmark=${encodeURIComponent(value)}`);
      const data = await res.json();
      setDeliveryZone(data.zone);
    } catch { setDeliveryZone(null); }
  }, []);

  function normalizePhone(v: string, countryCode?: string) {
    const clean = v.replace(/[^0-9+]/g, "");
    if (!clean) return v;
    if (clean.startsWith("+")) return clean;
    // Local Kenyan mobile numbers (07xx or 7xxx)
    if (countryCode === "+254") {
      if (clean.startsWith("07")) return "+254" + clean.slice(1);
      if (clean.startsWith("7") && clean.length === 9) return "+254" + clean;
      if (clean.startsWith("254")) return "+" + clean;
    }
    // Fallback: prefix selected country code if provided
    if (countryCode) {
      const noLead = clean.replace(/^0+/, "");
      return countryCode + noLead;
    }
    return clean;
  }

  function isPhoneValid(v: string) {
    const t = v.trim();
    if (!t) return false;
    if (t.startsWith("+")) { const d = t.replace(/\D/g, ""); return d.length >= 8 && d.length <= 15; }
    const d = t.replace(/\D/g, "");
    return (
      (d.startsWith("254") && d.length === 12) ||
      (d.startsWith("07") && d.length === 10) ||
      (d.length === 9 && (d.startsWith("7") || d.startsWith("1")))
    );
  }

  useEffect(() => { setSenderPhoneError(senderPhone ? (isPhoneValid(senderPhone) ? null : "Invalid number") : null); }, [senderPhone]);
  useEffect(() => { setRecipientPhoneError(recipientPhone ? (isPhoneValid(recipientPhone) ? null : "Invalid number") : null); }, [recipientPhone]);

  const total = amount + (usePinDrop ? 0 : (deliveryZone?.fee ?? 0));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    setRedirectUrl(null);
    setStep("redirecting");

    const normalizedSender = normalizePhone(senderPhone);
    const normalizedRecipient = normalizePhone(recipientPhone);
    const form = new FormData(e.currentTarget);

    try {
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          totalAmount: total,
          senderName: form.get("senderName"),
          senderPhone: normalizedSender,
          recipientName: form.get("recipientName"),
          recipientPhone: normalizedRecipient,
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
      if (!orderRes.ok) throw new Error(orderData.error?.formErrors?.join(", ") ?? orderData.error ?? "Something went wrong.");

      const orderId = orderData.order.id;

      const paymentRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          merchantReference: orderId,
          description: `TouchGift order #${orderId.slice(0, 8)}`,
          phoneNumber: normalizedSender,
        }),
      });

      const paymentData = await paymentRes.json();
      if (!paymentRes.ok) throw new Error(paymentData.error ?? "Failed to start payment.");

      if (usePinDrop) {
        try {
          const pinRes = await fetch("/api/pin-drop/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId }) });
          const pinData = await pinRes.json();
          if (pinData.whatsappUrl) window.open(pinData.whatsappUrl, "_blank");
        } catch { /* admin can resend */ }
      }

      setRedirectUrl(paymentData.redirectUrl ?? null);
      try { if (paymentData.redirectUrl) window.location.href = paymentData.redirectUrl; } catch { /* ignore */ }
    } catch (err: any) {
      setStep("error");
      setErrorMessage(err?.message ?? "Payment flow failed.");
    }
  }

  /* ── Redirecting State ── */
  if (step === "redirecting") {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-3xl border border-black/6 shadow-sm p-10 text-center">
          <div className="w-16 h-16 bg-brand/8 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <div className="w-7 h-7 border-[3px] border-brand border-t-transparent rounded-full animate-spin" />
          </div>
          <h3 className="font-display text-xl font-bold text-brand-deep mb-2">Taking you to payment…</h3>
          <p className="text-sm text-brand-muted mb-6">
            You&apos;ll complete your <span className="font-semibold text-brand-deep">{formatKsh(total)}</span> payment securely via PesaPal.
          </p>
          {redirectUrl && (
            <div className="space-y-3 mt-4">
              <p className="text-xs text-brand-muted">Didn&apos;t redirect automatically?</p>
              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => window.open(redirectUrl, "_blank")}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-brand text-white text-sm font-semibold rounded-xl hover:bg-brand-dark transition-colors"
                >
                  Open payment page
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => { navigator.clipboard?.writeText(redirectUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 text-brand-deep text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy link"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── Main Form ── */
  return (
    <form onSubmit={handleSubmit}>
      {/* Screen-reader live region for form status and phone validation errors */}
      <div role="status" aria-live="polite" className="sr-only">
        {step === "error" && errorMessage ? `Error: ${errorMessage}` : ""}
        {senderPhoneError ? ` ${senderPhoneError}` : ""}
        {recipientPhoneError ? ` ${recipientPhoneError}` : ""}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">

        {/* ── LEFT: Form ── */}
        <div className="space-y-4">
          {step === "error" && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600 flex items-start gap-3">
              <span className="text-lg flex-shrink-0">⚠️</span>
              <p>{errorMessage}</p>
            </div>
          )}

          {/* SECTION: Sender */}
          <div className="bg-white rounded-3xl border border-black/6 shadow-sm p-6 space-y-4">
            <h2 className="font-display font-bold text-brand-deep">Your details</h2>
            <div>
              <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider block mb-1.5">Your name</label>
              <input name="senderName" required placeholder="e.g. Amina Wanjiku" className={INPUT} />
            </div>
            <div>
              <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider block mb-1.5">Your phone number</label>
              <div className="flex items-center gap-3">
                <div className="shrink-0">
                  <CountrySelect value={senderCountry} onChange={setSenderCountry} className="!w-28" ariaLabel="sender country code" />
                </div>
                <input
                  name="senderPhone" required type="tel"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  onBlur={(e) => setSenderPhone(normalizePhone(e.target.value.trim(), senderCountry))}
                  placeholder="07XX XXX XXX"
                  maxLength={15}
                  className={`${INPUT} flex-1 ${senderPhoneError ? "!border-red-400 !bg-red-50" : ""}`}
                />
              </div>
              {senderPhoneError
                ? <p className="text-xs text-red-500 mt-1.5">{senderPhoneError}</p>
                : <p className="text-[11px] text-brand-muted mt-1.5">We auto-format common local numbers to the selected country code</p>
              }
            </div>
          </div>

          {/* SECTION: Recipient */}
          <div className="bg-white rounded-3xl border border-black/6 shadow-sm p-6 space-y-4">
            <h2 className="font-display font-bold text-brand-deep">Recipient details</h2>
            <div>
              <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider block mb-1.5">Their name</label>
              <input
                name="recipientName" required
                placeholder="e.g. Brian Kamau"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className={INPUT}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider block mb-1.5">Their phone number</label>
              <div className="flex items-center gap-3">
                <div className="shrink-0">
                  <CountrySelect value={recipientCountry} onChange={setRecipientCountry} className="!w-28" ariaLabel="recipient country code" />
                </div>
                <input
                  name="recipientPhone" required type="tel"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  onBlur={(e) => setRecipientPhone(normalizePhone(e.target.value.trim(), recipientCountry))}
                  placeholder="07XX XXX XXX"
                  maxLength={15}
                  className={`${INPUT} flex-1 ${recipientPhoneError ? "!border-red-400 !bg-red-50" : ""}`}
                />
              </div>
              {recipientPhoneError && <p className="text-xs text-red-500 mt-1.5">{recipientPhoneError}</p>}
            </div>
          </div>

          {/* SECTION: Delivery */}
          <div className="bg-white rounded-3xl border border-black/6 shadow-sm p-6 space-y-4">
            <h2 className="font-display font-bold text-brand-deep">Delivery</h2>

            {/* Pin Drop toggle */}
            <MapPinPicker
              onPinDropToggle={setUsePinDrop}
              recipientPhone={recipientPhone}
              recipientName={recipientName || undefined}
            />

            {/* Landmark — hidden when pin drop is on */}
            {!usePinDrop && (
              <div>
                <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider block mb-1.5">
                  Delivery area / landmark
                </label>
                <input
                  name="deliveryLandmark"
                  placeholder="e.g. Karen, near Shell station"
                  value={landmark}
                  onChange={(e) => lookupDelivery(e.target.value)}
                  className={INPUT}
                />
                {deliveryZone && (
                  <p className="text-xs text-brand-muted mt-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                    {deliveryZone.name} — {formatKsh(deliveryZone.fee)} · {deliveryZone.timeframe}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* SECTION: Gift note */}
          <div className="bg-white rounded-3xl border border-black/6 shadow-sm p-6 space-y-3">
            <div>
              <h2 className="font-display font-bold text-brand-deep">Gift note</h2>
              <p className="text-xs text-brand-muted mt-0.5">Optional — printed and attached to the gift</p>
            </div>
            <textarea
              name="giftNote"
              defaultValue={giftNote}
              rows={3}
              placeholder="Write a heartfelt message to attach with the gift…"
              className={`${INPUT} resize-none`}
            />
          </div>

          {/* SECTION: Surprise Safeguard */}
          <SurpriseToggle onChange={setSafeguards} />
        </div>

        {/* ── RIGHT: Order Summary (sticky on desktop) ── */}
        <div className="lg:sticky lg:top-20 space-y-4">
          {/* Summary card */}
          <div className="bg-white rounded-3xl border border-black/6 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-br from-brand-dark to-brand px-6 py-5">
              <p className="text-[11px] font-semibold text-white/60 uppercase tracking-wider mb-1">Order summary</p>
              <p className="font-display text-2xl font-bold text-white">{formatKsh(total)}</p>
              {deliveryZone && !usePinDrop && (
                <p className="text-xs text-white/60 mt-0.5">incl. {formatKsh(deliveryZone.fee)} delivery</p>
              )}
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-muted">{quantity > 1 ? `${quantity}× item` : "1 item"}</span>
                <span className="font-medium">{formatKsh(amount)}</span>
              </div>
              {deliveryZone && !usePinDrop && (
                <div className="flex justify-between">
                  <span className="text-brand-muted">Delivery ({deliveryZone.name})</span>
                  <span className="font-medium">{formatKsh(deliveryZone.fee)}</span>
                </div>
              )}
              {usePinDrop && (
                <div className="flex justify-between">
                  <span className="text-brand-muted">Delivery</span>
                  <span className="text-emerald-600 font-semibold text-xs">Calculated after pin drop</span>
                </div>
              )}
              {engraving && (
                <div className="border-t border-black/5 pt-3">
                  <p className="text-brand-muted text-xs">Engraving: &ldquo;{engraving}&rdquo;</p>
                </div>
              )}
              <div className="border-t border-black/5 pt-3 flex justify-between font-bold text-brand-deep">
                <span>Total</span>
                <span>{formatKsh(total)}</span>
              </div>
              {deliveryZone && <p className="text-xs text-brand-muted">{deliveryZone.timeframe}</p>}
            </div>
          </div>

          {/* Trust badges */}
          <div className="bg-white rounded-3xl border border-black/6 shadow-sm p-5 space-y-3">
            {[
              { icon: <Zap className="w-4 h-4 text-gold-dark" />, text: "On-time delivery or it's free" },
              { icon: <Package className="w-4 h-4 text-brand" />, text: "Photo proof before dispatch" },
              { icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />, text: "Your identity stays private" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-black/5">
                  {item.icon}
                </div>
                <span className="text-xs font-medium text-brand-muted">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Pay button */}
          <button
            id="checkout-pay-btn"
            type="submit"
            disabled={
              step !== "form" ||
              !!senderPhoneError ||
              !!recipientPhoneError ||
              !senderPhone ||
              !recipientPhone
            }
            className="w-full py-4 bg-gradient-to-r from-gold to-gold-light text-brand-deep rounded-2xl font-bold text-base shadow-gold hover:shadow-gold-lg hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            Pay {formatKsh(total)} →
          </button>

          {/* Payment methods */}
          <div className="flex items-center justify-center gap-5 text-xs text-brand-muted">
            <div className="flex items-center gap-1.5"><CardIcon /><span>Card</span></div>
            <div className="flex items-center gap-1.5"><MobileMoneyIcon /><span>M-Pesa</span></div>
            <div className="flex items-center gap-1.5"><SecureIcon /><span>Secured</span></div>
          </div>
        </div>

      </div>
    </form>
  );
}
