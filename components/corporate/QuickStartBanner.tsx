"use client";
/**
 * QuickStartBanner — shown inside the Overview tab when the account has no orders.
 *
 * HCI: 
 * • 3-step checklist (chunked — Miller's Law)  
 * • Each step is a direct action, not a description
 * • Visual progress motivates completion (Zeigarnik Effect)
 * • "What's next" is always visible — no hunting required
 */
import { useState, useEffect } from "react";
import { Package, Gift, Target, CheckCircle, ChevronRight, Sparkles } from "lucide-react";

const STORAGE_KEY_STEPS = "tg_corp_steps_v1";

const STEPS = [
  {
    id: "browse",
    icon: Package,
    num: "01",
    title: "Browse the gift catalog",
    body: "Over 500 corporate-approved items — branded merch, hampers, awards, tech.",
    cta: "Open Shop",
    tab: "shop",
    color: "text-amber-600 bg-amber-50 border-amber-100",
  },
  {
    id: "hamper",
    icon: Gift,
    num: "02",
    title: "Build your first hamper",
    body: "Pick 3–10 items, add your logo, list recipients — we package and deliver.",
    cta: "Build Hamper",
    tab: "hamper",
    color: "text-indigo-600 bg-indigo-50 border-indigo-100",
  },
  {
    id: "pool",
    icon: Target,
    num: "03",
    title: "Create a team gift pool",
    body: "Let the whole office chip in. Share a link — we track contributions and order automatically.",
    cta: "Start a Pool",
    tab: "pools",
    color: "text-green-600 bg-green-50 border-green-100",
  },
];

interface Props {
  onNavigate: (tab: string) => void;
}

export default function QuickStartBanner({ onNavigate }: Props) {
  const [done, setDone]       = useState<string[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY_STEPS);
    if (saved) setDone(JSON.parse(saved));
  }, []);

  function markDone(id: string, tab: string) {
    const next = [...new Set([...done, id])];
    setDone(next);
    localStorage.setItem(STORAGE_KEY_STEPS, JSON.stringify(next));
    onNavigate(tab);
  }

  if (dismissed) return null;

  const pct = Math.round((done.length / STEPS.length) * 100);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mb-6">
      {/* Header */}
      <div className="px-6 py-5 flex items-start justify-between border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-gray-900">Quick Start — 3 steps to your first order</h2>
            {done.length === STEPS.length && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full border border-green-200">All done! 🎉</span>
            )}
          </div>
          <p className="text-xs text-gray-400">New to the corporate portal? Here's how to get your first gift out the door.</p>
        </div>
        <button onClick={() => setDismissed(true)} className="text-xs text-gray-300 hover:text-gray-500 transition-colors shrink-0 ml-4">Dismiss</button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-100">
        <div className="h-full bg-amber-500 transition-all duration-700 rounded-full" style={{ width: `${pct}%` }} />
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
        {STEPS.map((s, i) => {
          const isDone = done.includes(s.id);
          return (
            <div key={s.id}
              className={`px-5 py-5 flex flex-col gap-3 transition-colors ${isDone ? "bg-gray-50/50" : "hover:bg-amber-50/30"}`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${isDone ? "bg-green-50 border-green-200" : s.color}`}>
                  {isDone ? <CheckCircle className="w-4.5 h-4.5 text-green-500" /> : <s.icon className="w-4 h-4" />}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">{isDone ? "Done ✓" : `Step ${s.num}`}</span>
                  <p className={`text-sm font-bold leading-tight ${isDone ? "text-gray-400 line-through" : "text-gray-900"}`}>{s.title}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{s.body}</p>
              {!isDone && (
                <button onClick={() => markDone(s.id, s.tab)}
                  className={`self-start flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    i === 0
                      ? "bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-200"
                      : "bg-white border border-gray-200 hover:border-amber-300 text-gray-700 hover:text-amber-700"
                  }`}>
                  {s.cta} <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
