"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SECTION_IDS } from "@/lib/corporate-journeys";
import { TOUCHLINE_BRIDGE } from "@/lib/corporate-merch";
import { ArrowUpRight } from "lucide-react";

/**
 * Sticky section tabs with scroll-spy.
 *
 * Scroll-spy rather than true tab-switching on purpose: this is a landing page,
 * and hiding sections behind tabs would put the use cases, the range and the
 * TouchLine handoff in separate DOM states — worse for sharing a deep link,
 * worse for search, and it breaks the back button. The tabs look and behave
 * like tabs but every section stays on one scrollable page.
 *
 * The TouchLine exit lives in the bar itself (doc item 1: "Need bulk /
 * uniforms / events? → TouchLine") because that is the moment someone realises
 * they are in the wrong place for their job.
 */
export default function CorporateSectionTabs() {
  const [active, setActive] = useState<string>(SECTION_IDS[0].id);
  const [stuck, setStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  /* Highlight whichever section owns the upper third of the viewport. */
  useEffect(() => {
    const sections = SECTION_IDS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );
    if (!sections.length) return;

    const onScroll = () => {
      const line = window.scrollY + window.innerHeight * 0.33;
      let current = sections[0].id;
      for (const el of sections) {
        if (el.offsetTop <= line) current = el.id;
      }
      // Bottom of the page means the last section is the active one, otherwise
      // a short trailing section can never win the highlight.
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 80) {
        current = sections[sections.length - 1].id;
      }
      setActive(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /* Shadow the bar once it detaches from the flow. */
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { rootMargin: "-72px 0px 0px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const go = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: el.offsetTop - 72,
      behavior: reduce ? "auto" : "smooth",
    });
    // Keep the hash in sync so the section is linkable, without letting the
    // browser's own jump scroll twice.
    window.history.replaceState(null, "", `#${id}`);
  }, []);

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" className="h-px" />
      <nav
        aria-label="Corporate sections"
        className={`sticky top-0 z-30 transition-shadow duration-300 ${
          stuck ? "shadow-[0_6px_24px_rgba(0,0,0,0.25)]" : ""
        }`}
        style={{ background: "var(--corp-header-bg)", backdropFilter: "blur(20px)" }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1 py-2">
            {/* Tabs scroll; the TouchLine exit is pinned outside the scroller.
                Measured at 412px: the full tab row is ~621px wide, so with the
                exit inside the scroller it sat off-screen by default — the one
                control that hands work to TouchLine is the one nobody would
                ever have found. */}
            <div className="relative flex-1 min-w-0">
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide -mx-1 px-1">
                {SECTION_IDS.map((s) => {
                  const isActive = active === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => go(s.id)}
                      aria-current={isActive ? "true" : undefined}
                      className={`shrink-0 whitespace-nowrap px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                        isActive
                          ? "text-[color:var(--corp-accent-soft)]"
                          : "text-[color:var(--corp-text-muted)] hover:text-[color:var(--corp-text)]"
                      }`}
                      style={
                        isActive
                          ? { background: "color-mix(in srgb, var(--corp-accent) 14%, transparent)" }
                          : undefined
                      }
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
              {/* Fade so it's obvious the row continues past the edge. */}
              <div
                aria-hidden
                className="pointer-events-none absolute right-0 top-0 bottom-0 w-8"
                style={{ background: "linear-gradient(to right, transparent, var(--corp-header-bg))" }}
              />
            </div>

            <span aria-hidden className="w-px h-4 bg-[color:var(--corp-border)] shrink-0" />

            <a
              href={TOUCHLINE_BRIDGE.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Need uniforms, banners or signage? Browse TouchLine"
              className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg border border-dashed border-[color:var(--corp-border-str)] text-[color:var(--corp-text-muted)] hover:text-[color:var(--corp-text)] hover:border-[color:var(--corp-accent)] transition-colors"
            >
              <span className="hidden sm:inline whitespace-nowrap">Need bulk?</span>
              <span className="sm:hidden whitespace-nowrap">Bulk</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </nav>
    </>
  );
}
