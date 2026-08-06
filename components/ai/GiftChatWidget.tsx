"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

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

const SUGGESTIONS: Record<string, string[]> = {
  en: ["Gift for my girlfriend's birthday", "Something for my mom", "Corporate client gift", "Wedding gift under KSh 5,000", "Help me write a note"],
  sw: ["Zawadi kwa birthday ya mpenzi wangu", "Kitu kwa mama yangu", "Zawili ya mteja", "Zawadi ya harusi chini ya KSh 5,000", "Nisaidie kuandika ujumbe"],
  fr: ["Cadeau pour l'anniversaire de ma copine", "Quelque chose pour ma maman", "Cadeau client entreprise", "Cadeau de mariage moins de 5000 KSh", "Aide-moi à écrire une note"],
};

export default function GiftChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Habari! 👋 I'm Zawadi, your gift concierge. I can help you find the perfect gift, write a heartfelt note, or build a custom hamper. What can I help you with?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [selectedLang, setSelectedLang] = useState("auto");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

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
    setShowSuggestions(false);

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
          content: "Pole sana! I'm having trouble connecting. Please try again in a moment. 🎁",
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

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50 group transition-all duration-300 ${
          isOpen ? "rotate-0" : ""
        }`}
        aria-label="Gift Assistant"
      >
        {isOpen ? (
          <div className="w-14 h-14 bg-brand rounded-full flex items-center justify-center shadow-glow hover:bg-brand-dark transition-colors">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        ) : (
          <div className="relative">
            <span className="absolute inset-0 rounded-full bg-brand animate-ping opacity-20" />
            <div className="relative w-14 h-14 bg-gradient-to-br from-brand to-brand-light rounded-full flex items-center justify-center shadow-glow hover:shadow-glow/50 hover:scale-105 transition-all duration-300">
              <span className="text-2xl">🎁</span>
            </div>
            {/* Notification badge */}
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gold rounded-full flex items-center justify-center">
              <span className="text-[10px] font-bold text-brand-deep">1</span>
            </div>
          </div>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-40 right-4 md:bottom-24 md:right-8 z-50 w-[calc(100vw-2rem)] max-w-[400px]">
          <div className="bg-white rounded-3xl shadow-card-hover border border-surface-border overflow-hidden flex flex-col" style={{ height: "min(520px, calc(100vh - 200px))" }}>
            {/* Header */}
            <div className="bg-gradient-brand text-white px-5 py-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xl">🎁</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Zawadi — Gift Concierge</p>
                <p className="text-white/70 text-xs">Ask me anything about gifting</p>
              </div>
              {/* Language selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center gap-1 bg-white/10 hover:bg-white/20 rounded-lg px-2 py-1.5 transition-colors text-xs"
                >
                  <span>{LANGUAGES.find((l) => l.code === selectedLang)?.flag || "🌍"}</span>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showLangMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-card-hover border border-surface-border py-1 z-50 w-40 max-h-60 overflow-y-auto">
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

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] ${
                    msg.role === "user"
                      ? "bg-brand text-white rounded-2xl rounded-br-md"
                      : "bg-gray-50 text-brand-deep rounded-2xl rounded-bl-md border border-surface-border"
                  } px-4 py-3`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                    {/* Product recommendations */}
                    {msg.recommendations && msg.recommendations.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {msg.recommendations.map((rec) => (
                          <Link
                            key={rec.product_id}
                            href={`/product/${rec.product_id}`}
                            className="block bg-white rounded-xl p-3 border border-surface-border hover:border-brand/30 hover:shadow-soft transition-all"
                            onClick={() => setIsOpen(false)}
                          >
                            <p className="font-semibold text-sm text-brand">{rec.name}</p>
                            <p className="text-xs text-brand-muted mt-1">{rec.reason}</p>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Note suggestion */}
                    {msg.noteSuggestion && (
                      <div className="mt-3 bg-gold/10 rounded-xl p-3 border border-gold/20">
                        <p className="text-xs font-semibold text-gold mb-1">✍️ Note Suggestion:</p>
                        <p className="text-sm italic text-brand-deep">&ldquo;{msg.noteSuggestion}&rdquo;</p>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(msg.noteSuggestion!);
                          }}
                          className="text-xs text-brand mt-2 hover:underline"
                        >
                          Copy note
                        </button>
                      </div>
                    )}

                    {/* Provider badge */}
                    {msg.provider && msg.role === "assistant" && (
                      <p className="text-[10px] text-brand-muted/50 mt-2 text-right">
                        via {msg.provider}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-50 rounded-2xl rounded-bl-md px-4 py-3 border border-surface-border">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-brand/30 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-brand/30 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-brand/30 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick suggestions */}
            {showSuggestions && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {(SUGGESTIONS[selectedLang] || SUGGESTIONS.en).map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-xs bg-brand/5 hover:bg-brand/10 text-brand px-3 py-1.5 rounded-full transition-colors border border-brand/10"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-surface-border bg-white">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about gifts..."
                  className="flex-1 bg-gray-50 border border-surface-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand transition-colors"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="w-10 h-10 bg-brand text-white rounded-xl flex items-center justify-center hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
