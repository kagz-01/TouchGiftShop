"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import {
  ArrowLeft, Building2, Link as LinkIcon, Upload, ShieldCheck,
  ChevronRight, CheckCircle2, Users, FileText, CreditCard,
  AlertCircle, X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type DeliveryMethod = "links" | "csv";
type PaymentMethod = "mpesa" | "bank";

const CARD_THEMES = [
  { id: "glassmorphism", label: "Frost Glass", color: "emerald" },
  { id: "holographic", label: "Holographic", color: "rose" },
  { id: "dark", label: "Midnight", color: "white" },
] as const;

export default function CorporateCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("product");
  const initQty = Number(searchParams.get("qty") ?? 50);

  const supabase = createClient();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Config
  const [quantity, setQuantity] = useState(initQty);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("links");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank");
  const [cardTheme, setCardTheme] = useState<string>("glassmorphism");

  // Company details
  const [companyName, setCompanyName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // CSV
  const csvRef = useRef<HTMLInputElement>(null);
  const [csvPhones, setCsvPhones] = useState<string[]>([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [csvError, setCsvError] = useState("");

  // Checkout state
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!productId) { router.push("/corporate"); return; }
    supabase.from("shop_products").select("*").eq("id", productId).single()
      .then(({ data }) => { if (data) setProduct(data); setLoading(false); });
  }, [productId, router, supabase]);

  const base = (product?.price ?? 0) * quantity;
  const discPct = quantity >= 500 ? 0.15 : quantity >= 100 ? 0.10 : quantity >= 50 ? 0.05 : 0;
  const discAmt = base * discPct;
  const finalAmt = base - discAmt;

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);
    setCsvError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split(/[\r\n]+/).map(l => l.trim()).filter(Boolean);
      // Extract phones — remove header if not a phone
      const phones = lines
        .map(l => l.split(",")[0].trim())
        .filter(l => /^[\d+\s()-]{7,}$/.test(l));
      if (phones.length === 0) {
        setCsvError("No valid phone numbers found in CSV. Expected format: one phone per row in the first column.");
        return;
      }
      setCsvPhones(phones);
      setQuantity(phones.length);
    };
    reader.readAsText(file);
  };

  const handleCheckout = async () => {
    setError("");
    if (!companyName.trim()) { setError("Company name is required"); return; }
    if (!contactPhone.trim()) { setError("Contact phone is required"); return; }
    if (deliveryMethod === "csv" && csvPhones.length === 0) {
      setError("Please upload a CSV file with employee phone numbers");
      return;
    }

    setPaying(true);
    try {
      const res = await fetch("/api/corporate/bulk-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          quantity,
          companyName: companyName.trim(),
          contactPhone: contactPhone.trim(),
          contactEmail: contactEmail.trim(),
          deliveryMethod,
          csvPhones: deliveryMethod === "csv" ? csvPhones : [],
          paymentMethod,
          amount: product?.price ?? 0,
          totalAmount: finalAmt,
          style: cardTheme,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Order failed");

      // Store response for success page
      sessionStorage.setItem("corp_order_result", JSON.stringify({
        links: data.links,
        method: deliveryMethod,
        paymentMethod,
        orderId: data.orderId,
        invoiceDetails: data.invoiceDetails,
        count: data.count,
        companyName: companyName.trim(),
      }));

      // Redirect to PesaPal if M-Pesa
      if (paymentMethod === "mpesa" && data.paymentRedirectUrl) {
        window.location.href = data.paymentRedirectUrl;
        return;
      }

      router.push("/corporate/success");
    } catch (err: any) {
      setError(err.message);
      setPaying(false);
    }
  };

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-[#050304] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050304] text-white pb-24 font-sans">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/15 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-teal-900/10 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#050304]/60 backdrop-blur-2xl border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold text-sm">Corporate Showroom</span>
        </button>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-display font-bold text-emerald-400 text-sm tracking-widest uppercase">Pesapal Enterprise</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">

        {/* ── LEFT: Configuration ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
          className="lg:col-span-7 space-y-6"
        >
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight mb-2">Configure Deployment</h1>
            <p className="text-white/50 text-sm">Customize how your team receives their <span className="text-white">{product.name}</span> gifts.</p>
          </div>

          {/* Company Details */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-7 space-y-4">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Company Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/40 font-semibold mb-1.5 uppercase tracking-wider">Company Name *</label>
                <input
                  type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
                  placeholder="Safaricom PLC" aria-label="Company name"
                  className="w-full bg-black/40 border border-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none rounded-xl py-3 px-4 text-sm font-semibold transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-white/40 font-semibold mb-1.5 uppercase tracking-wider">Billing Phone *</label>
                <input
                  type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)}
                  placeholder="07XX XXX XXX" aria-label="Billing phone"
                  className="w-full bg-black/40 border border-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none rounded-xl py-3 px-4 text-sm font-semibold transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-white/40 font-semibold mb-1.5 uppercase tracking-wider">Billing Email (optional)</label>
              <input
                type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)}
                placeholder="hr@yourcompany.co.ke" aria-label="Billing email"
                className="w-full bg-black/40 border border-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none rounded-xl py-3 px-4 text-sm font-semibold transition-all"
              />
            </div>
          </div>

          {/* Recipient Count */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-7">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Recipient Count
            </h2>
            <div className="flex items-end justify-between mb-4">
              <span className="font-display text-5xl font-bold tracking-tighter">{quantity}</span>
              <span className="text-white/40 mb-2">Employees</span>
            </div>
            <input
              type="range" min="10" max="1000" step="10" value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              disabled={deliveryMethod === "csv" && csvPhones.length > 0}
            />
            <div className="flex justify-between text-[10px] text-white/30 uppercase font-bold mt-3 tracking-wider">
              <span>Min: 10</span>
              <div className="flex gap-3">
                <span className={quantity >= 50 && quantity < 100 ? "text-emerald-400" : ""}>50+ (5%)</span>
                <span className={quantity >= 100 && quantity < 500 ? "text-emerald-400" : ""}>100+ (10%)</span>
                <span className={quantity >= 500 ? "text-emerald-400" : ""}>500+ (15%)</span>
              </div>
              <span>Max: 1,000</span>
            </div>
          </div>

          {/* Distribution Protocol */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-7">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Distribution Protocol
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              {([
                { id: "links" as const, icon: LinkIcon, title: "Export Magic Links", desc: "Download a spreadsheet of secure gift links. Perfect for Slack, Teams, or email." },
                { id: "csv" as const, icon: Upload, title: "Automated CSV Blast", desc: "Upload employee roster with phones. We auto-blast personalized SMS notifications." },
              ]).map(opt => (
                <motion.button
                  key={opt.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setDeliveryMethod(opt.id)}
                  className={`p-5 rounded-2xl border transition-all text-left relative overflow-hidden ${deliveryMethod === opt.id ? "bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]" : "bg-white/5 border-white/10 hover:border-white/20"}`}
                >
                  {deliveryMethod === opt.id && <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-emerald-400" />}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${deliveryMethod === opt.id ? "bg-emerald-500/20" : "bg-white/5"}`}>
                    <opt.icon className={`w-5 h-5 ${deliveryMethod === opt.id ? "text-emerald-400" : "text-white/40"}`} />
                  </div>
                  <h3 className="font-bold text-sm mb-1.5">{opt.title}</h3>
                  <p className="text-xs text-white/50 leading-relaxed">{opt.desc}</p>
                </motion.button>
              ))}
            </div>

            {/* CSV Upload area */}
            <AnimatePresence>
              {deliveryMethod === "csv" && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                  <input ref={csvRef} type="file" accept=".csv,.txt" onChange={handleCsvUpload} className="hidden" id="csv-upload" />
                  <label
                    htmlFor="csv-upload"
                    className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-white/10 hover:border-emerald-500/40 rounded-2xl cursor-pointer transition-colors"
                  >
                    {csvFileName ? (
                      <>
                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                        <p className="text-sm font-semibold text-emerald-400">{csvFileName}</p>
                        <p className="text-xs text-white/40">{csvPhones.length} phone numbers detected</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-white/30" />
                        <p className="text-sm font-semibold text-white/60">Click to upload CSV</p>
                        <p className="text-xs text-white/30">Format: one phone per row in Column A</p>
                      </>
                    )}
                  </label>
                  {csvError && (
                    <div className="mt-3 flex items-start gap-2 text-rose-300 text-xs bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      {csvError}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Card Theme */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-7">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Gift Card Style
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {CARD_THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setCardTheme(t.id)}
                  className={`p-3 rounded-2xl border text-center transition-all ${cardTheme === t.id ? "border-emerald-500 bg-emerald-500/10" : "border-white/10 bg-white/5 hover:border-white/20"}`}
                >
                  <p className="text-xs font-bold mb-1">{t.label}</p>
                  {cardTheme === t.id && <Check className="w-4 h-4 text-emerald-400 mx-auto" />}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── RIGHT: Payment Summary ── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-5"
        >
          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-7 sticky top-24 backdrop-blur-xl shadow-2xl space-y-6">
            <h2 className="font-display text-xl font-bold flex items-center justify-between">
              Investment Summary
              <span className="text-xs font-sans font-normal text-white/40 bg-white/5 px-2 py-1 rounded-md">B2B Portal</span>
            </h2>

            {/* Product preview */}
            <div className="flex items-center gap-3 bg-black/40 p-3 rounded-2xl border border-white/5">
              <div className="w-14 h-14 rounded-xl bg-emerald-900/30 border border-white/10 overflow-hidden shrink-0">
                {product.media_urls?.[0] && <img src={product.media_urls[0]} alt="" className="w-full h-full object-cover" />}
              </div>
              <div>
                <h3 className="font-bold text-sm">{product.name}</h3>
                <p className="text-xs text-emerald-400 mt-0.5">KES {Number(product.price).toLocaleString()} / recipient</p>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-white/60">
                <span>Subtotal ({quantity} units)</span>
                <span className="text-white font-medium">KES {base.toLocaleString()}</span>
              </div>
              <AnimatePresence>
                {discPct > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex justify-between text-emerald-400">
                    <span>Volume Discount ({discPct * 100}%)</span>
                    <span className="font-medium">- KES {discAmt.toLocaleString()}</span>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="border-t border-white/10 pt-3 flex justify-between items-end">
                <span className="text-white/60 font-medium">Total Due</span>
                <div className="text-right">
                  <span className="font-display text-3xl font-bold tracking-tight">KES {finalAmt.toLocaleString()}</span>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">Inclusive of all taxes</p>
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">Settlement Method</label>
              <div className="space-y-2">
                {([
                  { id: "bank" as const, label: "Wire Transfer / Proforma Invoice", icon: FileText, desc: "Ideal for procurement teams. Invoice sent to your email." },
                  { id: "mpesa" as const, label: "Pesapal Corporate M-Pesa", icon: CreditCard, desc: "Instant STK push to your billing phone." },
                ] as const).map(pm => (
                  <button
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`w-full flex items-start gap-3 p-4 rounded-xl border transition-all text-left ${paymentMethod === pm.id ? "border-emerald-500/50 bg-emerald-500/10" : "border-white/10 bg-white/5 hover:border-white/20"}`}
                  >
                    <pm.icon className={`w-5 h-5 mt-0.5 shrink-0 ${paymentMethod === pm.id ? "text-emerald-400" : "text-white/40"}`} />
                    <div>
                      <p className="text-xs font-bold">{pm.label}</p>
                      <p className="text-[11px] text-white/40 mt-0.5">{pm.desc}</p>
                    </div>
                    {paymentMethod === pm.id && <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto shrink-0 mt-0.5" />}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={paying}
              className={`relative w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm transition-all overflow-hidden group ${
                paying
                  ? "bg-emerald-900/50 text-emerald-400 cursor-wait border border-emerald-500/20"
                  : "bg-emerald-500 text-[#050304] hover:bg-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.2)] hover:shadow-[0_0_60px_rgba(16,185,129,0.4)]"
              }`}
            >
              {!paying && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />}
              <span className="relative z-10 flex items-center gap-2">
                {paying ? (
                  <><div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" /> Provisioning {quantity} Gifts…</>
                ) : (
                  <><ShieldCheck className="w-4 h-4" /> Authorize — KES {finalAmt.toLocaleString()}</>
                )}
              </span>
            </button>

            <p className="text-center text-[10px] text-white/30 uppercase tracking-widest flex items-center justify-center gap-2">
              <ShieldCheck className="w-3 h-3" /> Secured by Pesapal Enterprise
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

// Missing icon
function Check({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
