"use client";

import { useState, useCallback, useEffect } from "react";
import MapPinPicker from "./MapPinPicker";
import SurpriseToggle from "./SurpriseToggle";
import CountrySelect from "@/components/ui/CountrySelect";
import { formatKsh } from "@/lib/utils";
import { CardIcon, MobileMoneyIcon, SecureIcon } from "@/components/ui/icons/PaymentIcons";
import { ShieldCheck, Package, Zap, ArrowLeft, ExternalLink, Copy, CheckCircle2, Gift, Tag, Crown } from "lucide-react";
import type { CartItem } from "@/lib/cart";

type Step = "form" | "redirecting" | "error";

interface DeliveryZone {
  name: string;
  fee: number;
  timeframe: string;
  distanceKm?: number;
}

interface LoyaltyInfo {
  tier: string;
  tierConfig?: { name: string; color: string; discount: number };
  discountPercent: number;
  totalOrders: number;
  totalSpend: number;
  nextTier: string | null;
  ordersToNext: number;
}

const INPUT =
  "w-full bg-gray-50 border border-black/8 rounded-xl px-4 py-3 text-sm text-brand-deep placeholder:text-brand-muted/50 focus:outline-none focus:border-brand focus:bg-white transition-all";

const WRAPPING_PRICES = { classic: 200, premium: 500, luxury: 1000 };

