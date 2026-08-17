"use client";

import { useState } from "react";
import { EyeOff, PhoneOff, Info } from "lucide-react";

interface SurpriseToggleProps {
  onChange?: (value: { anonymous: boolean; dontCall: boolean }) => void;
  defaultAnonymous?: boolean;
  defaultDontCall?: boolean;
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${on ? "bg-brand" : "bg-gray-200"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${on ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}

function InfoPopover({ text, open, onToggle }: { text: string; open: boolean; onToggle: () => void }) {
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); onToggle(); }}
        className="w-4 h-4 text-brand-muted hover:text-brand transition-colors"
      >
        <Info className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute left-full top-0 ml-2 z-20 w-52 bg-brand-deep text-white text-[11px] leading-relaxed rounded-xl px-3 py-2.5 shadow-lg">
          {text}
          <div className="absolute right-full top-3 w-0 h-0 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-brand-deep" />
        </div>
      )}
    </div>
  );
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
    <div className="bg-white rounded-3xl border border-black/6 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-dark to-brand px-6 py-4 flex items-center gap-3">
        <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <EyeOff className="w-4.5 h-4.5 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Surprise Safeguard</h3>
          <p className="text-[11px] text-white/65">Keep the surprise completely intact</p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Don't call toggle */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <PhoneOff className="w-3.5 h-3.5 text-brand-muted flex-shrink-0" />
              <p className="text-sm font-semibold text-brand-deep">Don&apos;t call the recipient</p>
              <InfoPopover
                text="Rider uses gate guards, reception, or the delivery landmark instead of calling. Perfect for birthday surprises."
                open={showDontCallInfo}
                onToggle={() => { setShowDontCallInfo(!showDontCallInfo); setShowAnonymousInfo(false); }}
              />
            </div>
            <p className="text-xs text-brand-muted ml-5 leading-relaxed">
              Rider uses landmarks or guards — no calls to the recipient.
            </p>
          </div>
          <Toggle on={dontCall} onToggle={() => updateDontCall(!dontCall)} />
        </div>

        <div className="border-t border-black/5" />

        {/* Anonymous toggle */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <EyeOff className="w-3.5 h-3.5 text-brand-muted flex-shrink-0" />
              <p className="text-sm font-semibold text-brand-deep">Anonymous Mode</p>
              <InfoPopover
                text="The recipient sees 'Someone sent you a gift!' — no name, no price. Your gift note still shows."
                open={showAnonymousInfo}
                onToggle={() => { setShowAnonymousInfo(!showAnonymousInfo); setShowDontCallInfo(false); }}
              />
            </div>
            <p className="text-xs text-brand-muted ml-5 leading-relaxed">
              Your name and the price are completely hidden.
            </p>
          </div>
          <Toggle on={anonymous} onToggle={() => updateAnonymous(!anonymous)} />
        </div>

        {/* Active badges */}
        {(dontCall || anonymous) && (
          <div className="flex flex-wrap gap-2 pt-1">
            {dontCall && (
              <span className="inline-flex items-center gap-1.5 bg-brand/8 text-brand text-[11px] font-semibold px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                No-contact delivery
              </span>
            )}
            {anonymous && (
              <span className="inline-flex items-center gap-1.5 bg-brand/8 text-brand text-[11px] font-semibold px-3 py-1.5 rounded-full">
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
