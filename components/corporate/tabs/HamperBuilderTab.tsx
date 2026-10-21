"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Package, Plus, Minus, Trash2, Users, ChevronRight, ChevronLeft, CheckCircle, Loader2, Gift, ArrowRight } from "lucide-react";
import { formatKsh } from "@/lib/utils";

interface HamperItem {
  id: string; name: string; slug: string;
  price: number; image_url: string | null;
  qty: number;
}

interface Recipient { name: string; email: string; department: string; }

const HAMPER_CATEGORIES = [
  { key: "gift-sets",        label: "Gift Sets",    emoji: "🎁" },
  { key: "drinkware",        label: "Drinkware",    emoji: "☕" },
  { key: "stationery-office",label: "Stationery",   emoji: "✏️" },
  { key: "awards-trophies",  label: "Awards",       emoji: "🏆" },
  { key: "accessories",      label: "Accessories",  emoji: "🔑" },
  { key: "tech-gadgets",     label: "Tech",         emoji: "💻" },
];

type Step = 1 | 2 | 3;

const STEPS = [
  { n: 1, label: "Pick Items",   icon: Gift },
  { n: 2, label: "Recipients",  icon: Users },
  { n: 3, label: "Review",      icon: CheckCircle },
];

export default function HamperBuilderTab() {
  const [step, setStep]     = useState<Step>(1);
  const [cat, setCat]       = useState("gift-sets");
  const [catalog, setCatalog] = useState<Omit<HamperItem, "qty">[]>([]);
  const [basket, setBasket] = useState<HamperItem[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>([{ name: "", email: "", department: "" }]);
  const [orderNote, setOrderNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoadingCatalog(true);
    fetch(`/api/corporate/catalog?category=${cat}&limit=12`)
      .then(r => r.json())
      .then(d => { setCatalog(d.products ?? []); setLoadingCatalog(false); })
      .catch(() => setLoadingCatalog(false));
  }, [cat]);

  function addToBasket(p: Omit<HamperItem, "qty">) {
    setBasket(prev => {
      const ex = prev.find(x => x.id === p.id);
      if (ex) return prev.map(x => x.id === p.id ? { ...x, qty: x.qty + 1 } : x);
      return [...prev, { ...p, qty: 1 }];
    });
  }

  function updateQty(id: string, delta: number) {
    setBasket(prev => prev.map(x => x.id === id ? { ...x, qty: Math.max(1, x.qty + delta) } : x).filter(x => x.qty > 0));
  }
  function remove(id: string) { setBasket(prev => prev.filter(x => x.id !== id)); }

  const hamperTotal    = basket.reduce((s, x) => s + x.price * x.qty, 0);
  const recipientCount = recipients.filter(r => r.name && r.email).length;
  const grandTotal     = hamperTotal * Math.max(1, recipientCount);

  function addRecipient() { setRecipients(prev => [...prev, { name: "", email: "", department: "" }]); }
  function removeRecipient(i: number) { setRecipients(prev => prev.filter((_, j) => j !== i)); }
  function updateRecipient(i: number, key: keyof Recipient, val: string) {
    setRecipients(prev => prev.map((r, j) => j === i ? { ...r, [key]: val } : r));
  }

  async function submitOrder() {
    setSubmitting(true);
    try {
      await fetch("/api/corporate/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "hamper", items: basket, recipients, note: orderNote, total: grandTotal }),
      });
    } catch {}
    setSubmitting(false); setSubmitted(true);
  }

  if (submitted) return (
    <div className="flex flex-col items-center py-20 gap-4">
      <div className="w-16 h-16 bg-green-100 border border-green-200 rounded-full flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900">Hamper Order Submitted!</h3>
        <p className="text-gray-500 text-sm mt-2">Our team will review and send you a proforma invoice within 2 hours.</p>
      </div>
      <button onClick={() => { setBasket([]); setStep(1); setSubmitted(false); setRecipients([{ name: "", email: "", department: "" }]); }}
        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors">
        Build Another Hamper
      </button>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={s.n} className="flex items-center">
            <button onClick={() => s.n < step && setStep(s.n as Step)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                step === s.n ? "bg-amber-500 text-white shadow-sm"
                : step > s.n ? "bg-green-50 border border-green-200 text-green-700 cursor-pointer hover:bg-green-100"
                : "bg-white border border-gray-200 text-gray-400"
              }`}>
              <s.icon className="w-4 h-4 shrink-0" />
              <span>Step {s.n}: {s.label}</span>
            </button>
            {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300 mx-1 shrink-0" />}
          </div>
        ))}
        {basket.length > 0 && (
          <div className="ml-auto flex items-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm font-semibold text-amber-800">
            <Gift className="w-4 h-4" /> {basket.reduce((s, x) => s + x.qty, 0)} items · {formatKsh(hamperTotal)}
          </div>
        )}
      </div>

      {/* ── Step 1: Pick Items ── */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Product picker */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {HAMPER_CATEGORIES.map(c => (
                <button key={c.key} onClick={() => setCat(c.key)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    cat === c.key ? "bg-amber-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-amber-300"
                  }`}>
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>

            {loadingCatalog ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-white border border-gray-100 rounded-xl animate-pulse aspect-[3/4]" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {catalog.map(p => {
                  const inBasket = basket.find(x => x.id === p.id);
                  return (
                    <div key={p.id} className={`group bg-white border rounded-xl overflow-hidden transition-all ${inBasket ? "border-amber-400 shadow-sm" : "border-gray-200 hover:border-amber-300 hover:shadow-sm"}`}>
                      <div className="relative aspect-square bg-gray-50 overflow-hidden">
                        {p.image_url
                          ? <Image src={p.image_url} alt={p.name} fill sizes="200px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                          : <div className="absolute inset-0 flex items-center justify-center"><Package className="w-8 h-8 text-gray-300" /></div>
                        }
                        {inBasket && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow">
                            {inBasket.qty}
                          </div>
                        )}
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-semibold text-gray-900 line-clamp-2 mb-1.5 leading-tight">{p.name}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-gray-900">{formatKsh(p.price)}</p>
                          <button onClick={() => addToBasket(p)}
                            className="flex items-center gap-1 px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold rounded-lg transition-colors">
                            <Plus className="w-3 h-3" /> Add
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Basket */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 h-fit sticky top-24">
            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-500" /> Hamper Contents
              {basket.length === 0 && <span className="text-gray-400 font-normal text-xs">Empty</span>}
            </h3>
            {basket.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Add items from the catalog</p>
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {basket.map(x => (
                    <div key={x.id} className="flex items-center gap-2 py-2 border-b border-gray-50">
                      <div className="relative w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        {x.image_url && <Image src={x.image_url} alt={x.name} fill sizes="40px" className="object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{x.name}</p>
                        <p className="text-[10px] text-gray-400">{formatKsh(x.price)} × {x.qty}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => updateQty(x.id, -1)} className="w-5 h-5 rounded flex items-center justify-center bg-gray-100 hover:bg-gray-200"><Minus className="w-3 h-3" /></button>
                        <span className="w-5 text-center text-xs font-semibold">{x.qty}</span>
                        <button onClick={() => updateQty(x.id, 1)} className="w-5 h-5 rounded flex items-center justify-center bg-gray-100 hover:bg-gray-200"><Plus className="w-3 h-3" /></button>
                        <button onClick={() => remove(x.id)} className="w-5 h-5 rounded flex items-center justify-center text-red-400 hover:bg-red-50"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-gray-100 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Per hamper</span>
                    <span className="font-semibold text-gray-900">{formatKsh(hamperTotal)}</span>
                  </div>
                  <p className="text-[11px] text-gray-400">× {Math.max(1, recipientCount)} recipients on next step</p>
                </div>
                <button onClick={() => setStep(2)} className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                  Next: Recipients <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Step 2: Recipients ── */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Add Recipients</h3>
            <div className="flex gap-2">
              <button onClick={addRecipient} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:border-amber-300 text-sm text-gray-700 font-medium rounded-lg transition-all">
                <Plus className="w-3.5 h-3.5" /> Add Row
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Full Name</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Email</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Department</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recipients.map((r, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2"><input value={r.name} onChange={e => updateRecipient(i, "name", e.target.value)} placeholder="Jane Doe" className="w-full text-sm border-0 focus:outline-none text-gray-900 placeholder-gray-300" /></td>
                    <td className="px-4 py-2"><input value={r.email} onChange={e => updateRecipient(i, "email", e.target.value)} placeholder="jane@company.co.ke" type="email" className="w-full text-sm border-0 focus:outline-none text-gray-900 placeholder-gray-300" /></td>
                    <td className="px-4 py-2"><input value={r.department} onChange={e => updateRecipient(i, "department", e.target.value)} placeholder="Sales" className="w-full text-sm border-0 focus:outline-none text-gray-900 placeholder-gray-300" /></td>
                    <td className="px-2"><button onClick={() => removeRecipient(i)} className="w-7 h-7 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-900">{recipientCount} recipients × {formatKsh(hamperTotal)} per hamper</p>
              <p className="text-xs text-amber-700 mt-0.5">Grand total: <strong>{formatKsh(grandTotal)}</strong></p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-200 text-sm text-gray-600 font-medium rounded-lg hover:border-gray-300 transition-all">
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button onClick={() => setStep(3)} disabled={recipientCount === 0}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50">
                Review <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3: Review ── */}
      {step === 3 && (
        <div className="max-w-2xl space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-50">
            <div className="px-5 py-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">Hamper Contents</h3>
              <div className="space-y-2">
                {basket.map(x => (
                  <div key={x.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{x.name} × {x.qty}</span>
                    <span className="font-medium text-gray-900">{formatKsh(x.price * x.qty)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-sm font-semibold pt-2 border-t border-gray-100">
                  <span className="text-gray-800">Per hamper</span>
                  <span className="text-amber-700">{formatKsh(hamperTotal)}</span>
                </div>
              </div>
            </div>
            <div className="px-5 py-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-2">Recipients ({recipientCount})</h3>
              <div className="flex flex-wrap gap-2">
                {recipients.filter(r => r.name && r.email).map((r, i) => (
                  <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">{r.name}</span>
                ))}
              </div>
            </div>
            <div className="px-5 py-4">
              <div className="flex items-center justify-between text-base font-bold">
                <span className="text-gray-900">Grand Total</span>
                <span className="text-amber-600">{formatKsh(grandTotal)}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">A proforma invoice will be sent to you within 2 business hours.</p>
            </div>
          </div>

          <textarea value={orderNote} onChange={e => setOrderNote(e.target.value)} rows={3}
            placeholder="Additional notes (branding specs, delivery address, preferred delivery date…)"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 text-sm text-gray-700 font-medium rounded-lg hover:border-gray-300 transition-all">
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>
            <button onClick={submitOrder} disabled={submitting}
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {submitting ? "Submitting…" : "Submit Hamper Order"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
