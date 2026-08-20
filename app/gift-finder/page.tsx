"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Sparkles, Globe, ChevronDown, Send, ArrowLeft, Copy, ExternalLink } from "lucide-react";

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

const QUICK_STARTS = [
  { emoji: "🎂", text: "Birthday gift for my partner" },
  { emoji: "💐", text: "Thank you gift for my teacher" },
  { emoji: "🏢", text: "Corporate hamper for 20 people" },
  { emoji: "💒", text: "Wedding gift under KSh 10,000" },
  { emoji: "✍️", text: "Help me write a gift note" },
  { emoji: "💝", text: "Just because — surprise someone" },
];

export default function GiftChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Habari! 👋 I'm T-Gifter, your personal gift concierge.\n\nTell me about the gift you're looking for — who is it for, what's the occasion, and any preferences you have. I'll help you find the perfect match.\n\nOr just say hi and we'll figure it out together!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedLang, setSelectedLang] = useState("auto");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Close lang menu on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
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
    },
    [messages]
  );

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

  const autoResizeTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const isEmptyConversation = messages.length <= 1;

  return (
    <div className="h-screen flex flex-col section-theme-b overflow-hidden">
      {/* ── Header ── */}
      <header className="flex-shrink-0 bg-white/80 backdrop-blur-md border-b border-black/5 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link
            href="/"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-brand-muted hover:bg-brand/5 hover:text-brand transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand to-brand-light flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-brand-deep text-sm leading-none">T-Gifter</h1>
              <p className="text-[11px] text-brand-muted mt-0.5">AI Gift Concierge · Online</p>
            </div>
          </div>

          {/* Language selector */}
          <div className="relative flex-shrink-0" ref={langMenuRef}>
            <button
              id="lang-selector-btn"
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-black/8 rounded-xl px-3 py-2 text-sm transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-brand-muted" />
              <span className="text-[12px] text-brand-muted font-medium hidden sm:inline">
                {LANGUAGES.find((l) => l.code === selectedLang)?.flag}
              </span>
              <ChevronDown className="w-3 h-3 text-brand-muted" />
            </button>
            {showLangMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-card-hover border border-black/8 py-1.5 z-50 w-44 max-h-64 overflow-y-auto">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setSelectedLang(lang.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-left transition-colors ${
                      selectedLang === lang.code
                        ? "bg-brand/8 text-brand font-semibold"
                        : "text-brand-deep hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {/* Assistant avatar */}
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand to-brand-light flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-[82%] md:max-w-[68%] ${
                  msg.role === "user"
                    ? "bg-brand text-white rounded-2xl rounded-br-sm shadow-sm"
                    : "bg-white text-brand-deep rounded-2xl rounded-bl-sm border border-black/6 shadow-sm"
                } px-4 py-3.5`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                {/* Product recommendations */}
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="mt-4 space-y-2 pt-3 border-t border-black/8">
                    <p className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider">
                      Picked for you
                    </p>
                    {msg.recommendations.map((rec) => (
                      <Link
                        key={rec.product_id}
                        href={`/product/${rec.product_id}`}
                        className="flex items-center justify-between bg-gray-50 hover:bg-brand/5 rounded-xl p-3 border border-black/6 hover:border-brand/20 transition-all group"
                      >
                        <div className="min-w-0 flex-1 mr-3">
                          <p className="font-semibold text-xs text-brand-deep group-hover:text-brand truncate">
                            {rec.name}
                          </p>
                          <p className="text-[11px] text-brand-muted mt-0.5 line-clamp-1">{rec.reason}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[10px] bg-brand/10 text-brand px-2 py-0.5 rounded-full font-semibold">
                            {Math.round(rec.confidence * 100)}% match
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-brand-muted group-hover:text-brand transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Note suggestion */}
                {msg.noteSuggestion && (
                  <div className="mt-4 bg-gradient-to-br from-gold/10 to-amber-50 rounded-xl p-3.5 border border-gold/20 pt-3 border-t border-black/8">
                    <p className="text-[10px] font-bold text-gold-dark uppercase tracking-wider mb-1.5">
                      ✍️ Suggested Gift Note
                    </p>
                    <p className="text-xs italic text-brand-deep leading-relaxed">
                      &ldquo;{msg.noteSuggestion}&rdquo;
                    </p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => navigator.clipboard.writeText(msg.noteSuggestion!)}
                        className="flex items-center gap-1 text-[11px] bg-white text-brand-muted border border-black/10 px-3 py-1.5 rounded-lg hover:border-brand/30 hover:text-brand transition-all"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                      <Link
                        href={`/gift-lab/build-hamper?note=${encodeURIComponent(msg.noteSuggestion!)}`}
                        className="flex items-center gap-1 text-[11px] bg-brand/10 text-brand px-3 py-1.5 rounded-lg hover:bg-brand/20 transition-colors font-semibold"
                      >
                        Attach to hamper →
                      </Link>
                    </div>
                  </div>
                )}

                {msg.provider && msg.role === "assistant" && (
                  <p className="text-[9px] text-black/20 mt-2 text-right">via {msg.provider}</p>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-end gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand to-brand-light flex items-center justify-center flex-shrink-0 shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3.5 border border-black/6 shadow-sm">
                <div className="flex gap-1.5 items-center h-4">
                  <span className="w-2 h-2 bg-brand/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-brand/40 rounded-full animate-bounce" style={{ animationDelay: "140ms" }} />
                  <span className="w-2 h-2 bg-brand/40 rounded-full animate-bounce" style={{ animationDelay: "280ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Quick starts (shown only at the start) ── */}
      {isEmptyConversation && (
        <div className="flex-shrink-0 max-w-3xl mx-auto w-full px-4 pb-3">
          <p className="text-[11px] text-brand-muted text-center mb-2.5 uppercase tracking-wider font-medium">
            Quick start
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {QUICK_STARTS.map((qs) => (
              <button
                key={qs.text}
                onClick={() => sendMessage(qs.text)}
                className="flex items-center gap-2 bg-white hover:bg-brand/4 border border-black/8 hover:border-brand/25 rounded-xl px-3 py-2.5 text-left transition-all group"
              >
                <span className="text-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                  {qs.emoji}
                </span>
                <span className="text-[11px] font-medium text-brand-muted group-hover:text-brand leading-tight">
                  {qs.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input ── */}
      <div className="flex-shrink-0 bg-white/90 backdrop-blur-md border-t border-black/5">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex gap-2.5 items-end bg-gray-50 border border-black/8 rounded-2xl px-4 py-2.5 focus-within:border-brand/40 focus-within:bg-white transition-all">
            <textarea
              ref={inputRef}
              id="gift-chat-input"
              value={input}
              onChange={autoResizeTextarea}
              onKeyDown={handleKeyDown}
              placeholder="Who is the gift for? Tell me about them…"
              rows={1}
              className="flex-1 bg-transparent text-sm text-brand-deep placeholder:text-brand-muted/60 focus:outline-none resize-none leading-relaxed"
              style={{ minHeight: "24px", maxHeight: "120px" }}
              disabled={isTyping}
            />
            <button
              type="submit"
              id="gift-chat-send-btn"
              disabled={!input.trim() || isTyping}
              className="w-9 h-9 bg-brand text-white rounded-xl flex items-center justify-center hover:bg-brand-dark transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-brand-muted/40 text-center mt-2">
            T-Gifter is powered by AI · responses may vary · TouchGift delivers across Nairobi
          </p>
        </form>
      </div>
    </div>
  );
}
