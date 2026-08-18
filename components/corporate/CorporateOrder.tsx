"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { formatKsh } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface Recipient {
  name: string;
  phone: string;
  note: string;
}

type Step = "select" | "recipients" | "review";

export default function CorporateOrder() {
  const [step, setStep] = useState<Step>("select");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([
    { name: "", phone: "", note: "" },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const total = selectedProduct ? selectedProduct.price * recipients.length : 0;

  function addRecipient() {
    setRecipients([...recipients, { name: "", phone: "", note: "" }]);
  }

  function updateRecipient(index: number, field: keyof Recipient, value: string) {
    const updated = [...recipients];
    updated[index][field] = value;
    setRecipients(updated);
  }

  function removeRecipient(index: number) {
    if (recipients.length <= 1) return;
    setRecipients(recipients.filter((_, i) => i !== index));
  }

  function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim());
      const parsed: Recipient[] = [];

      // Skip header if present
      const startIdx =
        lines[0]?.toLowerCase().includes("name") &&
        lines[0]?.toLowerCase().includes("phone")
          ? 1
          : 0;

      for (let i = startIdx; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim());
        if (cols.length >= 2 && cols[0] && cols[1]) {
          parsed.push({
            name: cols[0],
            phone: cols[1],
            note: cols[2] || "",
          });
        }
      }

      if (parsed.length > 0) {
        setRecipients(parsed);
        setStep("recipients");
      }
    };
    reader.readAsText(file);
  }

  async function handleSubmit() {
    if (!selectedProduct) return;

    // In production, this would create bulk orders via API
    // For now, show a confirmation
    alert(
      `Bulk order for ${recipients.length} recipients submitted!\n\nTotal: ${formatKsh(total)}\n\nIn production, each recipient would get an M-Pesa prompt and delivery notification.`
    );
  }

  if (step === "select") {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Choose a gift</h2>
          <p className="text-sm text-brand-muted">
            Select one product to send to all recipients.
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-brand-muted">Loading products...</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.slice(0, 20).map((product) => (
              <button
                key={product.id}
                onClick={() => {
                  setSelectedProduct(product);
                  setStep("recipients");
                }}
                className={`rounded-2xl p-4 text-left transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-card-hover group border ${
                  selectedProduct?.id === product.id
                    ? "border-brand"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <div className="aspect-square bg-gray-100 rounded-md mb-2 overflow-hidden relative">
                  {product.image_url && (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                    />
                  )}
                </div>
                <p className="text-xs font-medium truncate">{product.name}</p>
                <p className="text-xs text-brand-muted">
                  {formatKsh(product.price)}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (step === "recipients") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Add recipients</h2>
            <p className="text-sm text-brand-muted">
              {selectedProduct?.name} — {formatKsh(selectedProduct?.price ?? 0)} each
            </p>
          </div>
          <button
            onClick={() => setStep("select")}
            className="text-sm text-brand underline"
          >
            Change gift
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Or upload a CSV</label>
          <p className="text-xs text-brand-muted">
            Format: name, phone, note (optional). First row can be a header.
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={handleCsvUpload}
            className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all bg-white/50"
          />
        </div>

        <div className="space-y-3">
          {recipients.map((r, i) => (
            <div key={i} className="rounded-lg border border-gray-200 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Recipient {i + 1}</p>
                {recipients.length > 1 && (
                  <button
                    onClick={() => removeRecipient(i)}
                    className="text-xs text-red-500"
                  >
                    remove
                  </button>
                )}
              </div>
              <input
                placeholder="Name"
                value={r.name}
                onChange={(e) => updateRecipient(i, "name", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all bg-white/50"
              />
              <input
                placeholder="Phone (07XX XXX XXX)"
                value={r.phone}
                onChange={(e) => updateRecipient(i, "phone", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all bg-white/50"
              />
              <input
                placeholder="Gift note (optional)"
                value={r.note}
                onChange={(e) => updateRecipient(i, "note", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all bg-white/50"
              />
            </div>
          ))}
        </div>

        <button
          onClick={addRecipient}
          className="w-full rounded-lg border border-dashed border-gray-300 py-3 text-sm"
        >
          + Add another recipient
        </button>

        <div className="sticky bottom-4 z-20 rounded-2xl bg-white/90 backdrop-blur-md border border-brand/20 shadow-xl p-5 text-sm space-y-2 mt-8">
          <div className="flex justify-between">
            <span className="text-brand-muted">
              {recipients.length} recipient{recipients.length !== 1 ? "s" : ""}
            </span>
            <span>{formatKsh(selectedProduct?.price ?? 0)} each</span>
          </div>
          <div className="flex justify-between font-medium border-t border-gray-200 pt-1 mt-1">
            <span>Total</span>
            <span>{formatKsh(total)}</span>
          </div>
        </div>

        <button
          onClick={() => setStep("review")}
          disabled={recipients.some((r) => !r.name || !r.phone)}
          className="w-full rounded-lg bg-brand text-white py-3 font-medium disabled:opacity-50"
        >
          Review order
        </button>
      </div>
    );
  }

  // Review step
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Review bulk order</h2>
        <p className="text-sm text-brand-muted">
          {selectedProduct?.name} — {formatKsh(total)} total
        </p>
      </div>

      <div className="space-y-2">
        {recipients.map((r, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 p-3 flex items-center justify-between text-sm"
          >
            <div>
              <p className="font-medium">{r.name}</p>
              <p className="text-xs text-brand-muted">{r.phone}</p>
              {r.note && (
                <p className="text-xs text-brand-muted italic mt-1">
                  &ldquo;{r.note}&rdquo;
                </p>
              )}
            </div>
            <span className="text-brand-muted">{formatKsh(selectedProduct?.price ?? 0)}</span>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 text-sm">
        <div className="flex justify-between font-medium">
          <span>Total ({recipients.length} gifts)</span>
          <span>{formatKsh(total)}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStep("recipients")}
          className="flex-1 rounded-lg border border-gray-300 py-3 text-sm font-medium"
        >
          Edit
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 rounded-lg bg-brand text-white py-3 text-sm font-medium"
        >
          Place order
        </button>
      </div>
    </div>
  );
}
