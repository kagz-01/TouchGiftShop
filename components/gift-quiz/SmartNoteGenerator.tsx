"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type QuizContext = {
  recipient: string;
  occasion: string;
  interests: string[];
};

type SmartNoteGeneratorProps = {
  quizContext?: QuizContext;
  productName?: string;
  onNoteSelect: (note: string) => void;
};

const TONES = [
  { id: "heartfelt", label: "Heartfelt", emoji: "💕" },
  { id: "funny", label: "Funny", emoji: "😂" },
  { id: "formal", label: "Formal", emoji: "🎩" },
  { id: "romantic", label: "Romantic", emoji: "🌹" },
  { id: "warm", label: "Warm", emoji: "☀️" },
];

const LANGUAGES = [
  { id: "en", label: "English" },
  { id: "sw", label: "Kiswahili" },
  { id: "sheng", label: "Sheng" },
];

export default function SmartNoteGenerator({
  quizContext,
  productName,
  onNoteSelect,
}: SmartNoteGeneratorProps) {
  const [tone, setTone] = useState("heartfelt");
  const [language, setLanguage] = useState("en");
  const [generatedNote, setGeneratedNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [customNote, setCustomNote] = useState("");
  const [mode, setMode] = useState<"ai" | "custom">("ai");

  const recipientLabel =
    quizContext?.recipient === "her" ? "her"
    : quizContext?.recipient === "him" ? "him"
    : quizContext?.recipient === "couple" ? "the couple"
    : quizContext?.recipient === "baby" ? "the little one"
    : quizContext?.recipient === "parents" ? "you"
    : "them";

  const occasionLabel = quizContext?.occasion?.replace("-", " ") || "special occasion";

  const generateNote = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "generate",
          tone,
          language,
          recipient: recipientLabel,
          occasion: occasionLabel,
          productName,
        }),
      });
      const data = await res.json();
      setGeneratedNote(data.text || data.note || "");
    } catch {
      // Fallback note
      const fallbacks: Record<string, Record<string, string>> = {
        en: {
          heartfelt: `Wishing you all the joy and happiness on this ${occasionLabel}. You deserve the world! 🎁`,
          funny: `I got you this because I love you... but mostly because I couldn't find the receipt for the other thing. 😂`,
          formal: `With warmest wishes on this ${occasionLabel}. May this gift bring you joy.`,
          romantic: `Every moment with you is a gift. This is just a small token of how much you mean to me. ❤️`,
          warm: `Just a little something to say you're thought of and appreciated. Happy ${occasionLabel}! ☀️`,
        },
        sw: {
          heartfelt: `Nakutakia furaha na heri tele katika ${occasionLabel} hii. Ustahili ulimwengu wote! 🎁`,
          funny: `Nikununua hii kwa sababu nakupenda... lakini zaidi kwa sababu sikupata risiti ya kitu kingine. 😂`,
          formal: `Na mawazo yetu joto katika ${occasionLabel} hii. Tafadhali pokea zawadi hii kwa furaha.`,
          romantic: `Kila wakati pamoja nawe ni zawadi. Hii ni ishara ndogo ya jinsi unavyoni meaningful. ❤️`,
          warm: `Ni kitu kidogo tu kusema unakumbukwa na kupostiwa. Furaha ${occasionLabel}! ☀️`,
        },
        sheng: {
          heartfelt: `Nikutakia furaha yote na baraka kwa ${occasionLabel} hii. U deserve the best bana! 🎁`,
          funny: `Nikiletea hii kwa sababu nakupenda... lakini zaidi ya kupata receipt ya ingine. 😂`,
          formal: `Na mawazo joto kwa ${occasionLabel} hii. Pokea zawadi hii kwa furaha.`,
          romantic: `Kila saa na wewe ni zawadi. Hii ni ishara ndogo ya jinsi unavyonihusu. ❤️`,
          warm: `Kitu kidogo tu kusema unakumbukwa. Happy ${occasionLabel} bana! ☀️`,
        },
      };
      setGeneratedNote(fallbacks[language]?.[tone] || fallbacks.en.heartfelt);
    } finally {
      setLoading(false);
    }
  };

  const activeNote = mode === "ai" ? generatedNote : customNote;

  return (
    <div className="bg-white rounded-2xl border border-surface-border p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold flex items-center gap-2">
          <span className="text-xl">💌</span>
          Gift Note
        </h3>
        <div className="flex bg-surface rounded-lg p-0.5">
          <button
            onClick={() => setMode("ai")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              mode === "ai" ? "bg-white text-brand shadow-sm" : "text-brand-muted"
            )}
          >
            🤖 AI Generate
          </button>
          <button
            onClick={() => setMode("custom")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              mode === "custom" ? "bg-white text-brand shadow-sm" : "text-brand-muted"
            )}
          >
            ✍️ Write Own
          </button>
        </div>
      </div>

      {mode === "ai" ? (
        <>
          {/* Tone selector */}
          <div>
            <p className="text-xs font-medium text-brand-muted mb-2">Tone</p>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    tone === t.id
                      ? "bg-brand text-white"
                      : "bg-surface text-brand-muted hover:bg-brand/10"
                  )}
                >
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language selector */}
          <div>
            <p className="text-xs font-medium text-brand-muted mb-2">Language</p>
            <div className="flex gap-2">
              {LANGUAGES.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLanguage(l.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    language === l.id
                      ? "bg-brand text-white"
                      : "bg-surface text-brand-muted hover:bg-brand/10"
                  )}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={generateNote}
            disabled={loading}
            className="w-full px-4 py-2.5 rounded-xl bg-brand text-white font-semibold text-sm hover:bg-brand-deep transition-all disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Note ✨"}
          </button>
        </>
      ) : (
        <textarea
          value={customNote}
          onChange={(e) => setCustomNote(e.target.value)}
          placeholder="Write your heartfelt message..."
          rows={4}
          maxLength={300}
          className="w-full px-3 py-2.5 rounded-xl border border-surface-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand resize-none"
        />
      )}

      {/* Preview */}
      {activeNote && (
        <div className="bg-gradient-to-br from-brand/5 to-gold/5 rounded-xl p-5 border border-brand/10">
          <p className="text-xs font-semibold text-brand mb-2">Preview</p>
          <p className="text-sm text-brand-deep leading-relaxed font-[Caveat] text-lg">
            {activeNote}
          </p>
          {mode === "custom" && (
            <p className="text-[10px] text-brand-muted mt-2 text-right">
              {customNote.length}/300
            </p>
          )}
        </div>
      )}

      {/* Use note button */}
      {activeNote && (
        <button
          onClick={() => onNoteSelect(activeNote)}
          className="w-full px-4 py-2.5 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition-all"
        >
          Use This Note ✓
        </button>
      )}
    </div>
  );
}
