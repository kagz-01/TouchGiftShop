"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import BackToHome from "@/components/ui/BackToHome";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  recommendations?: Array<{
    product_id: string;
    name: string;
    reason: string;
    confidence: number;
  }>;
  noteSuggestion?: string;
  provider?: string;
};

const LANGUAGES = [
  { code: "auto", label: "Auto-detect", flag: "🌍" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "sw", label: "Kiswahili", flag: "🇰🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "so", label: "Soomaali", flag: "🇸🇴" },
];

export default function GiftChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Habari! 👋 I'm T-Gifter, your personal gift concierge.\n\nTell me about the gift you're looking for — who is it for, what's the occasion, and any preferences you have. I'll help you find the perfect match.\n\nOr just say hi and we'll figure it out together!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedLang, setSelectedLang] = useState("auto");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const history = messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      const res = await fetch("/api/ai/gift-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      const data = await res.json();

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
        recommendations: data.recommendations,
        noteSuggestion: data.noteSuggestion,
        provider: data.provider,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Pole sana! Connection issue. Try again? 🎁",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const QUICK_STARTS = [
    { emoji: "🎂", text: "Birthday gift for my partner" },
    { emoji: "💐", text: "Thank you gift for my teacher" },
    { emoji: "🏢", text: "Corporate hamper for 20 people" },
    { emoji: "💒", text: "Wedding gift under KSh 10,000" },
    { emoji: "✍️", text: "Help me write a note" },
    { emoji: "💝", text: "Just because — surprise someone" },
  ];

  return (
    <div className="min-h-screen bg-gradient-warm flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-surface-border sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-4 flex items-center gap-3">
          <Link href="/" className="text-brand-muted hover:text-brand">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-gradient-brand rounded-full flex items-center justify-center">
              <span className="text-xl">🎁</span>
            </div>
            <div>
              <h1 className="font-display font-bold">Gift Finder</h1>
              <p className="text-xs text-brand-muted">15+ languages supported • Powered by AI</p>
            </div>
          </div>
          {/* Language selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-surface-border rounded-xl px-3 py-2 text-sm transition-colors"
            >
              <span>{LANGUAGES.find((l) => l.code === selectedLang)?.flag || "🌍"}</span>
              <span className="hidden sm:inline text-brand-muted text-xs">{LANGUAGES.find((l) => l.code === selectedLang)?.label}</span>
              <svg className="w-3 h-3 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showLangMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-card-hover border border-surface-border py-1 z-50 w-44 max-h-60 overflow-y-auto">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { setSelectedLang(lang.code); setShowLangMenu(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-brand/5 transition-colors ${
                      selectedLang === lang.code ? "bg-brand/10 text-brand font-semibold" : "text-brand-deep"
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] md:max-w-[70%] ${
                msg.role === "user"
                  ? "bg-brand text-white rounded-2xl rounded-br-md"
                  : "bg-white text-brand-deep rounded-2xl rounded-bl-md border border-surface-border shadow-soft"
              } px-5 py-4`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                {/* Recommendations */}
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold opacity-70 mb-2">Recommended for you:</p>
                    {msg.recommendations.map((rec) => (
                      <Link
                        key={rec.product_id}
                        href={`/product/${rec.product_id}`}
                        className="block bg-white rounded-xl p-4 border border-surface-border hover:border-brand/30 hover:shadow-card transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm text-brand group-hover:text-brand-dark">{rec.name}</p>
                          <span className="text-xs bg-brand/10 text-brand px-2 py-0.5 rounded-full">
                            {Math.round(rec.confidence * 100)}% match
                          </span>
                        </div>
                        <p className="text-xs text-brand-muted mt-1">{rec.reason}</p>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Note suggestion */}
                {msg.noteSuggestion && (
                  <div className="mt-4 bg-gradient-to-br from-gold/10 to-gold/5 rounded-xl p-4 border border-gold/20">
                    <p className="text-xs font-semibold text-gold mb-2">✍️ Handwritten Note Suggestion:</p>
                    <p className="text-sm italic text-brand-deep leading-relaxed">&ldquo;{msg.noteSuggestion}&rdquo;</p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => navigator.clipboard.writeText(msg.noteSuggestion!)}
                        className="text-xs bg-gold/20 text-gold-dark px-3 py-1 rounded-full hover:bg-gold/30 transition-colors"
                      >
                        Copy note
                      </button>
                      <Link
                        href={`/gift-lab/build-hamper?note=${encodeURIComponent(msg.noteSuggestion!)}`}
                        className="text-xs bg-brand/10 text-brand px-3 py-1 rounded-full hover:bg-brand/20 transition-colors"
                      >
                        Attach to hamper →
                      </Link>
                    </div>
                  </div>
                )}

                {msg.provider && msg.role === "assistant" && (
                  <p className="text-[10px] opacity-30 mt-2 text-right">via {msg.provider}</p>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl rounded-bl-md px-5 py-4 border border-surface-border shadow-soft">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-brand/30 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-brand/30 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-brand/30 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick starts (only show at beginning) */}
      {messages.length <= 1 && (
        <div className="max-w-3xl mx-auto px-4 md:px-8 pb-4">
          <p className="text-xs text-brand-muted mb-3 text-center">Quick start:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {QUICK_STARTS.map((qs) => (
              <button
                key={qs.text}
                onClick={() => sendMessage(qs.text)}
                className="flex items-center gap-2 bg-white border border-surface-border rounded-xl px-3 py-2.5 text-left hover:border-brand/30 hover:shadow-soft transition-all group"
              >
                <span className="text-lg group-hover:scale-110 transition-transform">{qs.emoji}</span>
                <span className="text-xs font-medium text-brand-muted group-hover:text-brand">{qs.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="sticky bottom-0 bg-white border-t border-surface-border">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 md:px-8 py-4">
          <div className="flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tell me about the gift you're looking for..."
              rows={1}
              className="flex-1 bg-gray-50 border border-surface-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors resize-none"
              style={{ minHeight: "48px", maxHeight: "120px" }}
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="w-12 h-12 bg-brand text-white rounded-2xl flex items-center justify-center hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-[10px] text-brand-muted/50 text-center mt-2">
            T-Gifter uses AI to help you find gifts. Responses may vary.
          </p>
        </form>
      </div>

      {/* Back to Home */}
      <div className="text-center pb-8">
        <BackToHome label="Back to Home" />
      </div>
    </div>
  );
}
