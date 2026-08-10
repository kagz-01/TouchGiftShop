"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatKsh, cn } from "@/lib/utils";
import { useSubscription } from "@/components/reminders/SubscriptionProvider";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  description?: string;
}

const WHATSAPP_NUMBER = "254700000000"; // TODO: replace with real WhatsApp number

export default function BuildSubscriptionPage() {
  const router = useRouter();
  const { addSubscriptionItem, removeSubscriptionItem, subscriptionItems, clearSubscriptionItems } = useSubscription();

  const [activeTab, setActiveTab] = useState<"catalog" | "custom">("catalog");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [customDescription, setCustomDescription] = useState("");

  const selectedIds = new Set(subscriptionItems.map((p) => p.id));

  useEffect(() => {
    clearSubscriptionItems();
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleProduct = (product: Product) => {
    if (selectedIds.has(product.id)) {
      removeSubscriptionItem(product.id);
    } else {
      addSubscriptionItem(product);
    }
  };

  const totalSelected = subscriptionItems.length;
  const totalPrice = subscriptionItems.reduce((acc, p) => acc + p.price, 0);

  const canComplete =
    activeTab === "catalog" ? totalSelected > 0 : customDescription.trim().length > 0;

  const handleComplete = () => {
    router.push("/reminders?tab=subscriptions&setup=true");
  };

  const whatsappMessage = encodeURIComponent(
    `Hi TouchGift! I'd like to set up a subscription gift box.\n\nGift Description:\n${customDescription}\n\nPlease help me set this up.`
  );
  const emailSubject = encodeURIComponent("Subscription Gift Box Request");
  const emailBody = encodeURIComponent(
    `Hi TouchGift,\n\nI'd like to set up a subscription gift box.\n\nGift Description:\n${customDescription}\n\nPlease assist me.\n\nThank you.`
  );

  return (
    <div className="min-h-screen bg-gradient-warm pb-32">
      {/* Header */}
      <div className="bg-white border-b border-surface-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href="/reminders?tab=subscriptions" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface transition-colors text-brand-muted hover:text-brand">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="font-display text-xl font-bold text-brand-deep">Build Subscription Box</h1>
                <p className="text-xs text-brand-muted">Select gifts or describe what you want</p>
              </div>
            </div>
            {totalSelected > 0 && (
              <span className="bg-brand text-white text-xs font-bold px-3 py-1 rounded-full">
                {totalSelected} selected
              </span>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-surface p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("catalog")}
              className={cn(
                "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                activeTab === "catalog"
                  ? "bg-white text-brand shadow-sm"
                  : "text-brand-muted hover:text-brand-deep"
              )}
            >
              Browse Catalog
            </button>
            <button
              onClick={() => setActiveTab("custom")}
              className={cn(
                "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                activeTab === "custom"
                  ? "bg-white text-brand shadow-sm"
                  : "text-brand-muted hover:text-brand-deep"
              )}
            >
              Describe Your Gift
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 mt-6">
        {/* ─── CATALOG TAB ─── */}
        {activeTab === "catalog" && (
          <div className="space-y-4 animate-fade-in">
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-3 bg-white border border-surface-border rounded-2xl text-sm focus:border-brand outline-none transition-colors"
              />
            </div>

            {/* Instructions */}
            <p className="text-xs text-brand-muted font-medium pl-1">
              Tap a product to add it to your subscription box. You can select multiple.
            </p>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-surface-border">
                <p className="text-brand-muted">No products found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredProducts.map((product) => {
                  const isSelected = selectedIds.has(product.id);
                  return (
                    <button
                      key={product.id}
                      onClick={() => toggleProduct(product)}
                      className={cn(
                        "relative bg-white rounded-2xl border-2 p-3 text-left transition-all hover:shadow-card",
                        isSelected ? "border-brand shadow-card" : "border-surface-border"
                      )}
                    >
                      {/* Checkmark */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-brand rounded-full flex items-center justify-center z-10 shadow">
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <div className="aspect-square bg-blush rounded-xl mb-3 relative overflow-hidden">
                        {product.image_url ? (
                          <Image src={product.image_url} alt={product.name} fill className="object-contain p-2" sizes="160px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-brand/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

        {/* ─── CUSTOM TAB ─── */}
        {activeTab === "custom" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-2xl border border-surface-border p-5 space-y-4">
              <div>
                <h3 className="font-display font-bold text-brand-deep mb-1">Tell us what you want</h3>
                <p className="text-xs text-brand-muted">Describe the gift, budget, frequency — we'll source it for you.</p>
              </div>
              <textarea
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                rows={5}
                placeholder={`e.g. "I want weekly white roses, around Ksh 1,500 per delivery. My wife loves fresh flowers every Monday morning."`}
                className="w-full border border-surface-border rounded-xl px-4 py-3 text-sm focus:border-brand outline-none transition-colors resize-none"
              />
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-brand-muted uppercase tracking-wider pl-1">Reach us via</p>

              {/* WhatsApp */}
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 bg-white border border-surface-border rounded-2xl p-4 hover:shadow-card hover:border-green-300 transition-all group"
              >
                <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.535 5.855L.057 23.998l6.297-1.649A11.938 11.938 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.866 9.866 0 01-5.035-1.378l-.361-.214-3.741.98 1.001-3.649-.235-.374A9.862 9.862 0 012.106 12C2.106 6.527 6.527 2.106 12 2.106S21.894 6.527 21.894 12 17.473 21.894 12 21.894z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-brand-deep group-hover:text-green-700 transition-colors">Chat on WhatsApp</p>
                  <p className="text-xs text-brand-muted">We'll respond within minutes</p>
                </div>
                <svg className="w-4 h-4 text-brand-muted group-hover:text-green-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>

              {/* Email */}
              <a
                href={`mailto:info@touchgiftshop.co.ke?subject=${emailSubject}&body=${emailBody}`}
                className="flex items-center gap-4 bg-white border border-surface-border rounded-2xl p-4 hover:shadow-card hover:border-blue-300 transition-all group"
              >
                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-brand-deep group-hover:text-blue-600 transition-colors">Send us an email</p>
                  <p className="text-xs text-brand-muted">info@touchgiftshop.co.ke</p>
                </div>
                <svg className="w-4 h-4 text-brand-muted group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>

              {/* Call */}
              <a
                href="tel:+254700000000"
                className="flex items-center gap-4 bg-white border border-surface-border rounded-2xl p-4 hover:shadow-card hover:border-brand/40 transition-all group"
              >
                <div className="w-11 h-11 bg-brand/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-brand-deep group-hover:text-brand transition-colors">Call us</p>
                  <p className="text-xs text-brand-muted">Mon–Sat, 8am – 8pm</p>
                </div>
                <svg className="w-4 h-4 text-brand-muted group-hover:text-brand transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar */}
      {activeTab === "catalog" && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
          <div className="max-w-3xl mx-auto">
            {canComplete ? (
              <div className="bg-white border-2 border-brand rounded-2xl shadow-xl p-4 flex items-center justify-between pointer-events-auto animate-fade-in">
                <div>
                  <p className="font-bold text-brand-deep text-sm">{totalSelected} item{totalSelected !== 1 ? "s" : ""} selected</p>
                  <p className="text-xs text-brand-muted">{formatKsh(totalPrice)} / delivery</p>
                </div>
                <button
                  onClick={handleComplete}
                  className="bg-brand text-white font-bold text-sm px-6 py-3 rounded-xl shadow-button hover:bg-brand-dark transition-colors"
                >
                  Complete Setup →
                </button>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur border border-surface-border rounded-2xl p-3 pointer-events-auto text-center">
                <p className="text-xs text-brand-muted font-medium">Tap products above to add them to your subscription</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
