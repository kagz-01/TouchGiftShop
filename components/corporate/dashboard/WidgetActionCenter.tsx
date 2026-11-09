"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AlertCircle, Clock, MapPin, CheckCircle2, ChevronRight, MessageSquare, ExternalLink, ShieldCheck, ArrowRight, X } from "lucide-react";

export interface BlockerItem {
  id: string;
  type: "missing_pin" | "pending_quote" | "delivery_proof" | "unpaid_invoice";
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  count: number;
  actionLabel: string;
  actionHref?: string;
  data?: any;
}

interface WidgetActionCenterProps {
  blockers: BlockerItem[];
  companyName: string;
  onNavigateTab?: (tab: string) => void;
}

export default function WidgetActionCenter({ blockers, companyName, onNavigateTab }: WidgetActionCenterProps) {
  const [activeModal, setActiveModal] = useState<BlockerItem | null>(null);
  const [copiedLinkIndex, setCopiedLinkIndex] = useState<number | null>(null);
  const [actionDone, setActionDone] = useState<Record<string, boolean>>({});

  const highSeverity = blockers.filter(b => b.severity === "high" && !actionDone[b.id]);
  const mediumSeverity = blockers.filter(b => b.severity === "medium" && !actionDone[b.id]);
  const lowSeverity = blockers.filter(b => b.severity === "low" && !actionDone[b.id]);
  const activeCount = blockers.filter(b => !actionDone[b.id]).length;

  const handleCopyMagicLink = (phone: string, name: string, idx: number) => {
    const text = `Hi ${name}! TouchGift has a special corporate package for you from ${companyName}. Please tap here to choose your delivery date and drop your exact Nairobi pin: https://touchgiftshop.co.ke/gift/claim?ref=TG-MAGIC-${Date.now().toString().slice(-4)}`;
    navigator.clipboard.writeText(text);
    setCopiedLinkIndex(idx);
    setTimeout(() => setCopiedLinkIndex(null), 3000);
  };

  return (
    <div
      className="rounded-2xl p-6 transition-all"
      style={{
        background: "var(--portal-surface)",
        border: "1px solid var(--portal-border)",
        boxShadow: "var(--portal-shadow)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4" style={{ borderBottom: "1px solid var(--portal-border-soft)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: activeCount > 0 ? "var(--portal-stop-tint)" : "var(--portal-positive-tint)",
              color: activeCount > 0 ? "var(--portal-stop)" : "var(--portal-positive)",
            }}
          >
            {activeCount > 0 ? <AlertCircle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold tracking-tight" style={{ color: "var(--portal-text)" }}>
                Action Center
              </h3>
              {activeCount > 0 ? (
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: "var(--portal-stop)", color: "#FFFFFF" }}
                >
                  {activeCount} Blocker{activeCount > 1 ? "s" : ""}
                </span>
              ) : (
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{ background: "var(--portal-positive-tint)", color: "var(--portal-positive)" }}
                >
                  All Clear
                </span>
              )}
            </div>
            <p className="text-xs mt-0.5" style={{ color: "var(--portal-text-muted)" }}>
              Items requiring immediate decision or coordination
            </p>
          </div>
        </div>

        <span className="text-xs font-medium" style={{ color: "var(--portal-text-faint)" }}>
          Live Resolution Engine
        </span>
      </div>

      {/* Body List */}
      {activeCount === 0 ? (
        <div className="py-8 text-center flex flex-col items-center justify-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
            style={{ background: "var(--portal-positive-tint)", color: "var(--portal-positive)" }}
          >
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold" style={{ color: "var(--portal-text)" }}>
            Zero Pending Bottlenecks
          </p>
          <p className="text-xs max-w-sm mt-1" style={{ color: "var(--portal-text-muted)" }}>
            All recipient addresses are resolved, corporate invoices are up to date, and riders have delivery clearance.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {blockers
            .filter((b) => !actionDone[b.id])
            .map((item) => {
              const isHigh = item.severity === "high";
              const isMed = item.severity === "medium";

              return (
                <div
                  key={item.id}
                  className="group rounded-xl p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  style={{
                    background: isHigh
                      ? "rgba(225, 29, 72, 0.04)"
                      : isMed
                      ? "rgba(245, 158, 11, 0.04)"
                      : "var(--portal-surface-2)",
                    border: `1px solid ${
                      isHigh
                        ? "rgba(225, 29, 72, 0.25)"
                        : isMed
                        ? "rgba(245, 158, 11, 0.25)"
                        : "var(--portal-border)"
                    }`,
                  }}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{
                        background: isHigh
                          ? "var(--portal-stop-tint)"
                          : isMed
                          ? "var(--portal-warn-tint)"
                          : "var(--portal-accent-tint)",
                        color: isHigh
                          ? "var(--portal-stop)"
                          : isMed
                          ? "var(--portal-warn)"
                          : "var(--portal-accent)",
                      }}
                    >
                      {item.type === "missing_pin" && <MapPin className="w-4 h-4" />}
                      {item.type === "pending_quote" && <Clock className="w-4 h-4" />}
                      {item.type === "delivery_proof" && <CheckCircle2 className="w-4 h-4" />}
                      {item.type === "unpaid_invoice" && <AlertCircle className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold truncate" style={{ color: "var(--portal-text)" }}>
                          {item.title}
                        </span>
                        <span
                          className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded"
                          style={{
                            background: isHigh
                              ? "var(--portal-stop-tint)"
                              : isMed
                              ? "var(--portal-warn-tint)"
                              : "var(--portal-border)",
                            color: isHigh
                              ? "var(--portal-stop)"
                              : isMed
                              ? "var(--portal-warn)"
                              : "var(--portal-text-muted)",
                          }}
                        >
                          {item.severity}
                        </span>
                      </div>
                      <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--portal-text-muted)" }}>
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {item.type === "missing_pin" ? (
                      <button
                        onClick={() => setActiveModal(item)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-transform active:scale-95 flex items-center gap-1.5 shadow-sm"
                        style={{
                          background: "var(--portal-accent)",
                          color: "var(--portal-accent-text)",
                        }}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Nudge via WhatsApp</span>
                      </button>
                    ) : item.actionHref ? (
                      <Link
                        href={item.actionHref}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                        style={{
                          background: "var(--portal-accent)",
                          color: "var(--portal-accent-text)",
                        }}
                      >
                        <span>{item.actionLabel}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <button
                        onClick={() => setActiveModal(item)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                        style={{
                          background: "var(--portal-accent-tint)",
                          border: "1px solid var(--portal-border)",
                          color: "var(--portal-accent)",
                        }}
                      >
                        <span>{item.actionLabel}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Recipient WhatsApp Magic Link Modal */}
      {activeModal && activeModal.type === "missing_pin" && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-lg rounded-2xl p-6 shadow-2xl relative"
            style={{
              background: "var(--portal-surface)",
              border: "1px solid var(--portal-border)",
              color: "var(--portal-text)",
            }}
          >
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--portal-accent-tint)", color: "var(--portal-accent)" }}>
                <MapPin className="w-4 h-4" />
              </span>
              <h4 className="text-base font-bold">WhatsApp Magic Link Pin Request</h4>
            </div>

            <p className="text-xs mb-4" style={{ color: "var(--portal-text-muted)" }}>
              No need to ask employees for private residential addresses. Send a branded TouchGift Magic Link so they pick their date and pin their landmark.
            </p>

            <div className="space-y-3 mb-6">
              {(activeModal.data?.recipients || []).map((r: any, idx: number) => {
                const waLink = `https://wa.me/${r.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                  `Hi ${r.name}! TouchGift has a surprise corporate package ready for you from ${companyName}. Please tap here to set your delivery landmark: https://touchgiftshop.co.ke/gift/claim?ref=TG-VIP-${idx + 101}`
                )}`;

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl flex items-center justify-between gap-3"
                    style={{ background: "var(--portal-surface-2)", border: "1px solid var(--portal-border-soft)" }}
                  >
                    <div>
                      <p className="text-sm font-semibold">{r.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--portal-text-muted)" }}>
                        {r.phone} · <span className="italic">{r.gift}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyMagicLink(r.phone, r.name, idx)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{
                          background: copiedLinkIndex === idx ? "var(--portal-positive-tint)" : "var(--portal-surface)",
                          border: "1px solid var(--portal-border)",
                          color: copiedLinkIndex === idx ? "var(--portal-positive)" : "var(--portal-text)",
                        }}
                      >
                        {copiedLinkIndex === idx ? "Copied!" : "Copy Link"}
                      </button>

                      <a
                        href={waLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                        style={{ background: "#25D366", color: "#FFFFFF" }}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Send</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-3 border-t" style={{ borderColor: "var(--portal-border-soft)" }}>
              <button
                onClick={() => {
                  setActionDone(prev => ({ ...prev, [activeModal.id]: true }));
                  setActiveModal(null);
                }}
                className="text-xs font-semibold underline"
                style={{ color: "var(--portal-text-muted)" }}
              >
                Mark as Resolved
              </button>
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold"
                style={{ background: "var(--portal-accent)", color: "var(--portal-accent-text)" }}
              >
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Proof Review Modal */}
      {activeModal && activeModal.type === "delivery_proof" && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-md rounded-2xl p-6 shadow-2xl relative"
            style={{
              background: "var(--portal-surface)",
              border: "1px solid var(--portal-border)",
              color: "var(--portal-text)",
            }}
          >
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h4 className="text-base font-bold mb-1">Rider Drop-off Proof</h4>
            <p className="text-xs mb-4" style={{ color: "var(--portal-text-muted)" }}>
              Delivery completed at {activeModal.data?.dropoffTime || "11:42 AM"}. Signed by recipient reception.
            </p>

            <div className="rounded-xl overflow-hidden mb-4 border" style={{ borderColor: "var(--portal-border)" }}>
              <div
                className="h-44 flex flex-col items-center justify-center text-center p-4"
                style={{ background: "var(--portal-surface-2)" }}
              >
                <ShieldCheck className="w-10 h-10 mb-2" style={{ color: "var(--portal-positive)" }} />
                <p className="text-xs font-semibold">TouchGift Concierge Seal Intact</p>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--portal-text-muted)" }}>
                  Recipient Signature & Reception Timestamp Verified
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setActionDone(prev => ({ ...prev, [activeModal.id]: true }));
                  setActiveModal(null);
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-center"
                style={{ background: "var(--portal-positive)", color: "#FFFFFF" }}
              >
                Accept & Archive
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

