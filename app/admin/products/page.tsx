"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatKsh } from "@/lib/utils";
import type { ColorVariant, SizeVariant } from "@/lib/types";
import {
  Search, Plus, Edit2, Trash2, Package,
  Eye, EyeOff, X, Save, Loader2,
  ImagePlus, GripVertical, Tag, BarChart3,
  Globe, Palette, Ruler,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  sale_price: number | null;
  image_url: string | null;
  images: string[];
  in_stock: boolean;
  stock_quantity: number | null;
  sku: string | null;
  status: string;
  weight_kg: number | null;
  tags: string[];
  seo_title: string | null;
  seo_description: string | null;
  color_variants: ColorVariant[];
  size_variants: SizeVariant[];
  is_coming_soon: boolean | null;
  is_personalizable: boolean;
  created_at: string;
  product_categories?: { category_id: string; categories: { name: string; slug: string } | null }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

type Tab = "basic" | "pricing" | "media" | "inventory" | "variants" | "seo";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "basic", label: "Basic", icon: <Package className="w-4 h-4" /> },
  { key: "pricing", label: "Pricing", icon: <BarChart3 className="w-4 h-4" /> },
  { key: "media", label: "Media", icon: <ImagePlus className="w-4 h-4" /> },
  { key: "inventory", label: "Inventory", icon: <Tag className="w-4 h-4" /> },
  { key: "variants", label: "Variants", icon: <Palette className="w-4 h-4" /> },
  { key: "seo", label: "SEO", icon: <Globe className="w-4 h-4" /> },
];

