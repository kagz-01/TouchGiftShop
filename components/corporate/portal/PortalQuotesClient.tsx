"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, X, ChevronDown, MessageCircle, AlertCircle } from "lucide-react";
import { statusLabel, statusColour, canRespond } from "@/lib/portal-status";

const money = (n: number) => `KES ${Math.round(n).toLocaleString("en-KE")}`;

const date = (v: string | null) =>
  v ? new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : null;

type Quote = {
  id: string;
  reference: string | null;
  product_name: string;
  quantity: number;
  category: string | null;
  moq_tier: string | null;
  total_estimate: number | null;
  quoted_amount: number | null;
  valid_until: string | null;
  status: string;
  created_at: string;
  quoted_at: string | null;
  customer_response: { decision?: string; message?: string | null; responded_by?: string } | null;
  customer_responded_at: string | null;
};

export default function PortalQuotesClient({
  canSeeMoney,
  accountName,
}: {
  canSeeMoney: boolean;
  accountName: string;
}) {
  const params = useSearchParams();
  const [quotes, setQuotes] = useState<Quote[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(params.get("open"));
  const [filter, setFilter] = useState<string>(params.get("status") ?? "all");
  const [busy, setBusy] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(
        `/api/corporate/portal/quotes${filter === "all" ? "" : `?status=${filter}`}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not load your quotes");
      setQuotes(data.quotes ?? []);
    } catch (e) {
      setQuotes([]);
      setError(e instanceof Error ? e.message : "Could not load your quotes");
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  async function respond(quote: Quote, decision: "accept" | "decline") {
    if (!quote.reference) return;
    setBusy(quote.reference);
    setRowError(null);
    try {
      const res = await fetch(`/api/corporate/portal/quotes/${quote.reference}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, message: note.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not record your response");
      setQuotes((prev) =>
        (prev ?? []).map((q) =>
          q.reference === quote.reference
            ? {
                ...q,
                status: decision === "accept" ? "accepted" : "declined",
                customer_response: data.quote.customer_response,
                customer_responded_at: data.quote.customer_responded_at,
              }
            : q
        )
      );
      setNote("");
    } catch (e) {
      setRowError(e instanceof Error ? e.message : "Could not record your response");
    } finally {
      setBusy(null);
    }
  }

  const tabs = [
    { key: "all", label: "All" },
    { key: "pending", label: "With our team" },
    { key: "quoted", label: "Needs you" },
    { key: "accepted", label: "Accepted" },
    { key: "declined", label: "Declined" },
  ];

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold leading-tight">Quotes</h1>
        <p className="mt-1.5 text-sm text-[color:var(--portal-text-muted)]">
          Every request {accountName} has sent, with the pricing we quoted back.
        </p>
      </header>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className="min-h-9 rounded-lg px-3 py-2 text-xs transition-colors"
            style={{
              background: filter === t.key ? "var(--portal-accent-tint)" : "transparent",
              color: filter === t.key ? "var(--portal-accent)" : "var(--portal-text-muted)",
              fontWeight: filter === t.key ? 600 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {rowError && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm"
          style={{ background: "var(--portal-stop-tint)", color: "var(--portal-stop)" }}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span className="break-words">{rowError}</span>
        </div>
      )}

      {error ? (
        <div className="portal-card p-8 text-center">
          <AlertCircle className="mx-auto h-5 w-5" style={{ color: "var(--portal-stop)" }} />
          <h2 className="font-display mt-3 text-lg font-bold">{error}</h2>
          <button
            onClick={load}
            className="mt-4 rounded-xl border px-4 py-2 text-sm font-medium"
            style={{ borderColor: "var(--portal-border)", color: "var(--portal-text-muted)" }}
          >
            Try again
          </button>
        </div>
      ) : quotes === null ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="portal-card h-20 animate-pulse" style={{ opacity: 0.5 - i * 0.15 }} />
          ))}
        </div>
      ) : quotes.length === 0 ? (
        <div
          className="rounded-2xl border p-8 text-center"
          style={{ background: "var(--portal-surface-2)", borderColor: "var(--portal-border-soft)" }}
        >
          <h2 className="font-display text-lg font-bold">Nothing here yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[color:var(--portal-text-muted)]">
            {filter === "all"
              ? "When you request pricing, it will appear here with a reference you can quote back to us."
              : "No quotes with that status right now."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {quotes.map((q) => {
            const status = {
              label: statusLabel(q.status),
              colour: statusColour(q.status),
              canRespond: canRespond(q.status),
            };
            const isOpen = open === (q.reference ?? q.id);
            const amount = q.quoted_amount ?? q.total_estimate;
            const expired = q.valid_until ? new Date(q.valid_until).getTime() < Date.now() : false;

            return (
              <li key={q.id} className="portal-card overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : q.reference ?? q.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-[color:var(--portal-surface-2)]"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{q.product_name}</span>
                    <span className="mt-0.5 block text-xs text-[color:var(--portal-text-faint)]">
                      {q.reference ?? "Reference pending"} · {q.quantity} units
                      {q.category ? ` · ${q.category}` : ""}
                    </span>
                  </span>

                  {canSeeMoney && amount != null && (
                    <span className="hidden text-sm tabular-nums text-[color:var(--portal-text-muted)] sm:block">
                      {q.quoted_amount != null ? money(amount) : `~${money(amount)}`}
                    </span>
                  )}

                  <span className="portal-status shrink-0 justify-end" style={{ color: status.colour }}>
                    {status.label}
                  </span>

                  <ChevronDown
                    className={`h-4 w-4 flex-shrink-0 text-[color:var(--portal-text-faint)] transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isOpen && (
                  <div className="border-t px-5 py-5" style={{ borderColor: "var(--portal-border-soft)" }}>
                    <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                      <Field label="Reference" value={q.reference ?? "—"} mono />
                      <Field label="Requested" value={date(q.created_at) ?? "—"} />
                      <Field label="Quantity" value={`${q.quantity} units`} />
                      {q.moq_tier && <Field label="Bulk tier" value={q.moq_tier} />}
                      {q.valid_until && (
                        <Field
                          label="Valid until"
                          value={date(q.valid_until) ?? "—"}
                          tone={expired ? "var(--portal-stop)" : undefined}
                          note={expired ? "This quote has expired — ask us to refresh it" : undefined}
                        />
                      )}
                      {canSeeMoney && (
                        <>
                          {q.total_estimate != null && (
                            <Field label="Your estimate" value={money(q.total_estimate)} />
                          )}
                          {q.quoted_amount != null && (
                            <Field label="Our quote" value={money(q.quoted_amount)} />
                          )}
                        </>
                      )}
                    </dl>

                    {q.customer_response?.message && (
                      <p className="mt-5 border-l-2 pl-4 text-sm leading-relaxed text-[color:var(--portal-text-muted)]" style={{ borderColor: "var(--portal-border)" }}>
                        “{q.customer_response.message}”
                      </p>
                    )}

                    {status.canRespond && q.reference && (
                      <div className="mt-6 border-t pt-5" style={{ borderColor: "var(--portal-border-soft)" }}>
                        {q.status === "quoted" ? (
                          <>
                            <p className="text-sm leading-relaxed text-[color:var(--portal-text-muted)]">
                              Accepting confirms {canSeeMoney && q.quoted_amount != null ? money(q.quoted_amount) : "this quote"}
                              {q.valid_until ? ` and holds it until ${date(q.valid_until)}` : ""}. We will be in
                              touch to confirm delivery.
                            </p>
                            <textarea
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                              rows={2}
                              maxLength={2000}
                              placeholder="Anything we should know? (optional)"
                              className="mt-3 w-full resize-y rounded-xl border bg-transparent px-3.5 py-2.5 text-sm outline-none placeholder:text-[color:var(--portal-text-faint)]"
                              style={{ borderColor: "var(--portal-border)", color: "var(--portal-text)" }}
                            />
                            <div className="mt-4 flex flex-wrap gap-3">
                              <button
                                onClick={() => respond(q, "accept")}
                                disabled={busy === q.reference}
                                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
                                style={{ background: "var(--portal-positive)", color: "#fff" }}
                              >
                                <Check className="h-4 w-4" />
                                Accept quote
                              </button>
                              <button
                                onClick={() => respond(q, "decline")}
                                disabled={busy === q.reference}
                                className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium disabled:opacity-60"
                                style={{ borderColor: "var(--portal-border)", color: "var(--portal-text-muted)" }}
                              >
                                <X className="h-4 w-4" />
                                Not this time
                              </button>
                              <a
                                href={`https://wa.me/254183172111?text=${encodeURIComponent(
                                  `Hello TouchGift — about quote ${q.reference} for ${q.product_name}`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-2 py-2.5 text-sm"
                                style={{ color: "var(--portal-text-muted)" }}
                              >
                                <MessageCircle className="h-4 w-4" />
                                Ask a question
                              </a>
                            </div>
                          </>
                        ) : (
                          <p className="text-sm leading-relaxed text-[color:var(--portal-text-muted)]">
                            Changed your mind? Reopening puts this back in front of our team —
                            it does not cancel anything that is already being made.
                          </p>
                        )}
                      </div>
                    )}

                    {!q.reference && (
                      <p className="mt-5 text-sm text-[color:var(--portal-text-faint)]">
                        This quote predates references. Quote the product name when you contact us.
                      </p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  note,
  tone,
  mono,
}: {
  label: string;
  value: string;
  note?: string;
  tone?: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-[color:var(--portal-text-faint)]">{label}</dt>
      <dd
        className={`mt-1 text-sm ${mono ? "font-medium tracking-wide" : ""}`}
        style={{ color: tone ?? "var(--portal-text)" }}
      >
        {value}
      </dd>
      {note && <p className="mt-1 text-xs" style={{ color: "var(--portal-stop)" }}>{note}</p>}
    </div>
  );
}
