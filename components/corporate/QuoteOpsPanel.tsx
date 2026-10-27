"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Inbox, Send, XCircle, CheckCircle, Loader2, Building2, Search,
  ChevronDown, Copy, Check, MessageCircle, Palette, User, CalendarClock,
  FileText, FilterX, Phone, Mail, AlertCircle,
} from "lucide-react";
import { formatKsh } from "@/lib/utils";

/* Roadmap §3 Phase 1.1 / 1.3. Ops tooling — the server re-checks the session,
   the client only hides what the current status cannot do. */

export type QuoteStatus = "pending" | "quoted" | "accepted" | "declined";

export interface QuoteRow {
  id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  company_name: string;
  email: string;
  phone: string | null;
  category: string | null;
  notes: string | null;
  unit_price: number | null;
  total_estimate: number | null;
  quoted_amount: number | null;
  valid_until: string | null;
  moq_tier: string | null;
  assignee: string | null;
  internal_notes: string | null;
  design_payload: Record<string, unknown> | null;
  design_preview_url: string | null;
  status: QuoteStatus;
  quoted_at: string | null;
  created_at: string;
  /** Set when the client answers from their own portal. */
  customer_response: { decision?: string; message?: string | null; responded_by?: string; responded_at?: string } | null;
  customer_responded_at: string | null;
}

/* Mirrors TRANSITIONS in app/api/corporate/quotes/route.ts. Duplicated on
   purpose — the client copy drives affordances, the server copy is the one
   that actually enforces. */
const NEXT_ACTIONS: Record<QuoteStatus, { to: QuoteStatus; label: string; icon: typeof Send; cls: string }[]> = {
  pending: [
    { to: "quoted",   label: "Send Quote",  icon: Send,       cls: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 text-blue-400" },
    { to: "declined", label: "Decline",     icon: XCircle,    cls: "bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-400" },
  ],
  quoted: [
    { to: "accepted", label: "Mark Accepted", icon: CheckCircle, cls: "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-400" },
    { to: "declined", label: "Decline",       icon: XCircle,     cls: "bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-400" },
    { to: "pending",  label: "Reopen",        icon: Loader2,     cls: "bg-white/5 hover:bg-white/10 border-white/10 text-white/60" },
  ],
  accepted: [],
  declined: [
    { to: "pending", label: "Reopen", icon: Loader2, cls: "bg-white/5 hover:bg-white/10 border-white/10 text-white/60" },
  ],
};

const STATUS_CONFIG: Record<QuoteStatus, { label: string; cls: string; dot: string }> = {
  pending:  { label: "Pending",  cls: "bg-amber-500/10 text-amber-400 border-amber-500/20",         dot: "bg-amber-400" },
  quoted:   { label: "Quoted",   cls: "bg-blue-500/10 text-blue-400 border-blue-500/20",            dot: "bg-blue-400" },
  accepted: { label: "Accepted", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400" },
  declined: { label: "Declined", cls: "bg-red-500/10 text-red-400 border-red-500/20",               dot: "bg-red-400" },
};

function StatusBadge({ status }: { status: QuoteStatus }) {
  const c = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border shrink-0 ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

/* Ops WhatsApp line. Overridable so it does not need a code change to point at
   a different desk. */
const OPS_WHATSAPP = process.env.NEXT_PUBLIC_OPS_WHATSAPP ?? "254183172111";

function whatsappDeepLink(phone: string | null, company: string, product: string) {
  const number = (phone ?? "").replace(/[^\d]/g, "");
  const to = number.length >= 9 ? number : OPS_WHATSAPP;
  const text = encodeURIComponent(
    `Hi ${company}, thanks for your quote request for ${product} — TouchGift here.`
  );
  return `https://wa.me/${to}?text=${text}`;
}

/* Roadmap 1.3 — a paste-ready summary. Ops were assembling this by hand in
   WhatsApp every time. */
function buildQuoteSummary(q: QuoteRow) {
  const amount = q.quoted_amount ?? q.total_estimate;
  const lines = [
    `Hello ${q.company_name},`,
    ``,
    `Thank you for your quote request. Here is a summary:`,
    ``,
    `Item:      ${q.product_name}`,
    `Quantity:  ${q.quantity} units${q.moq_tier ? ` (${q.moq_tier} tier)` : ""}`,
    `Estimate:  ${amount ? formatKsh(amount) : "to be confirmed"}`,
  ];
  if (q.valid_until) {
    lines.push(`Valid until: ${new Date(q.valid_until).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}`);
  }
  lines.push(
    ``,
    q.assignee ? `Your contact: ${q.assignee}` : `Next step: we will confirm stock and lead time, then send a final quote.`,
    ``,
    `— TouchGift Corporate`
  );
  return lines.join("\n");
}

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = useCallback(async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1600);
    } catch {
      /* clipboard blocked (insecure origin / denied permission) — the URL is
         still selectable in the DOM, so failing silently is acceptable here */
    }
  }, []);
  return { copied, copy };
}

