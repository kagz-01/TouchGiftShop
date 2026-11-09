"use client";

/**
 * QuoteBuilder — Catalog-driven corporate quote request builder.
 *
 * Lets a corporate client browse the product catalog, add items (with qty)
 * into a draft line list, fill in company details and submit the whole thing
 * as a single quote request.  Modeled on TouchDesk's QuoteEditor (line editor
 * with running totals) but styled for the TouchGift storefront.
 *
 * Usage:
 *   <QuoteBuilder onClose={() => setOpen(false)} />
 *
 * The component is intentionally self-contained: it manages its own catalog
 * fetch, line state, and submission — the parent only needs an onClose handler.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search, Plus, Minus, Trash2, Send, Package, Loader2,
  CheckCircle, X, AlertCircle, ChevronDown, ShoppingCart,
  FileText, Building2, Mail, Phone, MessageSquare,
} from "lucide-react";
import Image from "next/image";
import { formatKsh } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CatalogProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  category_name: string | null;
  moq: number | null;
  description: string | null;
}

interface QuoteLine {
  id: string; // product.id
  name: string;
  category: string | null;
  unitPrice: number;
  qty: number;
  notes: string;
}

type SubmitState = "idle" | "sending" | "done" | "error";

const CATEGORIES = [
  { slug: "all",                label: "All" },
  { slug: "accessories",        label: "Accessories" },
  { slug: "apparel",            label: "Apparel" },
  { slug: "awards-trophies",    label: "Awards & Trophies" },
  { slug: "bags",               label: "Bags" },
  { slug: "clocks",             label: "Clocks" },
  { slug: "drinkware",          label: "Drinkware" },
  { slug: "gift-sets",          label: "Gift Sets" },
  { slug: "stationery-office",  label: "Stationery" },
  { slug: "tech-gadgets",       label: "Tech Gadgets" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function lineId() {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ProductCard({
  product,
  onAdd,
}: {
  product: CatalogProduct;
  onAdd: (p: CatalogProduct) => void;
}) {
  const img = product.images?.[0] ?? null;
  return (
    <div className="group relative flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl overflow-hidden hover:border-[#9B1B5A]/40 dark:hover:border-[#9B1B5A]/40 transition-all duration-200">
      <div className="relative h-32 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        {img ? (
          <Image
            src={img}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="160px"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Package className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
          </div>
        )}
        {product.moq && (
          <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
            MOQ {product.moq}
          </span>
        )}
      </div>
      <div className="flex flex-col flex-1 p-3 gap-1">
        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2">
          {product.name}
        </p>
        {product.category_name && (
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{product.category_name}</p>
        )}
        <p className="text-sm font-bold text-[#9B1B5A] mt-auto pt-1">
          {formatKsh(product.price)}
        </p>
      </div>
      <button
        onClick={() => onAdd(product)}
        className="
          flex items-center justify-center gap-1.5 w-full py-2
          bg-[#9B1B5A]/5 hover:bg-[#9B1B5A]/15 dark:bg-[#9B1B5A]/10 dark:hover:bg-[#9B1B5A]/25
          text-[#9B1B5A] text-xs font-semibold
          border-t border-zinc-100 dark:border-white/5
          transition-colors
        "
      >
        <Plus className="w-3.5 h-3.5" />
        Add to Quote
      </button>
    </div>
  );
}

function LineRow({
  line,
  onChange,
  onRemove,
}: {
  line: QuoteLine;
  onChange: (id: string, patch: Partial<QuoteLine>) => void;
  onRemove: (id: string) => void;
}) {
  const lineTotal = line.qty * line.unitPrice;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-lg">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{line.name}</p>
        {line.category && (
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{line.category}</p>
        )}
        <input
          type="text"
          placeholder="Line notes (optional)"
          value={line.notes}
          onChange={(e) => onChange(line.id, { notes: e.target.value })}
          className="mt-1 w-full text-xs bg-transparent border-b border-dashed border-zinc-300 dark:border-white/20 text-zinc-600 dark:text-zinc-400 placeholder:text-zinc-400 outline-none focus:border-[#9B1B5A]/50"
        />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Unit price */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Unit price</span>
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            {formatKsh(line.unitPrice)}
          </span>
        </div>

        {/* Qty stepper */}
        <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-lg px-1">
          <button
            onClick={() => onChange(line.id, { qty: Math.max(1, line.qty - 1) })}
            className="p-1 text-zinc-500 hover:text-[#9B1B5A]"
          >
            <Minus className="w-3 h-3" />
          </button>
          <input
            type="number"
            min={1}
            value={line.qty}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (Number.isFinite(v) && v > 0) onChange(line.id, { qty: v });
            }}
            className="w-10 text-center text-sm font-semibold bg-transparent text-zinc-900 dark:text-zinc-100 outline-none"
          />
          <button
            onClick={() => onChange(line.id, { qty: line.qty + 1 })}
            className="p-1 text-zinc-500 hover:text-[#9B1B5A]"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Line total */}
        <div className="flex flex-col items-end min-w-[72px]">
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Line total</span>
          <span className="text-sm font-bold text-[#9B1B5A]">{formatKsh(lineTotal)}</span>
        </div>

        <button
          onClick={() => onRemove(line.id)}
          className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function QuoteBuilder({ onClose }: { onClose?: () => void }) {
  // Catalog state
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [catLoading, setCatLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Quote lines
  const [lines, setLines] = useState<QuoteLine[]>([]);

  // Client details
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [globalNotes, setGlobalNotes] = useState("");

  // Panel view: "catalog" | "review"
  const [view, setView] = useState<"catalog" | "review">("catalog");

  // Submission
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState("");
  const [reference, setReference] = useState("");

  // Debounce search
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(search), 350);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search]);

  // Fetch catalog
  const fetchCatalog = useCallback(async (reset = false) => {
    setCatLoading(true);
    const p = reset ? 1 : page;
    if (reset) setPage(1);
    try {
      const params = new URLSearchParams({
        page: String(p),
        limit: "12",
        category,
        ...(debouncedSearch ? { q: debouncedSearch } : {}),
      });
      const res = await fetch(`/api/corporate/catalog?${params}`);
      if (!res.ok) return;
      const json = await res.json();
      const incoming: CatalogProduct[] = json.products ?? [];
      setProducts(reset ? incoming : (prev) => [...prev, ...incoming]);
      setHasMore(json.hasMore ?? false);
    } catch {
      // silent — catalog is not critical
    } finally {
      setCatLoading(false);
    }
  }, [page, category, debouncedSearch]);

  useEffect(() => { fetchCatalog(true); }, [category, debouncedSearch]);

  // Add product to lines
  const handleAddProduct = useCallback((p: CatalogProduct) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.id === p.id);
      if (existing) {
        return prev.map((l) => l.id === p.id ? { ...l, qty: l.qty + 1 } : l);
      }
      return [...prev, {
        id: p.id,
        name: p.name,
        category: p.category_name,
        unitPrice: p.price,
        qty: p.moq ?? 1,
        notes: "",
      }];
    });
  }, []);

  const handleLineChange = useCallback((id: string, patch: Partial<QuoteLine>) => {
    setLines((prev) => prev.map((l) => l.id === id ? { ...l, ...patch } : l));
  }, []);

  const handleLineRemove = useCallback((id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }, []);

  // Totals
  const { subtotal, lineCount } = useMemo(() => ({
    subtotal: lines.reduce((s, l) => s + l.qty * l.unitPrice, 0),
    lineCount: lines.length,
  }), [lines]);

  // Submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!lines.length) return;
    if (!company.trim() || !email.trim()) return;

    setSubmitState("sending");
    setSubmitError("");

    try {
      // For multi-line quotes we serialize all lines into the notes field
      // and send the first (most expensive) line as the primary product.
      const primary = [...lines].sort((a, b) => b.qty * b.unitPrice - a.qty * a.unitPrice)[0];
      const linesSummary = lines
        .map((l, i) => `${i + 1}. ${l.name} × ${l.qty} @ KES ${l.unitPrice.toLocaleString("en-KE")} = KES ${(l.qty * l.unitPrice).toLocaleString("en-KE")}${l.notes ? ` (${l.notes})` : ""}`)
        .join("\n");

      const payload = {
        productId: primary.id,
        productName: lines.length > 1
          ? `Multi-item quote (${lines.length} items)`
          : primary.name,
        qty: lines.reduce((s, l) => s + l.qty, 0),
        company: company.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        category: primary.category ?? undefined,
        notes: [globalNotes.trim(), `--- Line items ---\n${linesSummary}`]
          .filter(Boolean).join("\n\n"),
        unitPrice: primary.unitPrice,
        total: subtotal,
        moqTier: undefined,
      };

      const res = await fetch("/api/corporate/quote-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setSubmitError(json.error ?? "Failed to submit. Please try again.");
        setSubmitState("error");
        return;
      }

      setReference(json.reference ?? "");
      setSubmitState("done");
    } catch (err) {
      setSubmitError("Network error. Please check your connection and try again.");
      setSubmitState("error");
    }
  }

  // ─── Success screen ──────────────────────────────────────────────────────
  if (submitState === "done") {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Quote Request Sent!
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-sm">
            We have received your request for <strong>{lineCount} item{lineCount !== 1 ? "s" : ""}</strong> totalling{" "}
            <strong>{formatKsh(subtotal)}</strong>. Our team will prepare an official quotation and email it to{" "}
            <strong>{email}</strong>.
          </p>
          {reference && (
            <div className="mt-4 inline-flex items-center gap-2 bg-[#9B1B5A]/5 border border-[#9B1B5A]/20 rounded-lg px-4 py-2">
              <FileText className="w-4 h-4 text-[#9B1B5A]" />
              <span className="text-sm font-mono font-bold text-[#9B1B5A]">{reference}</span>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="px-6 py-2.5 bg-[#9B1B5A] text-white text-sm font-semibold rounded-lg hover:bg-[#7a1448] transition-colors"
        >
          Done
        </button>
      </div>
    );
  }

  // ─── Review & Submit ──────────────────────────────────────────────────────
  const ReviewPane = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4">
      <div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-[#9B1B5A]" />
          Quote Lines ({lineCount})
        </h3>
        {lines.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">
            No items yet. Go back to the catalog and add items.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {lines.map((line) => (
              <LineRow
                key={line.id}
                line={line}
                onChange={handleLineChange}
                onRemove={handleLineRemove}
              />
            ))}
            {/* Totals */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-white/10 mt-1">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Estimated Total</span>
              <span className="text-lg font-bold text-[#9B1B5A]">{formatKsh(subtotal)}</span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 -mt-1">
              * Indicative pricing. Final quotation will be sent after review.
            </p>
          </div>
        )}
      </div>

      {/* Client details */}
      <div className="border-t border-zinc-200 dark:border-white/10 pt-4">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#9B1B5A]" />
          Your Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Company Name *</span>
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2.5">
              <Building2 className="w-4 h-4 text-zinc-400 shrink-0" />
              <input
                required
                type="text"
                placeholder="Acme Ltd"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="flex-1 text-sm bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none"
              />
            </div>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Email Address *</span>
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2.5">
              <Mail className="w-4 h-4 text-zinc-400 shrink-0" />
              <input
                required
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 text-sm bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none"
              />
            </div>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Phone (optional)</span>
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2.5">
              <Phone className="w-4 h-4 text-zinc-400 shrink-0" />
              <input
                type="tel"
                placeholder="+254 7XX XXX XXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 text-sm bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none"
              />
            </div>
          </label>

          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Additional notes (branding, delivery, timeline…)</span>
            <div className="flex items-start gap-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2.5">
              <MessageSquare className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              <textarea
                rows={3}
                placeholder="Any special requirements, branding specs, event date..."
                value={globalNotes}
                onChange={(e) => setGlobalNotes(e.target.value)}
                className="flex-1 text-sm bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none resize-none"
              />
            </div>
          </label>
        </div>
      </div>

      {submitError && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-sm px-3 py-2.5 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {submitError}
        </div>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={() => setView("catalog")}
          className="px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/10 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
        >
          ← Back to Catalog
        </button>
        <button
          type="submit"
          disabled={lines.length === 0 || submitState === "sending"}
          className="
            flex-1 flex items-center justify-center gap-2
            px-4 py-2.5 bg-[#9B1B5A] hover:bg-[#7a1448] disabled:opacity-50 disabled:cursor-not-allowed
            text-white text-sm font-semibold rounded-lg transition-colors
          "
        >
          {submitState === "sending" ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
          ) : (
            <><Send className="w-4 h-4" /> Request Quotation</>
          )}
        </button>
      </div>
    </form>
  );

  // ─── Catalog Pane ─────────────────────────────────────────────────────────
  const CatalogPane = (
    <div className="flex flex-col h-full">
      {/* Search + filter bar */}
      <div className="p-4 border-b border-zinc-200 dark:border-white/10 flex flex-col gap-3">
        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-zinc-400 hover:text-zinc-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {/* Category pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
          {CATEGORIES.map((c) => (
            <button
              key={c.slug}
              onClick={() => setCategory(c.slug)}
              className={`
                shrink-0 px-3 py-1 text-xs font-medium rounded-full border transition-colors
                ${category === c.slug
                  ? "bg-[#9B1B5A] text-white border-transparent"
                  : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/10 hover:border-[#9B1B5A]/40"
                }
              `}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {catLoading && products.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-[#9B1B5A] animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Package className="w-10 h-10 text-zinc-300 dark:text-zinc-600" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No products found</p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-xs text-[#9B1B5A] underline underline-offset-2"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} onAdd={handleAddProduct} />
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => { setPage((v) => v + 1); fetchCatalog(false); }}
                  disabled={catLoading}
                  className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-white/10 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  {catLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating cart summary */}
      {lines.length > 0 && (
        <div className="p-4 border-t border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {lineCount} item{lineCount !== 1 ? "s" : ""} selected
              </p>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Est. {formatKsh(subtotal)}
              </p>
            </div>
            <button
              onClick={() => setView("review")}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#9B1B5A] hover:bg-[#7a1448] text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              Review Quote ({lineCount})
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-white/10">
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Build a Quote
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Browse catalog → add items → request quotation
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Tab pills */}
          <div className="hidden sm:flex items-center bg-zinc-100 dark:bg-white/5 rounded-lg p-0.5">
            <button
              onClick={() => setView("catalog")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${view === "catalog" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm" : "text-zinc-500 dark:text-zinc-400"}`}
            >
              Catalog
            </button>
            <button
              onClick={() => setView("review")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${view === "review" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm" : "text-zinc-500 dark:text-zinc-400"}`}
            >
              Quote {lineCount > 0 && `(${lineCount})`}
            </button>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden">
        {view === "catalog" ? CatalogPane : ReviewPane}
      </div>
    </div>
  );
}
