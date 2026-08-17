"use client";

import React, { useEffect, useRef, useState } from "react";
import COUNTRY_OPTIONS from "./country-codes";

type Option = { code: string; label: string };

export default function CountrySelect({
  value,
  onChange,
  options = COUNTRY_OPTIONS,
  ariaLabel = "country code",
  className = "",
}: {
  value: string;
  onChange: (code: string) => void;
  options?: Option[];
  ariaLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = options.filter((o) => {
    const q = query.toLowerCase();
    return (
      o.code.toLowerCase().includes(q) || o.label.toLowerCase().includes(q) || `${o.label} ${o.code}`.toLowerCase().includes(q)
    );
  });

  const handleSelect = (code: string) => {
    onChange(code);
    setOpen(false);
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => { setOpen((s) => !s); setQuery(""); setTimeout(() => inputRef.current?.focus(), 30); }}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border border-black/6 bg-white text-sm ${className}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
      >
        <span className="text-sm font-medium">{value}</span>
        <svg className="w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-56 bg-white border border-black/6 rounded-lg shadow-lg">
          <div className="p-2">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country or code"
              className="w-full rounded-lg border border-black/6 px-2 py-1 text-sm"
              aria-label="Search country"
            />
          </div>
          <ul role="listbox" className="max-h-60 overflow-auto p-1 space-y-1">
            {filtered.map((o) => (
              <li key={o.code}>
                <button
                  type="button"
                  onClick={() => handleSelect(o.code)}
                  className="w-full text-left px-3 py-1 rounded-md hover:bg-gray-50 text-sm"
                >
                  <span className="font-medium">{o.label}</span>
                  <span className="ml-2 text-gray-500">{o.code}</span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && <li className="px-3 py-2 text-sm text-gray-500">No matches</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
