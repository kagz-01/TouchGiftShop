"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MessageSquare, Send, Bell, Users, Gift, Calendar,
  Check, ChevronRight, Smartphone, ArrowRight, Sparkles,
  Zap, Clock, Shield, BarChart3, Settings, Play, X,
  Save, RotateCcw, Copy, ExternalLink, AlertTriangle
} from "lucide-react";

type BotFlow = {
  id: string;
  title: string;
  description: string;
  trigger: string;
  message: string;
  enabled: boolean;
};

type RecommendedProduct = {
  name: string;
  price: number;
  image_url: string;
  slug: string;
};

const DEFAULT_FLOWS: BotFlow[] = [
  {
    id: "pool_invite",
    title: "Pool Invitation",
    description: "Notify colleagues about a new gift pool",
    trigger: "When pool is created",
    message: "🎉 *{organizer}* is collecting gifts for *{recipient}'s {occasion}*!\n\nTarget: KSh *{target}*\nMin contribution: KSh *{min}*\n\nContribute here: {link}\n\n#TeamSpirit",
    enabled: true,
  },
  {
    id: "pool_reminder",
    title: "Pool Reminder",
    description: "Remind contributors before deadline",
    trigger: "3 days before deadline",
    message: "⏰ Reminder: *{recipient}'s {occasion}* pool closes in {days} days!\n\nCurrent: KSh *{collected}* / KSh *{target}*\n{contributors} people have contributed.\n\nHelp us reach the goal: {link}",
    enabled: true,
  },
  {
    id: "pool_target_hit",
    title: "Target Reached",
    description: "Celebrate when pool hits the target",
    trigger: "When 100% collected",
    message: "🎯 *We did it!*\n\n*{recipient}'s {occasion}* pool has reached KSh *{target}*!\n\n{contributors} colleagues came together. The gift is being prepared! 🎁",
    enabled: true,
  },
  {
    id: "birthday_reminder",
    title: "Birthday Alert",
    description: "Alert HR about upcoming birthdays",
    trigger: "7 days before birthday",
    message: "🎂 Upcoming birthday: *{recipient}* ({department}) on *{date}*!\n\nSuggested budget: KSh *{budget}*\n\nCreate a pool or order a gift: {link}",
    enabled: true,
  },
  {
    id: "anniversary_reminder",
    title: "Work Anniversary",
    description: "Celebrate work anniversaries",
    trigger: "On work anniversary",
    message: "🎉 Happy {years} year work anniversary, *{recipient}*!\n\nYour team has prepared something special. 🎁\n\nWith love from the *{department}* team.",
    enabled: false,
  },
  {
    id: "gift_delivered",
    title: "Gift Delivered",
    description: "Notify when gift is delivered",
    trigger: "When gift is delivered",
    message: "✅ Gift delivered to *{recipient}*!\n\n📸 Photo: {photo_link}\n\nThank you to everyone who contributed! 🙏",
    enabled: true,
  },
  {
    id: "product_recommendation",
    title: "Product Recommendation",
    description: "Suggest gifts based on occasion and budget",
    trigger: "When employee asks for gift ideas",
    message: "🎁 *Gift Suggestions*\n\nBased on your budget of *KSh {budget}*, here are top picks:\n\n{product_list}\n\nWant to order? Just reply with the number! 🛒",
    enabled: true,
  },
];

const SAMPLE_DATA: Record<string, string> = {
  "{organizer}": "David",
  "{recipient}": "Sarah",
  "{occasion}": "Birthday",
  "{target}": "5,000",
  "{min}": "200",
  "{link}": "https://touchgift.co.ke/pool/sarah-bday",
  "{days}": "3",
  "{collected}": "3,800",
  "{contributors}": "12",
  "{department}": "Engineering",
  "{date}": "September 15th",
  "{budget}": "5,000",
  "{years}": "3",
  "{photo_link}": "https://touchgift.co.ke/delivery/photo-abc123",
  "{product_list}": "1. Executive Hamper — KSh 4,500\n2. Welcome Kit — KSh 3,200\n3. Birthday Surprise — KSh 2,800",
  "{name}": "You",
};

function renderPreview(template: string): string {
  let result = template;
  for (const [key, val] of Object.entries(SAMPLE_DATA)) {
    result = result.split(key).join(val);
  }
  return result;
}

type ChatMessage = {
  sender: string;
  text: string;
  time: string;
  isButton?: boolean;
  buttons?: string[];
  product?: RecommendedProduct;
};

