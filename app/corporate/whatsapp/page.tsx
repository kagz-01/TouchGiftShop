"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageSquare, Send, Bell, Users, Gift, Calendar,
  Check, ChevronRight, Smartphone, ArrowRight, Sparkles,
  Zap, Clock, Shield, BarChart3, Settings, Play
} from "lucide-react";

type BotFlow = {
  id: string;
  title: string;
  description: string;
  trigger: string;
  message: string;
  enabled: boolean;
};

const BOT_FLOWS: BotFlow[] = [
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
];

const CHAT_MESSAGES = [
  { sender: "bot", text: "🎉 *Gift Pool Invitation*\n\nHi team! *David* is collecting gifts for *Sarah's Birthday* 🎂\n\nTarget: KSh *5,000*\nMin contribution: KSh *200*\nDeadline: Sept 1st\n\nContribute via M-Pesa:", time: "9:00 AM" },
  { sender: "bot", text: "🔽 *Quick Amounts*", time: "9:00 AM", isButton: true, buttons: ["KSh 200", "KSh 500", "KSh 1,000", "Custom"] },
  { sender: "user", text: "KSh 500", time: "9:05 AM" },
  { sender: "bot", text: "✅ Got it! *KSh 500* contribution noted.\n\nPlease send M-Pesa to:\n📱 *Paybill:* 123456\n🔑 *Account:* SARAH-BDAY\n\nOr click to pay directly:", time: "9:05 AM" },
  { sender: "bot", text: "💳 *Pay Now*", time: "9:05 AM", isButton: true, buttons: ["M-Pesa Link", "Card Payment"] },
  { sender: "user", text: "Paid via M-Pesa! 🎉", time: "9:10 AM" },
  { sender: "bot", text: "✅ *Payment confirmed!*\n\nThank you, *{name}*! Your KSh 500 has been added to Sarah's birthday pool.\n\n🎯 Progress: KSh 3,800 / 5,000 (76%)\n👥 12 contributors\n\nYou're amazing! 🙌", time: "9:10 AM" },
];

export default function WhatsAppBotPage() {
  const [flows, setFlows] = useState(BOT_FLOWS);
  const [activeTab, setActiveTab] = useState<"flows" | "demo" | "settings">("flows");

  const toggleFlow = (id: string) => {
    setFlows((prev) => prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)));
  };

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
              { label: "Messages Sent", value: "1,247", icon: <Send className="w-5 h-5" />, color: "text-emerald-500" },
              { label: "Active Flows", value: flows.filter((f) => f.enabled).length.toString(), icon: <Zap className="w-5 h-5" />, color: "text-brand" },
              { label: "Conversions", value: "89%", icon: <BarChart3 className="w-5 h-5" />, color: "text-violet-500" },
              { label: "Avg Response", value: "2 min", icon: <Clock className="w-5 h-5" />, color: "text-gold" },
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
                  <button className="px-3 py-1.5 bg-brand/10 text-brand shape-premium-button text-xs font-semibold hover:bg-brand/20 transition-colors flex items-center gap-1">
                    <Settings className="w-3 h-3" /> Edit
                  </button>
                  <button className="px-3 py-1.5 bg-gray-100 dark:bg-white/5 text-theme-muted shape-premium-button text-xs font-semibold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors flex items-center gap-1">
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
                {CHAT_MESSAGES.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] ${
                      msg.sender === "user"
                        ? "bg-[#DCF8C6] dark:bg-[#005C4B] text-gray-800 dark:text-white"
                        : "bg-white dark:bg-[#1F2C34] text-gray-800 dark:text-white"
                    } rounded-xl px-3 py-2 shadow-sm`}>
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
                <div className="flex-1 bg-white dark:bg-[#0B141A] rounded-full px-4 py-2 text-sm text-gray-400">
                  Type a message...
                </div>
                <div className="w-10 h-10 bg-[#075E54] shape-premium-button flex items-center justify-center">
                  <Send className="w-4 h-4 text-white" />
                </div>
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
              <h3 className="text-sm font-semibold text-theme-heading">Bot Configuration</h3>

              <div className="space-y-3">
                {[
                  { label: "Auto-send pool invitations", description: "When a pool is created, notify all team members", enabled: true },
                  { label: "Auto-send reminders", description: "Send WhatsApp reminders 3 days before pool deadline", enabled: true },
                  { label: "Birthday alerts to HR", description: "Notify HR 7 days before employee birthdays", enabled: true },
                  { label: "Delivery confirmations", description: "Send photo confirmation when gift is delivered", enabled: true },
                  { label: "Contribution receipts", description: "Send M-Pesa receipt confirmation to contributors", enabled: false },
                ].map((setting, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 shape-premium-card">
                    <div>
                      <p className="text-sm font-semibold text-theme-heading">{setting.label}</p>
                      <p className="text-xs text-theme-muted">{setting.description}</p>
                    </div>
                    <div className={`w-10 h-6 shape-premium-button transition-all relative ${setting.enabled ? "bg-brand" : "bg-gray-200"}`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${setting.enabled ? "left-5" : "left-1"}`} />
                    </div>
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
                  <button className="px-3 py-1.5 bg-brand/10 text-brand shape-premium-button text-xs font-semibold">Copy</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
