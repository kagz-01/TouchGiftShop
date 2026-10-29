"use client";

import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, Send, Sparkles, Download, Phone, MapPin, Eye, X, Check, RefreshCw } from "lucide-react";
import { validatePhone, normalizePhone, getWhatsAppPhone } from "@/lib/phone";

export interface BatchItem {
  id: string;
  name: string;
  totalRecipients: number;
  pinsCollected: number;
  dispatched: number;
  delivered: number;
  date: string;
  status: "collecting_pins" | "dispatched" | "completed";
}

interface ParsedRecipient {
  name: string;
  phone: string;
  tier: string;
  note: string;
  isValid: boolean;
  normalizedPhone: string;
  error?: string;
}

interface WidgetBulkDispatchProps {
  batches: BatchItem[];
  companyName: string;
}

const DEFAULT_SAMPLE_ROWS: ParsedRecipient[] = [
  { name: "Sylvia Mumbua", phone: "0712345678", tier: "Tier A (Executive)", note: "Thank you for leading the Q3 product sprint!", isValid: true, normalizedPhone: "+254712345678" },
  { name: "George Njoroge", phone: "0722998877", tier: "Tier B (Premium)", note: "Happy 5th Workiversary with the engineering squad!", isValid: true, normalizedPhone: "+254722998877" },
  { name: "Purity Cherono", phone: "0110123456", tier: "Tier B (Premium)", note: "Warmest congratulations on your promotion!", isValid: true, normalizedPhone: "+254710123456" },
  { name: "Evans Odhiambo", phone: "0799881122", tier: "Tier C (Standard)", note: "Great work exceeding client onboarding targets.", isValid: true, normalizedPhone: "+254799881122" },
  { name: "Invalid Entry Demo", phone: "0722-bad-num", tier: "Tier C (Standard)", note: "Testing validator error handling", isValid: false, normalizedPhone: "", error: "Invalid Kenyan mobile number" }
];