export default function CheckoutForm({
  productId,
  amount,
  quantity = 1,
  engraving = "",
  giftNote = "",
  customizationImageUrl = "",
  hamperRef = "",
}: {
  productId: string;
  amount: number;
  quantity?: number;
  engraving?: string;
  giftNote?: string;
  customizationImageUrl?: string;
  hamperRef?: string;
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

  // Cart items
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartCheckout, setIsCartCheckout] = useState(false);

  // Gift wrapping
  const [giftWrapping, setGiftWrapping] = useState(false);
  const [giftWrappingStyle, setGiftWrappingStyle] = useState<"classic" | "premium" | "luxury">("classic");

  // Loyalty
  const [loyaltyInfo, setLoyaltyInfo] = useState<LoyaltyInfo | null>(null);

  // Gift card redemption
  const [giftCardCode, setGiftCardCode] = useState("");
  const [giftCardDiscount, setGiftCardDiscount] = useState(0);
  const [giftCardError, setGiftCardError] = useState<string | null>(null);
  const [giftCardChecking, setGiftCardChecking] = useState(false);

  // Delivery slots
  const [deliverySlots, setDeliverySlots] = useState<Array<{
    id: string; name: string; key: string; description: string;
    extraFee: number; isAvailable: boolean; remainingSlots: number;
  }>>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [slotExtraFee, setSlotExtraFee] = useState(0);

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<Array<{
    id: string; label: string; address_line1: string; city: string;
    landmark: string | null; latitude: number | null; longitude: number | null;
  }>>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Load cart items from localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cartParam = params.get("cart");
    const wrappingParam = params.get("wrapping");

    if (cartParam === "true") {
      setIsCartCheckout(true);
      try {
        const raw = localStorage.getItem("touchgift_cart");
        if (raw) setCartItems(JSON.parse(raw));
      } catch {}
    }

    if (wrappingParam && ["classic", "premium", "luxury"].includes(wrappingParam)) {
      setGiftWrapping(true);
      setGiftWrappingStyle(wrappingParam as "classic" | "premium" | "luxury");
    }
  }, []);

  // Load hamper build from server
  useEffect(() => {
    if (!hamperRef) return;
    setIsCartCheckout(true);
    fetch(`/api/hamper-builds?ref=${encodeURIComponent(hamperRef)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.hamper?.resolvedItems) {
          const items = data.hamper.resolvedItems
            .filter((i: any) => i.product)
            .map((i: any) => ({
              productId: i.productId,
              name: i.product.name,
              price: i.product.price,
              image_url: i.product.image_url,
              quantity: i.quantity,
            }));
          setCartItems(items);
        }
      })
      .catch(() => {});
  }, [hamperRef]);

  // Load loyalty info
  useEffect(() => {
    fetch("/api/loyalty")
      .then((r) => r.json())
      .then((data) => { if (data.tier) setLoyaltyInfo(data); })
      .catch(() => {});
  }, []);

  // Load delivery slots
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];
    setDeliveryDate(dateStr);

    fetch(`/api/delivery-slots?date=${dateStr}`)
      .then((r) => r.json())
      .then((data) => setDeliverySlots(data.slots ?? []))
      .catch(() => {});
  }, []);

  // Load saved addresses
  useEffect(() => {
    fetch("/api/addresses")
      .then((r) => r.json())
      .then((data) => setSavedAddresses(data.addresses ?? []))
      .catch(() => {});
  }, []);

  // Gift card lookup
  async function lookupGiftCard(code: string) {
    if (!code || code.length < 5) {
      setGiftCardDiscount(0);
      setGiftCardError(null);
      return;
    }
    setGiftCardChecking(true);
    try {
      const res = await fetch(`/api/gift-cards?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (data.card?.is_usable) {
        const applicable = Math.min(Number(data.card.balance), total);
        setGiftCardDiscount(applicable);
        setGiftCardError(null);
      } else {
        setGiftCardDiscount(0);
        setGiftCardError(data.card?.is_expired ? "Gift card expired" : "Gift card invalid or empty");
      }
    } catch {
      setGiftCardDiscount(0);
      setGiftCardError("Failed to check gift card");
    }
    setGiftCardChecking(false);
  }

  const lookupDelivery = useCallback(async (value: string, lat?: number | null, lng?: number | null) => {
    setLandmark(value);
    if (value.length < 3) { setDeliveryZone(null); return; }
    try {
      let url = `/api/delivery?landmark=${encodeURIComponent(value)}`;
      if (lat != null && lng != null) url += `&lat=${lat}&lng=${lng}`;
      const res = await fetch(url);
      const data = await res.json();
      setDeliveryZone(data.zone);
    } catch { setDeliveryZone(null); }
  }, []);

  function normalizePhone(v: string, countryCode?: string) {
    const clean = v.replace(/[^0-9+]/g, "");
    if (!clean) return v;
    if (clean.startsWith("+")) return clean;
    if (countryCode === "+254") {
      if (clean.startsWith("07")) return "+254" + clean.slice(1);
      if (clean.startsWith("7") && clean.length === 9) return "+254" + clean;
      if (clean.startsWith("254")) return "+" + clean;
    }
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

  // Calculate totals
  const itemsTotal = isCartCheckout
    ? cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
    : amount;
  const deliveryFee = usePinDrop ? 0 : (deliveryZone?.fee ?? 0);
  const wrappingCost = giftWrapping ? WRAPPING_PRICES[giftWrappingStyle] : 0;
  const loyaltyDiscount = loyaltyInfo && loyaltyInfo.discountPercent > 0
    ? Math.round(itemsTotal * (loyaltyInfo.discountPercent / 100))
    : 0;
  const subtotal = itemsTotal + deliveryFee + wrappingCost - loyaltyDiscount + slotExtraFee;
  const total = Math.max(0, subtotal - giftCardDiscount);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    setRedirectUrl(null);
    setStep("redirecting");

    const normalizedSender = normalizePhone(senderPhone);
    const normalizedRecipient = normalizePhone(recipientPhone);
    const form = new FormData(e.currentTarget);

    try {
      // Create orders for each item (or single item)
      const itemsToOrder = isCartCheckout && cartItems.length > 0
        ? cartItems
        : [{ productId, name: "", price: amount, image_url: null, quantity }];

      const orderIds: string[] = [];

      for (const item of itemsToOrder) {
        const orderRes = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: item.productId,
            totalAmount: item.price * item.quantity,
            senderName: form.get("senderName"),
            senderPhone: normalizedSender,
            recipientName: form.get("recipientName"),
            recipientPhone: normalizedRecipient,
            isAnonymous: safeguards.anonymous,
            dontCallRecipient: safeguards.dontCall,
            deliveryLandmark: usePinDrop ? "" : landmark,
            giftNote: (item as CartItem).giftNote || form.get("giftNote") || giftNote,
            engraving: (item as CartItem).personalization || engraving || undefined,
            customizationImageUrl: (item as CartItem).customizationImageUrl || customizationImageUrl || undefined,
            quantity: item.quantity,
            shippingFee: deliveryFee,
            recipientPinRequested: usePinDrop,
          }),
        });

        const orderData = await orderRes.json();
        if (!orderRes.ok) throw new Error(orderData.error?.formErrors?.join(", ") ?? orderData.error ?? "Failed to create order.");
        orderIds.push(orderData.order.id);
      }

      // Create payment for the total
      const paymentRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          merchantReference: orderIds.length === 1 ? orderIds[0] : `multi-${orderIds.join(",")}`,
          description: isCartCheckout
            ? `TouchGift order (${cartItems.length} items)`
            : `TouchGift order #${orderIds[0].slice(0, 8)}`,
          phoneNumber: normalizedSender,
        }),
      });

      const paymentData = await paymentRes.json();
      if (!paymentRes.ok) throw new Error(paymentData.error ?? "Failed to start payment.");

      // Book delivery slot if selected
      if (selectedSlotId && deliveryDate) {
        for (const oid of orderIds) {
          await fetch("/api/delivery-slots/book", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slotId: selectedSlotId, deliveryDate, orderId: oid }),
          }).catch(() => {});
        }
      }

      // Redeem gift card if applied
      if (giftCardCode && giftCardDiscount > 0) {
        for (const oid of orderIds) {
          await fetch("/api/gift-cards/redeem", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: giftCardCode, orderId: oid, amount: giftCardDiscount / orderIds.length }),
          }).catch(() => {});
        }
      }

      // Clear cart if cart checkout
      if (isCartCheckout) {
        localStorage.removeItem("touchgift_cart");
      }

      if (usePinDrop) {
        try {
          for (const oid of orderIds) {
            const pinRes = await fetch("/api/pin-drop/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: oid }) });
            const pinData = await pinRes.json();
            if (pinData.whatsappUrl) window.open(pinData.whatsappUrl, "_blank");
          }
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
      <div role="status" aria-live="polite" className="sr-only">
        {step === "error" && errorMessage ? `Error: ${errorMessage}` : ""}
        {senderPhoneError ? ` ${senderPhoneError}` : ""}
        {recipientPhoneError ? ` ${recipientPhoneError}` : ""}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-6 items-start">

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
            <MapPinPicker
              onPinDropToggle={setUsePinDrop}
              recipientPhone={recipientPhone}
              recipientName={recipientName || undefined}
            />

            {/* Saved addresses */}
            {!usePinDrop && savedAddresses.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
                  Saved Addresses
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => {
                        setSelectedAddressId(addr.id);
                        setLandmark(addr.landmark || addr.address_line1);
                        lookupDelivery(addr.landmark || addr.address_line1, addr.latitude, addr.longitude);
                      }}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        selectedAddressId === addr.id
                          ? "border-brand bg-brand/5"
                          : "border-black/8 hover:border-brand/20"
                      }`}
                    >
                      <p className="text-xs font-bold text-brand-deep">{addr.label}</p>
                      <p className="text-[11px] text-brand-muted truncate">{addr.address_line1}, {addr.city}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!usePinDrop && (
              <div>
                <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider block mb-1.5">
                  Delivery area / landmark
                </label>
                <input
                  name="deliveryLandmark"
                  placeholder="e.g. Karen, near Shell station"
                  value={landmark}
                  onChange={(e) => { lookupDelivery(e.target.value); setSelectedAddressId(null); }}
                  className={INPUT}
                />
                {deliveryZone && (
                  <p className="text-xs text-brand-muted mt-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                    {deliveryZone.name} — {formatKsh(deliveryZone.fee)} · {deliveryZone.timeframe}
                    {deliveryZone.distanceKm != null && (
                      <span className="text-brand-muted/60">({deliveryZone.distanceKm}km)</span>
                    )}
                  </p>
                )}
              </div>
            )}

            {/* Delivery time slots */}
            {!usePinDrop && deliverySlots.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
                  Delivery Time Slot
                </label>
                <div className="space-y-2">
                  {deliverySlots.filter((s) => s.isAvailable).map((slot) => (
                    <label
                      key={slot.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        selectedSlotId === slot.id
                          ? "border-brand bg-brand/5"
                          : "border-black/8 hover:border-brand/30"
                      }`}
                      onClick={() => {
                        setSelectedSlotId(slot.id);
                        setSlotExtraFee(slot.extraFee);
                      }}
                    >
                      <input
                        type="radio"
                        name="deliverySlot"
                        checked={selectedSlotId === slot.id}
                        onChange={() => {
                          setSelectedSlotId(slot.id);
                          setSlotExtraFee(slot.extraFee);
                        }}
                        className="w-4 h-4 text-brand focus:ring-brand"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-brand-deep">{slot.name}</p>
                        <p className="text-[11px] text-brand-muted">{slot.description}</p>
                      </div>
                      {slot.extraFee > 0 && (
                        <span className="text-xs font-bold text-brand-deep">+{formatKsh(slot.extraFee)}</span>
                      )}
                      {slot.remainingSlots <= 5 && (
                        <span className="text-[10px] font-bold text-orange-500">{slot.remainingSlots} left</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION: Gift Wrapping */}
          <div className="bg-white rounded-3xl border border-black/6 shadow-sm p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-brand-deep">Gift Wrapping 🎁</h2>
                <p className="text-xs text-brand-muted mt-0.5">Make it extra special</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={giftWrapping}
                  onChange={(e) => setGiftWrapping(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
              </label>
            </div>
            {giftWrapping && (
              <div className="space-y-2">
                {[
                  { style: "classic" as const, label: "Classic Wrap", price: 200, emoji: "🎀" },
                  { style: "premium" as const, label: "Premium Box", price: 500, emoji: "🎁" },
                  { style: "luxury" as const, label: "Luxury Experience", price: 1000, emoji: "✨" },
                ].map((opt) => (
                  <label
                    key={opt.style}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      giftWrappingStyle === opt.style
                        ? "border-brand bg-brand/5"
                        : "border-black/8 hover:border-brand/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="wrapping"
                      checked={giftWrappingStyle === opt.style}
                      onChange={() => setGiftWrappingStyle(opt.style)}
                      className="w-4 h-4 text-brand focus:ring-brand"
                    />
                    <span className="text-lg">{opt.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-brand-deep">{opt.label}</p>
                    </div>
                    <span className="text-sm font-bold text-brand-deep">+{formatKsh(opt.price)}</span>
                  </label>
                ))}
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
              {/* Items */}
              {isCartCheckout && cartItems.length > 0 ? (
                cartItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-brand-muted truncate flex-1 mr-2">
                      {item.quantity > 1 ? `${item.quantity}× ` : ""}{item.name}
                    </span>
                    <span className="font-medium">{formatKsh(item.price * item.quantity)}</span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between">
                  <span className="text-brand-muted">{quantity > 1 ? `${quantity}× item` : "1 item"}</span>
                  <span className="font-medium">{formatKsh(amount)}</span>
                </div>
              )}

              {/* Delivery */}
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

              {/* Gift wrapping */}
              {giftWrapping && (
                <div className="flex justify-between">
                  <span className="text-brand-muted">Gift wrapping</span>
                  <span className="font-medium">{formatKsh(wrappingCost)}</span>
                </div>
              )}

              {/* Loyalty discount */}
              {loyaltyInfo && loyaltyInfo.discountPercent > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span className="flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5" />
                    {loyaltyInfo.tier} ({loyaltyInfo.discountPercent}% off)
                  </span>
                  <span className="font-medium">-{formatKsh(loyaltyDiscount)}</span>
                </div>
              )}

              {engraving && (
                <div className="border-t border-black/5 pt-3">
                  <p className="text-brand-muted text-xs">Engraving: &ldquo;{engraving}&rdquo;</p>
                </div>
              )}

              {customizationImageUrl && (
                <div className="border-t border-black/5 pt-3">
                  <p className="text-brand-muted text-xs mb-2">Custom Design:</p>
                  <img
                    src={customizationImageUrl}
                    alt="Custom design preview"
                    className="w-20 h-20 object-cover rounded-lg border border-black/10"
                  />
                </div>
              )}

              <div className="border-t border-black/5 pt-3 flex justify-between font-bold text-brand-deep">
                <span>Total</span>
                <span>{formatKsh(total)}</span>
              </div>
              {deliveryZone && <p className="text-xs text-brand-muted">{deliveryZone.timeframe}</p>}
            </div>
          </div>

          {/* Loyalty tier badge */}
          {loyaltyInfo && (
            <div className="bg-white rounded-3xl border border-black/6 shadow-sm p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
                <Crown className="w-5 h-5 text-brand-deep" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-brand-deep capitalize">{loyaltyInfo.tier} Member</p>
                <p className="text-[10px] text-brand-muted">
                  {loyaltyInfo.discountPercent > 0
                    ? `${loyaltyInfo.discountPercent}% off every order`
                    : loyaltyInfo.ordersToNext > 0
                      ? `${loyaltyInfo.ordersToNext} more orders for ${loyaltyInfo.nextTier}`
                      : "You've reached the top tier!"}
                </p>
              </div>
            </div>
          )}

          {/* Gift Card Redemption */}
          <div className="bg-white rounded-3xl border border-black/6 shadow-sm p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-brand" />
              <p className="text-sm font-semibold text-brand-deep">Have a gift card?</p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="TG-XXXXXXXX"
                value={giftCardCode}
                onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
                onBlur={() => lookupGiftCard(giftCardCode)}
                className={`${INPUT} flex-1 font-mono text-xs`}
              />
              <button
                type="button"
                onClick={() => lookupGiftCard(giftCardCode)}
                disabled={giftCardChecking || !giftCardCode}
                className="px-4 py-2 bg-brand/10 text-brand rounded-xl text-xs font-semibold hover:bg-brand/20 transition-colors disabled:opacity-50"
              >
                {giftCardChecking ? "Checking..." : "Apply"}
              </button>
            </div>
            {giftCardDiscount > 0 && (
              <p className="text-xs text-emerald-600 font-medium">
                Gift card applied: -{formatKsh(giftCardDiscount)}
              </p>
            )}
            {giftCardError && (
              <p className="text-xs text-red-500">{giftCardError}</p>
            )}
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