const BASE_CHAT: ChatMessage[] = [
  { sender: "bot", text: "🎉 *Gift Pool Invitation*\n\nHi team! *David* is collecting gifts for *Sarah's Birthday* 🎂\n\nTarget: KSh *5,000*\nMin contribution: KSh *200*\nDeadline: Sept 1st\n\nContribute via M-Pesa:", time: "9:00 AM" },
  { sender: "bot", text: "🔽 *Quick Amounts*", time: "9:00 AM", isButton: true, buttons: ["KSh 200", "KSh 500", "KSh 1,000", "Custom"] },
  { sender: "user", text: "KSh 500", time: "9:05 AM" },
  { sender: "bot", text: "✅ Got it! *KSh 500* contribution noted.\n\nPlease send M-Pesa to:\n📱 *Paybill:* 123456\n🔑 *Account:* SARAH-BDAY\n\nOr click to pay directly:", time: "9:05 AM" },
  { sender: "bot", text: "💳 *Pay Now*", time: "9:05 AM", isButton: true, buttons: ["M-Pesa Link", "Card Payment"] },
  { sender: "user", text: "Paid via M-Pesa! 🎉", time: "9:10 AM" },
  { sender: "bot", text: "✅ *Payment confirmed!*\n\nThank you, *{name}*! Your KSh 500 has been added to Sarah's birthday pool.\n\n🎯 Progress: KSh 3,800 / 5,000 (76%)\n👥 12 contributors\n\nYou're amazing! 🙌", time: "9:10 AM" },
  { sender: "user", text: "Any gift ideas for KSh 5,000?", time: "9:15 AM" },
  { sender: "bot", text: "🎁 *Gift Suggestions*\n\nBased on your budget, here are our top picks:", time: "9:15 AM" },
];

function buildProductMessages(products: RecommendedProduct[]): ChatMessage[] {
  if (products.length === 0) {
    return [{ sender: "bot", text: "Loading products...", time: "9:15 AM" }];
  }
  return products.slice(0, 3).map((p) => ({
    sender: "bot",
    text: `📦 *${p.name}*\nKSh *${p.price.toLocaleString()}*`,
    time: "9:15 AM",
    product: p,
  }));
}

/* ═══════════════════════════════════════════
   VARIABLES HELPERT — extract {var} from text
   ═══════════════════════════════════════════ */
function extractVariables(text: string): string[] {
  const matches = text.match(/\{[^}]+\}/g);
  return matches ? [...new Set(matches)] : [];
}

type StatsData = {
  totalOrders: number;
  monthOrders: number;
  deliveredCount: number;
};

