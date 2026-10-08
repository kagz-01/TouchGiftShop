"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Copy, Download, Mail, ArrowRight, ExternalLink, Wallet, Building2, Link as LinkIcon } from "lucide-react";
import { motion } from "framer-motion";
import ReactConfetti from "react-confetti";
import { useWindowSize } from "react-use";

type OrderResult = {
  links: { id: string; slug: string; url: string; phone: string | null }[];
  method: "links" | "csv";
  paymentMethod: "mpesa" | "bank";
  orderId: string;
  invoiceDetails: {
    amount: number;
    reference: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    swiftCode: string;
  } | null;
  count: number;
  companyName: string;
};

export default function CorporateSuccessPage() {
  const router = useRouter();
  const [result, setResult] = useState<OrderResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedRow, setCopiedRow] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(true);
  const { width, height } = useWindowSize();

  useEffect(() => {
    const raw = sessionStorage.getItem("corp_order_result");
    if (raw) {
      try { setResult(JSON.parse(raw)); } catch { /* noop */ }
    }
    const t = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(t);
  }, []);

  const handleCopyAll = () => {
    if (!result) return;
    const text = result.links.map(l => l.url).join("\n");
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCopyRow = (url: string, slug: string) => {
    navigator.clipboard?.writeText(url);
    setCopiedRow(slug);
    setTimeout(() => setCopiedRow(null), 2000);
  };

  const handleDownloadCSV = () => {
    if (!result) return;
    const rows = [
      ["#", "Recipient Phone", "Magic Link"],
      ...result.links.map((l, i) => [i + 1, l.phone ?? "", l.url]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `touchgift_${result.companyName.replace(/\s/g, "_")}_links.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-[#050304] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050304] text-white font-sans pb-24 relative overflow-hidden">
      {/* Confetti */}
      {showConfetti && width > 0 && (
        <ReactConfetti
          width={width} height={height} numberOfPieces={250} recycle={false}
          colors={["#10b981", "#06b6d4", "#f59e0b", "#f43f5e", "#ffffff"]}
          gravity={0.2}
        />
      )}

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-[60%] bg-emerald-900/15 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-16 relative z-10">

        {/* ── Success Header ── */}
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }} className="text-center mb-12">
          <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_60px_rgba(16,185,129,0.25)] relative">
            <div className="absolute inset-0 rounded-full border border-emerald-400/20 animate-ping opacity-20" />
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          </div>
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-5">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">{result.companyName}</span>
          </div>
          <h1 className="font-display text-5xl font-bold tracking-tight mb-4">Deployment Authorized</h1>
          <p className="text-white/50 text-lg">
            <span className="text-emerald-400 font-bold text-2xl">{result.count}</span> secure gift links have been provisioned.
          </p>
        </motion.div>

        {/* ── Bank Invoice (if bank transfer) ── */}
        {result.paymentMethod === "bank" && result.invoiceDetails && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-6 mb-6 space-y-3">
            <h3 className="font-bold text-sm text-amber-400 flex items-center gap-2">
              <Wallet className="w-4 h-4" /> Bank Transfer Details
            </h3>
            <p className="text-xs text-amber-300/70">Complete payment to activate your gift links. Reference is required.</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: "Bank", value: result.invoiceDetails.bankName },
                { label: "Account Name", value: result.invoiceDetails.accountName },
                { label: "Account No.", value: result.invoiceDetails.accountNumber },
                { label: "Swift / BIC", value: result.invoiceDetails.swiftCode },
                { label: "Amount", value: `KES ${Number(result.invoiceDetails.amount).toLocaleString()}` },
                { label: "Reference", value: result.invoiceDetails.reference },
              ].map(row => (
                <div key={row.label} className="bg-black/30 rounded-xl p-3">
                  <p className="text-white/30 text-[10px] uppercase tracking-wider mb-0.5">{row.label}</p>
                  <p className="font-mono font-semibold text-white text-xs break-all">{row.value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Links mode ── */}
        {result.method === "links" ? (
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white/[0.02] border border-white/5 rounded-3xl p-7 backdrop-blur-xl shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent rounded-t-3xl" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <div>
                <h3 className="font-display font-bold text-xl flex items-center gap-2 mb-1">
                  <LinkIcon className="w-5 h-5 text-emerald-400" /> Magic Link Roster
                </h3>
                <p className="text-sm text-white/40">{result.count} secure distribution endpoints</p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={handleCopyAll}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-white/5 hover:bg-white/10 text-sm font-bold rounded-xl border border-white/10 flex items-center justify-center gap-2 transition-colors"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white/60" />}
                  {copied ? "Copied All!" : "Copy All"}
                </button>
                <button
                  onClick={handleDownloadCSV}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-[#050304] text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                >
                  <Download className="w-4 h-4" /> Export CSV
                </button>
              </div>
            </div>

            <div className="bg-black/40 border border-white/5 rounded-2xl h-80 overflow-y-auto space-y-0.5 font-mono text-xs p-2">
              {result.links.map((link, i) => (
                <div
                  key={link.slug}
                  className="flex items-center gap-3 p-2.5 hover:bg-white/5 rounded-xl transition-colors group cursor-pointer"
                  onClick={() => handleCopyRow(link.url, link.slug)}
                >
                  <span className="text-white/20 w-7 text-right font-bold">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-emerald-400/70 group-hover:text-emerald-400 transition-colors flex-1 truncate">{link.url}</span>
                  {link.phone && <span className="text-white/20 shrink-0">{link.phone}</span>}
                  {copiedRow === link.slug
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    : <Copy className="w-3 h-3 text-white/0 group-hover:text-white/30 ml-auto shrink-0 transition-colors" />}
                </div>
              ))}
              <div className="sticky bottom-0 h-10 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
            </div>
          </motion.div>
        ) : (
          /* ── CSV blast mode ── */
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white/[0.02] border border-white/5 rounded-3xl p-12 backdrop-blur-xl shadow-2xl text-center">
            <div className="w-20 h-20 mx-auto bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 bg-emerald-400/20 rounded-2xl blur-xl animate-pulse" />
              <Mail className="w-10 h-10 text-emerald-400 relative z-10" />
            </div>
            <h3 className="font-display font-bold text-3xl mb-4">Distribution Initiated</h3>
            <p className="text-white/50 mb-3 max-w-lg mx-auto leading-relaxed">
              The enterprise engine is dispatching <span className="text-white font-bold">{result.count}</span> personalized gift links via SMS to your employee roster.
            </p>
            <p className="text-white/30 text-sm mb-10">A delivery report will be sent to your billing email shortly.</p>

            {/* Progress animation */}
            <div className="relative bg-white/5 border border-white/10 rounded-2xl p-4 mb-8">
              <div className="text-xs text-white/40 mb-2 text-left">Blast Progress</div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 4, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-emerald-400 mt-2 text-right">Sending {result.count} SMS…</p>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 flex flex-col sm:flex-row gap-3">
          <button onClick={() => router.push("/corporate")} className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
            <Building2 className="w-4 h-4" /> Corporate Home
          </button>
          <button onClick={() => router.push("/corporate/dashboard")} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-[#050304] rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2">
            <ExternalLink className="w-4 h-4" /> Enterprise Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
