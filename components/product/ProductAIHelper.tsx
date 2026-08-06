"use client";

import { useState } from "react";
import Link from "next/link";

type Props = {
  productName: string;
  productId: string;
};

export default function ProductAIHelper({ productName, productId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateNote = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "generate",
          recipient: "someone special",
          occasion: "just because",
          tone: "heartfelt",
          language: "en",
        }),
      });
      const data = await res.json();
      setNoteText(data.text);
    } catch {
      setNoteText("Wishing you all the happiness in the world. You deserve it!");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Help me decide */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-center gap-2 py-3 bg-brand/5 hover:bg-brand/10 border border-brand/20 rounded-xl text-sm font-medium text-brand transition-all"
      >
        <span className="text-lg">🤖</span>
        Need help? Ask Zawadi about this gift
      </button>

      {isOpen && (
        <div className="bg-gradient-warm rounded-2xl p-4 border border-surface-border space-y-3 animate-pop">
          <p className="text-xs text-brand-muted">
            Ask anything about <strong>{productName}</strong> — who it&apos;s good for, what occasion, or get a note written.
          </p>
          <div className="flex gap-2">
            <Link
              href={`/gift-finder?prefill=Tell me about ${encodeURIComponent(productName)}`}
              className="flex-1 py-2.5 bg-brand text-white rounded-xl text-xs font-semibold text-center hover:bg-brand-dark transition-colors"
            >
              Chat with Zawadi
            </Link>
            <button
              onClick={generateNote}
              disabled={isGenerating}
              className="flex-1 py-2.5 bg-gold text-brand-deep rounded-xl text-xs font-semibold hover:bg-gold-light transition-colors disabled:opacity-50"
            >
              {isGenerating ? "Generating..." : "Generate a Note ✍️"}
            </button>
          </div>

          {noteText && (
            <div className="bg-white rounded-xl p-3 border border-surface-border">
              <p className="text-[10px] text-gold font-semibold mb-1">Note for this gift:</p>
              <p className="text-sm italic text-brand-deep">&ldquo;{noteText}&rdquo;</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => navigator.clipboard.writeText(noteText)}
                  className="text-[10px] text-brand hover:underline"
                >
                  Copy
                </button>
                <Link
                  href={`/checkout?productId=${productId}&note=${encodeURIComponent(noteText)}`}
                  className="text-[10px] text-gold hover:underline"
                >
                  Attach to order →
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