export default function WhatsAppBotPage() {
  const [flows, setFlows] = useState<BotFlow[]>(DEFAULT_FLOWS);
  const [activeTab, setActiveTab] = useState<"flows" | "demo" | "settings">("flows");
  const [recommendedProducts, setRecommendedProducts] = useState<RecommendedProduct[]>([]);
  const [userInput, setUserInput] = useState("");
  const [chatMessages, setChatMessages] = useState(BASE_CHAT);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  /* ── Edit modal state ── */
  const [editingFlow, setEditingFlow] = useState<BotFlow | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTrigger, setEditTrigger] = useState("");
  const [editMessage, setEditMessage] = useState("");

  const PRESET_TRIGGERS = [
    "When pool is created",
    "3 days before deadline",
    "When 100% collected",
    "7 days before birthday",
    "On work anniversary",
    "When gift is delivered",
    "When employee asks for gift ideas",
    "When order is placed",
    "When new employee joins",
    "Weekly digest",
    "Custom",
  ];

  const VARIABLE_CATEGORIES = [
    {
      name: "People",
      color: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
      items: [
        { key: "{recipient}", desc: "Person receiving the gift" },
        { key: "{organizer}", desc: "Person who created the pool" },
        { key: "{sender_name}", desc: "Name of the sender" },
        { key: "{department}", desc: "Recipient's department" },
      ],
    },
    {
      name: "Events",
      color: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
      items: [
        { key: "{occasion}", desc: "Type of occasion (Birthday, etc.)" },
        { key: "{event_name}", desc: "Full event name" },
        { key: "{date}", desc: "Date of the event" },
        { key: "{years}", desc: "Years for anniversaries" },
      ],
    },
    {
      name: "Financial",
      color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
      items: [
        { key: "{target}", desc: "Pool target amount" },
        { key: "{collected}", desc: "Amount collected so far" },
        { key: "{min}", desc: "Minimum contribution" },
        { key: "{budget}", desc: "Suggested budget" },
        { key: "{amount}", desc: "Specific amount" },
      ],
    },
    {
      name: "Pool",
      color: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
      items: [
        { key: "{contributors}", desc: "Number of contributors" },
        { key: "{link}", desc: "Auto-generated pool link" },
        { key: "{pool_name}", desc: "Name of the gift pool" },
        { key: "{days}", desc: "Days until deadline" },
      ],
    },
    {
      name: "Products",
      color: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
      items: [
        { key: "{product_name}", desc: "Name of a product" },
        { key: "{product_price}", desc: "Price of a product" },
        { key: "{product_list}", desc: "Numbered list of suggestions" },
      ],
    },
  ];

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertVariable = (varKey: string) => {
    const ta = textareaRef.current;
    if (!ta) {
      setEditMessage(prev => prev + varKey);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = editMessage.substring(0, start);
    const after = editMessage.substring(end);
    const newMsg = before + varKey + after;
    setEditMessage(newMsg);
    // Restore cursor position after the inserted variable
    setTimeout(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + varKey.length;
    }, 0);
  };

  /* ── Test modal state ── */
  const [testingFlow, setTestingFlow] = useState<BotFlow | null>(null);

  /* ── Settings state ── */
  const [settings, setSettings] = useState([
    { key: "auto_pool_invite", label: "Auto-send pool invitations", description: "When a pool is created, notify all team members", enabled: true },
    { key: "auto_reminders", label: "Auto-send reminders", description: "Send WhatsApp reminders 3 days before pool deadline", enabled: true },
    { key: "birthday_alerts", label: "Birthday alerts to HR", description: "Notify HR 7 days before employee birthdays", enabled: true },
    { key: "delivery_confirm", label: "Delivery confirmations", description: "Send photo confirmation when gift is delivered", enabled: true },
    { key: "receipts", label: "Contribution receipts", description: "Send M-Pesa receipt confirmation to contributors", enabled: false },
  ]);
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    fetch("/api/products?limit=4")
      .then(r => r.json())
      .then(d => {
        const products = (d.products || []).slice(0, 3).map((p: any) => ({
          name: p.name,
          price: p.price,
          image_url: p.image_url || "",
          slug: p.slug,
        }));
        setRecommendedProducts(products);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/corporate/stats")
      .then(r => r.json())
      .then(d => {
        setStats(d);
        setStatsLoading(false);
      })
      .catch(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    const productMsgs = buildProductMessages(recommendedProducts);
    setChatMessages([...BASE_CHAT, ...productMsgs]);
  }, [recommendedProducts]);

  const toggleFlow = (id: string) => {
    setFlows((prev) => prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)));
  };

  const toggleSetting = (key: string) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, enabled: !s.enabled } : s));
    setSettingsSaved(false);
  };

  const handleSaveSettings = () => {
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  /* ── Edit handlers ── */
  const openEdit = (flow: BotFlow) => {
    setEditingFlow(flow);
    setEditTitle(flow.title);
    setEditTrigger(flow.trigger);
    setEditMessage(flow.message);
  };

  const saveEdit = () => {
    if (!editingFlow) return;
    setFlows(prev => prev.map(f => f.id === editingFlow.id
      ? { ...f, title: editTitle, trigger: editTrigger, message: editMessage }
      : f
    ));
    setEditingFlow(null);
  };

  /* ── Test handler ── */
  const openTest = (flow: BotFlow) => {
    setTestingFlow(flow);
  };

  /* ── Demo chat ── */
  const handleSend = () => {
    if (!userInput.trim()) return;
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    setChatMessages(prev => [
      ...prev,
      { sender: "user", text: userInput, time: timeStr },
      { sender: "bot", text: `✅ Thanks! We'll find the perfect gift for you. Check out our showroom for more options.`, time: timeStr },
    ]);
    setUserInput("");
  };

  const copyWebhook = useCallback(() => {
    navigator.clipboard?.writeText("https://api.touchgift.co.ke/webhook/whatsapp");
  }, []);

  return (
    <div className="min-h-screen section-theme-a">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-surface-border">
        <div className="page-container-capped py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display italic text-2xl font-bold">WhatsApp Bot</h1>
              <p className="text-theme-muted text-sm">Automate gift notifications, reminders, and contributions via WhatsApp.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-sm text-success font-semibold">Connected</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Messages Sent", value: statsLoading ? "..." : (stats?.monthOrders ?? 0).toLocaleString(), icon: <Send className="w-5 h-5" />, color: "text-emerald-500" },
              { label: "Active Flows", value: flows.filter((f) => f.enabled).length.toString(), icon: <Zap className="w-5 h-5" />, color: "text-brand" },
              { label: "Conversions", value: statsLoading ? "..." : (stats?.totalOrders ? `${Math.round(((stats?.deliveredCount ?? 0) / stats.totalOrders) * 100)}%` : "0%"), icon: <BarChart3 className="w-5 h-5" />, color: "text-violet-500" },
              { label: "Avg Response", value: statsLoading ? "..." : "2 min", icon: <Clock className="w-5 h-5" />, color: "text-gold" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/80 backdrop-blur-sm shape-premium-card p-4 border border-surface-border shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 shape-premium-card flex items-center justify-center bg-gray-50 dark:bg-white/5 ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-xl font-bold text-theme-heading">{stat.value}</p>
                    <p className="text-xs text-theme-muted">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {[
              { id: "flows" as const, label: "Bot Flows", icon: <MessageSquare className="w-4 h-4" /> },
              { id: "demo" as const, label: "Live Demo", icon: <Play className="w-4 h-4" /> },
              { id: "settings" as const, label: "Settings", icon: <Settings className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 shape-premium-button text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-brand text-white"
                    : "bg-white/80 border border-surface-border text-theme-muted hover:border-brand/30"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="page-container-capped py-6">
        {/* ═══ BOT FLOWS ═══ */}
        {activeTab === "flows" && (
          <div className="space-y-4">
            {flows.map((flow) => (
              <div
                key={flow.id}
                className={`bg-white/80 backdrop-blur-sm shape-premium-card p-5 border shadow-sm transition-all ${
                  flow.enabled ? "border-brand/20" : "border-surface-border opacity-75"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 shape-premium-card flex items-center justify-center ${
                      flow.enabled ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500" : "bg-gray-100 dark:bg-white/5 text-gray-400"
                    }`}>
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-theme-heading">{flow.title}</h3>
                      <p className="text-xs text-theme-muted">{flow.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFlow(flow.id)}
                    className={`w-12 h-7 shape-premium-button transition-all relative ${
                      flow.enabled ? "bg-brand" : "bg-gray-200"
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all shadow-sm ${
                      flow.enabled ? "left-6" : "left-1"
                    }`} />
                  </button>
                </div>

                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 mb-3">
                  <p className="text-xs font-semibold text-theme-muted mb-1">Trigger: {flow.trigger}</p>
                  <p className="text-sm text-theme-heading whitespace-pre-line font-mono text-xs leading-relaxed">{flow.message}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(flow)}
                    className="px-3 py-1.5 bg-brand/10 text-brand shape-premium-button text-xs font-semibold hover:bg-brand/20 transition-colors flex items-center gap-1"
                  >
                    <Settings className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => openTest(flow)}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-white/5 text-theme-muted shape-premium-button text-xs font-semibold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" /> Test
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══ LIVE DEMO ═══ */}
        {activeTab === "demo" && (
          <div className="max-w-md mx-auto">
            <div className="bg-[#ECE5DD] dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-surface-border">
              {/* Chat header */}
              <div className="bg-[#075E54] text-white px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 shape-premium-button flex items-center justify-center">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">TouchGift Bot</p>
                  <p className="text-xs text-white/70">online</p>
                </div>
              </div>

              {/* Messages */}
              <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto bg-[#ECE5DD] dark:bg-[#0B141A]">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] ${
                      msg.sender === "user"
                        ? "bg-[#DCF8C6] dark:bg-[#005C4B] text-gray-800 dark:text-white"
                        : "bg-white dark:bg-[#1F2C34] text-gray-800 dark:text-white"
                    } rounded-xl px-3 py-2 shadow-sm`}>
                      {("product" in msg && msg.product) ? (
                        <div className="flex items-center gap-3 mb-1">
                          {msg.product.image_url && (
                            <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 relative bg-gray-100">
                              <Image src={msg.product.image_url} alt={msg.product.name} fill className="object-cover" sizes="56px" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold">{msg.product.name}</p>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">KSh {msg.product.price.toLocaleString()}</p>
                          </div>
                        </div>
                      ) : null}
                      <p className="text-sm whitespace-pre-line">{msg.text}</p>
                      {msg.isButton && msg.buttons && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {msg.buttons.map((btn, j) => (
                            <span key={j} className="px-3 py-1 bg-white/80 dark:bg-white/10 border border-[#075E54]/20 dark:border-white/20 rounded-full text-xs font-medium text-[#075E54] dark:text-emerald-400 cursor-pointer hover:bg-[#075E54]/10">
                              {btn}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className={`text-[10px] mt-1 ${msg.sender === "user" ? "text-green-700/60 dark:text-green-300/40" : "text-gray-400 dark:text-gray-500"} text-right`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="bg-[#F0F0F0] dark:bg-[#1F2C34] px-4 py-3 flex items-center gap-3 border-t border-surface-border">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 bg-white dark:bg-[#0B141A] rounded-full px-4 py-2 text-sm text-gray-800 dark:text-white outline-none"
                />
                <button onClick={handleSend} className="w-10 h-10 bg-[#075E54] shape-premium-button flex items-center justify-center hover:bg-[#064E46] transition-colors">
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-theme-muted mt-4">
              This is a simulated WhatsApp conversation showing how the bot works.
            </p>
          </div>
        )}

        {/* ═══ SETTINGS ═══ */}
        {activeTab === "settings" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white/80 backdrop-blur-sm shape-premium-card p-6 border border-surface-border shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-theme-heading">Bot Configuration</h3>
                <button
                  onClick={handleSaveSettings}
                  className="px-4 py-2 bg-brand text-white shape-premium-button text-xs font-semibold hover:bg-brand-dark transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Save Settings
                </button>
              </div>

              {settingsSaved && (
                <div className="p-3 bg-success/10 border border-success/20 shape-premium-card text-sm text-success font-semibold">
                  Settings saved successfully!
                </div>
              )}

              <div className="space-y-3">
                {settings.map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 shape-premium-card">
                    <div>
                      <p className="text-sm font-semibold text-theme-heading">{setting.label}</p>
                      <p className="text-xs text-theme-muted">{setting.description}</p>
                    </div>
                    <button
                      onClick={() => toggleSetting(setting.key)}
                      className={`w-10 h-6 shape-premium-button transition-all relative ${setting.enabled ? "bg-brand" : "bg-gray-200"}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${setting.enabled ? "left-5" : "left-1"}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm shape-premium-card p-6 border border-surface-border shadow-sm">
              <h3 className="text-sm font-semibold text-theme-heading mb-3">Integration</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 shape-premium-card">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className="text-sm font-semibold text-theme-heading">WhatsApp Business API</p>
                      <p className="text-xs text-success font-semibold">Connected</p>
                    </div>
                  </div>
                  <span className="text-xs text-theme-muted">Phone: +254 142 677 898</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 shape-premium-card">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-brand" />
                    <div>
                      <p className="text-sm font-semibold text-theme-heading">Webhook URL</p>
                      <p className="text-xs text-theme-muted font-mono">https://api.touchgift.co.ke/webhook/whatsapp</p>
                    </div>
                  </div>
                  <button
                    onClick={copyWebhook}
                    className="px-3 py-1.5 bg-brand/10 text-brand shape-premium-button text-xs font-semibold hover:bg-brand/20 transition-colors flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════
          EDIT FLOW MODAL
          ═══════════════════════════════════════ */}
      {editingFlow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditingFlow(null)} />

          {/* Modal */}
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-surface-border">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 px-6 py-4 border-b border-surface-border flex items-center justify-between z-10">
              <div>
                <h2 className="font-display italic text-lg font-bold text-theme-heading">Edit Flow</h2>
                <p className="text-xs text-theme-muted">Customize the message template for this flow</p>
              </div>
              <button onClick={() => setEditingFlow(null)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                <X className="w-4 h-4 text-theme-muted" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-theme-heading mb-1.5">Flow Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-surface-border shape-premium-card px-4 py-3 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                />
              </div>

              {/* Trigger */}
              <div>
                <label className="block text-sm font-semibold text-theme-heading mb-1.5">Trigger</label>
                <div className="space-y-2">
                  <select
                    value={PRESET_TRIGGERS.includes(editTrigger) ? editTrigger : "Custom"}
                    onChange={(e) => {
                      if (e.target.value !== "Custom") setEditTrigger(e.target.value);
                      else setEditTrigger("");
                    }}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-surface-border shape-premium-card px-4 py-3 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand appearance-none cursor-pointer"
                  >
                    {PRESET_TRIGGERS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  {(!PRESET_TRIGGERS.includes(editTrigger) || editTrigger === "") && (
                    <input
                      type="text"
                      value={editTrigger}
                      onChange={(e) => setEditTrigger(e.target.value)}
                      placeholder="Type your custom trigger..."
                      className="w-full bg-gray-50 dark:bg-white/5 border border-surface-border shape-premium-card px-4 py-3 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                    />
                  )}
                </div>
                <p className="text-xs text-theme-muted mt-1">When should this message be sent?</p>
              </div>

              {/* Message template */}
              <div>
                <label className="block text-sm font-semibold text-theme-heading mb-1.5">Message Template</label>
                <textarea
                  ref={textareaRef}
                  value={editMessage}
                  onChange={(e) => setEditMessage(e.target.value)}
                  rows={8}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-surface-border shape-premium-card px-4 py-3 text-sm font-mono leading-relaxed focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand resize-none"
                />

                {/* Variable categories — click to insert */}
                <div className="mt-3 space-y-2.5">
                  {VARIABLE_CATEGORIES.map((cat) => (
                    <div key={cat.name}>
                      <p className="text-[11px] font-semibold text-theme-muted uppercase tracking-wider mb-1">{cat.name}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.items.map((v) => (
                          <button
                            key={v.key}
                            onClick={() => insertVariable(v.key)}
                            title={v.desc}
                            className={`px-2 py-1 text-xs font-mono rounded-full transition-all hover:scale-105 hover:shadow-sm cursor-pointer ${cat.color}`}
                          >
                            {v.key}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Active variables in template */}
                {extractVariables(editMessage).length > 0 && (
                  <div className="mt-3 p-3 bg-brand/5 border border-brand/10 rounded-xl">
                    <p className="text-[11px] font-semibold text-brand uppercase tracking-wider mb-1.5">In this template</p>
                    <div className="flex flex-wrap gap-1.5">
                      {extractVariables(editMessage).map((v) => {
                        const cat = VARIABLE_CATEGORIES.find(c => c.items.some(i => i.key === v));
                        const desc = cat?.items.find(i => i.key === v)?.desc;
                        return (
                          <span key={v} title={desc} className="px-2 py-0.5 bg-brand/10 text-brand text-xs font-mono rounded-full">
                            {v}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Live preview */}
              <div>
                <label className="block text-sm font-semibold text-theme-heading mb-1.5">Preview (with sample data)</label>
                <div className="bg-[#ECE5DD] dark:bg-[#0B141A] rounded-xl p-4">
                  <div className="bg-white dark:bg-[#1F2C34] rounded-xl px-3 py-2 shadow-sm max-w-[90%]">
                    <p className="text-sm whitespace-pre-line text-gray-800 dark:text-white">{renderPreview(editMessage)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-900 px-6 py-4 border-t border-surface-border flex items-center justify-end gap-3">
              <button
                onClick={() => setEditingFlow(null)}
                className="px-4 py-2 bg-gray-100 dark:bg-white/5 text-theme-muted shape-premium-button text-sm font-semibold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-5 py-2 bg-brand text-white shape-premium-button text-sm font-semibold hover:bg-brand-dark transition-colors flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          TEST FLOW MODAL
          ═══════════════════════════════════════ */}
      {testingFlow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setTestingFlow(null)} />

          {/* Modal */}
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-surface-border">
            {/* Header */}
            <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 shape-premium-button flex items-center justify-center">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{testingFlow.title}</p>
                  <p className="text-xs text-white/70">Test Preview</p>
                </div>
              </div>
              <button onClick={() => setTestingFlow(null)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated WhatsApp message */}
            <div className="bg-[#ECE5DD] dark:bg-[#0B141A] p-4 min-h-[200px]">
              <div className="flex justify-start">
                <div className="bg-white dark:bg-[#1F2C34] rounded-xl px-3 py-2 shadow-sm max-w-[90%] text-gray-800 dark:text-white">
                  <p className="text-sm whitespace-pre-line">{renderPreview(testingFlow.message)}</p>
                  <p className="text-[10px] mt-1 text-gray-400 dark:text-gray-500 text-right">9:00 AM</p>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="bg-white dark:bg-gray-900 px-4 py-3 border-t border-surface-border flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-theme-muted">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Simulated — not sent to real WhatsApp</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setTestingFlow(null)}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-white/5 text-theme-muted shape-premium-button text-xs font-semibold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setTestingFlow(null);
                    setActiveTab("demo");
                  }}
                  className="px-3 py-1.5 bg-brand text-white shape-premium-button text-xs font-semibold hover:bg-brand-dark transition-colors flex items-center gap-1"
                >
                  <Play className="w-3 h-3" /> View in Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
