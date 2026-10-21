"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check, X, AlertCircle, Loader2, ReceiptText, Ban, Undo2, FileWarning, Send, ChevronDown,
} from "lucide-react";
import { formatKsh } from "@/lib/utils";

type InvoiceStatus = "draft" | "issued" | "paid" | "void";

type Invoice = {
  id: string;
  invoice_number: string;
  invoice_slug: string;
  status: InvoiceStatus;
  corporate_order_id: string;
  buyer_name: string;
  buyer_tax_id: string | null;
  buyer_email: string | null;
  total_amount: number;
  subtotal: number;
  vat_amount: number;
  vat_registered: boolean;
  payment_terms_days: number;
  issued_at: string | null;
  due_at: string | null;
  void_reason: string | null;
  corporate_invoice_lines: { line_no: number }[];
};

/** sellerReadiness() — the only part the UI acts on is what is missing. */
type Seller = { missing: string[] };

type CreditNote = {
  credit_note_number: string;
  total_amount: number;
};

/** PATCH /api/corporate/orders/[id] returns early on a no-op move, so the
 *  invoicing fields are absent rather than null when nothing changed. */
type DispatchResult = {
  order?: { id: string; status: string };
  unchanged?: boolean;
  childrenUpdated?: number;
  invoice?: { invoice_number: string; created: boolean } | null;
  error?: string;
};

const TERMS = [0, 7, 14, 30, 60];

const CREDIT_REASONS = [
  { value: "duplicate", label: "Duplicate — issued twice by mistake" },
  { value: "incorrect_amount", label: "Incorrect amount" },
  { value: "goods_returned", label: "Goods returned" },
  { value: "service_not_delivered", label: "Service not delivered" },
  { value: "other", label: "Other" },
];

