"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import HandwrittenNote from "@/components/ai/HandwrittenNote";
import type { NoteStyle } from "@/lib/handwritten-note";
import { Gift, Users, Palette, CreditCard, PenLine, ClipboardList, Package, Ribbon, Building2 } from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: number;
  slug: string;
  image_url: string;
  short_description: string;
  categories: string[];
};

type Recipient = {
  name: string;
  phone: string;
  note: string;
};

type HamperItem = {
  product: Product;
  quantity: number;
};

const STEPS = [
  { id: 1, label: "Choose Gift", icon: <Gift className="w-5 h-5" /> },
  { id: 2, label: "Add Recipients", icon: <Users className="w-5 h-5" /> },
  { id: 3, label: "Customize", icon: <Palette className="w-5 h-5" /> },
  { id: 4, label: "Review & Pay", icon: <CreditCard className="w-5 h-5" /> },
];

export default function HamperBuilder() {
  const [step, setStep] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Step 1: Gift selection
  const [hamperItems, setHamperItems] = useState<HamperItem[]>([]);

  // Step 2: Recipients
  const [recipients, setRecipients] = useState<Recipient[]>([{ name: "", phone: "", note: "" }]);
  const [csvMode, setCsvMode] = useState(false);
  const [csvText, setCsvText] = useState("");

  // Step 3: Customization
  const [companyName, setCompanyName] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [giftWrap, setGiftWrap] = useState("standard");
  const [noteData, setNoteData] = useState<{ text: string; style: NoteStyle } | null>(null);

  // Fetch products
  useEffect(() => {
    fetch("/api/products?limit=50")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Product categories from fetched products
  const categories = [
    { slug: "all", label: "All" },
    { slug: "hampers", label: "Hampers" },
    { slug: "flowers", label: "Flowers" },
    { slug: "chocolates", label: "Chocolates" },
    { slug: "drinks", label: "Drinks" },
    { slug: "personalised", label: "Personalised" },
  ];

  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter((p) => p.categories?.some((c) => c.toLowerCase().includes(selectedCategory)));

  const toggleProduct = (product: Product) => {
    setHamperItems((prev) => {
      const exists = prev.find((item) => item.product.id === product.id);
      if (exists) {
        return prev.filter((item) => item.product.id !== product.id);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, qty: number) => {
    if (qty < 1) return;
    setHamperItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: qty } : item
      )
    );
  };

  const hamperTotal = hamperItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const recipientCount = recipients.filter((r) => r.name && r.phone).length;
  const orderTotal = hamperTotal * recipientCount;
  const bulkDiscount = recipientCount >= 50 ? 0.15 : recipientCount >= 10 ? 0.10 : 0;
  const discountedTotal = orderTotal * (1 - bulkDiscount);

  // CSV parsing
  const parseCsv = useCallback(() => {
    if (!csvText.trim()) return;
    const lines = csvText.trim().split("\n");
    const parsed: Recipient[] = [];
    // Skip header if first line doesn't look like a phone number
    const start = lines[0].toLowerCase().includes("name") || lines[0].toLowerCase().includes("phone") ? 1 : 0;
    for (let i = start; i < lines.length; i++) {
      const parts = lines[i].split(",").map((s) => s.trim());
      if (parts.length >= 2) {
        parsed.push({ name: parts[0], phone: parts[1], note: parts[2] || "" });
      }
    }
    if (parsed.length > 0) {
      setRecipients(parsed);
      setCsvMode(false);
    }
  }, [csvText]);

  const addRecipient = () => {
    setRecipients((prev) => [...prev, { name: "", phone: "", note: "" }]);
  };

  const updateRecipient = (index: number, field: keyof Recipient, value: string) => {
    setRecipients((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  };

  const removeRecipient = (index: number) => {
    if (recipients.length <= 1) return;
    setRecipients((prev) => prev.filter((_, i) => i !== index));
  };

  const canProceed = () => {
    if (step === 1) return hamperItems.length > 0;
    if (step === 2) return recipients.some((r) => r.name && r.phone);
    if (step === 3) return true;
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Header */}
      <div className="bg-white border-b border-surface-border sticky top-0 z-40">
        <div className="page-container-capped py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/corporate" className="text-brand-muted hover:text-brand text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
            <h1 className="font-display text-lg font-bold">Corporate Hamper Builder</h1>
            <div className="text-sm text-brand-muted">
              {recipientCount > 0 && (
                <span className="bg-brand/10 text-brand px-2 py-1 rounded-full text-xs font-semibold">
                  {recipientCount} recipient{recipientCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2 flex-1">
                <button
                  onClick={() => s.id < step && setStep(s.id)}
                  disabled={s.id > step}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all w-full ${
                    s.id === step
                      ? "bg-brand text-white shadow-ribbon"
                      : s.id < step
                      ? "bg-success/10 text-success cursor-pointer hover:bg-success/20"
                      : "bg-gray-100 text-brand-muted cursor-not-allowed"
                  }`}
                >
                  <span className="text-base">{s.id < step ? "✓" : s.icon}</span>
                  <span className="hidden sm:inline truncate">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`w-4 h-0.5 flex-shrink-0 ${s.id < step ? "bg-success" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="page-container-capped py-8">
        {/* ═══ STEP 1: Choose Gift ═══ */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold mb-2">Choose your gift</h2>
              <p className="text-brand-muted text-sm">Select one or more items to include in your corporate hamper.</p>
            </div>

            {/* Category filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.slug
                      ? "bg-brand text-white"
                      : "bg-white border border-surface-border text-brand-muted hover:border-brand/30"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Products grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border border-surface-border animate-pulse">
                    <div className="aspect-square bg-gray-100 rounded-xl mb-3" />
                    <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredProducts.map((product) => {
                  const selected = hamperItems.some((item) => item.product.id === product.id);
                  const item = hamperItems.find((i) => i.product.id === product.id);
                  return (
                    <div
                      key={product.id}
                      onClick={() => toggleProduct(product)}
                      className={`relative bg-white rounded-2xl p-4 border-2 cursor-pointer transition-all duration-300 hover:shadow-card-hover ${
                        selected ? "border-brand shadow-ribbon" : "border-surface-border hover:border-brand/30"
                      }`}
                    >
                      {selected && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-brand rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <div className="aspect-square bg-gray-50 rounded-xl mb-3 overflow-hidden">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">🎁</div>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.name}</h3>
                      <p className="text-brand font-bold text-sm">KSh {product.price.toLocaleString()}</p>
                      {selected && item && (
                        <div className="mt-3 flex items-center justify-between bg-brand/5 rounded-lg px-3 py-2" onClick={(e) => e.stopPropagation()}>
                          <span className="text-xs text-brand-muted">Qty per hamper</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(product.id, item.quantity - 1)}
                              className="w-6 h-6 bg-white border rounded-lg flex items-center justify-center text-sm font-bold hover:bg-brand/10"
                            >
                              -
                            </button>
                            <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(product.id, item.quantity + 1)}
                              className="w-6 h-6 bg-white border rounded-lg flex items-center justify-center text-sm font-bold hover:bg-brand/10"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Hamper summary */}
            {hamperItems.length > 0 && (
              <div className="bg-white rounded-2xl p-4 border border-surface-border sticky bottom-20 md:bottom-4 z-30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{hamperItems.length} item{hamperItems.length !== 1 ? "s" : ""} in hamper</p>
                    <p className="text-brand-muted text-xs">KSh {hamperTotal.toLocaleString()} per hamper</p>
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3 bg-brand text-white rounded-xl font-semibold text-sm hover:bg-brand-dark transition-colors"
                  >
                    Next: Add Recipients →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ STEP 2: Recipients ═══ */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold mb-2">Add recipients</h2>
              <p className="text-brand-muted text-sm">Add the people who will receive this gift. One hamper per recipient.</p>
            </div>

            {/* Toggle CSV/Manual */}
            <div className="flex gap-2">
              <button
                onClick={() => setCsvMode(false)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  !csvMode ? "bg-brand text-white" : "bg-white border border-surface-border text-brand-muted"
                }`}
              >
                <PenLine className="w-4 h-4 inline-block mr-1" /> Add Manually
              </button>
              <button
                onClick={() => setCsvMode(true)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  csvMode ? "bg-brand text-white" : "bg-white border border-surface-border text-brand-muted"
                }`}
              >
                <ClipboardList className="w-4 h-4 inline-block mr-1" /> Upload CSV
              </button>
            </div>

            {csvMode ? (
              <div className="bg-white rounded-2xl p-6 border border-surface-border space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-2">Paste CSV data</p>
                  <p className="text-xs text-brand-muted mb-3">
                    Format: name, phone, note (one recipient per line). Example:
                  </p>
                  <pre className="bg-gray-50 rounded-lg p-3 text-xs text-brand-muted mb-3">
{`John Kamau, 0712345678, Happy birthday!
Jane Wanjiku, 0798765432, Congratulations!
Peter Odhiambo, 0755555555`}
                  </pre>
                </div>
                <textarea
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder={`name, phone, note\nJohn Kamau, 0712345678, Happy birthday!\nJane Wanjiku, 0798765432`}
                  className="w-full h-40 bg-gray-50 border border-surface-border rounded-xl p-3 text-sm font-mono focus:outline-none focus:border-brand resize-none"
                />
                <button
                  onClick={parseCsv}
                  className="px-6 py-3 bg-brand text-white rounded-xl font-semibold text-sm hover:bg-brand-dark transition-colors"
                >
                  Import {csvText.trim().split("\n").filter((l) => l.trim()).length} Recipients
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recipients.map((recipient, index) => (
                  <div key={index} className="bg-white rounded-2xl p-4 border border-surface-border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold">Recipient {index + 1}</span>
                      {recipients.length > 1 && (
                        <button
                          onClick={() => removeRecipient(index)}
                          className="text-red-400 hover:text-red-600 text-xs"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Full name *"
                        value={recipient.name}
                        onChange={(e) => updateRecipient(index, "name", e.target.value)}
                        className="bg-gray-50 border border-surface-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand"
                      />
                      <input
                        type="tel"
                        placeholder="Phone number (07XX) *"
                        value={recipient.phone}
                        onChange={(e) => updateRecipient(index, "phone", e.target.value)}
                        className="bg-gray-50 border border-surface-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Personal note (optional)"
                      value={recipient.note}
                      onChange={(e) => updateRecipient(index, "note", e.target.value)}
                      className="w-full mt-3 bg-gray-50 border border-surface-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand"
                    />
                  </div>
                ))}
                <button
                  onClick={addRecipient}
                  className="w-full py-3 border-2 border-dashed border-surface-border rounded-2xl text-sm font-medium text-brand-muted hover:border-brand/30 hover:text-brand transition-all"
                >
                  + Add Another Recipient
                </button>
              </div>
            )}

            {/* Summary + nav */}
            <div className="bg-white rounded-2xl p-4 border border-surface-border sticky bottom-20 md:bottom-4 z-30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{recipients.filter((r) => r.name && r.phone).length} recipient(s)</p>
                  <p className="text-brand-muted text-xs">KSh {hamperTotal.toLocaleString()} × {recipients.filter((r) => r.name && r.phone).length} = KSh {orderTotal.toLocaleString()}</p>
                  {bulkDiscount > 0 && (
                    <p className="text-success text-xs font-semibold">{bulkDiscount * 100}% bulk discount applied!</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-3 bg-gray-100 text-brand-muted rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!canProceed()}
                    className="px-6 py-3 bg-brand text-white rounded-xl font-semibold text-sm hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next: Customize →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ STEP 3: Customize ═══ */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold mb-2">Customize (optional)</h2>
              <p className="text-brand-muted text-sm">Add your company branding and personal touches.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-surface-border space-y-6">
              {/* Company name */}
              <div>
                <label className="block text-sm font-semibold mb-2">Company Name (for gift card)</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Technologies Ltd"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-gray-50 border border-surface-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand"
                />
              </div>

              {/* Custom message */}
              <div>
                <label className="block text-sm font-semibold mb-2">Custom Message (on gift card)</label>
                <textarea
                  placeholder="e.g. Thank you for an amazing year! Wishing you all the best. — The Acme Team"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-50 border border-surface-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand resize-none"
                />
                <p className="text-xs text-brand-muted mt-1">{customMessage.length}/200 characters</p>
              </div>

              {/* Gift wrap options */}
              <div>
                <label className="block text-sm font-semibold mb-3">Gift Wrapping</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "standard", label: "Standard", icon: <Package className="w-5 h-5 mx-auto mb-1" />, desc: "Classic gift wrap" },
                    { id: "premium", label: "Premium", icon: <Ribbon className="w-5 h-5 mx-auto mb-1" />, desc: "Box + ribbon" },
                    { id: "branded", label: "Branded", icon: <Building2 className="w-5 h-5 mx-auto mb-1" />, desc: "Custom logo box (+KSh 200)", extra: 200 },
                  ].map((wrap) => (
                    <button
                      key={wrap.id}
                      onClick={() => setGiftWrap(wrap.id)}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        giftWrap === wrap.id
                          ? "border-brand bg-brand/5 shadow-ribbon"
                          : "border-surface-border hover:border-brand/30"
                      }`}
                    >
                      <span className="text-2xl block mb-1">{wrap.icon}</span>
                      <p className="text-sm font-semibold">{wrap.label}</p>
                      <p className="text-xs text-brand-muted">{wrap.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Handwritten Note */}
            <HandwrittenNote
              onNoteReady={(note) => {
                setNoteData(note);
                setCustomMessage(note.text);
              }}
              initialText={customMessage}
              recipient="your recipients"
              occasion="corporate gift"
            />

            {/* Summary + nav */}
            <div className="bg-white rounded-2xl p-4 border border-surface-border sticky bottom-20 md:bottom-4 z-30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Order Summary</p>
                  <p className="text-brand-muted text-xs">
                    {hamperItems.length} item(s) × {recipients.filter((r) => r.name && r.phone).length} recipients
                  </p>
                  {bulkDiscount > 0 && (
                    <p className="text-success text-xs font-semibold">{bulkDiscount * 100}% bulk discount!</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStep(2)}
                    className="px-4 py-3 bg-gray-100 text-brand-muted rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="px-6 py-3 bg-brand text-white rounded-xl font-semibold text-sm hover:bg-brand-dark transition-colors"
                  >
                    Review Order →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ STEP 4: Review & Pay ═══ */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold mb-2">Review your order</h2>
              <p className="text-brand-muted text-sm">Double-check everything before placing your order.</p>
            </div>

            {/* Order breakdown */}
            <div className="bg-white rounded-2xl p-6 border border-surface-border space-y-6">
              {/* Items */}
              <div>
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <span className="text-lg">🎁</span> Hamper Contents
                </h3>
                <div className="space-y-2">
                  {hamperItems.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between text-sm py-2 border-b border-surface-border last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                          {item.product.image_url ? (
                            <img src={item.product.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">🎁</div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-brand-muted text-xs">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-semibold">KSh {(item.product.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-sm font-semibold mt-3 pt-3 border-t">
                  <p>Per hamper</p>
                  <p>KSh {hamperTotal.toLocaleString()}</p>
                </div>
              </div>

              {/* Customization */}
              {(companyName || customMessage || giftWrap !== "standard") && (
                <div>
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <span className="text-lg">🎨</span> Customization
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                    {companyName && <p><span className="text-brand-muted">Company:</span> {companyName}</p>}
                    {customMessage && <p><span className="text-brand-muted">Message:</span> &ldquo;{customMessage}&rdquo;</p>}
                    {giftWrap !== "standard" && (
                      <p><span className="text-brand-muted">Wrapping:</span> {giftWrap === "premium" ? "Premium Box + Ribbon" : "Branded Logo Box"}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Recipients */}
              <div>
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <span className="text-lg">👥</span> Recipients ({recipients.filter((r) => r.name && r.phone).length})
                </h3>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {recipients.filter((r) => r.name && r.phone).map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-surface-border last:border-0">
                      <div>
                        <p className="font-medium">{r.name}</p>
                        <p className="text-brand-muted text-xs">{r.phone}{r.note ? ` • ${r.note}` : ""}</p>
                      </div>
                      <p className="text-brand-muted text-xs">KSh {hamperTotal.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="bg-brand-deep rounded-2xl p-6 text-white">
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-white/60">Subtotal ({recipients.filter((r) => r.name && r.phone).length} × KSh {hamperTotal.toLocaleString()})</span>
                  <span>KSh {orderTotal.toLocaleString()}</span>
                </div>
                {bulkDiscount > 0 && (
                  <div className="flex justify-between text-gold">
                    <span>Bulk discount ({bulkDiscount * 100}%)</span>
                    <span>-KSh {(orderTotal * bulkDiscount).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-white/60">Delivery</span>
                  <span className="text-success">FREE (Nairobi)</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <p className="text-lg font-bold">Total</p>
                <p className="text-2xl font-display font-bold text-gold">KSh {discountedTotal.toLocaleString()}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 bg-gray-100 text-brand-muted rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={async () => {
                  setIsSubmitting(true);
                  setSubmitError("");
                  try {
                    const validRecipients = recipients.filter((r) => r.name && r.phone);
                    const res = await fetch("/api/orders/corporate", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        productId: hamperItems[0]?.product?.id,
                        recipients: validRecipients.map((r) => ({
                          name: r.name,
                          phone: r.phone,
                          note: r.note,
                        })),
                        senderName: companyName || "Corporate Client",
                        senderPhone: validRecipients[0]?.phone || "",
                        companyName,
                        customMessage,
                        giftWrap,
                      }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || "Failed to place order");
                    // Redirect to PesaPal checkout
                    window.location.href = data.payment.redirectUrl;
                  } catch (err: unknown) {
                    setSubmitError(err instanceof Error ? err.message : "Something went wrong");
                    setIsSubmitting(false);
                  }
                }}
                disabled={isSubmitting}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-gold to-gold-light text-brand-deep rounded-xl font-bold text-lg hover:shadow-gold hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-brand-deep/30 border-t-brand-deep rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  `Pay with M-Pesa — KSh ${discountedTotal.toLocaleString()}`
                )}
              </button>
            </div>
            {submitError && (
              <p className="text-red-500 text-sm text-center mt-2">{submitError}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
