"use client";

import { useState } from "react";
import { NOTE_STYLES, type NoteStyle } from "@/lib/handwritten-note";

type HandwrittenNoteProps = {
  onNoteReady: (note: { text: string; style: NoteStyle; imageUrl?: string }) => void;
  initialText?: string;
  recipient?: string;
  occasion?: string;
};

export default function HandwrittenNote({
  onNoteReady,
  initialText = "",
  recipient = "someone special",
  occasion = "just because",
}: HandwrittenNoteProps) {
  const [mode, setMode] = useState<"generate" | "custom" | null>(null);
  const [noteText, setNoteText] = useState(initialText);
  const [style, setStyle] = useState<NoteStyle>("handwritten");
  const [isGenerating, setIsGenerating] = useState(false);
  const [tone, setTone] = useState<"heartfelt" | "funny" | "formal" | "romantic" | "professional">("heartfelt");
  const [language, setLanguage] = useState<"en" | "sw" | "sheng">("en");

  const generateNote = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "generate",
          recipient,
          occasion,
          tone,
          language,
        }),
      });
      const data = await res.json();
      setNoteText(data.text);
      setMode("custom"); // Switch to edit mode after generation
    } catch {
      setNoteText("Something went wrong. Please try again or write your own note.");
    } finally {
      setIsGenerating(false);
    }
  };

  const confirmNote = () => {
    onNoteReady({ text: noteText, style });
  };

  return (
    <div className="bg-white rounded-2xl border border-surface-border overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-surface-border">
        <h3 className="font-display font-bold flex items-center gap-2">
          <span className="text-xl">✍️</span>
          Handwritten Note
        </h3>
        <p className="text-xs text-brand-muted mt-1">Add a personal touch to your gift</p>
      </div>

      {/* Mode selection */}
      {mode === null && (
        <div className="p-5 space-y-3">
          <button
            onClick={() => setMode("generate")}
            className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-brand/5 to-brand/10 rounded-xl border border-brand/20 hover:border-brand/40 transition-all text-left group"
          >
            <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              🤖
            </div>
            <div>
              <p className="font-semibold text-sm">AI generates a note for me</p>
              <p className="text-xs text-brand-muted">Tell me the vibe and I&apos;ll write something heartfelt</p>
            </div>
          </button>

          <button
            onClick={() => setMode("custom")}
            className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-gold/5 to-gold/10 rounded-xl border border-gold/20 hover:border-gold/40 transition-all text-left group"
          >
            <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              ✏️
            </div>
            <div>
              <p className="font-semibold text-sm">I&apos;ll write my own note</p>
              <p className="text-xs text-brand-muted">Type your message and we&apos;ll make it look handwritten</p>
            </div>
          </button>
        </div>
      )}

      {/* AI Generation options */}
      {mode === "generate" && !noteText && (
        <div className="p-5 space-y-4">
          {/* Tone */}
          <div>
            <label className="text-xs font-semibold text-brand-muted mb-2 block">Tone</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "heartfelt" as const, label: "Heartfelt", icon: "💕" },
                { id: "funny" as const, label: "Funny", icon: "😂" },
                { id: "romantic" as const, label: "Romantic", icon: "🥰" },
                { id: "formal" as const, label: "Formal", icon: "🎩" },
                { id: "professional" as const, label: "Professional", icon: "💼" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    tone === t.id
                      ? "bg-brand text-white"
                      : "bg-gray-100 text-brand-muted hover:bg-brand/10"
                  }`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="text-xs font-semibold text-brand-muted mb-2 block">Language</label>
            <div className="flex gap-2">
              {[
                { id: "en" as const, label: "English" },
                { id: "sw" as const, label: "Kiswahili" },
                { id: "sheng" as const, label: "Sheng" },
              ].map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLanguage(l.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    language === l.id
                      ? "bg-brand text-white"
                      : "bg-gray-100 text-brand-muted hover:bg-brand/10"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generateNote}
            disabled={isGenerating}
            className="w-full py-3 bg-gradient-to-r from-brand to-brand-light text-white rounded-xl font-semibold text-sm hover:shadow-ribbon transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </span>
            ) : (
              "Generate Note ✨"
            )}
          </button>
        </div>
      )}

      {/* Edit / Custom text */}
      {mode && (
        <div className="p-5 space-y-4">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Write your note here..."
            rows={4}
            className="w-full bg-gray-50 border border-surface-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors resize-none"
            maxLength={300}
          />
          <p className="text-xs text-brand-muted text-right">{noteText.length}/300</p>

          {/* Style selection */}
          <div>
            <label className="text-xs font-semibold text-brand-muted mb-2 block">Handwriting Style</label>
            <div className="grid grid-cols-2 gap-2">
              {NOTE_STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    style === s.id
                      ? "border-brand bg-brand/5"
                      : "border-surface-border hover:border-brand/30"
                  }`}
                >
                  <span className="text-lg">{s.icon}</span>
                  <p className="text-xs font-semibold mt-1">{s.label}</p>
                  <p className="text-[10px] text-brand-muted">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {noteText && (
            <div className="bg-gradient-to-br from-[#FDF8F4] to-[#FFF5F0] rounded-xl p-6 border border-gold/10">
              <p
                className="text-lg leading-relaxed text-brand-deep"
                style={{
                  fontFamily: style === "handwritten" ? "'Caveat', cursive"
                    : style === "elegant" ? "'Dancing Script', cursive"
                    : style === "playful" ? "'Patrick Hand', cursive"
                    : "'Great Vibes', cursive",
                }}
              >
                {noteText}
              </p>
              <p className="text-right text-sm text-brand/60 mt-4">— with love ♥</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => { setMode(null); setNoteText(""); }}
              className="px-4 py-3 bg-gray-100 text-brand-muted rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={confirmNote}
              disabled={!noteText.trim()}
              className="flex-1 py-3 bg-gradient-to-r from-gold to-gold-light text-brand-deep rounded-xl font-semibold text-sm hover:shadow-gold transition-all disabled:opacity-50"
            >
              Use This Note ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
