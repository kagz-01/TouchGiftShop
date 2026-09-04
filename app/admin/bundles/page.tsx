"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatKsh } from "@/lib/utils";
import type { HamperBundle, Product } from "@/lib/types";
import {
  Search, Plus, Edit2, Trash2, Gift, X, Save, Loader2,
  Eye, EyeOff, Star,
} from "lucide-react";

interface BundleItem {
  product_id: string | null;
  product_name: string;
  quantity: number;
}

function getDefaultForm() {
  return {
    name: "",
    slug: "",
    description: "",
    image_url: "",
    regular_price: "" as string | number,
    bundle_price: "" as string | number,
    category: "liquor",
    occasions: "",
    is_active: true,
    is_featured: false,
    is_coming_soon: false,
    items: [] as BundleItem[],
  };
}

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState<HamperBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(getDefaultForm());

  // Product picker state
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerResults, setPickerResults] = useState<Product[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);

  const fetchBundles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bundles");
      const data = await res.json();
      setBundles(data.bundles ?? []);
    } catch {
      setBundles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBundles(); }, [fetchBundles]);

  // Debounced product search for the picker
  useEffect(() => {
    if (!showForm) return;
    const t = setTimeout(async () => {
      setPickerLoading(true);
      try {
        const params = new URLSearchParams({ limit: "12" });
        if (pickerSearch) params.set("search", pickerSearch);
        const res = await fetch(`/api/products?${params}`);
        const data = await res.json();
        setPickerResults(data.products ?? []);
      } catch {
        setPickerResults([]);
      } finally {
        setPickerLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [pickerSearch, showForm]);

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const openCreate = () => {
    setEditingId(null);
    setForm(getDefaultForm());
    setShowForm(true);
  };

  const openEdit = (b: HamperBundle) => {
    setEditingId(b.id);
    setForm({
      name: b.name,
      slug: b.slug,
      description: b.description || "",
      image_url: b.image_url || "",
      regular_price: b.regular_price ?? "",
      bundle_price: b.bundle_price ?? "",
      category: b.category || "general",
      occasions: (b.occasions || []).join(", "),
      is_active: b.is_active,
      is_featured: b.is_featured,
      is_coming_soon: !!b.is_coming_soon,
      items: (b.items ?? []).map((it) => ({
        product_id: it.product_id,
        product_name: it.product_name,
        quantity: it.quantity,
      })),
    });
    setShowForm(true);
  };

  const addItemToBundle = (p: Product) => {
    setForm((f) => {
      const existingIdx = f.items.findIndex((i) => i.product_id === p.id);
      if (existingIdx >= 0) {
        const updated = [...f.items];
        updated[existingIdx] = { ...updated[existingIdx], quantity: updated[existingIdx].quantity + 1 };
        return { ...f, items: updated };
      }
      return { ...f, items: [...f.items, { product_id: p.id, product_name: p.name, quantity: 1 }] };
    });
  };

  const updateItemQty = (idx: number, delta: number) => {
    setForm((f) => {
      const updated = [...f.items];
      const next = updated[idx].quantity + delta;
      if (next < 1) updated.splice(idx, 1);
      else updated[idx] = { ...updated[idx], quantity: next };
      return { ...f, items: updated };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug || generateSlug(form.name),
        description: form.description || null,
        image_url: form.image_url || null,
        regular_price: Number(form.regular_price),
        bundle_price: Number(form.bundle_price),
        category: form.category,
        occasions: form.occasions.split(",").map((o) => o.trim()).filter(Boolean),
        is_active: form.is_active,
        is_featured: form.is_featured,
        is_coming_soon: form.is_coming_soon,
        items: form.items,
      };

      const res = editingId
        ? await fetch("/api/admin/bundles", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: editingId, ...payload }),
          })
        : await fetch("/api/admin/bundles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to save bundle");
        return;
      }

      setShowForm(false);
      setEditingId(null);
      fetchBundles();
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (b: HamperBundle) => {
    await fetch("/api/admin/bundles", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: b.id, is_active: !b.is_active }),
    });
    fetchBundles();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this bundle permanently?")) return;
    await fetch(`/api/admin/bundles?id=${id}`, { method: "DELETE" });
    fetchBundles();
  };

  const savingsPct =
    form.regular_price && form.bundle_price && Number(form.regular_price) > Number(form.bundle_price)
      ? Math.round(((Number(form.regular_price) - Number(form.bundle_price)) / Number(form.regular_price)) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Nav */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-6">
          <Link href="/admin" className="font-display text-lg font-bold text-brand-deep">TouchGift Admin</Link>
          <nav className="flex items-center gap-1">
            <Link href="/admin" className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Dashboard</Link>
            <Link href="/admin/orders" className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Orders</Link>
            <Link href="/admin/products" className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Products</Link>
            <Link href="/admin/bundles" className="px-3 py-1.5 rounded-lg text-sm font-medium bg-brand/10 text-brand">Bundles</Link>
            <Link href="/admin/templates" className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Templates</Link>
            <Link href="/admin/reviews" className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Reviews</Link>
          </nav>
          <button
            onClick={async () => {
              await fetch("/api/admin/auth", { method: "DELETE" });
              window.location.href = "/admin-access-2026";
            }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">Hamper Bundles</h1>
            <p className="text-sm text-gray-500">{bundles.length} pre-made bundles</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl text-sm font-semibold hover:bg-brand-deep transition-colors"
          >
            <Plus className="w-4 h-4" /> New Bundle
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-2xl animate-pulse h-64" />)}
          </div>
        ) : bundles.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No bundles yet</p>
            <p className="text-sm text-gray-400 mt-1">Create your first pre-made hamper</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bundles.map((b) => {
              const pct = b.regular_price > b.bundle_price
                ? Math.round(((b.regular_price - b.bundle_price) / b.regular_price) * 100)
                : 0;
              return (
                <div key={b.id} className={`bg-white rounded-2xl border overflow-hidden ${b.is_active ? "border-gray-200" : "border-dashed border-gray-300 opacity-70"}`}>
                  <div className="aspect-video bg-gray-100 relative">
                    {b.image_url ? (
                      <img src={b.image_url} alt={b.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Gift className="w-10 h-10 text-gray-300" /></div>
                    )}
                    {b.is_featured && (
                      <span className="absolute top-2 left-2 bg-gold text-brand-deep text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                        <Star className="w-3 h-3" /> FEATURED
                      </span>
                    )}
                    {!b.is_active && (
                      <span className="absolute top-2 right-2 bg-gray-700 text-white text-[10px] font-bold px-2 py-1 rounded-lg">INACTIVE</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm text-gray-900 truncate">{b.name}</h3>
                    <div className="flex items-center gap-2 mt-1 mb-1">
                      <span className="text-base font-bold text-red-500">{formatKsh(b.bundle_price)}</span>
                      {pct > 0 && (
                        <>
                          <span className="text-xs text-gray-400 line-through">{formatKsh(b.regular_price)}</span>
                          <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">-{pct}%</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{b.item_count} items · {b.category}</p>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => openEdit(b)} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-100 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-200">
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                      <button onClick={() => toggleActive(b)} className="p-2 bg-blue-50 rounded-xl text-blue-500 hover:bg-blue-100">
                        {b.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => handleDelete(b.id)} className="p-2 bg-red-50 rounded-xl text-red-500 hover:bg-red-100">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-gray-900">
                {editingId ? "Edit Bundle" : "New Bundle"}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Basics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bundle Name</label>
                <input type="text" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value, slug: editingId ? form.slug : generateSlug(e.target.value) })}
                  placeholder="e.g. Whisky Lovers Hamper"
                  className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Regular Price (KSh)</label>
                <input type="number" value={form.regular_price} onChange={(e) => setForm({ ...form, regular_price: e.target.value })}
                  className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Bundle Price (KSh) {savingsPct > 0 && <span className="text-red-500 normal-case">— save {savingsPct}%</span>}
                </label>
                <input type="number" value={form.bundle_price} onChange={(e) => setForm({ ...form, bundle_price: e.target.value })}
                  className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand">
                  <option value="liquor">Liquor</option>
                  <option value="wine">Wine & Champagne</option>
                  <option value="gourmet">Gourmet</option>
                  <option value="wellness">Wellness & Spa</option>
                  <option value="chocolate">Chocolate</option>
                  <option value="corporate">Corporate</option>
                  <option value="baby">Baby</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Occasions (comma-separated)</label>
                <input type="text" value={form.occasions} onChange={(e) => setForm({ ...form, occasions: e.target.value })}
                  placeholder="birthday, corporate, holiday"
                  className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Image URL</label>
                <input type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..."
                  className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                  className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand resize-none" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded border-gray-300" />
                <span className="text-sm text-gray-700">Active (visible in catalog)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="rounded border-gray-300" />
                <span className="text-sm text-gray-700">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_coming_soon} onChange={(e) => setForm({ ...form, is_coming_soon: e.target.checked })} className="rounded border-gray-300" />
                <span className="text-sm text-gray-700">Coming Soon (notify instead of order)</span>
              </label>
            </div>

            {/* Items picker */}
            <div className="border-t border-gray-200 pt-4">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bundle Contents ({form.items.length} products)</label>

              {form.items.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {form.items.map((item, idx) => (
                    <div key={`${item.product_id}-${idx}`} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                      <span className="text-sm text-gray-800 truncate flex-1">{item.product_name}</span>
                      <div className="flex items-center gap-1 ml-2">
                        <button onClick={() => updateItemQty(idx, -1)} className="w-6 h-6 bg-white border border-gray-200 rounded-lg text-xs font-bold">−</button>
                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <button onClick={() => updateItemQty(idx, 1)} className="w-6 h-6 bg-white border border-gray-200 rounded-lg text-xs font-bold">+</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={pickerSearch} onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Search products to add..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto">
                {pickerLoading ? (
                  <div className="col-span-2 flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
                ) : (
                  pickerResults.map((p) => (
                    <button key={p.id} onClick={() => addItemToBundle(p)}
                      className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-xl text-left hover:border-brand transition-colors">
                      {p.image_url ? (
                        <img src={p.image_url} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-xs">🎁</div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{p.name}</p>
                        <p className="text-[10px] text-gray-400">{formatKsh(p.price)}</p>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-brand ml-auto flex-shrink-0" />
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-400">Changes broadcast live to the shop</p>
              <button onClick={handleSave} disabled={saving || !form.name || !form.regular_price || !form.bundle_price}
                className="flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-xl font-semibold text-sm hover:bg-brand-deep disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? "Save Changes" : "Create Bundle"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
