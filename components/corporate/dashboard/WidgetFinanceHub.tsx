"use client";

import { useState } from "react";
import { ReceiptText, FileText, CheckCircle2, Clock, AlertCircle, Download, Copy, Check, CreditCard, Landmark, ArrowUpRight, X, Printer, ShieldCheck } from "lucide-react";

export interface InvoiceItem {
  id: string;
  invoice_number: string;
  buyer_name: string;
  total_amount: number;
  status: "paid" | "unpaid" | "overdue" | "draft" | string;
  etims_number?: string;
  po_number?: string;
  created_at: string;
  due_at: string | null;
}

interface WidgetFinanceHubProps {
  invoices: InvoiceItem[];
  companyName: string;
}

export default function WidgetFinanceHub({ invoices: initialInvoices, companyName }: WidgetFinanceHubProps) {
  const [invoices, setInvoices] = useState<InvoiceItem[]>(initialInvoices);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeInvoiceModal, setActiveInvoiceModal] = useState<InvoiceItem | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [editingPoId, setEditingPoId] = useState<string | null>(null);
  const [poInputs, setPoInputs] = useState<Record<string, string>>({});
  const [stkTriggered, setStkTriggered] = useState(false);

  const filtered = invoices.filter((inv) => {
    if (statusFilter === "all") return true;
    return inv.status === statusFilter;
  });

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSavePo = (id: string) => {
    const newPo = poInputs[id];
    if (newPo) {
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, po_number: newPo } : inv));
    }
    setEditingPoId(null);
  };

  const handleTriggerStk = () => {
    setStkTriggered(true);
    setTimeout(() => {
      setStkTriggered(false);
      if (activeInvoiceModal) {
        setInvoices(prev => prev.map(inv => inv.id === activeInvoiceModal.id ? { ...inv, status: "paid" } : inv));
        setActiveInvoiceModal(null);
      }
    }, 2000);
  };

  return (
    <div
      className="rounded-2xl p-6 transition-all"
      style={{
        background: "var(--portal-surface)",
        border: "1px solid var(--portal-border)",
        boxShadow: "var(--portal-shadow)",
      }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4" style={{ borderBottom: "1px solid var(--portal-border-soft)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "var(--portal-positive-tint)",
              color: "var(--portal-positive)",
            }}
          >
            <ReceiptText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold tracking-tight" style={{ color: "var(--portal-text)" }}>
                Finance & Invoicing Hub
              </h3>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: "var(--portal-accent-tint)", color: "var(--portal-accent)" }}
              >
                KRA eTIMS Ready
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: "var(--portal-text-muted)" }}>
              Tax invoices · PO / LPO reference tracking · Corporate Paybill & Bank Wire
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center p-1 rounded-xl" style={{ background: "var(--portal-surface-2)", border: "1px solid var(--portal-border-soft)" }}>
          {["all", "unpaid", "paid", "overdue"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className="px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all"
              style={{
                background: statusFilter === st ? "var(--portal-surface)" : "transparent",
                color: statusFilter === st ? "var(--portal-text)" : "var(--portal-text-muted)",
                boxShadow: statusFilter === st ? "var(--portal-shadow)" : "none",
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice Table */}
      <div className="rounded-xl overflow-hidden border" style={{ borderColor: "var(--portal-border-soft)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead style={{ background: "var(--portal-surface-2)", color: "var(--portal-text-muted)" }}>
              <tr>
                <th className="p-3 font-semibold">Invoice Number</th>
                <th className="p-3 font-semibold">eTIMS Serial</th>
                <th className="p-3 font-semibold">LPO / PO Reference</th>
                <th className="p-3 font-semibold">Due Date</th>
                <th className="p-3 font-semibold text-right">Amount (KES)</th>
                <th className="p-3 font-semibold text-center">Status</th>
                <th className="p-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--portal-border-soft)" }}>
              {filtered.map((inv) => {
                const isPaid = inv.status === "paid";
                const isOverdue = inv.status === "overdue";

                return (
                  <tr
                    key={inv.id}
                    className="transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                    style={{ color: "var(--portal-text)" }}
                  >
                    <td className="p-3 font-mono font-bold">{inv.invoice_number}</td>
                    <td className="p-3 font-mono text-[11px]" style={{ color: "var(--portal-text-faint)" }}>
                      {inv.etims_number || "eTIMS-AUTO-SYNC"}
                    </td>
                    <td className="p-3">
                      {editingPoId === inv.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            defaultValue={inv.po_number || ""}
                            onChange={(e) => setPoInputs({ ...poInputs, [inv.id]: e.target.value })}
                            placeholder="e.g. PO-99120"
                            className="px-2 py-0.5 rounded text-xs border border-gray-300 dark:border-gray-700 bg-transparent"
                          />
                          <button
                            onClick={() => handleSavePo(inv.id)}
                            className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-600 text-white"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <span
                          onClick={() => setEditingPoId(inv.id)}
                          className="cursor-pointer hover:underline text-[11px] font-medium"
                          style={{ color: inv.po_number ? "var(--portal-text)" : "var(--portal-text-faint)" }}
                          title="Click to edit PO/LPO number"
                        >
                          {inv.po_number || "+ Add LPO No."}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-[11px]" style={{ color: isOverdue ? "var(--portal-stop)" : "var(--portal-text-muted)" }}>
                      {inv.due_at ? new Date(inv.due_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}
                    </td>
                    <td className="p-3 font-semibold text-right">
                      KES {Number(inv.total_amount).toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-block"
                        style={{
                          background: isPaid
                            ? "var(--portal-positive-tint)"
                            : isOverdue
                            ? "var(--portal-stop-tint)"
                            : "var(--portal-warn-tint)",
                          color: isPaid
                            ? "var(--portal-positive)"
                            : isOverdue
                            ? "var(--portal-stop)"
                            : "var(--portal-warn)",
                        }}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setActiveInvoiceModal(inv)}
                        className="px-2.5 py-1 rounded-md text-[11px] font-bold inline-flex items-center gap-1 transition-all"
                        style={{
                          background: isPaid ? "var(--portal-surface-2)" : "var(--portal-accent-tint)",
                          color: isPaid ? "var(--portal-text)" : "var(--portal-accent)",
                          border: "1px solid var(--portal-border-soft)",
                        }}
                      >
                        {isPaid ? <FileText className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                        <span>{isPaid ? "View / PDF" : "Pay & Settle"}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Details & Settlement Modal */}
      {activeInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-lg rounded-2xl p-6 shadow-2xl relative"
            style={{
              background: "var(--portal-surface)",
              border: "1px solid var(--portal-border)",
              color: "var(--portal-text)",
            }}
          >
            <button
              onClick={() => setActiveInvoiceModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--portal-accent-tint)", color: "var(--portal-accent)" }}>
                <ReceiptText className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-base font-bold">{activeInvoiceModal.invoice_number}</h4>
                <p className="text-xs" style={{ color: "var(--portal-text-muted)" }}>
                  eTIMS Serial: {activeInvoiceModal.etims_number || "ETIMS-0082718-2026"}
                </p>
              </div>
            </div>

            {/* Invoice Summary Box */}
            <div className="rounded-xl p-4 mb-4 border space-y-2" style={{ background: "var(--portal-surface-2)", borderColor: "var(--portal-border-soft)" }}>
              <div className="flex justify-between items-center text-xs">
                <span style={{ color: "var(--portal-text-muted)" }}>Billed To:</span>
                <span className="font-semibold">{activeInvoiceModal.buyer_name}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span style={{ color: "var(--portal-text-muted)" }}>Total Due (Inc. 16% VAT):</span>
                <span className="text-base font-bold" style={{ color: "var(--portal-accent)" }}>
                  KES {Number(activeInvoiceModal.total_amount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span style={{ color: "var(--portal-text-muted)" }}>Status:</span>
                <span className="font-bold uppercase tracking-wider text-[11px]" style={{ color: activeInvoiceModal.status === "paid" ? "var(--portal-positive)" : "var(--portal-warn)" }}>
                  {activeInvoiceModal.status}
                </span>
              </div>
            </div>

            {/* Payment Options (When unpaid) */}
            {activeInvoiceModal.status !== "paid" ? (
              <div className="space-y-3 mb-4">
                <p className="text-xs font-bold" style={{ color: "var(--portal-text)" }}>
                  Corporate Settlement Options:
                </p>

                {/* M-Pesa Paybill */}
                <div className="p-3 rounded-xl border flex items-center justify-between" style={{ borderColor: "var(--portal-border-soft)", background: "var(--portal-surface)" }}>
                  <div>
                    <span className="text-xs font-bold flex items-center gap-1.5 text-emerald-600">
                      <CreditCard className="w-3.5 h-3.5" /> Corporate M-Pesa Paybill
                    </span>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--portal-text-muted)" }}>
                      Business No: <strong>400200</strong> · Account: <strong>TG-{activeInvoiceModal.invoice_number.slice(-6)}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(`Paybill: 400200, Acc: TG-${activeInvoiceModal.invoice_number.slice(-6)}`, "paybill")}
                    className="px-2.5 py-1 rounded text-[11px] font-semibold border"
                    style={{ borderColor: "var(--portal-border)" }}
                  >
                    {copiedKey === "paybill" ? "Copied" : "Copy"}
                  </button>
                </div>

                {/* Bank Wire */}
                <div className="p-3 rounded-xl border flex items-center justify-between" style={{ borderColor: "var(--portal-border-soft)", background: "var(--portal-surface)" }}>
                  <div>
                    <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: "var(--portal-accent)" }}>
                      <Landmark className="w-3.5 h-3.5" /> Standard Chartered Bank Kenya
                    </span>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--portal-text-muted)" }}>
                      A/C: <strong>0102839201900</strong> · Swift: <strong>SCBLKENX</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy("Standard Chartered Bank, Acc: 0102839201900, Swift: SCBLKENX", "bank")}
                    className="px-2.5 py-1 rounded text-[11px] font-semibold border"
                    style={{ borderColor: "var(--portal-border)" }}
                  >
                    {copiedKey === "bank" ? "Copied" : "Copy"}
                  </button>
                </div>

                {/* STK Push Trigger */}
                <button
                  onClick={handleTriggerStk}
                  disabled={stkTriggered}
                  className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 text-white"
                  style={{ background: "#25D366" }}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{stkTriggered ? "Awaiting STK PIN on Finance Phone..." : "Send M-Pesa Prompt (STK Push)"}</span>
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600" />
                <span>eTIMS Clearance Verified. Official receipt issued to corporate procurement.</span>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex gap-2 pt-2 border-t" style={{ borderColor: "var(--portal-border-soft)" }}>
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5"
                style={{ borderColor: "var(--portal-border)" }}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print eTIMS Copy</span>
              </button>
              <button
                onClick={() => setActiveInvoiceModal(null)}
                className="flex-1 py-2 rounded-xl text-xs font-bold"
                style={{ background: "var(--portal-accent)", color: "var(--portal-accent-text)" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