export default function WidgetBulkDispatch({ batches: initialBatches, companyName }: WidgetBulkDispatchProps) {
  const [batches, setBatches] = useState<BatchItem[]>(initialBatches);
  const [isUploading, setIsUploading] = useState(false);
  const [parsedRecipients, setParsedRecipients] = useState<ParsedRecipient[]>(DEFAULT_SAMPLE_ROWS);
  const [previewRecipient, setPreviewRecipient] = useState<ParsedRecipient | null>(null);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"batches" | "upload">("batches");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validCount = parsedRecipients.filter(r => r.isValid).length;
  const invalidCount = parsedRecipients.filter(r => !r.isValid).length;

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "recipient_name,phone_number,gift_tier,personal_note\n" +
      "Sylvia Mumbua,0712345678,Executive Champagne Hamper,Congratulations on your 5-year workiversary!\n" +
      "George Njoroge,0722998877,Gourmet Keepsake Box,Happy Birthday from the Safaricom Leadership Team!\n" +
      "Faith Mwangi,0110123456,Artisanal Wellness Set,Great work leading the regional rollout!";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "touchgift_bulk_recipient_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter(l => l.trim().length > 0);
      const rows: ParsedRecipient[] = [];

      // skip header if present
      const startIdx = lines[0].toLowerCase().includes("name") || lines[0].toLowerCase().includes("phone") ? 1 : 0;

      for (let i = startIdx; i < lines.length; i++) {
        const parts = lines[i].split(",").map(p => p.trim().replace(/^"|"$/g, ""));
        if (parts.length >= 2) {
          const name = parts[0] || `Recipient ${i}`;
          const rawPhone = parts[1] || "";
          const tier = parts[2] || "Tier B (Premium)";
          const note = parts[3] || "Warmest regards from our team!";
          const validation = validatePhone(rawPhone);

          rows.push({
            name,
            phone: rawPhone,
            tier,
            note,
            isValid: validation.isValid,
            normalizedPhone: validation.isValid ? validation.normalized : "",
            error: validation.isValid ? undefined : "Invalid Kenyan mobile number (07xx, 01xx, +254)"
          });
        }
      }

      setParsedRecipients(rows.length > 0 ? rows : DEFAULT_SAMPLE_ROWS);
      setIsUploading(false);
      setActiveTab("upload");
    };
    reader.readAsText(file);
  };

  const handleDispatchBatch = () => {
    setDispatchSuccess(true);
    setTimeout(() => {
      const newBatch: BatchItem = {
        id: `bat-${Date.now().toString().slice(-4)}`,
        name: `Batch Dispatch (${validCount} recipients)`,
        totalRecipients: validCount,
        pinsCollected: 0,
        dispatched: validCount,
        delivered: 0,
        date: new Date().toISOString().split("T")[0],
        status: "collecting_pins"
      };
      setBatches([newBatch, ...batches]);
      setDispatchSuccess(false);
      setActiveTab("batches");
    }, 1500);
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
              background: "var(--portal-accent-tint)",
              color: "var(--portal-accent)",
            }}
          >
            <Send className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold tracking-tight" style={{ color: "var(--portal-text)" }}>
                Bulk Dispatch & Magic Links
              </h3>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: "var(--portal-gold-tint)", color: "var(--portal-gold)" }}
              >
                No Address Friction
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: "var(--portal-text-muted)" }}>
              Upload recipient CSV · WhatsApp Magic Link lets recipients drop their own GPS pin
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center p-1 rounded-xl" style={{ background: "var(--portal-surface-2)", border: "1px solid var(--portal-border-soft)" }}>
          <button
            onClick={() => setActiveTab("batches")}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: activeTab === "batches" ? "var(--portal-surface)" : "transparent",
              color: activeTab === "batches" ? "var(--portal-text)" : "var(--portal-text-muted)",
              boxShadow: activeTab === "batches" ? "var(--portal-shadow)" : "none",
            }}
          >
            Live Batches ({batches.length})
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: activeTab === "upload" ? "var(--portal-surface)" : "transparent",
              color: activeTab === "upload" ? "var(--portal-text)" : "var(--portal-text-muted)",
              boxShadow: activeTab === "upload" ? "var(--portal-shadow)" : "none",
            }}
          >
            CSV Intake ({parsedRecipients.length})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === "batches" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {batches.map((batch) => {
              const pinProgress = Math.round((batch.pinsCollected / batch.totalRecipients) * 100);
              const isDone = batch.status === "completed";

              return (
                <div
                  key={batch.id}
                  className="rounded-xl p-4 transition-all"
                  style={{
                    background: "var(--portal-surface-2)",
                    border: "1px solid var(--portal-border-soft)",
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-bold" style={{ color: "var(--portal-text)" }}>
                        {batch.name}
                      </h4>
                      <p className="text-xs mt-0.5" style={{ color: "var(--portal-text-muted)" }}>
                        Dispatched {batch.date} · {batch.totalRecipients} recipients
                      </p>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider"
                      style={{
                        background: isDone ? "var(--portal-positive-tint)" : "var(--portal-accent-tint)",
                        color: isDone ? "var(--portal-positive)" : "var(--portal-accent)",
                      }}
                    >
                      {isDone ? "Delivered" : "Pins Collecting"}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1 mt-3">
                    <div className="flex justify-between text-xs font-medium" style={{ color: "var(--portal-text-muted)" }}>
                      <span>GPS Pins Received</span>
                      <span className="font-bold" style={{ color: "var(--portal-text)" }}>
                        {batch.pinsCollected} / {batch.totalRecipients} ({pinProgress}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--portal-border)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pinProgress}%`,
                          background: isDone ? "var(--portal-positive)" : "var(--portal-accent)",
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-3 mt-3 border-t" style={{ borderColor: "var(--portal-border-soft)", color: "var(--portal-text-faint)" }}>
                    <span>{batch.delivered} Delivered by TouchGift Rider</span>
                    <button
                      onClick={() => setActiveTab("upload")}
                      className="font-semibold underline hover:no-underline"
                      style={{ color: "var(--portal-accent)" }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick upload trigger */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer border-2 border-dashed rounded-xl p-5 text-center transition-all hover:opacity-90 flex flex-col items-center justify-center gap-2"
            style={{
              borderColor: "var(--portal-border)",
              background: "var(--portal-accent-tint)",
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,.txt"
              className="hidden"
              onChange={handleFileUpload}
            />
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "var(--portal-surface)", color: "var(--portal-accent)" }}>
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: "var(--portal-text)" }}>
                Start a New Bulk Dispatch
              </p>
              <p className="text-[11px]" style={{ color: "var(--portal-text-muted)" }}>
                Drop recipient CSV here or browse files · Auto-validates Kenyan phone prefixes
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* CSV Intake & Validation Tab */
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl" style={{ background: "var(--portal-surface-2)" }}>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold" style={{ color: "var(--portal-text)" }}>
                Validation Status:
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md" style={{ background: "var(--portal-positive-tint)", color: "var(--portal-positive)" }}>
                <Check className="w-3 h-3" /> {validCount} Valid Kenyan Numbers
              </span>
              {invalidCount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md" style={{ background: "var(--portal-stop-tint)", color: "var(--portal-stop)" }}>
                  <AlertTriangle className="w-3 h-3" /> {invalidCount} Needs Correction
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadTemplate}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                style={{
                  background: "var(--portal-surface)",
                  border: "1px solid var(--portal-border)",
                  color: "var(--portal-text)",
                }}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Template CSV</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                style={{
                  background: "var(--portal-surface)",
                  border: "1px solid var(--portal-border)",
                  color: "var(--portal-text)",
                }}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New</span>
              </button>
            </div>
          </div>

          {/* Table Preview */}
          <div className="rounded-xl overflow-hidden border" style={{ borderColor: "var(--portal-border-soft)" }}>
            <div className="overflow-x-auto max-h-60 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead style={{ background: "var(--portal-surface-2)", color: "var(--portal-text-muted)" }}>
                  <tr>
                    <th className="p-3 font-semibold">Recipient</th>
                    <th className="p-3 font-semibold">Mobile (+254)</th>
                    <th className="p-3 font-semibold">Selected Tier</th>
                    <th className="p-3 font-semibold">Personal Note</th>
                    <th className="p-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "var(--portal-border-soft)" }}>
                  {parsedRecipients.map((r, idx) => (
                    <tr
                      key={idx}
                      className="transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                      style={{ color: "var(--portal-text)" }}
                    >
                      <td className="p-3 font-medium flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: r.isValid ? "var(--portal-positive)" : "var(--portal-stop)" }}
                        />
                        {r.name}
                      </td>
                      <td className="p-3">
                        {r.isValid ? (
                          <span className="font-mono text-[11px] font-semibold">{r.normalizedPhone}</span>
                        ) : (
                          <span className="text-red-500 font-mono text-[11px] font-bold">{r.phone} ({r.error})</span>
                        )}
                      </td>
                      <td className="p-3 font-medium" style={{ color: "var(--portal-gold)" }}>{r.tier}</td>
                      <td className="p-3 max-w-xs truncate" style={{ color: "var(--portal-text-muted)" }}>{r.note}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setPreviewRecipient(r)}
                          className="px-2.5 py-1 rounded-md text-[11px] font-bold inline-flex items-center gap-1 transition-all"
                          style={{
                            background: "var(--portal-accent-tint)",
                            color: "var(--portal-accent)",
                          }}
                        >
                          <Eye className="w-3 h-3" />
                          <span>Magic Link Preview</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dispatch CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <p className="text-xs" style={{ color: "var(--portal-text-muted)" }}>
              Recipients will receive a branded WhatsApp/SMS message from TouchGift Concierge.
            </p>

            <button
              onClick={handleDispatchBatch}
              disabled={validCount === 0 || dispatchSuccess}
              className="px-5 py-2.5 rounded-xl text-xs font-bold transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              style={{
                background: "var(--portal-accent)",
                color: "var(--portal-accent-text)",
              }}
            >
              {dispatchSuccess ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Dispatching {validCount} Magic Links...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Dispatch All {validCount} WhatsApp Magic Links</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Recipient Experience Preview Modal (HCI Showcase) */}
      {previewRecipient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-sm rounded-3xl p-5 shadow-2xl relative border"
            style={{
              background: "#FFFFFF",
              color: "#1A1416",
              borderColor: "var(--portal-border)",
            }}
          >
            <button
              onClick={() => setPreviewRecipient(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 text-gray-500 hover:text-black transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Mobile frame header */}
            <div className="text-center pb-3 mb-3 border-b border-gray-100">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#9B1B5A]">
                TouchGift Recipient Concierge
              </span>
              <h4 className="text-sm font-bold mt-0.5">What {previewRecipient.name} Sees</h4>
            </div>

            {/* Simulated WhatsApp incoming message */}
            <div className="bg-[#E7F8EE] rounded-2xl p-3.5 mb-4 text-xs leading-relaxed border border-[#25D366]/20">
              <div className="flex items-center gap-1.5 font-bold text-[#1F7A43] mb-1">
                <span>TouchGift Concierge</span>
                <CheckCircle className="w-3 h-3 fill-[#25D366] text-white" />
              </div>
              <p>
                Hello {previewRecipient.name}! 🎁 {companyName} has sent you a curated celebration gift for:
              </p>
              <p className="font-semibold text-gray-900 mt-1">&ldquo;{previewRecipient.note}&rdquo;</p>
              <div className="mt-2.5 p-2 bg-white rounded-xl shadow-xs border border-gray-100">
                <span className="text-[11px] font-bold text-[#9B1B5A] block">Tap to claim & set delivery point:</span>
                <span className="text-[10px] text-blue-600 underline">https://touchgiftshop.co.ke/gift/claim?id=TG-2026-VIP</span>
              </div>
            </div>

            {/* Simulated Claim Portal Screen */}
            <div className="bg-[#FAF7F5] rounded-2xl p-4 border border-[#9B1B5A]/15 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">{previewRecipient.tier}</span>
                <span className="text-[10px] bg-[#9B1B5A]/10 text-[#9B1B5A] px-2 py-0.5 rounded font-bold">100% Confidential</span>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-600 block mb-1">Preferred Delivery Date</label>
                <div className="bg-white rounded-lg p-2 text-xs border border-gray-200 font-medium">
                  Tomorrow, 10:00 AM - 1:00 PM
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-600 block mb-1">Delivery Landmark / GPS Pin</label>
                <div className="bg-white rounded-lg p-2 text-xs border border-emerald-500/40 font-medium flex items-center justify-between">
                  <span className="flex items-center gap-1 text-emerald-800">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    Safaricom Waiyaki Way, Nairobi
                  </span>
                  <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">GPS Pinned</span>
                </div>
              </div>

              <button
                onClick={() => setPreviewRecipient(null)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-sm"
                style={{ background: "#9B1B5A" }}
              >
                Confirm Delivery (Recipient Action)
              </button>
            </div>

            <p className="text-[10px] text-center text-gray-400 mt-3">
              TouchGift riders deliver directly without requiring address entry from your HR desk.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

