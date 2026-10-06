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
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${mode === "dropzone" ? "bg-brand text-white" : "bg-white border border-surface-border text-brand-muted hover:border-brand"}`}
        >
          📁 Upload CSV file
        </button>
        <button
          onClick={() => setMode("paste")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${mode === "paste" ? "bg-brand text-white" : "bg-white border border-surface-border text-brand-muted hover:border-brand"}`}
        >
          📋 Paste / type data
        </button>
        <button
          onClick={downloadSampleCsv}
          className="ml-auto px-4 py-2 rounded-full text-sm font-semibold text-gold border border-gold/30 hover:bg-gold/5 transition-colors flex items-center gap-1.5"
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
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? "border-brand bg-brand/5 scale-[1.01]"
              : "border-surface-border hover:border-brand/40 hover:bg-brand/[0.02]"
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <FileSpreadsheet className={`w-12 h-12 mx-auto mb-4 transition-colors ${isDragging ? "text-brand" : "text-brand-muted/40"}`} />
          <p className="text-theme-heading font-semibold mb-1">
            {isDragging ? "Drop it!" : "Drop your CSV here, or click to browse"}
          </p>
          <p className="text-theme-muted text-sm">Columns: Name, Phone, Address (optional), Note (optional)</p>
        </div>
      ) : (
        <div>
          <textarea
            value={pasteText}
            onChange={(e) => { setPasteText(e.target.value); processText(e.target.value); }}
            placeholder={`Paste CSV data here:\n${SAMPLE_CSV}`}
            className="w-full h-48 px-4 py-3 rounded-2xl border border-surface-border bg-white focus:outline-none focus:border-brand text-sm font-mono resize-none"
          />
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-red-700 font-semibold text-sm">{errors.length} row(s) had issues (skipped)</p>
          </div>
          {errors.slice(0, 5).map((e, i) => <p key={i} className="text-red-600 text-xs ml-6">{e}</p>)}
        </div>
      )}

      {/* Preview table */}
      {recipients.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-theme-heading flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-success font-bold">{recipients.length}</span> recipients imported
            </h3>
          </div>
          <div className="overflow-hidden rounded-2xl border border-surface-border">
            <table className="w-full text-sm">
              <thead className="bg-surface-warm">
                <tr>
                  {["#", "Name", "Phone", "Address", "Note"].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-brand-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {preview.map((r, i) => (
                  <tr key={i} className="hover:bg-surface-warm/50">
                    <td className="px-4 py-2.5 text-brand-muted text-xs">{i + 1}</td>
                    <td className="px-4 py-2.5 font-medium text-theme-heading">{r.name}</td>
                    <td className="px-4 py-2.5 text-theme-body">{r.phone}</td>
                    <td className="px-4 py-2.5 text-theme-muted text-xs">{r.address || "—"}</td>
                    <td className="px-4 py-2.5 text-theme-muted text-xs truncate max-w-[140px]">{r.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recipients.length > 8 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full py-2.5 text-xs font-semibold text-brand hover:text-brand-light transition-colors flex items-center justify-center gap-1 bg-surface-warm border-t border-surface-border"
              >
                {showAll ? <><ChevronUp className="w-3.5 h-3.5" /> Show less</> : <><ChevronDown className="w-3.5 h-3.5" /> Show all {recipients.length} rows</>}
              </button>
            )}
          </div>

          <button
            onClick={() => onDone(recipients)}
            className="w-full mt-4 py-3.5 bg-gradient-to-r from-brand to-brand-light text-white font-bold rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
          >
            Continue with {recipients.length} recipients <ArrowRight className="w-4 h-4" />
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
      <label className="block text-sm font-semibold text-theme-heading mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={form[name]}
        onChange={e => update(name, e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl border ${errors[name] ? "border-red-400 bg-red-50" : "border-surface-border"} focus:outline-none focus:border-brand text-sm transition-colors`}
      />
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  );

  const BUDGETS = ["Under KSh 5,000", "KSh 5,000–15,000", "KSh 15,000–50,000", "KSh 50,000–200,000", "Over KSh 200,000", "Discuss with us"];

  return (
    <div className="space-y-5">
      <div className="bg-gold/5 border border-gold/20 rounded-2xl p-4 flex items-start gap-3">
        <Users className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-theme-heading text-sm">{recipients.length} recipients loaded</p>
          <p className="text-theme-muted text-xs">Now tell us about your company so we can prepare a proposal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Company Name" name="companyName" placeholder="Acme Corp Ltd" required />
        <Field label="Your Name" name="contactName" placeholder="James Mwangi" required />
        <Field label="Your Phone" name="contactPhone" type="tel" placeholder="0712 345 678" required />
        <Field label="Your Email" name="contactEmail" type="email" placeholder="james@acmecorp.co.ke" required />
      </div>

      <div>
        <label className="block text-sm font-semibold text-theme-heading mb-1.5">What gifts are you looking for?</label>
        <input
          type="text"
          value={form.giftDescription}
          onChange={e => update("giftDescription", e.target.value)}
          placeholder="e.g. Premium hampers with wine and chocolates, personalised mugs..."
          className="w-full px-4 py-3 rounded-xl border border-surface-border focus:outline-none focus:border-brand text-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-theme-heading mb-1.5">Budget per person</label>
          <select
            value={form.budget}
            onChange={e => update("budget", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-surface-border focus:outline-none focus:border-brand text-sm bg-white"
          >
            <option value="">Select range…</option>
            {BUDGETS.map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-theme-heading mb-1.5">Ideal delivery date</label>
          <input
            type="date"
            value={form.deliveryDate}
            onChange={e => update("deliveryDate", e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full px-4 py-3 rounded-xl border border-surface-border focus:outline-none focus:border-brand text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-theme-heading mb-1.5">Any additional notes?</label>
        <textarea
          value={form.notes}
          onChange={e => update("notes", e.target.value)}
          rows={3}
          placeholder="Logo on packaging, specific allergies, preferred delivery window..."
          className="w-full px-4 py-3 rounded-xl border border-surface-border focus:outline-none focus:border-brand text-sm resize-none"
        />
      </div>

      <button
        onClick={() => validate() && onDone(form)}
        className="w-full py-3.5 bg-gradient-to-r from-brand to-brand-light text-white font-bold rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
      >
        Review & Submit <ArrowRight className="w-4 h-4" />
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
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: <Building2 className="w-5 h-5 text-brand" />, label: "Company", value: details.companyName },
          { icon: <Users className="w-5 h-5 text-brand" />, label: "Recipients", value: `${recipients.length} people` },
          { icon: <Phone className="w-5 h-5 text-brand" />, label: "Contact", value: details.contactPhone },
          { icon: <Mail className="w-5 h-5 text-brand" />, label: "Email", value: details.contactEmail },
        ].map(({ icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 p-4 bg-surface-warm rounded-2xl">
            <div className="w-9 h-9 bg-brand/10 rounded-xl flex items-center justify-center">{icon}</div>
            <div>
              <p className="text-[11px] text-brand-muted font-semibold uppercase tracking-wider">{label}</p>
              <p className="text-theme-heading font-bold text-sm">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {details.giftDescription && (
        <div className="p-4 bg-gold/5 border border-gold/20 rounded-2xl">
          <p className="text-xs font-bold text-gold uppercase tracking-wider mb-1">Gift requested</p>
          <p className="text-theme-heading text-sm">{details.giftDescription}</p>
        </div>
      )}

      <div className="bg-brand/5 border border-brand/20 rounded-2xl p-5">
        <p className="text-sm font-semibold text-theme-heading mb-2">What happens next?</p>
        <ol className="space-y-2 text-sm text-theme-body">
          <li className="flex items-start gap-2"><span className="w-5 h-5 bg-brand text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">1</span>Our team receives your request immediately</li>
          <li className="flex items-start gap-2"><span className="w-5 h-5 bg-brand text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">2</span>We prepare a curated proposal with pricing within 2 hours</li>
          <li className="flex items-start gap-2"><span className="w-5 h-5 bg-brand text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">3</span>You approve, pay via M-Pesa, we handle all deliveries</li>
        </ol>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="px-6 py-3 rounded-2xl border border-surface-border text-theme-muted font-semibold text-sm hover:border-brand hover:text-brand transition-colors">
          ← Back
        </button>
        <button
          onClick={submit}
          disabled={loading}
          className="flex-1 py-3.5 bg-gradient-to-r from-gold to-gold-light text-brand-deep font-bold rounded-2xl hover:shadow-gold hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <>Submit Inquiry & Notify Team <ArrowRight className="w-4 h-4" /></>}
        </button>
      </div>
    </div>
  );
}

/* ─── Step 4: Done ─── */
function DoneStep({ refCode, contactEmail, companyName }: { refCode: string; contactEmail: string; companyName: string }) {
  return (
    <div className="text-center py-8 space-y-6">
      <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-10 h-10 text-success" />
      </div>
      <div>
        <h2 className="font-display text-2xl font-bold text-theme-heading mb-2">Request Submitted!</h2>
        <p className="text-theme-body">Our team has been notified and will reach out to <strong>{companyName}</strong> within 2 business hours.</p>
      </div>

      <div className="bg-surface-warm border border-surface-border rounded-2xl p-5 max-w-sm mx-auto">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">Your Reference Code</p>
        <p className="font-display text-2xl font-bold text-brand">{refCode}</p>
        <p className="text-xs text-brand-muted mt-1">A confirmation was sent to {contactEmail}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href={`https://wa.me/254142677898?text=Hi%21+I%27ve+submitted+a+corporate+inquiry+ref+${refCode}+for+${encodeURIComponent(companyName)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white font-semibold rounded-2xl hover:brightness-110 transition-all"
        >
          <MessageSquare className="w-4 h-4" /> WhatsApp Us
        </a>
        <Link
          href="/shop?category=corporate"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-brand/20 text-brand font-semibold rounded-2xl hover:border-brand transition-colors"
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
    <div className="min-h-screen section-theme-a">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-surface-border sticky top-0 z-40">
        <div className="page-container-capped py-4 flex items-center gap-4">
          <Link href="/corporate" className="text-brand-muted hover:text-brand text-sm flex items-center gap-1">
            <X className="w-4 h-4" /> Close
          </Link>
          <div className="flex-1">
            <h1 className="font-display font-bold text-base text-theme-heading">Corporate Bulk Gift Upload</h1>
          </div>
          {recipients.length > 0 && currentStep !== "done" && (
            <div className="flex items-center gap-1.5 bg-success/10 text-success px-3 py-1 rounded-full text-xs font-bold">
              <Users className="w-3.5 h-3.5" /> {recipients.length} recipients
            </div>
          )}
        </div>

        {/* Step progress */}
        {currentStep !== "done" && (
          <div className="page-container-capped pb-4">
            <div className="flex items-center gap-2">
              {STEPS.slice(0, 3).map((s, i) => (
                <div key={s.id} className="flex items-center gap-2 flex-1">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    i < stepIndex ? "bg-success/10 text-success" :
                    i === stepIndex ? "bg-brand text-white" : "bg-surface-border text-brand-muted"
                  }`}>
                    {s.icon}
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                  {i < 2 && <div className={`flex-1 h-0.5 transition-colors ${i < stepIndex ? "bg-success" : "bg-surface-border"}`} />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="page-container-capped py-10 max-w-3xl mx-auto">
        {currentStep === "upload" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-theme-heading mb-2">Upload your recipient list</h2>
              <p className="text-theme-body">Upload a CSV file or paste your data. Supported columns: Name, Phone, Address, Note.</p>
            </div>
            <UploadStep onDone={(r) => { setRecipients(r); setCurrentStep("details"); }} />
          </div>
        )}

        {currentStep === "details" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-theme-heading mb-2">Your company details</h2>
              <p className="text-theme-body">We&apos;ll use this to prepare your personalised proposal.</p>
            </div>
            <DetailsStep recipients={recipients} onDone={(d) => { setDetails(d); setCurrentStep("confirm"); }} />
          </div>
        )}

        {currentStep === "confirm" && details && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-theme-heading mb-2">Review & submit</h2>
              <p className="text-theme-body">Double-check everything before we notify our team.</p>
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
  );
}