function QuoteDetail({
  quote: q,
  onSave,
  saving,
}: {
  quote: QuoteRow;
  onSave: (id: string, patch: Record<string, unknown>) => Promise<void>;
  saving: boolean;
}) {
  const [assignee, setAssignee] = useState(q.assignee ?? "");
  const [notes, setNotes] = useState(q.internal_notes ?? "");
  const [amount, setAmount] = useState(q.quoted_amount != null ? String(q.quoted_amount) : "");
  const [validUntil, setValidUntil] = useState(q.valid_until ? q.valid_until.slice(0, 10) : "");

  const dirty =
    assignee !== (q.assignee ?? "") ||
    notes !== (q.internal_notes ?? "") ||
    amount !== (q.quoted_amount != null ? String(q.quoted_amount) : "") ||
    validUntil !== (q.valid_until ? q.valid_until.slice(0, 10) : "");

  const inputCls =
    "w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/25 focus:border-blue-400 focus:outline-none transition-colors";

  return (
    <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* ── Customer context ── */}
      <div className="space-y-2.5 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">Customer</p>
        <div className="space-y-1.5 text-xs">
          <p className="flex items-center gap-2 min-w-0">
            <Mail className="w-3.5 h-3.5 text-white/30 shrink-0" />
            <a href={`mailto:${q.email}`} className="text-blue-300 hover:underline truncate">{q.email}</a>
          </p>
          {q.phone && (
            <p className="flex items-center gap-2 min-w-0">
              <Phone className="w-3.5 h-3.5 text-white/30 shrink-0" />
              <a href={`tel:${q.phone}`} className="text-blue-300 hover:underline truncate">{q.phone}</a>
            </p>
          )}
          {q.category && (
            <p className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-white/30 shrink-0" />
              <span className="text-white/60">{q.category}</span>
            </p>
          )}
        </div>

        {q.notes && (
          <div className="rounded-lg bg-amber-500/5 border border-amber-500/15 p-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400/70 mb-1">Customer message</p>
            <p className="text-xs text-white/70 leading-relaxed whitespace-pre-wrap break-words">{q.notes}</p>
          </div>
        )}

        {q.design_preview_url && (
          <div className="rounded-lg border border-white/10 p-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3 h-3" /> Studio design
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={q.design_preview_url}
              alt="Studio design preview"
              className="w-full max-w-[220px] rounded-lg border border-white/10 bg-white/5 object-contain"
            />
          </div>
        )}

        {q.design_payload && Object.keys(q.design_payload).length > 0 && (
          <details className="rounded-lg border border-white/10 p-2.5">
            <summary className="text-[10px] font-bold uppercase tracking-wider text-white/30 cursor-pointer select-none">
              Fulfillment payload
            </summary>
            <pre className="mt-2 text-[10px] text-white/50 overflow-x-auto max-h-40 whitespace-pre-wrap break-words">
              {JSON.stringify(q.design_payload, null, 2)}
            </pre>
          </details>
        )}
      </div>

      {/* ── Ops editors ── */}
      <div className="space-y-2.5 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">Ops</p>
        <div>
          <label className="block text-[10px] text-white/40 mb-1">Assignee</label>
          <div className="relative">
            <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
            <input
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="Who owns this?"
              className={`${inputCls} pl-8`}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="min-w-0">
            <label className="block text-[10px] text-white/40 mb-1">Quoted amount (KES)</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
              inputMode="decimal"
              placeholder="—"
              className={inputCls}
            />
          </div>
          <div className="min-w-0">
            <label className="block text-[10px] text-white/40 mb-1">Valid until</label>
            <div className="relative">
              <CalendarClock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className={`${inputCls} pl-8`}
              />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-[10px] text-white/40 mb-1">Internal notes (ops only)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Supplier quote, lead time, margin…"
            className={`${inputCls} resize-y min-h-[64px]`}
          />
        </div>

        {dirty && (
          <button
            onClick={() =>
              onSave(q.id, {
                assignee: assignee || null,
                internal_notes: notes || null,
                quoted_amount: amount === "" ? null : Number(amount),
                valid_until: validUntil ? new Date(validUntil).toISOString() : null,
              })
            }
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-2 bg-blue-500 hover:bg-blue-400 text-black text-xs font-bold rounded-lg transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            Save ops fields
          </button>
        )}
      </div>
    </div>
  );
}

