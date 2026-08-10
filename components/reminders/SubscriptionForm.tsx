"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { formatKsh } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
}

interface SubscriptionFormProps {
  onSuccess: (data: any) => void;
  onCancel: () => void;
}

const FREQUENCIES = ["Weekly", "Bi-weekly", "Monthly", "Quarterly", "Annually"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function SubscriptionForm({ onSuccess, onCancel }: SubscriptionFormProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [recipientName, setRecipientName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [frequency, setFrequency] = useState("Weekly");
  const [deliveryDay, setDeliveryDay] = useState("Friday");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [productId, setProductId] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        if (data.products) setProducts(data.products);
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientName,
        relationship: relationship || undefined,
        isSubscription: true,
        frequency,
        productId: productId || undefined,
        deliveryDay,
        deliveryAddress: deliveryAddress || undefined,
      }),
    });

    const data = await res.json();
    setLoading(false);
    if (data.reminder) {
      onSuccess(data.reminder);
    }
  }

  const selectedProduct = products.find(p => p.id === productId);

  return (
    <form onSubmit={handleSubmit} className="bg-surface rounded-2xl p-5 border border-surface-border space-y-5 animate-fade-in">
      <div className="flex items-center justify-between pb-3 border-b border-surface-border">
        <div>
          <h3 className="font-display font-bold text-lg text-brand-deep">New Subscription</h3>
          <p className="text-xs text-brand-muted">We'll send you a payment link 2 days before delivery.</p>
        </div>
        <button type="button" onClick={onCancel} className="text-sm font-semibold text-brand-muted hover:text-brand transition-colors">
          Cancel
        </button>
      </div>

      <div className="space-y-4">
        {/* Recipient */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-brand-deep mb-1">Recipient Name</label>
            <input
              required
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g. My Wife, Sarah"
              className="w-full border border-surface-border rounded-xl px-3 py-2 text-sm focus:border-brand outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-deep mb-1">Relationship</label>
            <input
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="e.g. Spouse"
              className="w-full border border-surface-border rounded-xl px-3 py-2 text-sm focus:border-brand outline-none transition-colors"
            />
          </div>
        </div>

        {/* Schedule */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-brand-deep mb-1">Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full border border-surface-border rounded-xl px-3 py-2 text-sm focus:border-brand outline-none transition-colors bg-white"
            >
              {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-deep mb-1">Delivery Day</label>
            <select
              value={deliveryDay}
              onChange={(e) => setDeliveryDay(e.target.value)}
              className="w-full border border-surface-border rounded-xl px-3 py-2 text-sm focus:border-brand outline-none transition-colors bg-white"
            >
              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* Product Selection */}
        <div>
          <label className="block text-xs font-semibold text-brand-deep mb-1">Gift to deliver</label>
          <select
            required
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full border border-surface-border rounded-xl px-3 py-2 text-sm focus:border-brand outline-none transition-colors bg-white"
          >
            <option value="">Select a product...</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} — {formatKsh(p.price)}</option>
            ))}
          </select>
          
          {selectedProduct && (
            <div className="mt-3 bg-white border border-surface-border rounded-xl p-3 flex items-center gap-4">
              {selectedProduct.image_url && (
                <div className="w-12 h-12 relative bg-blush rounded-lg flex-shrink-0">
                  <Image src={selectedProduct.image_url} alt={selectedProduct.name} fill className="object-contain p-1" sizes="48px" />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-brand-deep line-clamp-1">{selectedProduct.name}</p>
                <p className="text-xs text-brand font-bold">{formatKsh(selectedProduct.price)} / delivery</p>
              </div>
            </div>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-semibold text-brand-deep mb-1">Delivery Landmark / Area (Optional)</label>
          <input
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            placeholder="e.g. Kilimani, near Yaya Centre"
            className="w-full border border-surface-border rounded-xl px-3 py-2 text-sm focus:border-brand outline-none transition-colors"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !recipientName || !productId}
        className="w-full btn-brand py-3 rounded-xl font-bold shadow-button disabled:opacity-50"
      >
        {loading ? "Saving..." : "Start Subscription"}
      </button>
    </form>
  );
}
