"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import { formatKsh, cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

const BOX_SIZES = [
  { name: "Small", price: 500, maxItems: 3, description: "3 items" },
  { name: "Medium", price: 800, maxItems: 5, description: "5 items" },
  { name: "Large", price: 1200, maxItems: 8, description: "8 items" },
];

const HAMPER_CATEGORIES = [
  { label: "All", slug: "" },
  { label: "Flowers", slug: "flowers" },
  { label: "Chocolates", slug: "chocolates" },
  { label: "Drinks", slug: "beverages" },
  { label: "Snacks", slug: "food-treats" },
  { label: "Personalised", slug: "personalised" },
  { label: "Self Care", slug: "wellness" },
  { label: "Baby", slug: "baby" },
];

interface HamperItem {
  product: Product;
  quantity: number;
}

interface FlyingItem {
  id: string;
  imageUrl: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

function ConfettiPiece({ delay, color }: { delay: number; color: string }) {
  const left = Math.random() * 100;
  const size = 4 + Math.random() * 6;
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${left}%`,
        top: "50%",
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? "50%" : "2px",
        animation: `confetti-fall ${0.8 + Math.random() * 0.6}s ease-out ${delay}s forwards`,
      }}
    />
  );
}

export default function HamperBuilder() {
  const [selectedBox, setSelectedBox] = useState(0);
  const [items, setItems] = useState<HamperItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("");
  const [search, setSearch] = useState("");

  // Animation states
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const [pulseKey, setPulseKey] = useState(0);
  const [shakingId, setShakingId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [prevItemCount, setPrevItemCount] = useState(0);

  const hamperRef = useRef<HTMLDivElement>(null);
  const prevTotalRef = useRef(0);
  const [displayTotal, setDisplayTotal] = useState(0);

  const box = BOX_SIZES[selectedBox];
  const itemsTotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const total = box.price + itemsTotal;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const canAddMore = itemCount < box.maxItems;
  const fillPercent = Math.min((itemCount / box.maxItems) * 100, 100);
  const isFull = itemCount >= box.maxItems;

  // Price count-up animation
  useEffect(() => {
    const start = prevTotalRef.current;
    const end = total;
    if (start === end) return;

    const duration = 400;
    const startTime = Date.now();

    function tick() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayTotal(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
    prevTotalRef.current = total;
  }, [total]);

  // Confetti trigger when hamper fills
  useEffect(() => {
    if (isFull && prevItemCount < box.maxItems) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
    setPrevItemCount(itemCount);
  }, [itemCount, isFull, box.maxItems, prevItemCount]);

  useEffect(() => {
    fetch("/api/products?limit=100")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (activeCategory) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(activeCategory.toLowerCase()) ||
        (p as any).categories?.some((c: any) =>
          c.slug?.includes(activeCategory) || c.name?.toLowerCase().includes(activeCategory.toLowerCase())
        )
      );
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    return result;
  }, [products, activeCategory, search]);

  const triggerFly = useCallback((imageUrl: string, cardEl: HTMLElement) => {
    const hamperEl = hamperRef.current;
    if (!hamperEl) return;

    const cardRect = cardEl.getBoundingClientRect();
    const hamperRect = hamperEl.getBoundingClientRect();

    const flyItem: FlyingItem = {
      id: `${Date.now()}-${Math.random()}`,
      imageUrl,
      startX: cardRect.left + cardRect.width / 2,
      startY: cardRect.top + cardRect.height / 2,
      endX: hamperRect.left + hamperRect.width / 2,
      endY: hamperRect.top + 40,
    };

    setFlyingItems((prev) => [...prev, flyItem]);
    setTimeout(() => {
      setFlyingItems((prev) => prev.filter((f) => f.id !== flyItem.id));
    }, 700);
  }, []);

  function addItem(product: Product, e: React.MouseEvent) {
    if (!canAddMore) return;

    // Fly animation
    const cardEl = (e.currentTarget as HTMLElement).closest("button");
    if (cardEl && product.image_url) {
      triggerFly(product.image_url, cardEl);
    }

    // Pulse the hamper
    setPulseKey((k) => k + 1);

    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }

  function removeItem(productId: string) {
    setShakingId(productId);
    setTimeout(() => {
      setShakingId(null);
      setItems((prev) => {
        const existing = prev.find((i) => i.product.id === productId);
        if (!existing) return prev;
        if (existing.quantity > 1) {
          return prev.map((i) =>
            i.product.id === productId
              ? { ...i, quantity: i.quantity - 1 }
              : i
          );
        }
        return prev.filter((i) => i.product.id !== productId);
      });
    }, 350);
  }

  function goToCheckout() {
    const itemIds = items.map((i) => i.product.id).join(",");
    const params = new URLSearchParams({
      productId: items[0]?.product.id ?? "",
      amount: total.toString(),
      qty: itemCount.toString(),
      hamper: "true",
      hamperBox: box.name,
      hamperItems: itemIds,
    });
    window.location.href = `/checkout?${params.toString()}`;
  }

  // Hamper border/fill color based on progress
  const hamperBorderColor = isFull
    ? "border-gold"
    : fillPercent >= 60
    ? "border-brand"
    : fillPercent > 0
    ? "border-brand/40"
    : "border-surface-border";

  const hamperGlow = isFull
    ? "shadow-[0_0_20px_rgba(212,168,83,0.3)]"
    : fillPercent >= 60
    ? "shadow-[0_0_15px_rgba(155,27,90,0.15)]"
    : "";

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Flying items portal */}
      {flyingItems.map((f) => {
        const dx = f.endX - f.startX;
        const dy = f.endY - f.startY;
        return (
          <div
            key={f.id}
            className="fixed z-[9999] pointer-events-none"
            style={{
              left: f.startX - 24,
              top: f.startY - 24,
              width: 48,
              height: 48,
              animation: "fly-to-basket 0.65s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
              "--fly-x": `${dx}px`,
              "--fly-y": `${dy}px`,
            } as React.CSSProperties}
          >
            <div
              className="w-12 h-12 rounded-xl overflow-hidden border-2 border-brand shadow-lg"
              style={{
                animation: "fly-to-basket 0.65s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
              }}
            >
              <Image
                src={f.imageUrl}
                alt=""
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        );
      })}

      {/* LEFT: Hamper summary */}
      <div className="lg:w-[340px] shrink-0">
        <div className="lg:sticky lg:top-4 space-y-4">
          {/* Box selector */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Choose a box</p>
            <div className="grid grid-cols-3 gap-2">
              {BOX_SIZES.map((b, i) => (
                <button
                  key={b.name}
                  onClick={() => {
                    setSelectedBox(i);
                    setItems([]);
                  }}
                  className={cn(
                    "rounded-xl border-2 p-3 text-center transition-all duration-200",
                    i === selectedBox
                      ? "border-brand bg-brand text-white shadow-ribbon"
                      : "border-surface-border hover:border-brand/30 bg-white"
                  )}
                >
                  <p className="font-semibold text-sm">{b.name}</p>
                  <p className={cn("text-[11px] mt-0.5", i === selectedBox ? "text-white/70" : "text-brand-muted")}>{b.description}</p>
                  <p className={cn("text-xs mt-1 font-bold", i === selectedBox ? "text-gold" : "text-brand")}>{formatKsh(b.price)}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Hamper contents — the basket */}
          <div
            ref={hamperRef}
            className={cn(
              "bg-white rounded-2xl border-2 p-4 space-y-3 transition-all duration-300",
              hamperBorderColor,
              hamperGlow,
              pulseKey > 0 && "animate-hamper-pulse"
            )}
            key={pulseKey}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Your hamper</p>
              <span className={cn(
                "text-xs font-bold px-2.5 py-1 rounded-full transition-colors duration-300",
                isFull
                  ? "bg-gold/20 text-brand-deep"
                  : fillPercent >= 60
                  ? "bg-brand/10 text-brand"
                  : "bg-gray-100 text-brand-muted"
              )}>
                {itemCount}/{box.maxItems}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500 ease-out",
                  isFull
                    ? "bg-gradient-to-r from-gold to-gold-light"
                    : fillPercent >= 60
                    ? "bg-gradient-to-r from-brand to-brand-light"
                    : "bg-brand/40"
                )}
                style={{ width: `${fillPercent}%` }}
              />
            </div>

            {items.length === 0 ? (
              <div className="text-center py-6">
                <span className="text-4xl block mb-2 animate-basket-bob">🧺</span>
                <p className="text-xs text-brand-muted">
                  Tap products on the right to add them
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[240px] overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-xl bg-gray-50 transition-all duration-200",
                      shakingId === item.product.id && "animate-shake"
                    )}
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden relative shrink-0 bg-gray-100">
                      {item.product.image_url && (
                        <Image
                          src={item.product.image_url}
                          alt={item.product.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{item.product.name}</p>
                      <p className="text-[11px] text-brand-muted">{formatKsh(item.product.price)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="w-7 h-7 rounded-full bg-white border border-surface-border flex items-center justify-center text-brand-muted hover:text-brand hover:border-brand/30 transition-colors active:scale-90"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="w-6 text-center text-xs font-bold animate-badge-pop" key={item.quantity}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={(e) => canAddMore && addItem(item.product, e)}
                        disabled={!canAddMore}
                        className="w-7 h-7 rounded-full bg-brand text-white flex items-center justify-center disabled:opacity-30 hover:bg-brand-dark transition-colors active:scale-90"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Totals with animated price */}
            <div className="border-t border-surface-border pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-muted text-xs">Box ({box.name})</span>
                <span className="text-xs">{formatKsh(box.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted text-xs">Items ({itemCount})</span>
                <span className="text-xs">{formatKsh(itemsTotal)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-surface-border pt-2">
                <span className="text-sm">Total</span>
                <span className="text-brand text-sm animate-price-count" key={displayTotal}>
                  {formatKsh(displayTotal)}
                </span>
              </div>
            </div>

            <button
              onClick={goToCheckout}
              disabled={items.length === 0}
              className={cn(
                "w-full py-3 bg-gradient-to-r from-brand to-brand-light text-white rounded-xl font-semibold text-sm transition-all duration-300",
                items.length === 0
                  ? "opacity-40 cursor-not-allowed"
                  : isFull
                  ? "animate-glow-button hover:shadow-xl"
                  : "hover:shadow-lg hover:-translate-y-0.5"
              )}
            >
              {isFull ? "🎉 " : ""}Send this hamper — {formatKsh(displayTotal)}
            </button>

            {/* Confetti overlay */}
            {showConfetti && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
                {Array.from({ length: 20 }).map((_, i) => (
                  <ConfettiPiece
                    key={i}
                    delay={i * 0.05}
                    color={["#9B1B5A", "#D4A853", "#C4297A", "#E8C97A", "#FF6B6B"][i % 5]}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: Product picker */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Search + category pills */}
        <div className="space-y-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-white border border-surface-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand transition-colors"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1" style={{ scrollbarWidth: "none" }}>
            {HAMPER_CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0",
                  activeCategory === cat.slug
                    ? "bg-brand text-white"
                    : "bg-white border border-surface-border text-brand-muted hover:border-brand/30"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product grid */}
        {loading ? (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-gray-100 animate-pulse aspect-[3/4]" />
            ))}
          </div>
        ) : (
          <>
            <p className="text-xs text-brand-muted">{filteredProducts.length} products</p>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {filteredProducts.map((product) => {
                const inHamper = items.find((i) => i.product.id === product.id);
                const disabled = !canAddMore && !inHamper;

                return (
                  <button
                    key={product.id}
                    onClick={(e) => addItem(product, e)}
                    disabled={disabled}
                    className={cn(
                      "group rounded-xl border-2 overflow-hidden text-left transition-all duration-200 active:scale-[0.95]",
                      disabled
                        ? "opacity-40 cursor-not-allowed border-transparent"
                        : "border-transparent hover:border-brand/30 hover:shadow-card",
                      inHamper ? "border-brand shadow-ribbon" : ""
                    )}
                  >
                    <div className="relative aspect-[3/4] bg-blush overflow-hidden">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 33vw, 25vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">🎁</div>
                      )}

                      {/* Add button */}
                      {!disabled && (
                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                          <div className="w-8 h-8 bg-brand text-white rounded-full flex items-center justify-center shadow-lg group-active:rotate-90 transition-transform duration-300">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                        </div>
                      )}

                      {/* In-hamper badge */}
                      {inHamper && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-brand text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg animate-badge-pop">
                          {inHamper.quantity}
                        </div>
                      )}
                    </div>

                    <div className="p-2">
                      <p className="text-xs font-semibold truncate">{product.name}</p>
                      <p className="text-xs text-gold font-bold">{formatKsh(product.price)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
