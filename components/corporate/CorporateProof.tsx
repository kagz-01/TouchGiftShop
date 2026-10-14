"use client";

import { useEffect, useState } from "react";
import { Building2, FileText, Package, Users } from "lucide-react";

/**
 * PROOF — real numbers, or an honest empty state.
 *
 * This section exists because the hero it replaced claimed "2,400+ companies
 * served, 98% on-time, KES 50M+ deployed, 4.9 stars" and not one of those
 * figures was readable from any table. Everything here comes from
 * /api/corporate/proof, which returns counts only.
 *
 * Note what is NOT here: revenue, fulfilment and on-time rates. There is no
 * corporate_orders table, so we cannot count deliveries or money — and an
 * "on-time %" with no delivery data behind it is exactly the kind of number
 * this rebuild was removing. If that data ever gets stored, add the figure
 * here with its source, not in the copy.
 */

type Proof = {
  quoteRequests: number;
  bulkInquiries: number;
  companies: number;
  companiesCapped: boolean;
  recipients: number;
  unavailable?: boolean;
};

export default function CorporateProof() {
  const [data, setData] = useState<Proof | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/corporate/proof")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: Proof) => {
        if (cancelled) return;
        setData(d);
        setState("ready");
      })
      .catch(() => {
        if (cancelled) return;
        // A stats blip must never break the page. Say so rather than guess.
        setState("failed");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const n = (v: number) => v.toLocaleString("en-KE");

  return (
    <section id="proof" className="relative z-10 max-w-7xl mx-auto px-4 pt-16 pb-20 scroll-mt-20">
      <div className="text-center mb-10">
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Where we actually are</h2>
        <p className="text-[color:var(--corp-text-muted)] text-sm max-w-lg mx-auto">
          Counted from our own records. If it&apos;s small, it&apos;s small.
        </p>
      </div>

      {state === "loading" ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl animate-pulse"
              style={{ background: "var(--corp-surface)", border: "1px solid var(--corp-border)" }}
            />
          ))}
        </div>
      ) : state === "failed" || !data ? (
        <div
          className="rounded-2xl border border-dashed p-8 text-center"
          style={{ borderColor: "var(--corp-border-str)" }}
        >
          <p className="text-[color:var(--corp-text-muted)] text-sm">
            Our live numbers didn&apos;t load just now. Ask us and we&apos;ll tell you where we are.
          </p>
        </div>
      ) : data.companies === 0 && data.quoteRequests === 0 && data.bulkInquiries === 0 ? (
        /* Empty state, not zeros dressed up as proof. */
        <div
          className="rounded-2xl border border-dashed p-8 text-center max-w-xl mx-auto"
          style={{ borderColor: "var(--corp-border-str)" }}
        >
          <p className="font-bold text-[color:var(--corp-text)] mb-2">You&apos;d be our first</p>
          <p className="text-[color:var(--corp-text-muted)] text-sm leading-relaxed">
            Corporate gifting is new here and the record is genuinely empty. Send us a
            quote request and we&apos;ll reply with real numbers about what we can do
            for your team — no projections.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: Building2, label: "Companies enquired", value: n(data.companies) },
            { icon: FileText, label: "Quote requests", value: n(data.quoteRequests) },
            { icon: Package, label: "Bulk inquiries", value: n(data.bulkInquiries) },
            { icon: Users, label: "Recipients covered", value: n(data.recipients) },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border p-5 flex flex-col items-center gap-2 text-center"
              style={{ background: "var(--corp-surface)", borderColor: "var(--corp-border)" }}
            >
              <s.icon className="w-5 h-5" style={{ color: "var(--corp-accent-soft)" }} />
              <span className="font-display text-3xl font-bold text-[color:var(--corp-text)]">
                {s.value}
              </span>
              <span className="text-[11px] text-[color:var(--corp-text-muted)] leading-tight">
                {s.label}
              </span>
            </div>
          ))}
          {data.companiesCapped && (
            <p className="col-span-2 lg:col-span-4 text-center text-[11px] text-[color:var(--corp-text-muted)]">
              Counts are sampled from the most recent {n(5000)} records.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
