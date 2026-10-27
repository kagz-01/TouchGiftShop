"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  CORPORATE_PACKS,
  MAX_PACK_QTY,
  MIN_PACK_QTY,
  VOLUME_BANDS,
  calculatePack,
  clampQty,
  type PackId,
} from "@/lib/corporate-packs";
import { formatKsh } from "@/lib/utils";

/**
 * The pack calculator.
 *
 * This replaces the old "tiers with no contents" block. It does three things a
 * buyer actually needs before they will talk to sales:
 *
 *   1. Show what is in each pack and what it costs per box.
 *   2. Let them move the quantity and see the volume price immediately.
 *   3. Give them a document they can take to finance without a meeting —
 *      a print-ready proforma — or send the same calculation to the quote desk.
 *
 * Every number is derived from lib/corporate-packs.ts; the UI never does its
 * own arithmetic, so the proforma and the on-screen total cannot drift apart.
 */

type QuoteState = "idle" | "sending" | "sent" | "error";

function makeProformaRef() {
  const year = new Date().getFullYear();
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PRO-${year}-${suffix}`;
}

export default function PackCalculator({
  vatRegistered,
  vatRate,
}: {
  vatRegistered: boolean;
  vatRate: number;
}) {
  const [packId, setPackId] = useState<PackId>("celebration");
  const [qty, setQty] = useState(50);
  const [showQuote, setShowQuote] = useState(false);
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [quoteState, setQuoteState] = useState<QuoteState>("idle");
  const [reference, setReference] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pack = CORPORATE_PACKS.find((p) => p.id === packId) ?? CORPORATE_PACKS[1];
  const quote = useMemo(() => calculatePack(pack, qty), [pack, qty]);
  const totalLabel = quote.subtotal;

  function openProforma() {
    const params = new URLSearchParams({
      tier: pack.id,
      qty: String(quote.qty),
      ref: makeProformaRef(),
      print: "1",
    });
    window.open(`/corporate/proforma?${params.toString()}`, "_blank", "noopener,noreferrer");
  }

  async function submitQuote(e: React.FormEvent) {
    e.preventDefault();
    setQuoteState("sending");
    setError(null);
    setReference(null);

    try {
      const res = await fetch("/api/corporate/quote-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: `pack:${pack.id}`,
          productName: `${pack.name} Pack`,
          qty: quote.qty,
          company,
          email,
          phone: phone || undefined,
          notes:
            notes ||
            `Pack calculator: ${quote.qty} × ${pack.name} @ ${formatKsh(quote.unitPrice)} per box.`,
          unitPrice: quote.unitPrice,
          total: quote.subtotal,
          moqTier: pack.id,
          category: "corporate-packs",
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        reference?: string | null;
      };

      if (!res.ok) {
        setError(data.error ?? "Could not send the request. Please try again.");
        setQuoteState("error");
        return;
      }

      setReference(data.reference ?? null);
      setQuoteState("sent");
    } catch {
      setError("Could not reach the quote desk. Please try again.");
      setQuoteState("error");
    }
  }

  return (
    <section
      id="packs"
      className="relative z-10 max-w-7xl mx-auto px-4 pt-16 pb-24 scroll-mt-20"
    >
      <div className="flex flex-col md:flex-row md:items-end gap-6 mb-10">
        <div className="flex-1 min-w-0">
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 mb-4"
            style={{ background: "var(--corp-surface)", borderColor: "var(--corp-border)" }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--corp-accent-soft)" }} />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[color:var(--corp-text-muted)]">
              Packs, not vague tiers
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[color:var(--corp-text)] mb-3">
            What your budget actually buys.
          </h2>
          <p className="text-base text-[color:var(--corp-text-muted)] leading-relaxed max-w-2xl">
            Three packs, one price per box, volume pricing published up front. Move the
            quantity to see the price change — then take a proforma to finance or send it
            straight to our quote desk.
          </p>
        </div>
        <Link
          href="/corporate/vendor-pack"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-2 self-start md:self-auto rounded-xl border px-4 py-2.5 text-sm font-bold transition-colors"
          style={{
            background: "var(--corp-surface)",
            borderColor: "var(--corp-border)",
            color: "var(--corp-text)",
          }}
        >
          <FileText className="w-4 h-4" style={{ color: "var(--corp-accent-soft)" }} />
          Procurement vendor pack
        </Link>
      </div>

      {/* ── Packs ── */}
      <div
        role="radiogroup"
        aria-label="Choose a gift pack"
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        {CORPORATE_PACKS.map((p) => {
          const active = p.id === packId;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => {
                setPackId(p.id);
                if (quoteState === "sent") setQuoteState("idle");
              }}
              className="text-left rounded-3xl border p-6 transition-all focus:outline-none focus-visible:ring-2"
              style={{
                background: active ? "var(--corp-surface-2)" : "var(--corp-surface)",
                borderColor: active ? "var(--corp-accent)" : "var(--corp-border)",
                boxShadow: active ? "0 12px 40px var(--corp-glow)" : "none",
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--corp-text-muted)]">
                    {p.eyebrow}
                  </p>
                  <h3 className="font-display text-2xl font-bold text-[color:var(--corp-text)] mt-1">
                    {p.name}
                  </h3>
                </div>
                <span
                  className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border"
                  style={{
                    borderColor: active ? "var(--corp-accent)" : "var(--corp-border-str)",
                    background: active ? "var(--corp-accent)" : "transparent",
                  }}
                  aria-hidden
                >
                  {active && <Check className="h-3.5 w-3.5" style={{ color: "var(--corp-accent-text)" }} />}
                </span>
              </div>

              <p className="font-display text-3xl font-bold text-[color:var(--corp-text)]">
                {formatKsh(p.price)}
                <span className="ml-1 text-xs font-semibold text-[color:var(--corp-text-muted)]">
                  / box
                </span>
              </p>
              <p className="mt-1 text-[11px] text-[color:var(--corp-text-muted)]">
                MOQ {p.moq} boxes · {p.bestFor}
              </p>

              <p className="mt-4 text-sm leading-relaxed text-[color:var(--corp-text-muted)]">
                {p.blurb}
              </p>

              <ul className="mt-4 space-y-2">
                {p.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[13px] text-[color:var(--corp-text)]">
                    <Check
                      className="mt-0.5 h-3.5 w-3.5 shrink-0"
                      style={{ color: "var(--corp-accent-soft)" }}
                    />
                    {item}
                  </li>
                ))}
              </ul>

              <p className="mt-4 border-t pt-3 text-[11px] italic leading-relaxed text-[color:var(--corp-text-muted)]" style={{ borderColor: "var(--corp-border)" }}>
                {p.outcome}
              </p>
            </button>
          );
        })}
      </div>

      {/* ── Calculator ── */}
      <div
        className="rounded-3xl border p-5 sm:p-7"
        style={{ background: "var(--corp-surface)", borderColor: "var(--corp-border)" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6 lg:gap-10">
          {/* Controls */}
          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--corp-text-muted)]">
                  Quantity
                </p>
                <p className="text-sm text-[color:var(--corp-text-muted)] mt-0.5">
                  {MIN_PACK_QTY}–{MAX_PACK_QTY} boxes · {pack.name} pack
                </p>
              </div>
              <span
                className="rounded-full border px-3 py-1 text-[11px] font-bold"
                style={{
                  borderColor: "var(--corp-border-str)",
                  color: quote.band.pct > 0 ? "var(--corp-accent-soft)" : "var(--corp-text-muted)",
                  background: "var(--corp-surface-2)",
                }}
              >
                {quote.band.pct > 0 ? `${quote.band.pct}% volume discount` : "List price"}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="range"
                min={MIN_PACK_QTY}
                max={MAX_PACK_QTY}
                step={1}
                value={quote.qty}
                onChange={(e) => {
                  setQty(clampQty(Number(e.target.value)));
                  if (quoteState === "sent") setQuoteState("idle");
                }}
                aria-label="Number of gift boxes"
                className="h-2 w-full cursor-pointer appearance-none rounded-full"
                style={{
                  accentColor: "var(--corp-accent)",
                  background:
                    "linear-gradient(to right, var(--corp-accent) 0%, var(--corp-accent) var(--pack-fill), var(--corp-border-str) var(--pack-fill), var(--corp-border-str) 100%)",
                  ["--pack-fill" as string]: `${
                    ((quote.qty - MIN_PACK_QTY) / (MAX_PACK_QTY - MIN_PACK_QTY)) * 100
                  }%`,
                }}
              />
              <input
                type="number"
                min={MIN_PACK_QTY}
                max={MAX_PACK_QTY}
                value={quote.qty}
                onChange={(e) => {
                  setQty(clampQty(Number(e.target.value)));
                  if (quoteState === "sent") setQuoteState("idle");
                }}
                aria-label="Number of gift boxes (numeric)"
                className="w-20 rounded-lg border px-2 py-2 text-center text-sm font-bold tabular-nums text-[color:var(--corp-text)] outline-none focus:ring-2"
                style={{
                  background: "var(--corp-surface-2)",
                  borderColor: "var(--corp-border)",
                }}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {VOLUME_BANDS.map((band) => (
                <span
                  key={`${band.min}-${band.max ?? "max"}`}
                  className="rounded-full border px-2.5 py-1 text-[10px] font-semibold"
                  style={{
                    borderColor:
                      band.min === quote.band.min ? "var(--corp-accent)" : "var(--corp-border)",
                    color:
                      band.min === quote.band.min
                        ? "var(--corp-accent-soft)"
                        : "var(--corp-text-muted)",
                  }}
                >
                  {band.min}
                  {band.max ? `–${band.max}` : "+"} · {band.pct > 0 ? `${band.pct}% off` : "list"}
                </span>
              ))}
            </div>

            <div
              className="mt-5 flex items-start gap-2 rounded-xl border border-dashed p-3 text-[11px] leading-relaxed text-[color:var(--corp-text-muted)]"
              style={{ borderColor: "var(--corp-border-str)" }}
            >
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: "var(--corp-accent-soft)" }} />
              <span>
                Indicative pricing, before delivery. Branding, stock and delivery date are
                confirmed on the quote. {vatRegistered
                  ? `Prices include ${vatRate}% VAT where applicable.`
                  : "No VAT is charged."}
              </span>
            </div>
          </div>

          {/* Summary */}
          <div
            className="rounded-2xl border p-5"
            style={{ background: "var(--corp-surface-2)", borderColor: "var(--corp-border)" }}
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--corp-text-muted)]">
                  Your estimate
                </p>
                <p className="font-display text-lg font-bold text-[color:var(--corp-text)]">
                  {pack.name} × {quote.qty}
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[color:var(--corp-text-muted)]">
                {formatKsh(quote.unitPrice)} / box
              </span>
            </div>

            <dl className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-[color:var(--corp-text-muted)]">At list price</dt>
                <dd className="tabular-nums text-[color:var(--corp-text)]">
                  {formatKsh(quote.listTotal)}
                </dd>
              </div>
              {quote.savings > 0 && (
                <div className="flex items-center justify-between">
                  <dt className="text-[color:var(--corp-text-muted)]">
                    Volume saving ({quote.band.pct}%)
                  </dt>
                  <dd className="tabular-nums font-semibold" style={{ color: "var(--corp-accent-soft)" }}>
                    − {formatKsh(quote.savings)}
                  </dd>
                </div>
              )}
              <div
                className="flex items-baseline justify-between border-t pt-3"
                style={{ borderColor: "var(--corp-border)" }}
              >
                <dt className="font-bold text-[color:var(--corp-text)]">
                  Total {vatRegistered ? "(VAT incl.)" : ""}
                </dt>
                <dd className="font-display text-2xl font-bold tabular-nums text-[color:var(--corp-text)]">
                  {formatKsh(totalLabel)}
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={openProforma}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all"
                style={{
                  background: "var(--corp-accent)",
                  color: "var(--corp-accent-text)",
                  boxShadow: "0 8px 26px var(--corp-glow)",
                }}
              >
                <Download className="h-4 w-4" /> Proforma PDF
              </button>
              <button
                type="button"
                onClick={() => setShowQuote((v) => !v)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition-colors"
                style={{
                  borderColor: "var(--corp-border-str)",
                  color: "var(--corp-text)",
                  background: "var(--corp-surface)",
                }}
              >
                <Send className="h-4 w-4" /> Request quote
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-[color:var(--corp-text-muted)]">
              Proforma opens print-ready. Choose &ldquo;Save as PDF&rdquo; in the print dialog.
            </p>
          </div>
        </div>

        {/* ── Quote form ── */}
        {showQuote && (
          <div className="mt-6 border-t pt-6" style={{ borderColor: "var(--corp-border)" }}>
            {quoteState === "sent" ? (
              <div className="flex flex-col items-center text-center py-4">
                <CheckCircle2 className="h-8 w-8 mb-2" style={{ color: "var(--corp-accent-soft)" }} />
                <h3 className="font-display text-xl font-bold text-[color:var(--corp-text)]">
                  Quote request received
                </h3>
                <p className="mt-1 max-w-md text-sm text-[color:var(--corp-text-muted)]">
                  We&apos;ll reply within 2 business hours
                  {reference ? (
                    <>
                      {" "}— your reference is <strong className="text-[color:var(--corp-text)]">{reference}</strong>.
                    </>
                  ) : (
                    "."
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => setShowQuote(false)}
                  className="mt-4 rounded-xl border px-4 py-2 text-sm font-bold"
                  style={{ borderColor: "var(--corp-border-str)", color: "var(--corp-text)" }}
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={submitQuote} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Company name *"
                  className="rounded-xl border px-3 py-2.5 text-sm text-[color:var(--corp-text)] outline-none focus:ring-2"
                  style={{ background: "var(--corp-surface-2)", borderColor: "var(--corp-border)" }}
                />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Work email *"
                  className="rounded-xl border px-3 py-2.5 text-sm text-[color:var(--corp-text)] outline-none focus:ring-2"
                  style={{ background: "var(--corp-surface-2)", borderColor: "var(--corp-border)" }}
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone (optional)"
                  className="rounded-xl border px-3 py-2.5 text-sm text-[color:var(--corp-text)] outline-none focus:ring-2"
                  style={{ background: "var(--corp-surface-2)", borderColor: "var(--corp-border)" }}
                />
                <input
                  value={`${quote.qty} × ${pack.name} — ${formatKsh(quote.subtotal)}`}
                  readOnly
                  aria-label="Selected pack and total"
                  className="rounded-xl border px-3 py-2.5 text-sm font-semibold text-[color:var(--corp-text-muted)]"
                  style={{ background: "var(--corp-surface-2)", borderColor: "var(--corp-border)" }}
                />
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Branding, delivery date, recipients or anything else we should know"
                  className="md:col-span-2 rounded-xl border px-3 py-2.5 text-sm text-[color:var(--corp-text)] outline-none focus:ring-2 resize-none"
                  style={{ background: "var(--corp-surface-2)", borderColor: "var(--corp-border)" }}
                />

                {error && (
                  <p className="md:col-span-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600">
                    {error}
                  </p>
                )}

                <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p className="text-[11px] text-[color:var(--corp-text-muted)]">
                    No payment now. We confirm stock, branding and delivery first.
                  </p>
                  <button
                    type="submit"
                    disabled={quoteState === "sending"}
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold disabled:opacity-60"
                    style={{ background: "var(--corp-accent)", color: "var(--corp-accent-text)" }}
                  >
                    {quoteState === "sending" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                    {quoteState === "sending" ? "Sending…" : `Send ${quote.qty}-box request`}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
