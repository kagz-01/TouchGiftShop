"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, MessageSquare, Package, Sparkles } from "lucide-react";
import { JOURNEYS } from "@/lib/corporate-journeys";
import { MERCH_CATEGORIES, type MerchCategory } from "@/lib/corporate-merch";

/**
 * THE RANGE — corporate's own way of presenting products.
 *
 * Deliberately NOT a copy of the storefront's presentation. The main shop
 * browses by category (columns, marquee, card grid) because a shopper already
 * knows they want a perfume. A corporate buyer doesn't — they know they need
 * to thank a client, and the product is downstream of that.
 *
 * So this is a decision funnel, not a catalogue:
 *
 *     moment  →  what's appropriate for it  →  quote
 *
 * Pick a journey, see the concrete moments inside it, see only the categories
 * that serve it, then start a quote. Nothing is shown that isn't relevant to
 * the moment currently selected.
 *
 * Real tab switching rather than scroll-spy: a buyer looking for "Team gifts"
 * wants to switch, not scroll three screens. Section-level wayfinding lives in
 * CorporateSectionTabs, which is a different job.
 */

const ALL_TAB = { id: "all", tab: "Everything", title: "The whole gift-ready range", lede: "Every category we carry for corporate, gift-framed. Uniforms, banners and signage are handled by TouchLine." } as const;

type Tab = { id: string; tab: string; title: string; lede: string; icon?: typeof Sparkles; moments?: typeof JOURNEYS[number]["moments"]; whatsappScript?: string };

export default function CorporateRangeSection() {
  const [active, setActive] = useState<string>(JOURNEYS[0].id);

  const tabs: Tab[] = useMemo(
    () => [...JOURNEYS.map((j) => ({ ...j, icon: j.icon })), ALL_TAB],
    []
  );

  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  /* Categories relevant to the selected journey, in the order the moments
     mention them so the most relevant leads. Falls back to the full range on
     the "Everything" tab.

     Matches on `key`, not `slug`: umbrellas, headwear, home and travel all
     share the `accessories` slug, so matching on slug collapsed the Team gifts
     tab to two cards. */
  const categories: MerchCategory[] = useMemo(() => {
    if (!current.moments) return MERCH_CATEGORIES;
    const ordered: MerchCategory[] = [];
    for (const moment of current.moments) {
      for (const key of moment.keys) {
        const hit = MERCH_CATEGORIES.find((c) => c.key === key);
        if (hit && !ordered.includes(hit)) ordered.push(hit);
      }
    }
    return ordered;
  }, [current]);

  const Icon = current.icon ?? Package;

  return (
    <section id="range" className="relative z-10 max-w-7xl mx-auto px-4 pt-16 pb-20 scroll-mt-20">
      {/* ── Journey tabs ── */}
      <div
        role="tablist"
        aria-label="Gift occasions"
        className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-2 mb-10 -mx-1 px-1"
      >
        {tabs.map((t) => {
          const isActive = t.id === active;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(t.id)}
              className={`shrink-0 whitespace-nowrap inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                isActive ? "text-[color:var(--corp-accent-text)]" : "text-[color:var(--corp-text-muted)] hover:text-[color:var(--corp-text)]"
              }`}
              style={
                isActive
                  ? { background: "var(--corp-accent)", boxShadow: "0 6px 20px var(--corp-glow)" }
                  : { border: "1px solid var(--corp-border)", background: "var(--corp-surface)" }
              }
            >
              {"icon" in t && t.icon ? <t.icon className="w-4 h-4" /> : <Package className="w-4 h-4" />}
              {t.tab}
            </button>
          );
        })}
      </div>

      {/* ── Active journey ── */}
      <div key={current.id} className="animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-end gap-6 mb-10">
          <div className="flex-1 min-w-0">
            <span
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-4"
              style={{ background: "var(--corp-surface)", borderColor: "var(--corp-border)" }}
            >
              <Icon className="w-3.5 h-3.5" style={{ color: "var(--corp-accent-soft)" }} />
              <span className="text-[11px] font-bold uppercase tracking-widest text-[color:var(--corp-text-muted)]">
                {current.tab}
              </span>
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[color:var(--corp-text)] mb-3">
              {current.title}
            </h2>
            <p className="text-base text-[color:var(--corp-text-muted)] leading-relaxed max-w-2xl">
              {current.lede}
            </p>
          </div>
          <Link
            href="/corporate/catalog"
            className="shrink-0 inline-flex items-center gap-2 self-start md:self-auto px-6 py-3 rounded-xl font-bold text-sm transition-all"
            style={{
              background: "var(--corp-accent)",
              color: "var(--corp-accent-text)",
              boxShadow: "0 6px 20px var(--corp-glow)",
            }}
          >
            Start a quote <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Moments — the "what am I doing" layer */}
        {current.moments && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {current.moments.map((m) => (
              <div
                key={m.label}
                className="rounded-2xl border p-5 flex flex-col"
                style={{ background: "var(--corp-surface)", borderColor: "var(--corp-border)" }}
              >
                <h3 className="font-bold text-[color:var(--corp-text)] mb-2">{m.label}</h3>
                <p className="text-[13px] text-[color:var(--corp-text-muted)] leading-relaxed flex-1">
                  {m.note}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Categories — the "what fits" layer */}
        <p className="text-[11px] font-bold uppercase tracking-widest text-[color:var(--corp-text-muted)] mb-4">
          {current.moments ? "What fits this" : `All ${MERCH_CATEGORIES.length} categories`}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories.map((c) => (
            <Link
              key={c.key}
              href={`/corporate/catalog?category=${c.slug}`}
              className="group rounded-2xl border p-4 transition-all hover:-translate-y-0.5"
              style={{ background: "var(--corp-surface)", borderColor: "var(--corp-border)" }}
            >
              <span className="text-2xl block mb-2" aria-hidden>{c.emoji}</span>
              <p className="font-bold text-sm text-[color:var(--corp-text)] truncate">{c.label}</p>
              <p className="text-[11px] text-[color:var(--corp-text-muted)] leading-snug mt-1 line-clamp-2">
                {c.blurb}
              </p>
              <span className="inline-flex items-center gap-1 mt-3 text-[10px] font-bold text-[color:var(--corp-accent-soft)] opacity-0 group-hover:opacity-100 transition-opacity">
                Browse <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>

        {current.whatsappScript && (
          <details
            className="mt-6 rounded-2xl border border-dashed p-4"
            style={{ borderColor: "var(--corp-border-str)", background: "var(--corp-surface)" }}
          >
            <summary className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-[color:var(--corp-text-muted)] hover:text-[color:var(--corp-text)] transition-colors">
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              Reply script for {current.tab.toLowerCase()} enquiries
            </summary>
            <p
              className="mt-3 text-[13px] leading-relaxed text-[color:var(--corp-text-muted)] border-l-2 pl-3"
              style={{ borderColor: "var(--corp-accent)" }}
            >
              {current.whatsappScript}
            </p>
          </details>
        )}
      </div>
    </section>
  );
}