const STATUS: Record<InvoiceStatus, { label: string; cls: string }> = {
  draft:  { label: "Draft",  cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  issued: { label: "Issued", cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  paid:   { label: "Paid",   cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  void:   { label: "Void",   cls: "bg-red-500/10 text-red-400 border-red-500/20" },
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const FIELD =
  "w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/25 focus:border-amber-400 focus:outline-none";
const LABEL = "block text-[10px] text-white/40 mb-1.5";
const BTN =
  "w-full flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all disabled:opacity-40";
const BTN_PRIMARY = `${BTN} bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/25 text-amber-400`;
const BTN_GHOST = `${BTN} bg-white/5 hover:bg-white/10 border border-white/10 text-white/60`;
const BTN_DANGER = `${BTN} bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400`;

const fmtDate = (v: string | null) =>
  v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

/**
 * Staff-side invoicing for corporate orders.
 *
 * The panel is deliberately shaped around why an invoice is *missing* rather
 * than around the happy path. Invoicing runs automatically on dispatch, so the
 * two failures ops actually hits are "the seller details are unset so dispatch
 * quietly skipped it" and "the order has an invoice and it is wrong" — and
 * neither of those has anything to do with the button on this card.
 */
export default function InvoiceOpsPanel() {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [recent, setRecent] = useState<Invoice[]>([]);
  const [orderId, setOrderId] = useState("");
  const [orderInput, setOrderInput] = useState("");
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loaded, setLoaded] = useState(true);
  const [query, setQuery] = useState("");
  const [showRecent, setShowRecent] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const [terms, setTerms] = useState("0");
  const [ovrName, setOvrName] = useState("");
  const [ovrTaxId, setOvrTaxId] = useState("");
  const [ovrAddress, setOvrAddress] = useState("");
  const [ovrEmail, setOvrEmail] = useState("");
  const [voidReason, setVoidReason] = useState("");
  const [voidNote, setVoidNote] = useState("");
  const [creditOpen, setCreditOpen] = useState(false);
  const [creditReason, setCreditReason] = useState("duplicate");
  const [creditNoteText, setCreditNoteText] = useState("");
  const [creditAmount, setCreditAmount] = useState("");
  const [creditResult, setCreditResult] = useState<string | null>(null);

  useEffect(() => {
    /* Unfiltered on purpose: this doubles as the order picker. There is no
       corporate order list endpoint to page through, but every invoice carries
       the order it belongs to, which is a real set of ids to work from. */
    fetch("/api/corporate/invoices", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { invoices?: Invoice[]; seller?: Seller }) => {
        setSeller(d.seller ?? { missing: [] });
        setRecent(d.invoices ?? []);
      })
      .catch(() => setSeller({ missing: [] }));
  }, []);

  const refresh = useCallback(async (id: string) => {
    const res = await fetch(`/api/corporate/invoices?order_id=${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Could not read that order");
    setSeller(data.seller ?? { missing: [] });
    const list: Invoice[] = data.invoices ?? [];
    /* An order can hold a voided invoice and the replacement issued against it,
       so the live one is the newest non-void — and the void is only the newest
       when nothing ever replaced it. */
    setInvoice(list.find((i) => i.status !== "void") ?? list[0] ?? null);
  }, []);

  async function openOrder(raw: string) {
    const id = raw.trim().toLowerCase();
    setError(null);
    setDone(null);
    setCreditResult(null);
    /* Checked here because the column is a uuid: PostgREST answers a bad value
       with "malformed input syntax", which tells an operator nothing. */
    if (!UUID_RE.test(id)) {
      setError("That is not an order id. Copy the uuid from the order record.");
      return;
    }
    setBusy("open");
    setLoaded(false);
    setOrderId(id);
    try {
      await refresh(id);
      setOrderInput("");
      setLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read that order");
    } finally {
      setBusy(null);
    }
  }

  function clearOrder() {
    setOrderId("");
    setOrderInput("");
    setInvoice(null);
    setLoaded(true);
    setVoidReason("");
    setVoidNote("");
    setCreditResult(null);
    setError(null);
    setDone(null);
  }

  async function raise(draft: boolean) {
    setBusy(draft ? "draft" : "raise");
    setError(null);
    setDone(null);
    const override: Record<string, string> = {};
    if (ovrName.trim()) override.name = ovrName.trim();
    if (ovrTaxId.trim()) override.taxId = ovrTaxId.trim();
    if (ovrAddress.trim()) override.address = ovrAddress.trim();
    if (ovrEmail.trim()) override.email = ovrEmail.trim();
    try {
      const res = await fetch("/api/corporate/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          draft,
          payment_terms_days: Number(terms),
          ...(Object.keys(override).length ? { buyer_override: override } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not raise the invoice");
      await refresh(orderId);
      setDone(
        data.draft
          ? `Draft ${data.invoice.invoice_number} raised. It stays internal until the seller details are settled.`
          : data.emailed
          ? `${data.invoice.invoice_number} issued and emailed to ${data.emailedTo}.`
          : `${data.invoice.invoice_number} issued.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not raise the invoice");
    } finally {
      setBusy(null);
    }
  }

  async function dispatch() {
    setBusy("dispatch");
    setError(null);
    setDone(null);
    try {
      const res = await fetch(`/api/corporate/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "dispatched" }),
      });
      const data: DispatchResult = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not move that order to dispatched");
      await refresh(orderId);
      if (data.unchanged) {
        setDone("That order was already dispatched — nothing changed.");
      } else if (data.invoice?.created) {
        setDone(`Dispatched. Invoice ${data.invoice.invoice_number} was raised automatically.`);
      } else if (data.invoice) {
        setDone(`Dispatched. This order already had invoice ${data.invoice.invoice_number}.`);
      } else {
        /* The documented quiet path: dispatch is never blocked by missing seller
           details, it just does not produce a document. */
        setDone(
          "Dispatched, but no invoice was raised — the seller details are not configured yet."
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not move that order to dispatched");
    } finally {
      setBusy(null);
    }
  }

  async function voidInvoice() {
    setBusy("void");
    setError(null);
    setDone(null);
    try {
      const res = await fetch("/api/corporate/invoices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_id: invoice!.id,
          reason: voidReason.trim(),
          ...(voidNote.trim() ? { note: voidNote.trim() } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not void this invoice");
      setVoidReason("");
      setVoidNote("");
      await refresh(orderId);
      setDone(`${data.invoice.invoice_number} is void. It keeps its number — numbers are never reused.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not void this invoice");
    } finally {
      setBusy(null);
    }
  }

  async function raiseCreditNote() {
    setBusy("credit");
    setError(null);
    setDone(null);
    setCreditResult(null);
    const amount = creditAmount.trim();
    try {
      const res = await fetch("/api/corporate/invoices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_id: invoice!.id,
          reason: creditReason,
          ...(creditNoteText.trim() ? { reason_note: creditNoteText.trim() } : {}),
          /* Left out entirely for the full credit — the server defaults the
             amount to the whole invoice, and sending 0 is not the same thing. */
          ...(amount ? { amount: Number(amount) } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not raise a credit note");
      const note: CreditNote = data.creditNote;
      setCreditAmount("");
      setCreditNoteText("");
      setCreditResult(
        `Credit note ${note.credit_note_number} raised — ${formatKsh(Number(note.total_amount))} credited against ${invoice!.invoice_number}.`
      );
      await refresh(orderId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not raise a credit note");
    } finally {
      setBusy(null);
    }
  }

  const recentOrders = useMemo(() => {
    const rows = new Map<string, { id: string; label: string; number: string; status: InvoiceStatus }>();
    for (const inv of recent) {
      if (rows.has(inv.corporate_order_id)) continue;
      rows.set(inv.corporate_order_id, {
        id: inv.corporate_order_id,
        label: inv.buyer_name,
        number: inv.invoice_number,
        status: inv.status,
      });
    }
    const all = [...rows.values()];
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (r) => r.id.includes(q) || r.label.toLowerCase().includes(q) || r.number.toLowerCase().includes(q)
    );
  }, [recent, query]);

  const sellerBlocked = (seller?.missing.length ?? 0) > 0;
  const status = invoice ? STATUS[invoice.status] : null;

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
      <h3 className="text-xs font-bold text-white mb-1 flex items-center gap-2">
        <ReceiptText className="w-4 h-4 text-amber-400" /> Invoicing
      </h3>
      <p className="text-[10px] text-white/35 mb-4 leading-relaxed">
        An invoice is raised automatically when a corporate order moves to dispatched. Everything
        below is for the cases automation cannot cover.
      </p>

      {sellerBlocked && (
        <div className="mb-4 rounded-lg bg-amber-500/[0.07] border border-amber-500/20 px-3 py-2.5">
          <p className="flex items-start gap-1.5 text-[11px] font-bold text-amber-400">
            <FileWarning className="w-3.5 h-3.5 shrink-0 mt-px" /> Seller details incomplete
          </p>
          <p className="mt-1 text-[10px] text-white/45 leading-relaxed">
            Invoicing will not raise automatically until these are set. Dispatched orders will go out
            with no invoice and no warning to anyone:
          </p>
          <p className="mt-1.5 font-mono text-[10px] text-amber-400/90 break-all">
            {seller!.missing.join(", ")}
          </p>
          <p className="mt-1.5 text-[10px] text-white/30 leading-relaxed">
            These are the registered entity details on a tax document — the trading brand is not
            enough.
          </p>
        </div>
      )}

      {!orderId ? (
        <div className="space-y-3">
          <div>
            <label htmlFor="invoice-order-id" className={LABEL}>Corporate order id</label>
            <input
              id="invoice-order-id"
              value={orderInput}
              onChange={(e) => setOrderInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") openOrder(orderInput); }}
              placeholder="00000000-0000-0000-0000-000000000000"
              className={`${FIELD} font-mono`}
            />
          </div>
          <button
            onClick={() => openOrder(orderInput)}
            disabled={busy === "open" || !orderInput.trim()}
            className={BTN_PRIMARY}
          >
            {busy === "open" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Load order
          </button>
          <p className="text-[10px] text-white/30 leading-relaxed">
            There is no corporate order list API to search — the only order route takes a status
            change — so paste an id. Recent invoiced orders are below.
          </p>

          {recent.length > 0 && (
            <div className="border-t border-white/10 pt-3">
              <button
                onClick={() => setShowRecent((v) => !v)}
                className="w-full flex items-center gap-1.5 text-[10px] text-white/40 hover:text-white/70 transition-colors"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showRecent ? "rotate-180" : ""}`} />
                Recent invoiced orders ({recentOrders.length})
              </button>

              {showRecent && (
                <div className="mt-2.5">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search buyer, invoice number or order id"
                    aria-label="Search recent orders"
                    className={`${FIELD} mb-2`}
                  />
                  <ul className="max-h-48 overflow-y-auto space-y-1">
                    {recentOrders.length === 0 ? (
                      <li className="text-[10px] text-white/30 py-2">No match.</li>
                    ) : (
                      recentOrders.map((r) => (
                        <li key={r.id}>
                          <button
                            onClick={() => openOrder(r.id)}
                            disabled={busy === "open"}
                            className="w-full text-left rounded-lg px-2.5 py-2 bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 transition-all disabled:opacity-40"
                          >
                            <span className="flex items-center gap-2">
                              <span className="text-[11px] text-white/75 truncate flex-1">{r.label}</span>
                              <span className={`shrink-0 text-[9px] px-1.5 py-0.5 rounded border ${STATUS[r.status].cls}`}>
                                {STATUS[r.status].label}
                              </span>
                            </span>
                            <span className="mt-0.5 block font-mono text-[9px] text-white/25 truncate">
                              {r.number} · {r.id.slice(0, 8)}
                            </span>
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
            <span className="text-[10px] text-white/40">Order</span>
            <span className="font-mono text-[10px] text-white/60 truncate flex-1">{orderId}</span>
            <button
              onClick={clearOrder}
              aria-label="Clear selected order"
              className="text-white/25 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {!loaded ? (
            <div className="flex items-center gap-2 py-4 text-[11px] text-white/40">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Reading order…
            </div>
          ) : !invoice ? (
            <div className="space-y-3">
              <p className="text-[11px] text-white/45 leading-relaxed">
                No invoice on this order yet. Dispatching it raises one automatically — the manual
                button is for proforma requests and admin corrections.
              </p>

              <button
                onClick={() => dispatch()}
                disabled={busy === "dispatch"}
                className={BTN_GHOST}
              >
                {busy === "dispatch" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Dispatch order &amp; raise invoice
              </button>

              <div className="border-t border-white/10 pt-3 space-y-2.5">
                <div>
                  <label htmlFor="invoice-terms" className={LABEL}>Payment terms</label>
                  <select
                    id="invoice-terms"
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    className={`${FIELD} appearance-none`}
                  >
                    {TERMS.map((d) => (
                      <option key={d} value={d} className="bg-[#0A0A12]">
                        {d === 0 ? "Due on receipt" : `Net ${d} days`}
                      </option>
                    ))}
                  </select>
                </div>

                <p className="text-[10px] text-white/30 leading-relaxed">
                  Buyer override is for what the client&rsquo;s finance team actually requires, which
                  is routinely not what we hold on the account. Leave blank to use the account.
                </p>

                <div>
                  <label htmlFor="ovr-name" className={LABEL}>Buyer name</label>
                  <input id="ovr-name" value={ovrName} onChange={(e) => setOvrName(e.target.value)} className={FIELD} placeholder="As it should read on the invoice" />
                </div>
                <div>
                  <label htmlFor="ovr-tax" className={LABEL}>Tax ID / VAT number</label>
                  <input id="ovr-tax" value={ovrTaxId} onChange={(e) => setOvrTaxId(e.target.value)} className={FIELD} placeholder="P123456789B" />
                </div>
                <div>
                  <label htmlFor="ovr-addr" className={LABEL}>Address</label>
                  <input id="ovr-addr" value={ovrAddress} onChange={(e) => setOvrAddress(e.target.value)} className={FIELD} placeholder="Registered billing address" />
                </div>
                <div>
                  <label htmlFor="ovr-email" className={LABEL}>Email</label>
                  <input id="ovr-email" type="email" value={ovrEmail} onChange={(e) => setOvrEmail(e.target.value)} className={FIELD} placeholder="accounts@company.co.ke" />
                </div>

                <button
                  onClick={() => raise(false)}
                  disabled={busy !== null || sellerBlocked}
                  className={BTN_PRIMARY}
                >
                  {busy === "raise" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ReceiptText className="w-3.5 h-3.5" />}
                  Raise invoice
                </button>

                {sellerBlocked && (
                  <button
                    onClick={() => raise(true)}
                    disabled={busy !== null}
                    className={BTN_GHOST}
                  >
                    {busy === "draft" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileWarning className="w-3.5 h-3.5" />}
                    Raise as draft instead
                  </button>
                )}
                {sellerBlocked && (
                  <p className="text-[10px] text-white/30 leading-relaxed">
                    A draft never leaves the building — it exists so the layout and arithmetic can be
                    checked before the registered entity details are settled.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs font-bold text-white truncate">{invoice.invoice_number}</p>
                  <p className="mt-0.5 text-[10px] text-white/35 truncate">{invoice.buyer_name}</p>
                </div>
                {status && (
                  <span className={`shrink-0 text-[9px] font-bold px-2 py-1 rounded-full border ${status.cls}`}>
                    {status.label}
                  </span>
                )}
              </div>

              <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {[
                  ["Total", formatKsh(Number(invoice.total_amount))],
                  ["Issued", fmtDate(invoice.issued_at)],
                  ["Due", fmtDate(invoice.due_at)],
                  ["Lines", String(invoice.corporate_invoice_lines?.length ?? 0)],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[10px] text-white/30">{k}</dt>
                    <dd className="text-[11px] text-white/75">{v}</dd>
                  </div>
                ))}
              </dl>

              {invoice.vat_amount > 0 && (
                <p className="text-[10px] text-white/30 leading-relaxed">
                  Subtotal {formatKsh(Number(invoice.subtotal))} + VAT {formatKsh(Number(invoice.vat_amount))}
                  {invoice.vat_registered ? "" : " (not VAT registered — this is not a tax invoice)"}
                </p>
              )}

              {invoice.status === "void" && invoice.void_reason && (
                <p className="text-[10px] text-red-300/80 leading-relaxed">Voided — {invoice.void_reason}</p>
              )}

              <a
                href={`/corporate/portal/invoices/${invoice.invoice_slug}`}
                target="_blank"
                rel="noreferrer"
                className="block text-center py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-xs font-bold rounded-lg transition-all"
              >
                Preview invoice
              </a>

              {(invoice.status === "issued" || invoice.status === "paid") && (
                <>
                  <button
                    onClick={() => setCreditOpen((v) => !v)}
                    aria-expanded={creditOpen}
                    className="w-full flex items-center justify-center gap-2 text-[10px] text-white/40 hover:text-white/70 transition-colors"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    Raise credit note
                    <ChevronDown className={`w-3 h-3 transition-transform ${creditOpen ? "rotate-180" : ""}`} />
                  </button>

                  {creditOpen && (
                    <form
                      onSubmit={(e) => { e.preventDefault(); raiseCreditNote(); }}
                      className="space-y-2.5 border-t border-white/10 pt-3"
                    >
                      <p className="text-[10px] text-white/30 leading-relaxed">
                        A credit note is a separate document that stands on its own. Leaving the amount
                        blank credits the whole invoice; the server refuses anything more than is left.
                      </p>
                      <div>
                        <label htmlFor="credit-reason" className={LABEL}>Reason</label>
                        <select
                          id="credit-reason"
                          value={creditReason}
                          onChange={(e) => setCreditReason(e.target.value)}
                          className={`${FIELD} appearance-none`}
                        >
                          {CREDIT_REASONS.map((r) => (
                            <option key={r.value} value={r.value} className="bg-[#0A0A12]">{r.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="credit-note" className={LABEL}>Note (optional)</label>
                        <input
                          id="credit-note"
                          maxLength={500}
                          value={creditNoteText}
                          onChange={(e) => setCreditNoteText(e.target.value)}
                          placeholder="What went wrong, for the client's finance team"
                          className={FIELD}
                        />
                      </div>
                      <div>
                        <label htmlFor="credit-amount" className={LABEL}>Amount (optional)</label>
                        <input
                          id="credit-amount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={creditAmount}
                          onChange={(e) => setCreditAmount(e.target.value)}
                          placeholder={`Full total — ${formatKsh(Number(invoice.total_amount))}`}
                          className={FIELD}
                        />
                      </div>
                      <button type="submit" disabled={busy !== null} className={BTN_GHOST}>
                        {busy === "credit" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Undo2 className="w-3.5 h-3.5" />}
                        Raise credit note
                      </button>
                    </form>
                  )}
                </>
              )}

              {invoice.status === "issued" && (
                <form
                  onSubmit={(e) => { e.preventDefault(); voidInvoice(); }}
                  className="space-y-2.5 border-t border-white/10 pt-3"
                >
                  <p className="flex items-start gap-1.5 text-[10px] text-white/35 leading-relaxed">
                    <Ban className="w-3.5 h-3.5 shrink-0 mt-px text-red-400" />
                    Voiding withdraws the invoice and keeps its number. It cannot be undone, and a
                    paid invoice has to be credited instead.
                  </p>
                  <div>
                    <label htmlFor="void-reason" className={LABEL}>Reason (required)</label>
                    <input
                      id="void-reason"
                      required
                      minLength={3}
                      maxLength={200}
                      value={voidReason}
                      onChange={(e) => setVoidReason(e.target.value)}
                      placeholder="Issued against the wrong order"
                      className={FIELD}
                    />
                  </div>
                  <div>
                    <label htmlFor="void-note" className={LABEL}>Internal note (optional)</label>
                    <input id="void-note" maxLength={500} value={voidNote} onChange={(e) => setVoidNote(e.target.value)} className={FIELD} />
                  </div>
                  <button type="submit" disabled={busy !== null || voidReason.trim().length < 3} className={BTN_DANGER}>
                    {busy === "void" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
                    Void this invoice
                  </button>
                </form>
              )}

              {invoice.status === "paid" && (
                <p className="text-[10px] text-white/30 leading-relaxed">
                  Paid invoices are not voidable — the money has moved, so it takes a credit note and a
                  refund. The void action is not offered because the server will refuse it.
                </p>
              )}

              {(invoice.status === "draft" || invoice.status === "void") && (
                <p className="text-[10px] text-white/30 leading-relaxed">
                  Nothing further to do on this invoice.
                  {invoice.status === "void" && " Raise a replacement from the order panel if it was withdrawn by mistake."}
                </p>
              )}
            </div>
          )}
        </>
      )}

      {creditResult && (
        <p className="mt-3 flex items-start gap-1.5 text-[11px] text-emerald-300">
          <Check className="w-3.5 h-3.5 shrink-0 mt-px" /> {creditResult}
        </p>
      )}

      {error && (
        <p className="mt-3 flex items-start gap-1.5 text-[11px] text-red-300">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-px" /> {error}
        </p>
      )}
      {done && (
        <p className="mt-3 flex items-start gap-1.5 text-[11px] text-emerald-300">
          <Check className="w-3.5 h-3.5 shrink-0 mt-px" /> {done}
        </p>
      )}
    </div>
  );
}