function getDefaultForm() {
  return {
    name: "",
    slug: "",
    description: "",
    price: 0,
    sale_price: "" as string | number,
    image_url: "",
    images: [] as string[],
    in_stock: true,
    is_personalizable: false,
    is_coming_soon: false,
    stock_quantity: "" as string | number,
    sku: "",
    status: "published" as string,
    weight_kg: "" as string | number,
    tags: [] as string[],
    seo_title: "",
    seo_description: "",
    color_variants: [] as ColorVariant[],
    size_variants: [] as SizeVariant[],
    categoryIds: [] as string[],
  };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("basic");
  const [tagInput, setTagInput] = useState("");

  const [form, setForm] = useState(getDefaultForm());

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("limit", "100");
    if (search) params.set("search", search);
    if (statusFilter !== "all") params.set("status", statusFilter);

    try {
      const res = await fetch(`/api/admin/products?${params}`);
      const data = await res.json();
      setProducts(data.products ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data.categories ?? []);
    } catch {
      // Fallback: extract from products
      const allCats: Category[] = [];
      const seen = new Set<string>();
      products.forEach((p) => {
        p.product_categories?.forEach((pc) => {
          if (pc.categories && !seen.has(pc.categories.slug)) {
            seen.add(pc.categories.slug);
            allCats.push({ id: pc.category_id, name: pc.categories.name, slug: pc.categories.slug });
          }
        });
      });
      setCategories(allCats);
    }
  }, [products]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      price: product.price,
      sale_price: product.sale_price ?? "",
      image_url: product.image_url || "",
      images: product.images || [],
      in_stock: product.in_stock,
      is_personalizable: product.is_personalizable,
      is_coming_soon: !!product.is_coming_soon,
      stock_quantity: product.stock_quantity ?? "",
      sku: product.sku || "",
      status: product.status || "published",
      weight_kg: product.weight_kg ?? "",
      tags: product.tags || [],
      seo_title: product.seo_title || "",
      seo_description: product.seo_description || "",
      color_variants: product.color_variants || [],
      size_variants: product.size_variants || [],
      categoryIds: product.product_categories?.map((pc) => pc.category_id) || [],
    });
    setActiveTab("basic");
    setShowCreate(false);
  };

  const openCreate = () => {
    setEditingProduct(null);
    setForm(getDefaultForm());
    setActiveTab("basic");
    setShowCreate(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        sale_price: form.sale_price ? Number(form.sale_price) : null,
        stock_quantity: form.stock_quantity ? Number(form.stock_quantity) : null,
        weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
        sku: form.sku || null,
        seo_title: form.seo_title || null,
        seo_description: form.seo_description || null,
      };

      if (editingProduct) {
        const res = await fetch("/api/admin/products", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingProduct.id, ...payload }),
        });
        if (!res.ok) throw new Error("Failed to update");
      } else {
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to create");
      }
      setShowCreate(false);
      setEditingProduct(null);
      fetchProducts();
    } catch {
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product permanently?")) return;
    try {
      await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      fetchProducts();
    } catch {
      alert("Failed to delete");
    }
  };

  const toggleStock = async (product: Product) => {
    try {
      await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, in_stock: !product.in_stock }),
      });
      fetchProducts();
    } catch {}
  };

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) {
      setForm({ ...form, tags: [...form.tags, t] });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });
  };

  const addColorVariant = () => {
    setForm({ ...form, color_variants: [...form.color_variants, { name: "", image: undefined, priceOverride: undefined }] });
  };

  const updateColorVariant = (idx: number, field: keyof ColorVariant, value: string | number | null | undefined) => {
    const updated = [...form.color_variants];
    updated[idx] = { ...updated[idx], [field]: value };
    setForm({ ...form, color_variants: updated });
  };

  const removeColorVariant = (idx: number) => {
    setForm({ ...form, color_variants: form.color_variants.filter((_, i) => i !== idx) });
  };

  const addSizeVariant = () => {
    setForm({ ...form, size_variants: [...form.size_variants, { name: "", priceOverride: undefined }] });
  };

  const updateSizeVariant = (idx: number, field: keyof SizeVariant, value: string | number | null | undefined) => {
    const updated = [...form.size_variants];
    updated[idx] = { ...updated[idx], [field]: value };
    setForm({ ...form, size_variants: updated });
  };

  const removeSizeVariant = (idx: number) => {
    setForm({ ...form, size_variants: form.size_variants.filter((_, i) => i !== idx) });
  };

  const addGalleryImage = (url: string) => {
    if (url && !form.images.includes(url)) {
      setForm({ ...form, images: [...form.images, url] });
    }
  };

  const removeGalleryImage = (idx: number) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== idx) });
  };

  const salePriceNum = form.sale_price ? Number(form.sale_price) : 0;
  const salePercent = salePriceNum && form.price > salePriceNum
    ? Math.round(((form.price - salePriceNum) / form.price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Nav */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-6">
          <Link href="/admin" className="font-display text-lg font-bold text-brand-deep">
            TouchGift Admin
          </Link>
          <nav className="flex items-center gap-1">
            <Link href="/admin" className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
              Dashboard
            </Link>
            <Link href="/admin/orders" className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
              Orders
            </Link>
            <Link href="/admin/products" className="px-3 py-1.5 rounded-lg text-sm font-medium bg-brand/10 text-brand">
              Products
            </Link>
            <Link href="/admin/bundles" className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
                Bundles
              </Link>
              <Link href="/admin/reviews" className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
              Reviews
            </Link>
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
            <h1 className="font-display text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-sm text-gray-500">{total} products</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl text-sm font-semibold hover:bg-brand-deep transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>

        {/* Search + Filters */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl animate-pulse h-64" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-square bg-gray-100 relative">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={() => toggleStock(product)}
                      className={`p-1.5 rounded-lg text-xs font-bold ${
                        product.in_stock ? "bg-green-500 text-white" : "bg-red-500 text-white"
                      }`}
                    >
                      {product.in_stock ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {product.sale_price && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                      SALE
                    </div>
                  )}
                  {product.status === "draft" && (
                    <div className="absolute bottom-2 left-2 bg-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                      DRAFT
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    {product.sale_price ? (
                      <>
                        <span className="text-lg font-bold text-red-500">{formatKsh(product.sale_price)}</span>
                        <span className="text-sm text-gray-400 line-through">{formatKsh(product.price)}</span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-brand">{formatKsh(product.price)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mb-3 flex-wrap">
                    {product.sku && (
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-mono">
                        {product.sku}
                      </span>
                    )}
                    {product.product_categories?.slice(0, 2).map((pc) => (
                      <span key={pc.category_id} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {pc.categories?.name}
                      </span>
                    ))}
                    {product.color_variants?.length > 0 && (
                      <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
                        {product.color_variants.length} colors
                      </span>
                    )}
                    {product.size_variants?.length > 0 && (
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                        {product.size_variants.length} sizes
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(product)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-100 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 bg-red-50 rounded-xl text-red-500 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreate || editingProduct) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 shrink-0">
              <h2 className="font-display text-lg font-bold text-gray-900">
                {editingProduct ? "Edit Product" : "Add Product"}
              </h2>
              <button onClick={() => { setShowCreate(false); setEditingProduct(null); }} className="p-2 rounded-xl hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 px-5 shrink-0 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.key
                      ? "border-brand text-brand"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* BASIC TAB */}
              {activeTab === "basic" && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Name</label>
                    <input type="text" value={form.name} onChange={(e) => {
                      setForm({ ...form, name: e.target.value });
                      if (!editingProduct) setForm((f) => ({ ...f, slug: generateSlug(e.target.value) }));
                    }} className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</label>
                    <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand resize-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand">
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Categories</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <label key={cat.id} className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.categoryIds.includes(cat.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setForm({ ...form, categoryIds: [...form.categoryIds, cat.id] });
                              } else {
                                setForm({ ...form, categoryIds: form.categoryIds.filter((id) => id !== cat.id) });
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">{cat.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tags</label>
                    <div className="flex gap-2 mt-1">
                      <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} placeholder="Add tag..." className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
                      <button onClick={addTag} className="px-3 py-2 bg-gray-100 rounded-xl text-sm font-medium hover:bg-gray-200">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {form.tags.map((tag) => (
                        <span key={tag} className="flex items-center gap-1 text-xs bg-brand/10 text-brand px-2 py-1 rounded-full">
                          {tag}
                          <button onClick={() => removeTag(tag)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.is_personalizable} onChange={(e) => setForm({ ...form, is_personalizable: e.target.checked })} className="rounded border-gray-300" />
                      <span className="text-sm text-gray-700">Personalizable (custom text/image)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.is_coming_soon} onChange={(e) => setForm({ ...form, is_coming_soon: e.target.checked })} className="rounded border-gray-300" />
                      <span className="text-sm text-gray-700">Coming Soon (visible but not purchasable)</span>
                    </label>
                  </div>
                </>
              )}

              {/* PRICING TAB */}
              {activeTab === "pricing" && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Regular Price (KSh)</label>
                    <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sale Price (KSh) — optional</label>
                    <input type="number" value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value ? Number(e.target.value) : "" })} placeholder="Leave empty for no sale" className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
                    {salePercent > 0 && (
                      <p className="text-sm text-red-500 mt-1 font-medium">Save {salePercent}% — {formatKsh(form.price - salePriceNum)} off</p>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500 mb-1">Preview</p>
                    <div className="flex items-center gap-3">
                      {form.sale_price ? (
                        <>
                          <span className="text-2xl font-bold text-red-500">{formatKsh(salePriceNum)}</span>
                          <span className="text-lg text-gray-400 line-through">{formatKsh(form.price)}</span>
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">-{salePercent}%</span>
                        </>
                      ) : (
                        <span className="text-2xl font-bold text-brand">{formatKsh(form.price)}</span>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* MEDIA TAB */}
              {activeTab === "media" && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Hero Image URL</label>
                    <input type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
                    {form.image_url && (
                      <img src={form.image_url} alt="Preview" className="mt-2 w-24 h-24 rounded-xl object-cover border" />
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Gallery Images</label>
                    <p className="text-xs text-gray-400 mt-0.5">Different angles, colors, packaging shots</p>
                    <div className="flex gap-2 mt-2">
                      <input type="url" id="galleryInput" placeholder="Add image URL..." className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
                      <button onClick={() => {
                        const input = document.getElementById("galleryInput") as HTMLInputElement;
                        if (input.value) { addGalleryImage(input.value); input.value = ""; }
                      }} className="px-3 py-2 bg-gray-100 rounded-xl text-sm font-medium hover:bg-gray-200">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    {form.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mt-3">
                        {form.images.map((img, idx) => (
                          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border group">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <button onClick={() => removeGalleryImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="w-3 h-3" />
                            </button>
                            {idx === 0 && (
                              <span className="absolute bottom-1 left-1 bg-brand text-white text-[9px] px-1.5 py-0.5 rounded font-bold">HERO</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* INVENTORY TAB */}
              {activeTab === "inventory" && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU (Stock Keeping Unit)</label>
                    <input type="text" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="e.g. TG-Birthday-001" className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand font-mono" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock Quantity</label>
                    <input type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value ? Number(e.target.value) : "" })} placeholder="Leave empty for unlimited" className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
                    <p className="text-xs text-gray-400 mt-1">Set to 0 to auto-disable &quot;In Stock&quot;</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Weight (kg) — for delivery</label>
                    <input type="number" step="0.1" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value ? Number(e.target.value) : "" })} placeholder="e.g. 0.5" className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.in_stock} onChange={(e) => setForm({ ...form, in_stock: e.target.checked })} className="rounded border-gray-300" />
                      <span className="text-sm text-gray-700">In Stock</span>
                    </label>
                  </div>
                </>
              )}

              {/* VARIANTS TAB */}
              {activeTab === "variants" && (
                <>
                  {/* Color Variants */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Color Variants</label>
                      <button onClick={addColorVariant} className="flex items-center gap-1 text-xs text-brand font-medium hover:underline">
                        <Plus className="w-3 h-3" /> Add Color
                      </button>
                    </div>
                    {form.color_variants.length === 0 ? (
                      <p className="text-xs text-gray-400 bg-gray-50 p-3 rounded-xl">No color variants. Add one if this product comes in multiple colors.</p>
                    ) : (
                      <div className="space-y-2">
                        {form.color_variants.map((cv, idx) => (
                          <div key={idx} className="flex gap-2 items-start bg-gray-50 p-3 rounded-xl">
                            <input type="text" value={cv.name} onChange={(e) => updateColorVariant(idx, "name", e.target.value)} placeholder="Color name" className="w-28 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand" />
                            <input type="url" value={cv.image || ""} onChange={(e) => updateColorVariant(idx, "image", e.target.value || null)} placeholder="Image URL" className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand" />
                            <input type="number" value={cv.priceOverride ?? ""} onChange={(e) => updateColorVariant(idx, "priceOverride", e.target.value ? Number(e.target.value) : null)} placeholder="Price" className="w-24 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand" />
                            <button onClick={() => removeColorVariant(idx)} className="p-2 text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Size Variants */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Size Variants</label>
                      <button onClick={addSizeVariant} className="flex items-center gap-1 text-xs text-brand font-medium hover:underline">
                        <Plus className="w-3 h-3" /> Add Size
                      </button>
                    </div>
                    {form.size_variants.length === 0 ? (
                      <p className="text-xs text-gray-400 bg-gray-50 p-3 rounded-xl">No size variants. Add one if this product comes in different sizes.</p>
                    ) : (
                      <div className="space-y-2">
                        {form.size_variants.map((sv, idx) => (
                          <div key={idx} className="flex gap-2 items-start bg-gray-50 p-3 rounded-xl">
                            <input type="text" value={sv.name} onChange={(e) => updateSizeVariant(idx, "name", e.target.value)} placeholder="Size name (e.g. S, M, L)" className="w-28 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand" />
                            <input type="number" value={sv.priceOverride ?? ""} onChange={(e) => updateSizeVariant(idx, "priceOverride", e.target.value ? Number(e.target.value) : null)} placeholder="Price override" className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand" />
                            <button onClick={() => removeSizeVariant(idx)} className="p-2 text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* SEO TAB */}
              {activeTab === "seo" && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">SEO Title</label>
                    <input type="text" value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} placeholder="Page title for Google (leave empty to use product name)" className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
                    <p className="text-xs text-gray-400 mt-1">{(form.seo_title || form.name).length}/200 characters</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Meta Description</label>
                    <textarea value={form.seo_description} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} rows={3} placeholder="Description shown in Google search results" className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand resize-none" />
                    <p className="text-xs text-gray-400 mt-1">{(form.seo_description || form.description || "").length}/300 characters</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Google Preview</p>
                    <p className="text-blue-700 text-sm font-medium truncate">{form.seo_title || form.name || "Product Title"}</p>
                    <p className="text-green-700 text-xs truncate">touchgiftshop.co.ke/products/{form.slug || "product-slug"}</p>
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">{form.seo_description || form.description || "Product description will appear here..."}</p>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-5 border-t border-gray-200 shrink-0">
              <div className="text-sm text-gray-400">
                {form.sale_price && <span className="text-red-500 font-medium">Sale active</span>}
              </div>
              <button
                onClick={handleSave}
                disabled={saving || !form.name || !form.price}
                className="flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-xl font-semibold text-sm hover:bg-brand-deep transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingProduct ? "Save Changes" : "Create Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
