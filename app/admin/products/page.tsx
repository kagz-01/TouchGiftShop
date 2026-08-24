"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatKsh } from "@/lib/utils";
import {
  Search, Plus, Edit2, Trash2, Package,
  Eye, EyeOff, X, Save, Loader2,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image_url: string | null;
  in_stock: boolean;
  is_personalizable: boolean;
  created_at: string;
  product_categories?: { category_id: string; categories: { name: string; slug: string } | null }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  kind: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: 0,
    image_url: "",
    in_stock: true,
    is_personalizable: false,
    categoryIds: [] as string[],
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("limit", "100");
    if (search) params.set("search", search);

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
  }, [search]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/products?limit=1");
      // Categories come embedded in products, but let's get them from the DB directly
      // For now, use a simple approach
      const allCats: Category[] = [];
      const seen = new Set<string>();
      products.forEach((p) => {
        p.product_categories?.forEach((pc) => {
          if (pc.categories && !seen.has(pc.categories.slug)) {
            seen.add(pc.categories.slug);
            allCats.push({ id: pc.category_id, name: pc.categories.name, slug: pc.categories.slug, kind: "practical" });
          }
        });
      });
      setCategories(allCats);
    } catch {}
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (products.length > 0) fetchCategories();
  }, [products]);

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      price: product.price,
      image_url: product.image_url || "",
      in_stock: product.in_stock,
      is_personalizable: product.is_personalizable,
      categoryIds: product.product_categories?.map((pc) => pc.category_id) || [],
    });
    setShowCreate(false);
  };

  const openCreate = () => {
    setEditingProduct(null);
    setForm({
      name: "",
      slug: "",
      description: "",
      price: 0,
      image_url: "",
      in_stock: true,
      is_personalizable: false,
      categoryIds: [],
    });
    setShowCreate(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingProduct) {
        // Update
        const res = await fetch("/api/admin/products", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingProduct.id, ...form }),
        });
        if (!res.ok) throw new Error("Failed to update");
      } else {
        // Create
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
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
        body: JSON.stringify({
          id: product.id,
          in_stock: !product.in_stock,
        }),
      });
      fetchProducts();
    } catch {}
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

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
            <Link href="/admin/reviews" className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
              Reviews
            </Link>
          </nav>
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

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand"
            />
          </div>
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
                {/* Image */}
                <div className="aspect-square bg-gray-100 relative">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={() => toggleStock(product)}
                      className={`p-1.5 rounded-lg text-xs font-bold ${
                        product.in_stock
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {product.in_stock ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                    {product.name}
                  </h3>
                  <p className="text-lg font-bold text-brand mb-2">
                    {formatKsh(product.price)}
                  </p>
                  <div className="flex items-center gap-1 mb-3">
                    {product.product_categories?.slice(0, 2).map((pc) => (
                      <span
                        key={pc.category_id}
                        className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                      >
                        {pc.categories?.name}
                      </span>
                    ))}
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
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="font-display text-lg font-bold text-gray-900">
                {editingProduct ? "Edit Product" : "Add Product"}
              </h2>
              <button
                onClick={() => { setShowCreate(false); setEditingProduct(null); }}
                className="p-2 rounded-xl hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Product Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value });
                    if (!editingProduct) {
                      setForm((f) => ({ ...f, slug: generateSlug(e.target.value) }));
                    }
                  }}
                  className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Slug
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand"
                />
              </div>

              {/* Price */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Price (KSh)
                </label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Image URL
                </label>
                <input
                  type="url"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand"
                />
                {form.image_url && (
                  <img
                    src={form.image_url}
                    alt="Preview"
                    className="mt-2 w-20 h-20 rounded-xl object-cover"
                  />
                )}
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand resize-none"
                />
              </div>

              {/* Toggles */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.in_stock}
                    onChange={(e) => setForm({ ...form, in_stock: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">In Stock</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_personalizable}
                    onChange={(e) => setForm({ ...form, is_personalizable: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Personalizable</span>
                </label>
              </div>

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={saving || !form.name || !form.price}
                className="w-full flex items-center justify-center gap-2 py-3 bg-brand text-white rounded-xl font-semibold text-sm hover:bg-brand-deep transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {editingProduct ? "Save Changes" : "Create Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
