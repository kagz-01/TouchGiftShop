"use client";

import { useState } from "react";

interface SurpriseToggleProps {
  onChange?: (value: { anonymous: boolean; dontCall: boolean }) => void;
  defaultAnonymous?: boolean;
  defaultDontCall?: boolean;
}

export default function SurpriseToggle({
  onChange,
  defaultAnonymous = false,
  defaultDontCall = false,
}: SurpriseToggleProps) {
  const [anonymous, setAnonymous] = useState(defaultAnonymous);
  const [dontCall, setDontCall] = useState(defaultDontCall);
  const [showDontCallInfo, setShowDontCallInfo] = useState(false);
  const [showAnonymousInfo, setShowAnonymousInfo] = useState(false);

  function updateDontCall(val: boolean) {
    setDontCall(val);
    onChange?.({ anonymous, dontCall: val });
  }

  function updateAnonymous(val: boolean) {
    setAnonymous(val);
    onChange?.({ anonymous: val, dontCall });
  }

  return (
    <div className="bg-white rounded-2xl border border-surface-border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-dark to-brand px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🤫</span>
          <div>
            <h3 className="text-sm font-bold text-white">Surprise Safeguard</h3>
            <p className="text-[11px] text-white/70">Keep the surprise intact</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Don't call toggle */}
        <div className="space-y-2">
          <label className="flex items-start justify-between gap-3 cursor-pointer">
            <div className="flex-1">
              <p className="text-sm font-semibold flex items-center gap-2">
                Don&apos;t call or message the recipient
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setShowDontCallInfo(!showDontCallInfo); }}
                  className="w-4 h-4 rounded-full bg-brand/10 text-brand text-[10px] font-bold flex items-center justify-center hover:bg-brand/20 transition-colors"
                >
                  ?
                </button>
              </p>
              <p className="text-xs text-brand-muted mt-0.5">
                Riders will use gate guards, reception, or landmarks instead of calling.
              </p>
            </div>
            <button
              type="button"
              onClick={() => updateDontCall(!dontCall)}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                dontCall ? "bg-brand" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                  dontCall ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </label>

          {showDontCallInfo && (
            <div className="bg-brand/5 border border-brand/10 rounded-xl p-3 text-xs text-brand-muted space-y-1 animate-fade-in">
              <p>When enabled:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-1">
                <li>Rider won&apos;t call the recipient before arrival</li>
                <li>Rider will use the delivery landmark or pin location</li>
                <li>Perfect for birthday surprises and secret gifts</li>
              </ul>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-surface-border" />

        {/* Anonymous toggle */}
        <div className="space-y-2">
          <label className="flex items-start justify-between gap-3 cursor-pointer">
            <div className="flex-1">
              <p className="text-sm font-semibold flex items-center gap-2">
                Anonymous Mode
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setShowAnonymousInfo(!showAnonymousInfo); }}
                  className="w-4 h-4 rounded-full bg-brand/10 text-brand text-[10px] font-bold flex items-center justify-center hover:bg-brand/20 transition-colors"
                >
                  ?
                </button>
              </p>
              <p className="text-xs text-brand-muted mt-0.5">
                Hide your name and the gift price from the recipient.
              </p>
            </div>
            <button
              type="button"
              onClick={() => updateAnonymous(!anonymous)}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                anonymous ? "bg-brand" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                  anonymous ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </label>

          {showAnonymousInfo && (
            <div className="bg-brand/5 border border-brand/10 rounded-xl p-3 text-xs text-brand-muted space-y-1 animate-fade-in">
              <p>When enabled, the recipient will see:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-1">
                <li>&ldquo;Someone sent you a gift!&rdquo; instead of your name</li>
                <li>No price shown anywhere</li>
                <li>The gift note still appears with your message</li>
              </ul>
            </div>
          )}
        </div>

        {/* Active state badges */}
        {(dontCall || anonymous) && (
          <div className="flex flex-wrap gap-2 pt-1">
            {dontCall && (
              <span className="inline-flex items-center gap-1 bg-brand/10 text-brand text-[11px] font-semibold px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                No-contact delivery
              </span>
            )}
            {anonymous && (
              <span className="inline-flex items-center gap-1 bg-brand/10 text-brand text-[11px] font-semibold px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                Anonymous sender
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
