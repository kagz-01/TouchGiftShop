"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Upload, Users, Building2, Phone, Mail, CheckCircle2,
  AlertCircle, Download, ArrowRight, X, FileSpreadsheet,
  MessageSquare, Loader2, ChevronDown, ChevronUp
} from "lucide-react";

type Recipient = {
  name: string;
  phone: string;
  address?: string;
  note?: string;
};

type Step = "upload" | "details" | "confirm" | "done";

const SAMPLE_CSV = `Name,Phone,Address,Note
Sarah Kamau,0712345678,Westlands Nairobi,Happy Birthday!
James Mwangi,0723456789,CBD Nairobi,Thank you for your service
Aisha Omar,0734567890,Karen Nairobi,Welcome to the team`;

function parseCsvText(text: string): { recipients: Recipient[]; errors: string[] } {
  const lines = text.trim().split("\n").filter(Boolean);
  const errors: string[] = [];
  const recipients: Recipient[] = [];

  const start = lines[0]?.toLowerCase().includes("name") || lines[0]?.toLowerCase().includes("phone") ? 1 : 0;

  for (let i = start; i < lines.length; i++) {
    const parts = lines[i].split(",").map((s) => s.trim().replace(/^["']|["']$/g, ""));
    if (parts.length < 2) {
      errors.push(`Row ${i + 1}: missing name or phone`);
      continue;
    }
    const name = parts[0];
    const phone = parts[1];
    if (!name) { errors.push(`Row ${i + 1}: name is empty`); continue; }
    if (!phone) { errors.push(`Row ${i + 1}: phone is empty`); continue; }
    recipients.push({ name, phone, address: parts[2] || "", note: parts[3] || "" });
  }

  return { recipients, errors };
}

function downloadSampleCsv() {
  const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "touchgift-recipients-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/* ─── Step 1: CSV Upload ─── */
function UploadStep({ onDone }: { onDone: (r: Recipient[]) => void }) {
  const [mode, setMode] = useState<"dropzone" | "paste">("dropzone");
  const [pasteText, setPasteText] = useState("");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const processText = useCallback((text: string) => {
    const { recipients: parsed, errors: errs } = parseCsvText(text);
    setRecipients(parsed);
    setErrors(errs);
  }, []);

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      setErrors(["Please upload a .csv file"]);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => processText(e.target?.result as string);
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const preview = showAll ? recipients : recipients.slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("dropzone")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${mode === "dropzone" ? "bg-gold text-black" : "bg-white/5 border border-white/10 text-white/60 hover:border-gold/50"}`}
        >
          📁 Upload CSV file
        </button>
        <button
          onClick={() => setMode("paste")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${mode === "paste" ? "bg-gold text-black" : "bg-white/5 border border-white/10 text-white/60 hover:border-gold/50"}`}
        >
          📋 Paste / type data
        </button>
        <button
          onClick={downloadSampleCsv}
          className="ml-auto px-4 py-2 rounded-full text-sm font-semibold text-gold border border-gold/30 hover:bg-gold/10 transition-colors flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" /> Template
        </button>
      </div>

      {mode === "dropzone" ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-[2rem] p-12 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? "border-gold bg-gold/10 scale-[1.01]"
              : "border-white/20 hover:border-gold/50 hover:bg-white/5"
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <FileSpreadsheet className={`w-12 h-12 mx-auto mb-4 transition-colors ${isDragging ? "text-gold" : "text-white/40"}`} />
          <p className="text-white font-bold mb-1">
            {isDragging ? "Drop it!" : "Drop your CSV here, or click to browse"}
          </p>
          <p className="text-white/50 text-sm">Columns: Name, Phone, Address (optional), Note (optional)</p>
        </div>
      ) : (
        <div>
          <textarea
            value={pasteText}
            onChange={(e) => { setPasteText(e.target.value); processText(e.target.value); }}
            placeholder={`Paste CSV data here:\n${SAMPLE_CSV}`}
            className="w-full h-48 px-4 py-3 rounded-2xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-gold text-sm font-mono resize-none transition-colors"
          />
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <p className="text-red-300 font-semibold text-sm">{errors.length} row(s) had issues (skipped)</p>
          </div>
          {errors.slice(0, 5).map((e, i) => <p key={i} className="text-red-400/80 text-xs ml-6">{e}</p>)}
        </div>
      )}

      {/* Preview table */}
      {recipients.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400 font-bold">{recipients.length}</span> recipients imported
            </h3>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#1F1118]/50 backdrop-blur-sm">
            <table className="w-full text-sm">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  {["#", "Name", "Phone", "Address", "Note"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-white/50">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {preview.map((r, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-white/40 text-xs">{i + 1}</td>
                    <td className="px-4 py-3 font-semibold text-white">{r.name}</td>
                    <td className="px-4 py-3 text-white/70">{r.phone}</td>
                    <td className="px-4 py-3 text-white/50 text-xs">{r.address || "—"}</td>
                    <td className="px-4 py-3 text-white/50 text-xs truncate max-w-[140px]">{r.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recipients.length > 8 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full py-3 text-xs font-semibold text-gold hover:text-white transition-colors flex items-center justify-center gap-1 bg-white/5 border-t border-white/10"
              >
                {showAll ? <><ChevronUp className="w-3.5 h-3.5" /> Show less</> : <><ChevronDown className="w-3.5 h-3.5" /> Show all {recipients.length} rows</>}
              </button>
            )}
          </div>

          <button
            onClick={() => onDone(recipients)}
            className="w-full mt-6 py-4 bg-gradient-to-r from-gold to-yellow-500 text-black font-bold rounded-2xl hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(252,211,77,0.2)] transition-all duration-300 flex items-center justify-center gap-2"
          >
            Continue with {recipients.length} recipients <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Step 2: Company Details ─── */
function DetailsStep({
  recipients,
  onDone,
}: {
  recipients: Recipient[];
  onDone: (details: { companyName: string; contactName: string; contactPhone: string; contactEmail: string; giftDescription: string; budget: string; deliveryDate: string; notes: string }) => void;
}) {
  const [form, setForm] = useState({
    companyName: "", contactName: "", contactPhone: "", contactEmail: "",
    giftDescription: "", budget: "", deliveryDate: "", notes: "",
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const update = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.companyName) e.companyName = "Required";
    if (!form.contactName) e.contactName = "Required";
    if (!form.contactPhone) e.contactPhone = "Required";
    if (!form.contactEmail || !form.contactEmail.includes("@")) e.contactEmail = "Valid email required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const Field = ({ label, name, type = "text", placeholder = "", required = false }: {
    label: string; name: keyof typeof form; type?: string; placeholder?: string; required?: boolean;
  }) => (
    <div>
      <label className="block text-sm font-semibold text-white/80 mb-2">
        {label} {required && <span className="text-gold">*</span>}
      </label>
      <input
        type={type}
        value={form[name]}
        onChange={e => update(name, e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3.5 rounded-xl border ${errors[name] ? "border-red-400 bg-red-900/20" : "border-white/10 bg-white/5"} text-white placeholder-white/30 focus:outline-none focus:border-gold transition-colors`}
      />
      {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]}</p>}
    </div>
  );

  const BUDGETS = ["Under KSh 5,000", "KSh 5,000–15,000", "KSh 15,000–50,000", "KSh 50,000–200,000", "Over KSh 200,000", "Discuss with us"];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-gold/10 border border-gold/20 rounded-2xl p-4 flex items-start gap-3">
        <Users className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-white text-sm">{recipients.length} recipients loaded</p>
          <p className="text-white/60 text-xs">Now tell us about your company so we can prepare a proposal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Company Name" name="companyName" placeholder="Acme Corp Ltd" required />
        <Field label="Your Name" name="contactName" placeholder="James Mwangi" required />
        <Field label="Your Phone" name="contactPhone" type="tel" placeholder="0712 345 678" required />
        <Field label="Your Email" name="contactEmail" type="email" placeholder="james@acmecorp.co.ke" required />
      </div>

      <div>
        <label className="block text-sm font-semibold text-white/80 mb-2">What gifts are you looking for?</label>
        <input
          type="text"
          value={form.giftDescription}
          onChange={e => update("giftDescription", e.target.value)}
          placeholder="e.g. Premium hampers with wine and chocolates, personalised mugs..."
          className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-gold transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-white/80 mb-2">Budget per person</label>
          <select
            value={form.budget}
            onChange={e => update("budget", e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-gold transition-colors appearance-none"
          >
            <option value="" className="bg-[#14080D]">Select range…</option>
            {BUDGETS.map(b => <option key={b} className="bg-[#14080D]">{b}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-white/80 mb-2">Ideal delivery date</label>
          <input
            type="date"
            value={form.deliveryDate}
            onChange={e => update("deliveryDate", e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-gold transition-colors [color-scheme:dark]"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-white/80 mb-2">Any additional notes?</label>
        <textarea
          value={form.notes}
          onChange={e => update("notes", e.target.value)}
          rows={3}
          placeholder="Logo on packaging, specific allergies, preferred delivery window..."
          className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-gold transition-colors resize-none"
        />
      </div>

      <button
        onClick={() => validate() && onDone(form)}
        className="w-full py-4 bg-gradient-to-r from-gold to-yellow-500 text-black font-bold rounded-2xl hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(252,211,77,0.2)] transition-all duration-300 flex items-center justify-center gap-2 mt-4"
      >
        Review & Submit <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}

/* ─── Step 3: Confirm & Submit ─── */
function ConfirmStep({
  recipients,
  details,
  onBack,
  onDone,
}: {
  recipients: Recipient[];
  details: { companyName: string; contactName: string; contactPhone: string; contactEmail: string; giftDescription: string; budget: string; deliveryDate: string; notes: string };
  onBack: () => void;
  onDone: (refCode: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/corporate/bulk-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: details.companyName,
          contactName: details.contactName,
          contactPhone: details.contactPhone,
          contactEmail: details.contactEmail,
          giftDescription: details.giftDescription,
          budget: details.budget,
          deliveryDate: details.deliveryDate,
          notes: details.notes,
          recipients,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      onDone(data.refCode);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: <Building2 className="w-5 h-5 text-gold" />, label: "Company", value: details.companyName },
          { icon: <Users className="w-5 h-5 text-gold" />, label: "Recipients", value: `${recipients.length} people` },
          { icon: <Phone className="w-5 h-5 text-gold" />, label: "Contact", value: details.contactPhone },
          { icon: <Mail className="w-5 h-5 text-gold" />, label: "Email", value: details.contactEmail },
        ].map(({ icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
            <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center">{icon}</div>
            <div>
              <p className="text-[11px] text-white/50 font-bold uppercase tracking-wider">{label}</p>
              <p className="text-white font-bold text-sm">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {details.giftDescription && (
        <div className="p-5 bg-gold/10 border border-gold/20 rounded-2xl">
          <p className="text-xs font-bold text-gold uppercase tracking-wider mb-2">Gift requested</p>
          <p className="text-white text-sm leading-relaxed">{details.giftDescription}</p>
        </div>
      )}

      <div className="bg-[#1F1118] border border-white/10 rounded-2xl p-6">
        <p className="text-sm font-bold text-white mb-4">What happens next?</p>
        <ol className="space-y-4 text-sm text-white/70">
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 bg-gold text-black rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
            <span className="mt-0.5">Our team receives your request immediately</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 bg-gold text-black rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
            <span className="mt-0.5">We prepare a curated proposal with pricing within 2 hours</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 bg-gold text-black rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
            <span className="mt-0.5">You approve, pay via M-Pesa, and we handle all deliveries</span>
          </li>
        </ol>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button onClick={onBack} className="px-6 py-4 rounded-2xl border border-white/10 text-white/70 font-semibold text-sm hover:border-gold hover:text-white transition-colors">
          ← Back
        </button>
        <button
          onClick={submit}
          disabled={loading}
          className="flex-1 py-4 bg-gradient-to-r from-gold to-yellow-500 text-black font-bold rounded-2xl hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(252,211,77,0.2)] transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting…</> : <>Submit Inquiry & Notify Team <ArrowRight className="w-5 h-5" /></>}
        </button>
      </div>
    </div>
  );
}

/* ─── Step 4: Done ─── */
function DoneStep({ refCode, contactEmail, companyName }: { refCode: string; contactEmail: string; companyName: string }) {
  return (
    <div className="text-center py-12 space-y-8 animate-in zoom-in-95 duration-500">
      <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
        <CheckCircle2 className="w-12 h-12 text-emerald-400" />
      </div>
      <div>
        <h2 className="font-display text-3xl font-bold text-white mb-3">Request Submitted!</h2>
        <p className="text-white/70 text-lg max-w-md mx-auto">
          Our team has been notified and will reach out to <strong className="text-white">{companyName}</strong> within 2 business hours.
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 max-w-sm mx-auto relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-[40px]" />
        <p className="relative text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Your Reference Code</p>
        <p className="relative font-display text-4xl font-bold text-gold tracking-widest">{refCode}</p>
        <p className="relative text-xs text-white/50 mt-3">A confirmation was sent to {contactEmail}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <a
          href={`https://wa.me/254142677898?text=Hi%21+I%27ve+submitted+a+corporate+inquiry+ref+${refCode}+for+${encodeURIComponent(companyName)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#25D366] text-white font-bold rounded-2xl hover:bg-[#1EBE5A] hover:scale-105 transition-all shadow-[0_0_20px_rgba(37,211,102,0.2)]"
        >
          <MessageSquare className="w-5 h-5" /> WhatsApp Us
        </a>
        <Link
          href="/shop?category=corporate"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 text-white font-bold rounded-2xl hover:border-gold hover:bg-gold/10 transition-colors"
        >
          Browse Corporate Gifts
        </Link>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function BulkUploadPage() {
  const [currentStep, setCurrentStep] = useState<Step>("upload");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [details, setDetails] = useState<{
    companyName: string; contactName: string; contactPhone: string; contactEmail: string;
    giftDescription: string; budget: string; deliveryDate: string; notes: string;
  } | null>(null);
  const [refCode, setRefCode] = useState("");

  const STEPS = [
    { id: "upload", label: "Upload CSV", icon: <Upload className="w-4 h-4" /> },
    { id: "details", label: "Company Info", icon: <Building2 className="w-4 h-4" /> },
    { id: "confirm", label: "Review", icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: "done", label: "Done", icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  const stepIndex = STEPS.findIndex(s => s.id === currentStep);

  return (
    <div className="min-h-screen bg-[#14080D]">
      {/* Header */}
      <div className="bg-[#14080D]/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/corporate" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors border border-white/10">
            <X className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="font-display font-bold text-lg text-white">Corporate Bulk Gift Upload</h1>
          </div>
          {recipients.length > 0 && currentStep !== "done" && (
            <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-1.5 rounded-full text-xs font-bold">
              <Users className="w-4 h-4" /> {recipients.length} recipients
            </div>
          )}
        </div>

        {/* Step progress */}
        {currentStep !== "done" && (
          <div className="max-w-4xl mx-auto px-6 pb-4">
            <div className="flex items-center gap-2">
              {STEPS.slice(0, 3).map((s, i) => (
                <div key={s.id} className="flex items-center gap-2 flex-1">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                    i < stepIndex ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    i === stepIndex ? "bg-gold text-black border-gold shadow-[0_0_15px_rgba(252,211,77,0.3)]" : "bg-white/5 text-white/40 border-white/5"
                  }`}>
                    {s.icon}
                    <span className="hidden sm:inline tracking-wide uppercase">{s.label}</span>
                  </div>
                  {i < 2 && <div className={`flex-1 h-0.5 transition-colors ${i < stepIndex ? "bg-emerald-500/50" : "bg-white/10"}`} />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-6 py-12 max-w-3xl mx-auto relative">
        {/* Subtle background glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10">
          {currentStep === "upload" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-10">
                <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">Upload your recipient list</h2>
                <p className="text-white/60 text-lg">Upload a CSV file or paste your data. Supported columns: Name, Phone, Address, Note.</p>
              </div>
              <UploadStep onDone={(r) => { setRecipients(r); setCurrentStep("details"); }} />
            </div>
          )}

          {currentStep === "details" && (
            <div className="space-y-8">
              <div className="text-center mb-10">
                <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">Your company details</h2>
                <p className="text-white/60 text-lg">We&apos;ll use this to prepare your personalised proposal.</p>
              </div>
              <DetailsStep recipients={recipients} onDone={(d) => { setDetails(d); setCurrentStep("confirm"); }} />
            </div>
          )}

          {currentStep === "confirm" && details && (
            <div className="space-y-8">
              <div className="text-center mb-10">
                <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">Review & submit</h2>
                <p className="text-white/60 text-lg">Double-check everything before we notify our team.</p>
              </div>
              <ConfirmStep
                recipients={recipients}
                details={details}
                onBack={() => setCurrentStep("details")}
                onDone={(ref) => { setRefCode(ref); setCurrentStep("done"); }}
              />
            </div>
          )}

          {currentStep === "done" && details && (
            <DoneStep refCode={refCode} contactEmail={details.contactEmail} companyName={details.companyName} />
          )}
        </div>
      </div>
    </div>
  );
}