export default function QuoteOpsPanel({
  initialQuotes = [],
  initialPending = 0,
}: {
  initialQuotes?: QuoteRow[];
  initialPending?: number;
}) {
  const [quotes, setQuotes] = useState<QuoteRow[]>(initialQuotes);
  const [status, setStatus] = useState<"all" | QuoteStatus>("all");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(initialPending);
  const [error, setError] = useState<string | null>(null);
  const { copied, copy } = useCopy();

  const hasFilters = Boolean(search || category || from || to);

  const fetchQuotes = useCallback(
    async (opts: { status?: string; pageNum?: number }) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          limit: "20",
          page: String(opts.pageNum ?? 1),
        });
        if (opts.status && opts.status !== "all") params.set("status", opts.status);
        if (search.trim()) params.set("q", search.trim());
        if (category) params.set("category", category);
        if (from) params.set("from", from);
        if (to) params.set("to", to);

        /* The pooler drops connections often enough that a single failed read
           used to leave the panel empty with no way back short of a reload, so
           one 503/network failure is retried before we surface anything. */
        const request = async () => {
          const res = await fetch(`/api/corporate/quotes?${params}`);
          if (res.status === 503 || res.status >= 500) {
            await new Promise((r) => setTimeout(r, 1500));
            return fetch(`/api/corporate/quotes?${params}`);
          }
          return res;
        };

        const res = await request();
        if (res.status === 401) {
          setError("Your session expired — sign in again.");
          setQuotes([]);
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Could not load quotes.");
          return;
        }
        setQuotes(data.quotes ?? []);
        setTotal(data.total ?? 0);
        setPage(opts.pageNum ?? 1);
      } catch {
        setError("Network error loading quotes.");
      } finally {
        setLoading(false);
      }
    },
    [search, category, from, to]
  );

  /* Debounce so typing in the search box doesn't fire a request per keystroke
     against a table holding customer PII. */
  useEffect(() => {
    const t = setTimeout(() => fetchQuotes({ status, pageNum: 1 }), search ? 350 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, search, category, from, to]);

  const categories = useMemo(
    () => Array.from(new Set(quotes.map((q) => q.category).filter(Boolean))) as string[],
    [quotes]
  );

  async function patchQuote(id: string, patch: Record<string, unknown>) {
    setUpdating(id);
    setError(null);
    try {
      const res = await fetch("/api/corporate/quotes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
      const data = await res.json();
      if (!res.ok) {
        // 409 = illegal transition, 401 = session gone, 400 = bad value.
        setError(data.error ?? `Update failed (${res.status}).`);
        return false;
      }
      if (data.quote) setQuotes((prev) => prev.map((q) => (q.id === id ? data.quote : q)));
      return true;
    } catch {
      setError("Network error while saving.");
      return false;
    } finally {
      setUpdating(null);
    }
  }

  const tabs: { key: "all" | QuoteStatus; label: string; count?: number }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending", count: initialPending },
    { key: "quoted", label: "Quoted" },
    { key: "accepted", label: "Accepted" },
    { key: "declined", label: "Declined" },
  ];

  const clearFilters = () => {
    setSearch(""); setCategory(""); setFrom(""); setTo("");
  };

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/10 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
            <Inbox className="w-4 h-4 text-amber-400" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm">Quote Requests</h3>
            <p className="text-[10px] text-white/40">
              {loading ? "Loading…" : `${total} request${total === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="px-4 pt-4 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setStatus(t.key)}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                status === t.key
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                  : "bg-white/[0.03] text-white/40 border border-transparent hover:text-white/70"
              }`}
            >
              {t.label}
              {t.count != null && (
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-[9px]">{t.count}</span>
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="relative lg:col-span-2">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search company, email, phone, product, or TGQ reference…"
              aria-label="Search quotes"
              className="w-full bg-black/30 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder:text-white/25 focus:border-amber-400 focus:outline-none transition-colors min-w-0"
            />
          </div>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filter by category"
              className="w-full appearance-none bg-black/30 border border-white/10 rounded-lg pl-3 pr-8 py-2 text-xs text-white focus:border-amber-400 focus:outline-none transition-colors"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c} className="bg-[#0A0A12]">{c}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              aria-label="From date"
              className="min-w-0 bg-black/30 border border-white/10 rounded-lg px-2 py-2 text-[11px] text-white focus:border-amber-400 focus:outline-none"
            />
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              aria-label="To date"
              className="min-w-0 bg-black/30 border border-white/10 rounded-lg px-2 py-2 text-[11px] text-white focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white transition-colors"
          >
            <FilterX className="w-3.5 h-3.5" /> Clear filters
          </button>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/25 px-3 py-2 text-[11px] text-red-300">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-px" />
            <span className="break-words">{error}</span>
          </div>
        )}
      </div>

      {/* ── Rows ── */}
      <div className="px-4 pb-4 mt-3">
        {loading && quotes.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
          </div>
        ) : quotes.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <Inbox className="w-8 h-8 text-white/10 mb-3" />
            <p className="text-white/40 text-sm">
              {hasFilters ? "No quotes match these filters." : `No ${status !== "all" ? status : ""} quotes yet.`}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {quotes.map((q) => {
              const open = expanded === q.id;
              const amount = q.quoted_amount ?? q.total_estimate;
              return (
                <div
                  key={q.id}
                  className={`bg-white/[0.02] border rounded-xl transition-all ${
                    open ? "border-amber-500/30 bg-white/[0.05]" : "border-white/5 hover:border-white/15"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3">
                    <button
                      onClick={() => setExpanded(open ? null : q.id)}
                      aria-expanded={open}
                      className="flex-1 min-w-0 text-left flex items-start gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <p className="text-xs font-semibold text-white break-words">{q.product_name}</p>
                          <StatusBadge status={q.status} />
                          {q.assignee && (
                            <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/50 border border-white/10 max-w-[120px] truncate">
                              <User className="w-2.5 h-2.5 shrink-0" />{q.assignee}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-x-3 gap-y-0.5 flex-wrap text-[10px] text-white/40">
                          <span className="flex items-center gap-1 min-w-0 max-w-[180px]">
                            <Building2 className="w-3 h-3 shrink-0" />
                            <span className="truncate">{q.company_name}</span>
                          </span>
                          <span>{q.quantity} units</span>
                          {q.moq_tier && <span className="text-white/30">{q.moq_tier}</span>}
                          {amount != null && (
                            <span className="text-amber-400 font-semibold">
                              {q.quoted_amount != null ? "Quoted " : ""}{formatKsh(amount)}
                            </span>
                          )}
                          <span>{new Date(q.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-white/25 shrink-0 mt-0.5 transition-transform ${open ? "rotate-180" : ""}`} />
                    </button>

                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                      <button
                        onClick={() => copy(`wa-${q.id}`, whatsappDeepLink(q.phone, q.company_name, q.product_name))}
                        title="Copy WhatsApp deep link"
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg transition-all"
                      >
                        {copied === `wa-${q.id}` ? <Check className="w-3 h-3" /> : <MessageCircle className="w-3 h-3" />}
                        <span className="hidden sm:inline">WhatsApp</span>
                      </button>
                      <button
                        onClick={() => copy(`sum-${q.id}`, buildQuoteSummary(q))}
                        title="Copy quote summary"
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-[10px] font-bold rounded-lg transition-all"
                      >
                        {copied === `sum-${q.id}` ? <Check className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                        <span className="hidden sm:inline">Summary</span>
                      </button>
                      {NEXT_ACTIONS[q.status].map((a) => (
                        <button
                          key={a.to}
                          onClick={() => patchQuote(q.id, { status: a.to })}
                          disabled={updating === q.id}
                          className={`flex items-center gap-1 px-2.5 py-1.5 border text-[10px] font-bold rounded-lg transition-all disabled:opacity-50 ${a.cls}`}
                        >
                          {updating === q.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <a.icon className="w-3 h-3" />}
                          <span className="hidden md:inline">{a.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {q.customer_response && (
                    /* The other half of the loop: the client answered from
                       their portal, so ops sees it without having to ask. */
                    <div
                      className="mx-3 mb-3 rounded-lg border px-3 py-2.5"
                      style={{
                        borderColor:
                          q.customer_response.decision === "accept"
                            ? "rgba(16,185,129,0.28)"
                            : "rgba(248,113,113,0.28)",
                        background:
                          q.customer_response.decision === "accept"
                            ? "rgba(16,185,129,0.08)"
                            : "rgba(248,113,113,0.08)",
                      }}
                    >
                      <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                        <MessageCircle className="h-3 w-3" />
                        Client{" "}
                        {q.customer_response.decision === "accept" ? "accepted" : "declined"}
                        {q.customer_response.responded_by && (
                          <span className="font-normal normal-case tracking-normal text-white/40">
                            from {q.customer_response.responded_by}
                          </span>
                        )}
                      </p>
                      {q.customer_response.message && (
                        <p className="mt-1.5 text-[11px] leading-relaxed text-white/70 whitespace-pre-wrap break-words">
                          {q.customer_response.message}
                        </p>
                      )}
                    </div>
                  )}

                  {open && (
                    <div className="px-3 pb-3">
                      <QuoteDetail
                        quote={q}
                        saving={updating === q.id}
                        onSave={async (id, patch) => { await patchQuote(id, patch); }}
                      />
                    </div>
                  )}
                </div>
              );
            })}

            {total > 20 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => fetchQuotes({ status, pageNum: page - 1 })}
                  disabled={page === 1 || loading}
                  className="px-3 py-1.5 text-[11px] text-white/40 hover:text-white disabled:opacity-30 transition-colors"
                >
                  ← Prev
                </button>
                <span className="text-[10px] text-white/30">Page {page} of {Math.ceil(total / 20)}</span>
                <button
                  onClick={() => fetchQuotes({ status, pageNum: page + 1 })}
                  disabled={quotes.length < 20 || loading}
                  className="px-3 py-1.5 text-[11px] text-white/40 hover:text-white disabled:opacity-30 transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
