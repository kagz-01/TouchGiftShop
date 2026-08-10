"use client";


import { useState } from "react";
import Image from "next/image";
import { formatKsh } from "@/lib/utils";
import Link from "next/link";
import { useSubscription } from "@/components/reminders/SubscriptionProvider";

interface SubscriptionFormProps {
  onSuccess: (data: any) => void;
  onCancel: () => void;
}

const FREQUENCIES = ["Weekly", "Bi-weekly", "Monthly", "Quarterly", "Annually"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function SubscriptionForm({ onSuccess, onCancel }: SubscriptionFormProps) {
  const { subscriptionItems, cancelBuildingSubscription } = useSubscription();
  const [loading, setLoading] = useState(false);
  
  const [recipientName, setRecipientName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [frequency, setFrequency] = useState("Weekly");
  const [deliveryDay, setDeliveryDay] = useState("Friday");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [googleMapsLink, setGoogleMapsLink] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const productIds = subscriptionItems.map(p => p.id);

    const res = await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientName,
        relationship: relationship || undefined,
        isSubscription: true,
        frequency,
        productIds,
        deliveryDay,
        deliveryAddress: deliveryAddress || undefined,
        googleMapsLink: googleMapsLink || undefined,
      }),
    });

    const data = await res.json();
    setLoading(false);
    if (data.reminder) {
      cancelBuildingSubscription();
      onSuccess(data.reminder);
    }
  }

  const handleCancel = () => {
    cancelBuildingSubscription();
    onCancel();
  };

  const total = subscriptionItems.reduce((acc, item) => acc + item.price, 0);

  return (
    <form onSubmit={handleSubmit} className="bg-surface rounded-2xl p-5 border border-surface-border space-y-5 animate-fade-in shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-surface-border">
        <div>
          <h3 className="font-display font-bold text-lg text-brand-deep">Complete Subscription Setup</h3>
          <p className="text-xs text-brand-muted">Review your bundle and add delivery details.</p>
        </div>
        <button type="button" onClick={handleCancel} className="text-sm font-semibold text-brand-muted hover:text-brand transition-colors">
          Cancel
        </button>
      </div>

      <div className="space-y-4">
        {/* Selected Products */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-brand-deep">Subscription Box ({subscriptionItems.length} items)</label>
            {subscriptionItems.length > 0 && (
              <Link
                href="/"
                onClick={() => startBuildingSubscription()}
                className="text-xs font-bold text-brand hover:text-brand-dark"
              >
                + Add more gifts
              </Link>
            )}
          </div>
          <div className="space-y-2">
            {subscriptionItems.length === 0 && (
              <div className="text-center py-6 bg-blush/30 border border-brand/20 rounded-xl border-dashed">
                <p className="text-sm font-semibold text-brand-deep mb-2">Your box is empty</p>
                <Link
                  href="/"
                  onClick={() => startBuildingSubscription()}
                  className="bg-brand text-white text-xs font-bold px-4 py-2 rounded-xl shadow-button hover:bg-brand-dark transition-colors inline-block"
                >
                  Browse & Add Gifts
                </Link>
              </div>
            )}
            {subscriptionItems.map(product => (
              <div key={product.id} className="bg-white border border-surface-border rounded-xl p-3 flex items-center gap-4">
                {product.image_url && (
                  <div className="w-12 h-12 relative bg-blush rounded-lg flex-shrink-0">
                    <Image src={product.image_url} alt={product.name} fill className="object-contain p-1" sizes="48px" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-brand-deep line-clamp-1">{product.name}</p>
                  <p className="text-xs text-brand font-bold">{formatKsh(product.price)}</p>
                </div>
              </div>
            ))}
          </div>
          {subscriptionItems.length > 0 && (
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-surface-border">
              <span className="text-sm font-semibold text-brand-deep">Total per delivery</span>
              <span className="text-base font-bold text-brand">{formatKsh(total)}</span>
            </div>
          )}
        </div>

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

        {/* Address */}
        <div>
          <label className="block text-xs font-semibold text-brand-deep mb-1">Delivery Landmark / Area</label>
          <input
            required
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            placeholder="e.g. Kilimani, near Yaya Centre"
            className="w-full border border-surface-border rounded-xl px-3 py-2 text-sm focus:border-brand outline-none transition-colors mb-3"
          />
          <label className="block text-xs font-semibold text-brand-deep mb-1">Google Maps Pin (Optional, but recommended)</label>
          <input
            value={googleMapsLink}
            onChange={(e) => setGoogleMapsLink(e.target.value)}
            placeholder="Paste Google Maps URL here"
            className="w-full border border-surface-border rounded-xl px-3 py-2 text-sm focus:border-brand outline-none transition-colors"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !recipientName || subscriptionItems.length === 0}
        className="w-full btn-brand py-3 rounded-xl font-bold shadow-button disabled:opacity-50"
      >
        {loading ? "Saving..." : "Start Subscription"}
      </button>
    </form>
  );
}
