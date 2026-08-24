"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, MapPin, Trash2, Check, Home, Building, Star } from "lucide-react";

interface Address {
  id: string;
  label: string;
  full_name: string | null;
  phone: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  county: string | null;
  postal_code: string | null;
  landmark: string | null;
  is_default: boolean;
}

const LABEL_ICONS: Record<string, typeof Home> = {
  Home: Home,
  Work: Building,
  Favourite: Star,
};

const INPUT =
  "w-full bg-gray-50 border border-black/8 rounded-xl px-4 py-3 text-sm text-brand-deep placeholder:text-brand-muted/50 focus:outline-none focus:border-brand focus:bg-white transition-all";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    label: "Home",
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "Nairobi",
    county: "",
    postalCode: "",
    landmark: "",
    isDefault: false,
  });

  useEffect(() => {
    fetch("/api/addresses")
      .then((r) => r.json())
      .then((d) => { setAddresses(d.addresses ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function resetForm() {
    setForm({ label: "Home", fullName: "", phone: "", addressLine1: "", addressLine2: "", city: "Nairobi", county: "", postalCode: "", landmark: "", isDefault: false });
    setEditingId(null);
    setShowForm(false);
  }

  function editAddress(addr: Address) {
    setForm({
      label: addr.label,
      fullName: addr.full_name || "",
      phone: addr.phone || "",
      addressLine1: addr.address_line1,
      addressLine2: addr.address_line2 || "",
      city: addr.city,
      county: addr.county || "",
      postalCode: addr.postal_code || "",
      landmark: addr.landmark || "",
      isDefault: addr.is_default,
    });
    setEditingId(addr.id);
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { ...form, id: editingId } : form;
      const res = await fetch("/api/addresses", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        // Refresh addresses
        const refresh = await fetch("/api/addresses");
        const refreshData = await refresh.json();
        setAddresses(refreshData.addresses ?? []);
        resetForm();
      }
    } catch {}
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this address?")) return;
    await fetch(`/api/addresses?id=${id}`, { method: "DELETE" });
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  }

  if (loading) {
    return (
      <div className="min-h-screen section-theme-e flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen section-theme-e">
      <div className="page-container-capped py-6 md:py-10 max-w-lg mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/account" className="flex items-center gap-2 text-sm text-brand-muted hover:text-brand transition-colors">
            <ArrowLeft className="w-4 h-4" /> Account
          </Link>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand text-white rounded-xl text-sm font-semibold hover:bg-brand-dark transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Address
          </button>
        </div>

        <h1 className="font-display text-2xl font-bold text-brand-deep">Saved Addresses</h1>

        {/* Address Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-black/6 shadow-sm p-5 space-y-4">
            <h2 className="font-display font-bold text-brand-deep">{editingId ? "Edit Address" : "New Address"}</h2>

            {/* Label selector */}
            <div className="flex gap-2">
              {["Home", "Work", "Favourite"].map((label) => {
                const Icon = LABEL_ICONS[label] || MapPin;
                return (
                  <button
                    key={label}
                    onClick={() => setForm({ ...form, label })}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                      form.label === label
                        ? "border-brand bg-brand/5 text-brand"
                        : "border-black/8 text-brand-muted hover:border-brand/30"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider block mb-1.5">Full name</label>
                <input
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Recipient name"
                  className={INPUT}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider block mb-1.5">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="07XX XXX XXX"
                  className={INPUT}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider block mb-1.5">Address line 1 *</label>
              <input
                value={form.addressLine1}
                onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
                placeholder="Street address, apartment, suite"
                className={INPUT}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider block mb-1.5">Address line 2</label>
              <input
                value={form.addressLine2}
                onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
                placeholder="Floor, building, unit"
                className={INPUT}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider block mb-1.5">City *</label>
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className={INPUT}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider block mb-1.5">County</label>
                <input
                  value={form.county}
                  onChange={(e) => setForm({ ...form, county: e.target.value })}
                  placeholder="Nairobi"
                  className={INPUT}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider block mb-1.5">Landmark</label>
              <input
                value={form.landmark}
                onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                placeholder="Near Shell station, Karen"
                className={INPUT}
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand"
              />
              <span className="text-sm text-brand-deep">Set as default address</span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={!form.addressLine1 || !form.city || saving}
                className="flex-1 py-3 bg-brand text-white rounded-xl font-semibold text-sm hover:bg-brand-dark transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : editingId ? "Update Address" : "Save Address"}
              </button>
              <button
                onClick={resetForm}
                className="px-4 py-3 border border-black/8 rounded-xl text-sm font-medium text-brand-muted hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Address List */}
        {addresses.length === 0 && !showForm ? (
          <div className="bg-white rounded-2xl border border-black/6 shadow-sm p-10 text-center">
            <MapPin className="w-12 h-12 text-brand/20 mx-auto mb-3" />
            <p className="font-semibold text-brand-deep mb-1">No saved addresses</p>
            <p className="text-sm text-brand-muted mb-4">Add an address to speed up checkout</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-brand text-white rounded-xl text-sm font-semibold hover:bg-brand-dark transition-colors"
            >
              Add your first address
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => {
              const Icon = LABEL_ICONS[addr.label] || MapPin;
              return (
                <div
                  key={addr.id}
                  className={`bg-white rounded-2xl border shadow-sm p-4 flex items-start gap-3 ${
                    addr.is_default ? "border-brand/30 ring-1 ring-brand/10" : "border-black/6"
                  }`}
                >
                  <div className="w-10 h-10 bg-brand/8 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-brand" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-brand-deep text-sm">{addr.label}</p>
                      {addr.is_default && (
                        <span className="text-[9px] font-bold bg-brand/10 text-brand px-2 py-0.5 rounded-full">Default</span>
                      )}
                    </div>
                    {addr.full_name && <p className="text-xs text-brand-muted">{addr.full_name}</p>}
                    <p className="text-sm text-brand-deep mt-1">{addr.address_line1}</p>
                    {addr.address_line2 && <p className="text-xs text-brand-muted">{addr.address_line2}</p>}
                    <p className="text-xs text-brand-muted">{[addr.city, addr.county].filter(Boolean).join(", ")}</p>
                    {addr.landmark && <p className="text-xs text-brand-muted italic">Near: {addr.landmark}</p>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => editAddress(addr)}
                      className="text-xs text-brand font-medium hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
