"use client";

import { useState, useRef, useEffect } from "react";
import { useMood, MOODS, type Mood, getCustomPalette, CUSTOM_PALETTE_PRESETS } from "@/context/MoodContext";
import { cn } from "@/lib/utils";
import { ChevronDown, Sparkles, Plus, Check, Trash2 } from "lucide-react";
import { usePathname } from "next/navigation";
import EmojiPicker, { Theme } from "emoji-picker-react";

export default function VibeSelector() {
  const { mood, moodMeta, customMoods, activeCustomId, setMood, setCustomMood, setActiveCustomId, removeCustomMood } = useMood();
  const [open, setOpen] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [customLabel, setCustomLabel] = useState("");
  const [customTagline, setCustomTagline] = useState("");
  const [customEmoji, setCustomEmoji] = useState("✨");
  const [customPaletteIndex, setCustomPaletteIndex] = useState<number | null>(null);
  const [justChanged, setJustChanged] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const pathname = usePathname();
  const isCorporate = pathname?.startsWith("/corporate");

  const visibleMoods = MOODS.filter((m) => {
    if (isCorporate) {
      return ["corporate", "corp_appreciation", "corp_milestone", "corp_welcome"].includes(m.id);
    }
    return ["default", "romantic", "apology", "celebratory", "corporate"].includes(m.id);
  });

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowCustomInput(false);
        setShowEmojiPicker(false);
      }
    }
    if (open) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  // Focus input when custom panel opens
  useEffect(() => {
    if (showCustomInput) inputRef.current?.focus();
  }, [showCustomInput]);

  function handleSelect(id: Mood) {
    setMood(id);
    setOpen(false);
    setShowCustomInput(false);
    setShowEmojiPicker(false);
    flash();
  }

  function handleSelectCustom(id: string) {
    setActiveCustomId(id);
    setOpen(false);
    setShowCustomInput(false);
    setShowEmojiPicker(false);
    flash();
  }

  function handleCustomSubmit() {
    if (!customLabel.trim()) return;
    
    // Use explicitly selected palette, or fallback to keyword guess
    const palette = customPaletteIndex !== null 
      ? CUSTOM_PALETTE_PRESETS[customPaletteIndex] 
      : getCustomPalette(customLabel);

    setCustomMood(
      customLabel.trim(), 
      customEmoji, 
      customTagline.trim() || undefined,
      palette.gradient,
      palette.glow
    );
    
    setOpen(false);
    setShowCustomInput(false);
    setCustomLabel("");
    setCustomTagline("");
    setCustomPaletteIndex(null);
    flash();
  }

  function flash() {
    setJustChanged(true);
    setTimeout(() => setJustChanged(false), 1200);
  }

  // Derive preview palette
  const previewPalette = customPaletteIndex !== null 
    ? CUSTOM_PALETTE_PRESETS[customPaletteIndex] 
    : (customLabel ? getCustomPalette(customLabel) : null);
  const isDefault = mood === "default";

  return (
    <div ref={ref} className="relative flex-shrink-0" id="vibe-selector">
      {/* Trigger pill */}
      <button
        onClick={() => setOpen((p) => !p)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Switch gifting vibe"
        className={cn(
          "group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
          "transition-all duration-300 border hover:shadow-lg active:scale-95 select-none",
          justChanged && "scale-105",
          isDefault
            ? "bg-brand/8 border-brand/20 text-brand hover:bg-brand/14"
            : "border-transparent text-white shadow-md",
        )}
        style={!isDefault ? {
          background: "var(--mood-gradient, linear-gradient(135deg,#9b1b5a,#d4a853))",
          boxShadow: "0 4px 16px var(--mood-glow, rgba(155,27,90,0.3))",
        } : undefined}
      >
        <Sparkles className="w-3 h-3 opacity-70 group-hover:opacity-100 transition-opacity" />
        <span className="hidden sm:inline leading-none">{moodMeta.emoji} {moodMeta.label}</span>
        <span className="sm:hidden leading-none">{moodMeta.emoji}</span>
        <ChevronDown className={cn("w-3 h-3 opacity-60 transition-transform duration-200", open && "rotate-180")} />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          aria-label="Gifting vibes"
          className={cn(
            "absolute right-0 top-full mt-2 z-[200] w-72 rounded-2xl border shadow-2xl overflow-hidden",
            "backdrop-blur-xl",
          )}
          style={{
            background: "color-mix(in srgb, var(--bg-base) 85%, transparent)",
            borderColor: "var(--surface-border)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.25), 0 0 0 1px var(--surface-border)",
          }}
        >
          {/* Header */}
          <div className="px-4 pt-4 pb-2">
            <p className="text-[10px] uppercase tracking-widest font-bold text-theme-muted">
              What&apos;s your gifting vibe?
            </p>
          </div>

          {/* Preset moods */}
          <ul className="px-2 pb-1 space-y-0.5">
            {visibleMoods.map((m) => {
              const active = mood === m.id;
              return (
                <li key={m.id}>
                  <button
                    role="option"
                    aria-selected={active}
                    onClick={() => handleSelect(m.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left",
                      "transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
                      active ? "bg-brand/10 ring-1 ring-brand/30" : "hover:bg-white/5",
                    )}
                  >
                    <span className="text-xl leading-none select-none">{m.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-semibold leading-tight", active ? "text-brand" : "text-theme-heading")}>
                        {m.label}
                      </p>
                      <p className="text-[10px] text-theme-muted truncate leading-tight mt-0.5">
                        {m.tagline}
                      </p>
                    </div>
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />}
                  </button>
                </li>
              );
            })}
            
            {/* Saved Custom Moods */}
            {customMoods.map((m) => {
              const active = mood === "custom" && activeCustomId === m.id;
              return (
                <li key={m.id}>
                  <div className={cn(
                    "w-full flex items-center justify-between gap-1 px-3 py-2.5 rounded-xl transition-all duration-200",
                    active ? "bg-brand/10 ring-1 ring-brand/30" : "hover:bg-white/5",
                  )}>
                    <button
                      role="option"
                      aria-selected={active}
                      onClick={() => handleSelectCustom(m.id)}
                      className="flex-1 flex items-center gap-3 text-left hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <span className="text-xl leading-none select-none">{m.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-semibold leading-tight", active ? "text-brand" : "text-theme-heading")}>
                          {m.label}
                        </p>
                        {m.tagline && (
                          <p className="text-[10px] text-theme-muted truncate leading-tight mt-0.5">
                            {m.tagline}
                          </p>
                        )}
                      </div>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeCustomMood(m.id); }}
                      className="p-1.5 rounded-md hover:bg-red-500/10 text-theme-muted hover:text-red-400 transition-colors"
                      title="Delete custom vibe"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Divider */}
          <div className="mx-4 my-2 border-t" style={{ borderColor: "var(--surface-border)" }} />

          {/* Custom mood section */}
          {!showCustomInput ? (
            <div className="px-2 pb-3">
              <button
                onClick={() => setShowCustomInput(true)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left",
                  "transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:bg-white/5 text-theme-heading",
                )}
              >
                <div className="w-6 flex justify-center">
                  <Plus className="w-4 h-4 opacity-70" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-tight">Create New Vibe</p>
                  <p className="text-[10px] text-theme-muted truncate leading-tight mt-0.5">Mix your own colors and emojis</p>
                </div>
              </button>
            </div>
          ) : (
            <div className="px-3 pb-4 space-y-3">
              <p className="text-[10px] uppercase tracking-widest font-bold text-theme-muted pt-1">
                Name your vibe
              </p>

              {/* Emoji + label input row */}
              <div className="flex gap-2">
                {/* Emoji picker button */}
                <div className="relative">
                  <button
                    onClick={() => setShowEmojiPicker((p) => !p)}
                    className="w-12 h-10 rounded-xl text-center text-xl border flex items-center justify-center hover:bg-white/5 transition-colors"
                    style={{
                      background: "var(--surface)",
                      borderColor: "var(--surface-border)",
                    }}
                    title="Pick Emoji"
                  >
                    {customEmoji}
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute top-full left-0 mt-2 z-[300] shadow-2xl">
                      <EmojiPicker 
                        theme={Theme.AUTO} 
                        onEmojiClick={(e) => {
                          setCustomEmoji(e.emoji);
                          setShowEmojiPicker(false);
                          inputRef.current?.focus();
                        }} 
                      />
                    </div>
                  )}
                </div>
                {/* Label input */}
                <input
                  ref={inputRef}
                  type="text"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
                  placeholder='e.g. "For Mum", "Boss Birthday"'
                  maxLength={30}
                  aria-label="Vibe name"
                  className="flex-1 h-10 px-3 rounded-xl text-sm border outline-none focus:ring-2"
                  style={{
                    background: "var(--surface)",
                    borderColor: "var(--surface-border)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              {/* Tagline input row */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTagline}
                  onChange={(e) => setCustomTagline(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
                  placeholder='Description (e.g. "Q3 Kickoff!")'
                  maxLength={50}
                  aria-label="Vibe description"
                  className="w-full h-9 px-3 rounded-xl text-xs border outline-none focus:ring-2"
                  style={{
                    background: "var(--surface)",
                    borderColor: "var(--surface-border)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              {/* Palette selection swatches */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-theme-muted">
                    Color Theme
                  </p>
                  {isCorporate && customPaletteIndex === null && (
                    <span className="text-[9px] text-gold italic">Auto-detecting...</span>
                  )}
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
                  {CUSTOM_PALETTE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCustomPaletteIndex(idx)}
                      className={cn(
                        "w-8 h-8 rounded-full flex-shrink-0 snap-center transition-transform hover:scale-110",
                        customPaletteIndex === idx ? "ring-2 ring-offset-2 ring-brand scale-110" : "ring-1 ring-white/10"
                      )}
                      style={{ 
                        background: preset.gradient
                      }}
                      aria-label="Select color palette"
                    />
                  ))}
                </div>
              </div>

              {/* Preview Bar */}
              {previewPalette && (
                <div
                  className="h-1.5 rounded-full w-full transition-all duration-500"
                  style={{ background: previewPalette.gradient, boxShadow: `0 0 10px ${previewPalette.glow}` }}
                />
              )}

              {/* Action row */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCustomInput(false)}
                  className="flex-1 h-9 rounded-xl text-xs font-semibold border transition-all hover:bg-white/5"
                  style={{ borderColor: "var(--surface-border)", color: "var(--text-primary)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCustomSubmit}
                  disabled={!customLabel.trim()}
                  className="flex-1 h-9 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-95"
                  style={{
                    background: previewPalette?.gradient ?? "var(--color-brand)",
                    boxShadow: previewPalette ? `0 4px 12px ${previewPalette.glow}` : undefined,
                  }}
                >
                  <Check className="w-3.5 h-3.5" /> Set Vibe
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-2 border-t" style={{ borderColor: "var(--surface-border)" }}>
            <p className="text-[9px] text-theme-muted leading-relaxed">
              Your vibe personalises colours, copy & curation across the entire platform.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
