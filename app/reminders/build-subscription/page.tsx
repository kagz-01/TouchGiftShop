"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatKsh, cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
}

const FREQUENCIES = ["Weekly", "Bi-weekly", "Monthly", "Quarterly", "Annually"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const WHATSAPP_NUMBER = "254700000000"; // TODO: replace with real WhatsApp number

export default function BuildSubscriptionPage() {
  const router = useRouter();

  // Form fields
  const [recipientName, setRecipientName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [frequency, setFrequency] = useState("Weekly");
  const [deliveryDay, setDeliveryDay] = useState("Friday");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [googleMapsLink, setGoogleMapsLink] = useState("");
  const [loading, setLoading] = useState(false);

  // Gift selection
  const [giftTab, setGiftTab] = useState<"catalog" | "describe">("catalog");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [customDescription, setCustomDescription] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products ?? []);
        setProductsLoading(false);
      })
      .catch(() => setProductsLoading(false));
  }, []);

  const selectedIds = new Set(selectedProducts.map((p) => p.id));

  const toggleProduct = (product: Product) => {
    setSelectedProducts((prev) => {
      if (prev.find((p) => p.id === product.id)) {
        return prev.filter((p) => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPrice = selectedProducts.reduce((acc, p) => acc + p.price, 0);

  const canSubmit =
    recipientName.trim().length > 0 &&
    deliveryAddress.trim().length > 0 &&
    (selectedProducts.length > 0 || customDescription.trim().length > 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);

    await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientName,
        relationship: relationship || undefined,
        isSubscription: true,
        frequency,
        productIds: selectedProducts.map((p) => p.id),
        deliveryDay,
        deliveryAddress: deliveryAddress || undefined,
        googleMapsLink: googleMapsLink || undefined,
        customDescription: customDescription || undefined,
      }),
    });

    setLoading(false);
    router.push("/reminders?tab=subscriptions");
  }

  const whatsappMessage = encodeURIComponent(
    `Hi TouchGift! I'd like to set up a subscription gift box.\n\n${customDescription ? `Gift description:\n${customDescription}\n\n` : ""}Please help me set this up.`
  );
  const emailSubject = encodeURIComponent("Subscription Gift Box Request");
  const emailBody = encodeURIComponent(
    `Hi TouchGift,\n\nI'd like to set up a subscription gift box.\n\n${customDescription ? `Gift description:\n${customDescription}\n\n` : ""}Please assist me.\n\nThank you.`
  );

  return (
    <div className="min-h-screen bg-gradient-warm pb-12">
      {/* Header */}
      <div className="bg-white border-b border-surface-border sticky top-0 z-10">
        <div className="page-container py-5 flex items-center gap-3">
          <Link
            href="/reminders"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface transition-colors text-brand-muted hover:text-brand flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold text-brand-deep">Subscription Box Builder</h1>
            <p className="text-xs text-brand-muted">Schedule recurring gift deliveries</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="page-container mt-6 space-y-6">

        {/* ─── RECIPIENT ─── */}
        <div className="bg-white rounded-2xl border border-surface-border p-5 space-y-4">
          <h2 className="font-display font-bold text-brand-deep">Recipient Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-deep mb-1">Recipient Name <span className="text-red-400">*</span></label>
              <input
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Grace, My Wife"
                className="w-full border border-surface-border rounded-xl px-3 py-2.5 text-sm focus:border-brand outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-deep mb-1">Relationship</label>
              <input
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="e.g. Spouse, Mum"
                className="w-full border border-surface-border rounded-xl px-3 py-2.5 text-sm focus:border-brand outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* ─── SCHEDULE ─── */}
        <div className="bg-white rounded-2xl border border-surface-border p-5 space-y-4">
          <h2 className="font-display font-bold text-brand-deep">Delivery Schedule</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-deep mb-1">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full border border-surface-border rounded-xl px-3 py-2.5 text-sm focus:border-brand outline-none transition-colors bg-white"
              >
                {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-deep mb-1">Delivery Day</label>
              <select
                value={deliveryDay}
                onChange={(e) => setDeliveryDay(e.target.value)}
                className="w-full border border-surface-border rounded-xl px-3 py-2.5 text-sm focus:border-brand outline-none transition-colors bg-white"
              >
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ─── DELIVERY ADDRESS ─── */}
        <div className="bg-white rounded-2xl border border-surface-border p-5 space-y-3">
          <h2 className="font-display font-bold text-brand-deep">Delivery Location</h2>
          <div>
            <label className="block text-xs font-semibold text-brand-deep mb-1">Landmark / Area <span className="text-red-400">*</span></label>
            <input
              required
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="e.g. Kilimani, near Yaya Centre"
              className="w-full border border-surface-border rounded-xl px-3 py-2.5 text-sm focus:border-brand outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-deep mb-1">Google Maps Pin <span className="text-brand-muted font-normal">(Optional)</span></label>
            <input
              value={googleMapsLink}
              onChange={(e) => setGoogleMapsLink(e.target.value)}
              placeholder="Paste Google Maps link here"
              className="w-full border border-surface-border rounded-xl px-3 py-2.5 text-sm focus:border-brand outline-none transition-colors"
            />
          </div>
        </div>

        {/* ─── SELECT YOUR GIFT ─── */}
        <div className="bg-white rounded-2xl border border-surface-border overflow-hidden">
          <div className="p-5 border-b border-surface-border">
            <h2 className="font-display font-bold text-brand-deep">Select Your Gifts</h2>
            <p className="text-xs text-brand-muted mt-0.5">Pick from catalog or describe what you want</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-surface-border">
            <button
              type="button"
              onClick={() => setGiftTab("catalog")}
              className={cn(
                "flex-1 py-3 text-sm font-bold transition-colors relative",
                giftTab === "catalog" ? "text-brand" : "text-brand-muted hover:text-brand-deep"
              )}
            >
              Browse Catalog
              {giftTab === "catalog" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />}
            </button>
            <button
              type="button"
              onClick={() => setGiftTab("describe")}
              className={cn(
                "flex-1 py-3 text-sm font-bold transition-colors relative",
                giftTab === "describe" ? "text-brand" : "text-brand-muted hover:text-brand-deep"
              )}
            >
              Describe Your Gift
              {giftTab === "describe" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />}
            </button>
          </div>

          <div className="p-5">
            {/* ── CATALOG TAB ── */}
            {giftTab === "catalog" && (
              <div className="space-y-4 animate-fade-in">
                {/* Selected summary strip */}
                {selectedProducts.length > 0 && (
                  <div className="bg-brand/5 border border-brand/20 rounded-xl p-3">
                    <p className="text-xs font-bold text-brand mb-2">
                      {selectedProducts.length} item{selectedProducts.length !== 1 ? "s" : ""} selected — {formatKsh(totalPrice)} / delivery
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProducts.map((p) => (
                        <span
                          key={p.id}
                          className="inline-flex items-center gap-1.5 bg-white border border-brand/20 text-brand-deep text-xs font-semibold px-2.5 py-1 rounded-full"
                        >
                          {p.name.length > 20 ? p.name.slice(0, 20) + "…" : p.name}
                          <button
                            type="button"
                            onClick={() => toggleProduct(p)}
                            className="text-brand-muted hover:text-red-500 transition-colors ml-0.5"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search */}
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-9 pr-4 py-2.5 bg-surface border border-surface-border rounded-xl text-sm focus:border-brand outline-none transition-colors"
                  />
                </div>

                {productsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-7 h-7 border-4 border-brand border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
                    {filteredProducts.map((product) => {
                      const isSelected = selectedIds.has(product.id);
                      return (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => toggleProduct(product)}
                          className={cn(
                            "relative bg-white rounded-xl border-2 p-3 text-left transition-all hover:shadow-card",
                            isSelected ? "border-brand shadow-card" : "border-surface-border"
                          )}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-brand rounded-full flex items-center justify-center z-10 shadow">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                          <div className="aspect-square bg-blush rounded-lg mb-2 relative overflow-hidden">
                            {product.image_url ? (
                              <Image src={product.image_url} alt={product.name} fill className="object-contain p-2" sizes="140px" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-brand/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <p className="text-xs font-bold text-brand-deep line-clamp-2 leading-tight">{product.name}</p>
                          <p className="text-xs text-brand font-bold mt-1">{formatKsh(product.price)}</p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── DESCRIBE TAB ── */}
            {giftTab === "describe" && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <label className="block text-xs font-semibold text-brand-deep mb-2">Describe the gift you want</label>
                  <textarea
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    rows={4}
                    placeholder={`e.g. "Weekly white roses, around Ksh 1,500 per delivery. She loves fresh flowers every Monday morning."`}
                    className="w-full border border-surface-border rounded-xl px-4 py-3 text-sm focus:border-brand outline-none transition-colors resize-none"
                  />
                  <p className="text-xs text-brand-muted mt-1">We'll source and package it for you. Our team will confirm via WhatsApp.</p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-brand-muted uppercase tracking-wider">Or reach us directly</p>

                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 bg-surface border border-surface-border rounded-xl p-3.5 hover:border-green-300 transition-all group"
                  >
                    <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.535 5.855L.057 23.998l6.297-1.649A11.938 11.938 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.866 9.866 0 01-5.035-1.378l-.361-.214-3.741.98 1.001-3.649-.235-.374A9.862 9.862 0 012.106 12C2.106 6.527 6.527 2.106 12 2.106S21.894 6.527 21.894 12 17.473 21.894 12 21.894z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-brand-deep">Chat on WhatsApp</p>
                      <p className="text-xs text-brand-muted">Responds within minutes</p>
                    </div>
                    <svg className="w-4 h-4 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>

                  <a
                    href={`mailto:info@touchgiftshop.co.ke?subject=${emailSubject}&body=${emailBody}`}
                    className="flex items-center gap-3 bg-surface border border-surface-border rounded-xl p-3.5 hover:border-blue-300 transition-all group"
                  >
                    <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-brand-deep">Email us</p>
                      <p className="text-xs text-brand-muted">info@touchgiftshop.co.ke</p>
                    </div>
                    <svg className="w-4 h-4 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>

                  <a
                    href="tel:+254700000000"
                    className="flex items-center gap-3 bg-surface border border-surface-border rounded-xl p-3.5 hover:border-brand/40 transition-all group"
                  >
                    <div className="w-9 h-9 bg-brand/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-brand-deep">Call us</p>
                      <p className="text-xs text-brand-muted">Mon–Sat, 8am – 8pm</p>
                    </div>
                    <svg className="w-4 h-4 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── SUBMIT ─── */}
        <button
          type="submit"
          disabled={loading || !canSubmit}
          className="w-full bg-brand text-white font-bold py-4 rounded-2xl shadow-button hover:bg-brand-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
        >
          {loading ? "Saving subscription…" : "Start Subscription"}
        </button>

        {!canSubmit && (
          <p className="text-center text-xs text-brand-muted pb-2">
            Fill in recipient name, delivery address, and select at least one gift (or describe your gift).
          </p>
        )}
      </form>
    </div>
  );
}
