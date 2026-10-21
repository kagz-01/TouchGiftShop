"use client";
import { useState, useEffect } from "react";
import { Building2, Mail, Phone, Tag, Users, CreditCard, CheckCircle,
  Loader2, Save, AlertCircle, Shield, Globe, Bell, Palette } from "lucide-react";
import { formatKsh } from "@/lib/utils";

interface Account {
  id: string; company_name: string | null; company_email: string | null;
  company_phone: string | null; tax_id: string | null; industry: string | null;
  employee_count: number | null; credit_limit: number | null;
  credit_used: number | null; default_payment_terms: number | null;
  is_verified: boolean; created_at: string;
}

const INDUSTRIES = [
  "Finance & Banking", "Healthcare", "Technology", "Manufacturing",
  "Retail", "Education", "Real Estate", "Hospitality", "Consulting",
  "Media & Entertainment", "NGO / Non-profit", "Government", "Other",
];

const PAYMENT_TERMS = [
  { val: 0,  label: "Immediate" },
  { val: 7,  label: "Net 7 days" },
  { val: 14, label: "Net 14 days" },
  { val: 30, label: "Net 30 days" },
  { val: 60, label: "Net 60 days" },
];

function Section({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
          <Icon className="w-4 h-4 text-amber-600" />
        </div>
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

export default function PortalSettingsTab() {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  // Form state (initialised from account)
  const [companyName,    setCompanyName]    = useState("");
  const [companyEmail,   setCompanyEmail]   = useState("");
  const [companyPhone,   setCompanyPhone]   = useState("");
  const [taxId,          setTaxId]          = useState("");
  const [industry,       setIndustry]       = useState("");
  const [employeeCount,  setEmployeeCount]  = useState<number | "">(0);
  const [paymentTerms,   setPaymentTerms]   = useState(30);

  useEffect(() => {
    fetch("/api/corporate/accounts")
      .then(r => r.json())
      .then(d => {
        const a: Account = Array.isArray(d) ? d[0] : (d.account ?? d);
        if (a) {
          setAccount(a);
          setCompanyName(a.company_name ?? "");
          setCompanyEmail(a.company_email ?? "");
          setCompanyPhone(a.company_phone ?? "");
          setTaxId(a.tax_id ?? "");
          setIndustry(a.industry ?? "");
          setEmployeeCount(a.employee_count ?? "");
          setPaymentTerms(a.default_payment_terms ?? 30);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/corporate/accounts", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName, company_email: companyEmail,
          company_phone: companyPhone, tax_id: taxId,
          industry, employee_count: Number(employeeCount) || null,
          default_payment_terms: paymentTerms,
        }),
      });
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
    </div>
  );

  const creditAvailable = Number(account?.credit_limit ?? 0) - Number(account?.credit_used ?? 0);
  const creditPct = account?.credit_limit ? Math.min(100, Math.round((Number(account.credit_used) / Number(account.credit_limit)) * 100)) : 0;

  return (
    <form onSubmit={save} className="space-y-5 max-w-2xl">
      {/* Verification banner */}
      {account?.is_verified ? (
        <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">Verified Corporate Account</p>
            <p className="text-xs text-green-600 mt-0.5">Your business is verified. Invoice & LPO payment is enabled.</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Verification Pending</p>
            <p className="text-xs text-amber-600 mt-0.5">Our team will verify your account within 1 business day to unlock invoicing and credit terms.</p>
          </div>
        </div>
      )}

      {/* Company Profile */}
      <Section title="Company Profile" icon={Building2}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Company Name *">
            <input required value={companyName} onChange={e => setCompanyName(e.target.value)}
              placeholder="Acme Corp Ltd"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </Field>
          <Field label="Industry">
            <select value={industry} onChange={e => setIndustry(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500">
              <option value="">Select industry…</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </Field>
          <Field label="Business Email *">
            <input required type="email" value={companyEmail} onChange={e => setCompanyEmail(e.target.value)}
              placeholder="procurement@company.co.ke"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </Field>
          <Field label="Phone">
            <input type="tel" value={companyPhone} onChange={e => setCompanyPhone(e.target.value)}
              placeholder="+254 700 000 000"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </Field>
          <Field label="KRA PIN / Tax ID" hint="Required for invoicing">
            <input value={taxId} onChange={e => setTaxId(e.target.value)}
              placeholder="P0000000000A"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </Field>
          <Field label="Employee Count">
            <select value={String(employeeCount)} onChange={e => setEmployeeCount(Number(e.target.value))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500">
              {["", "1-10", "11-50", "51-200", "201-500", "500+"].map((r, i) => (
                <option key={r} value={i === 0 ? "" : String([5, 30, 125, 350, 750][i - 1])}>
                  {r || "Select size…"}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      {/* Billing & Credit */}
      <Section title="Billing & Credit" icon={CreditCard}>
        <div className="space-y-4">
          <Field label="Default Payment Terms">
            <div className="flex gap-2 flex-wrap">
              {PAYMENT_TERMS.map(pt => (
                <button key={pt.val} type="button" onClick={() => setPaymentTerms(pt.val)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    paymentTerms === pt.val ? "bg-amber-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-amber-300"
                  }`}>
                  {pt.label}
                </button>
              ))}
            </div>
          </Field>

          {account?.credit_limit && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">Credit Line</span>
                <span className={`text-xs font-bold ${creditPct > 80 ? "text-red-600" : "text-gray-600"}`}>
                  {formatKsh(Number(account.credit_used ?? 0))} used of {formatKsh(Number(account.credit_limit))}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${creditPct > 80 ? "bg-red-500" : creditPct > 60 ? "bg-amber-500" : "bg-green-500"}`}
                  style={{ width: `${creditPct}%` }} />
              </div>
              <p className="text-xs text-gray-500">{formatKsh(creditAvailable)} available</p>
            </div>
          )}
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={Bell}>
        <div className="space-y-3">
          {[
            { label: "Order status updates",      hint: "Email when order is processed or delivered" },
            { label: "Invoice reminders",         hint: "7 days before due date" },
            { label: "Pool funding milestones",   hint: "At 25%, 50%, 75%, and 100% funded" },
            { label: "Quote responses",           hint: "When we respond to your quote requests" },
            { label: "Milestone gift auto-fires", hint: "When a gifting rule is triggered" },
          ].map((n, i) => (
            <label key={n.label} className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5 shrink-0">
                <input type="checkbox" defaultChecked={i < 3} className="sr-only peer" />
                <div className="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-amber-500 transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{n.label}</p>
                <p className="text-xs text-gray-400">{n.hint}</p>
              </div>
            </label>
          ))}
        </div>
      </Section>

      {/* Security */}
      <Section title="Security & Access" icon={Shield}>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900">Two-factor authentication</p>
              <p className="text-xs text-gray-400">Require 2FA for all portal logins</p>
            </div>
            <div className="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-semibold rounded-lg">Coming soon</div>
          </div>
          <div className="border-t border-gray-100 pt-3">
            <p className="text-sm font-medium text-gray-900 mb-2">Portal Access</p>
            <p className="text-xs text-gray-400 mb-3">Manage who can log into the corporate portal.</p>
            <button type="button"
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:border-amber-300 text-sm text-gray-700 font-medium rounded-lg transition-all">
              <Users className="w-4 h-4" /> Manage Portal Users
            </button>
          </div>
        </div>
      </Section>

      {/* Save */}
      <div className="flex items-center gap-3 pb-6">
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-lg transition-colors disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
        </button>
        {saved && <p className="text-sm text-green-600 font-medium">✓ Profile updated successfully</p>}
      </div>
    </form>
  );
}
