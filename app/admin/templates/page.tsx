"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatKsh } from "@/lib/utils";
import type { HamperTemplate } from "@/lib/types";
import {
  Plus, Edit2, Trash2, LayoutTemplate, X, Save, Loader2,
  Eye, EyeOff, Star,
} from "lucide-react";

interface TemplateItem {
  product_id: string | null;
  product_name: string;
  price: number;
  quantity: number;
}

function getDefaultForm() {
  return {
    name: "",
    description: "",
    category: "welcome",
    price_range_min: "" as string | number,
    price_range_max: "" as string | number,
    occasions: "",
    is_active: true,
    is_featured: false,
    items: [] as TemplateItem[],
  };
}

const CATEGORIES = [
  { value: "welcome", label: "New Hire Welcome" },
  { value: "client", label: "Client Appreciation" },
  { value: "recognition", label: "Employee Recognition" },
  { value: "holiday", label: "Festive / Holiday" },
  { value: "event", label: "Conference & Events" },
  { value: "executive", label: "Executive VIP" },
  { value: "milestone", label: "Milestones" },
  { value: "sympathy", label: "Sympathy & Care" },
];

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<HamperTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(getDefaultForm());
  const [itemDraft, setItemDraft] = useState({ name: "", price: "" });

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/templates");
      const data = await res.json();
      setTemplates(data.templates ?? []);
    } catch {
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const openCreate = () => {
    setEditingId(null);
    setForm(getDefaultForm());
    setShowForm(true);
  };

  const openEdit = (t: HamperTemplate) => {
    setEditingId(t.id);
    setForm({
      name: t.name,
      description: t.description || "",
      category: t.category || "welcome",
      price_range_min: t.price_range_min ?? "",
      price_range_max: t.price_range_max ?? "",
      occasions: (t.occasions || []).join(", "),
      is_active: t.is_active,
      is_featured: t.is_featured,
      items: (t.items ?? []).map((it) => ({
        product_id: it.product_id,
        product_name: it.product_name,
        price: Number(it.price),
        quantity: it.quantity,
      })),
    });
    setShowForm(true);
  };

  const addItem = () => {
    const name = itemDraft.name.trim();
    const price = parseFloat(itemDraft.price);
    if (!name || isNaN(price)) return;
    setForm((f) => ({ ...f, items: [...f.items, { product_id: null, product_name: name, price, quantity: 1 }] }));
    setItemDraft({ name: "", price: "" });
  };

  const updateItemQty = (idx: number, delta: number) => {
    setForm((f) => {
      const items = [...f.items];
      const next = items[idx].quantity + delta;
      if (next < 1) items.splice(idx, 1);
      else items[idx] = { ...items[idx], quantity: next };
      return { ...f, items };
    });
  };

  const itemsTotal = form.items.reduce((s, it) => s + it.price * it.quantity, 0);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description || null,
        category: form.category,
        price_range_min: form.price_range_min ? Number(form.price_range_min) : null,
        price_range_max: form.price_range_max ? Number(form.price_range_max) : null,
        occasions: form.occasions.split(",").map((o) => o.trim()).filter(Boolean),
        is_active: form.is_active,
        is_featured: form.is_featured,
        items: form.items,
      };

      const res = editingId
        ? await fetch("/api/admin/templates", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingId, ...payload }) })
        : await fetch("/api/admin/templates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to save template");
        return;
      }

      setShowForm(false);
      setEditingId(null);
      fetchTemplates();
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (t: HamperTemplate) => {
    await fetch("/api/admin/templates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: t.id, is_active: !t.is_active }),
    });
    fetchTemplates();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this template permanently?")) return;
    await fetch(`/api/admin/templates?id=${id}`, { method: "DELETE" });
    fetchTemplates();
  };

  const catLabel = (v: string) => CATEGORIES.find((c) => c.value === v)?.label ?? v;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-6">
          <Link href="/admin" className="font-display text-lg font-bold text-brand-deep">TouchGift Admin</Link>
          <nav className="flex items-center gap-1 flex-wrap">
            <Link href="/admin" className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Dashboard</Link>
            <Link href="/admin/orders" className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Orders</Link>
            <Link href="/admin/products" className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Products</Link>
            <Link href="/admin/bundles" className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Bundles</Link>
            <Link href="/admin/templates" className="px-3 py-1.5 rounded-lg text-sm font-medium bg-brand/10 text-brand">Templates</Link>
            <Link href="/admin/reviews" className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Reviews</Link>
          </nav>
          <button
            onClick={async () => {
              await fetch("/api/admin/auth", { method: "DELETE" });
              window.location.href = "/admin-access-2026";
            }}
            className="text-sm text-gray-500 hover:text-gray-700 ml-auto"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">Corporate Templates</h1>
            <p className="text-sm text-gray-500">{templates.length} templates — power the corporate build wizard</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl text-sm font-semibold hover:bg-brand-deep transition-colors">
            <Plus className="w-4 h-4" /> New Template
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-2xl animate-pulse h-48" />)}
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <LayoutTemplate className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No templates yet</p>
            <p className="text-sm text-gray-400 mt-1">Create one, or run scripts/seed-hampers.ts to load starters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates.map((t) => (
              <div key={t.id} className={`bg-white rounded-2xl border overflow-hidden ${t.is_active ? "border-gray-200" : "border-dashed border-gray-300 opacity-70"}`}>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-brand/10 text-brand px-2 py-0.5 rounded-full">
                      {catLabel(t.category)}
                    </span>
                    {t.is_featured && (
                      <span className="flex items-center gap-1 text-[10px] font-bold bg-gold/20 text-gold-dark px-2 py-0.5 rounded-full">
                        <Star className="w-3 h-3" /> FEATURED
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm text-gray-900">{t.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 min-h-[2rem]">{t.description}</p>
                  <div className="mt-2 text-xs">
                    <p className="font-bold text-brand-deep">
                      {formatKsh(t.price_range_min ?? 0)} – {formatKsh(t.price_range_max ?? 0)}
                      <span className="text-gray-400 font-normal"> /person</span>
                    </p>
                    <p className="text-gray-400 mt-0.5">{t.item_count} items · {(t.occasions ?? []).slice(0, 2).join(", ")}</p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => openEdit(t)} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-100 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-200">
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => toggleActive(t)} className="p-2 bg-blue-50 rounded-xl text-blue-500 hover:bg-blue-100">
                      {t.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="p-2 bg-red-50 rounded-xl text-red-500 hover:bg-red-100">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-gray-900">{editingId ? "Edit Template" : "New Template"}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Template Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Executive Onboarding Kit"
                  className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand">
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Occasions (comma-sep)</label>
                <input type="text" value={form.occasions} onChange={(e) => setForm({ ...form, occasions: e.target.value })}
                  placeholder="onboarding, new hire"
                  className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Price Min (KSh)</label>
                <input type="number" value={form.price_range_min} onChange={(e) => setForm({ ...form, price_range_min: e.target.value })}
                  className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Price Max (KSh)</label>
                <input type="number" value={form.price_range_max} onChange={(e) => setForm({ ...form, price_range_max: e.target.value })}
                  className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                  className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand resize-none" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded border-gray-300" />
                <span className="text-sm text-gray-700">Active (shown in wizard)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="rounded border-gray-300" />
                <span className="text-sm text-gray-700">Popular badge</span>
              </label>
            </div>

            {/* Items */}
            <div className="border-t border-gray-200 pt-4">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Contents ({form.items.length}) — est. total {formatKsh(itemsTotal)}
              </label>
              {form.items.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {form.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                      <span className="text-sm text-gray-800 truncate flex-1">{item.product_name}</span>
                      <span className="text-xs text-gray-400 mr-2">{formatKsh(item.price)}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => updateItemQty(idx, -1)} className="w-6 h-6 bg-white border border-gray-200 rounded-lg text-xs font-bold">−</button>
                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <button onClick={() => updateItemQty(idx, 1)} className="w-6 h-6 bg-white border border-gray-200 rounded-lg text-xs font-bold">+</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <input type="text" value={itemDraft.name} onChange={(e) => setItemDraft({ ...itemDraft, name: e.target.value })}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }}
                  placeholder="Item name (e.g. Branded Mug)"
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
                <input type="number" value={itemDraft.price} onChange={(e) => setItemDraft({ ...itemDraft, price: e.target.value })}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }}
                  placeholder="Price"
                  className="w-28 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
                <button onClick={addItem} className="px-3 py-2 bg-gray-100 rounded-xl text-sm font-medium hover:bg-gray-200"><Plus className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button onClick={handleSave} disabled={saving || !form.name}
                className="flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-xl font-semibold text-sm hover:bg-brand-deep disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? "Save Changes" : "Create Template"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
