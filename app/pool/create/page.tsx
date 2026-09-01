"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import {
  Gift, Users, Settings, Eye, Share2, CheckCircle2,
  ChevronRight, ChevronLeft, Upload, Calendar, Lock,
  Globe, Sparkles, Target, ArrowRight, UserRound
} from "lucide-react";

// ─── Step config ────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, title: "Recipient",    icon: Gift,     desc: "Who are you gifting?" },
  { id: 2, title: "Gift",        icon: Sparkles,  desc: "Curate the perfect gift" },
  { id: 3, title: "Pool Setup",  icon: Settings,  desc: "Target & deadline" },
  { id: 4, title: "Privacy",     icon: Lock,      desc: "Control the experience" },
  { id: 5, title: "Preview",     icon: Eye,       desc: "See your pool page" },
  { id: 6, title: "Launch",      icon: Share2,    desc: "Share and collect" },
];

const OCCASIONS = [
  "🎂 Birthday", "💍 Wedding", "🎊 Anniversary", "👶 Baby Shower",
  "🎓 Graduation", "💼 Promotion", "🏠 Housewarming", "💝 Just Because",
  "🎄 Christmas", "🌸 Mother's Day", "👨 Father's Day", "💑 Valentine's",
  "+ Other",
];

type WizardData = {
  // Step 1
  recipientName: string;
  recipientPhoto: string;
  occasion: string;
  customOccasion: string;
  surpriseMode: boolean;
  // Step 2
  giftName: string;
  giftPrice: number;
  giftImageUrl: string;
  giftProductId: string;
  aiQuery: string;
  // Step 3
  title: string;
  description: string;
  targetAmount: number;
  minContribution: number;
  deadline: string;
  overTargetBehaviour: "wallet_credit" | "gift_upgrade";
  // Step 4
  privacyMode: "named" | "anonymous";
  ghostModeAllowed: boolean;
};

const defaultData: WizardData = {
  recipientName: "", recipientPhoto: "", occasion: "", customOccasion: "", surpriseMode: true,
  giftName: "", giftPrice: 0, giftImageUrl: "", giftProductId: "", aiQuery: "",
  title: "", description: "", targetAmount: 0, minContribution: 200,
  deadline: (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().split("T")[0]; })(),
  overTargetBehaviour: "wallet_credit",
  privacyMode: "named", ghostModeAllowed: true,
};

// ─── Step components ──────────────────────────────────────────────────────

function StepRecipient({ data, set }: { data: WizardData; set: (k: keyof WizardData, v: unknown) => void }) {
  const [photoLoading, setPhotoLoading] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("File too large. Max 5MB."); return; }
    setPhotoLoading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `pool-photos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("avatars").upload(path, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      set("recipientPhoto", urlData.publicUrl);
    } catch (err) {
      alert("Upload failed: " + (err as Error).message);
    } finally {
      setPhotoLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-brand-deep mb-2">Recipient&apos;s Name *</label>
        <input
          value={data.recipientName}
          onChange={e => { set("recipientName", e.target.value); set("title", `Gift Pool for ${e.target.value}`); }}
          placeholder="e.g. Amira"
          className="w-full px-4 py-3 rounded-2xl border-2 border-brand/10 focus:border-brand focus:outline-none font-sans text-brand-deep bg-white transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-brand-deep mb-2">Occasion</label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {OCCASIONS.map(occ => (
            <button
              key={occ}
              onClick={() => { set("occasion", occ); if (occ !== "✨ Other") set("customOccasion", ""); }}
              className={`py-2 px-3 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                data.occasion === occ
                  ? "bg-brand text-white shadow-md scale-[1.02]"
                  : "bg-brand/5 text-brand-deep hover:bg-brand/10"
              }`}
            >
              {occ}
            </button>
          ))}
        </div>
        {data.occasion === "✨ Other" && (
          <input
            value={data.customOccasion}
            onChange={e => set("customOccasion", e.target.value)}
            placeholder="e.g. Retirement, Welcome Baby, New Home..."
            className="w-full mt-3 px-4 py-3 rounded-2xl border-2 border-brand/10 focus:border-brand focus:outline-none font-sans text-brand-deep bg-white transition-colors"
            autoFocus
          />
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-brand-deep mb-2">Recipient Photo <span className="text-brand-deep/40 font-normal">(optional — shown on pool page)</span></label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handlePhotoUpload}
          className="hidden"
          id="recipient-photo"
        />
        <label htmlFor="recipient-photo" className="block">
          {data.recipientPhoto ? (
            <div className="relative rounded-2xl overflow-hidden border-2 border-brand/20 group">
              <img src={data.recipientPhoto} alt="Recipient" className="w-full h-40 object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm font-semibold">{photoLoading ? "Uploading..." : "Change Photo"}</span>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-brand/20 rounded-2xl p-6 text-center hover:border-brand/40 transition-colors cursor-pointer group">
              {photoLoading ? (
                <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              ) : (
                <Upload className="w-8 h-8 text-brand/30 group-hover:text-brand/60 mx-auto mb-2 transition-colors" />
              )}
              <p className="text-sm text-brand-deep/50">{photoLoading ? "Uploading..." : "Click to upload or drag & drop"}</p>
              <p className="text-xs text-brand-deep/30 mt-1">JPG, PNG up to 5MB</p>
            </div>
          )}
        </label>
      </div>

      <div className="flex items-center justify-between p-4 rounded-2xl bg-brand/5 border border-brand/10">
        <div>
          <p className="font-semibold text-brand-deep text-sm">🎁 Surprise Mode</p>
          <p className="text-xs text-brand-deep/60 mt-0.5">Recipient is notified only when the gift ships, not during collection</p>
        </div>
        <button
          onClick={() => set("surpriseMode", !data.surpriseMode)}
          className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${data.surpriseMode ? "bg-brand" : "bg-gray-200"}`}
        >
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${data.surpriseMode ? "left-7" : "left-1"}`} />
        </button>
      </div>
    </div>
  );
}

function StepGift({ data, set }: { data: WizardData; set: (k: keyof WizardData, v: unknown) => void }) {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{ name: string; price: number; image: string }[]>([]);

  const runAI = async () => {
    if (!data.aiQuery.trim()) return;
    setAiLoading(true);
    // Fetch from gift-finder API
    try {
      const res = await fetch(`/api/ai/suggest?q=${encodeURIComponent(data.aiQuery)}&limit=4`);
      if (res.ok) {
        const d = await res.json();
        setAiSuggestions(d.suggestions ?? []);
      }
    } catch { /* noop */ }
    setAiLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/20">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-gold" />
          <span className="text-sm font-semibold text-brand-deep">AI Gift Suggester</span>
        </div>
        <div className="flex gap-2">
          <input
            value={data.aiQuery}
            onChange={e => set("aiQuery", e.target.value)}
            onKeyDown={e => e.key === "Enter" && runAI()}
            placeholder={`Describe ${data.recipientName || "the recipient"}... e.g. "loves cooking, 30th birthday"`}
            className="flex-1 px-3 py-2 rounded-xl text-sm border border-gold/20 focus:border-gold focus:outline-none bg-white"
          />
          <button
            onClick={runAI}
            disabled={aiLoading}
            className="px-4 py-2 bg-gold text-white rounded-xl text-sm font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50"
          >
            {aiLoading ? "..." : "Find"}
          </button>
        </div>
        {aiSuggestions.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {aiSuggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => { set("giftName", s.name); set("giftPrice", s.price); set("targetAmount", s.price); set("giftImageUrl", s.image); }}
                className={`p-2 rounded-xl text-left text-xs transition-all border-2 ${data.giftName === s.name ? "border-brand bg-brand/5" : "border-transparent bg-white hover:border-brand/30"}`}
              >
                <div className="font-semibold text-brand-deep truncate">{s.name}</div>
                <div className="text-brand/70">KES {s.price.toLocaleString()}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px bg-brand/10" />
        <span className="text-xs text-brand-deep/40 font-medium">or enter manually</span>
        <div className="flex-1 h-px bg-brand/10" />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-semibold text-brand-deep mb-2">Gift Name</label>
          <input
            value={data.giftName}
            onChange={e => set("giftName", e.target.value)}
            placeholder="e.g. Premium Spa Hamper"
            className="w-full px-4 py-3 rounded-2xl border-2 border-brand/10 focus:border-brand focus:outline-none font-sans text-brand-deep bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-brand-deep mb-2">Gift Price (KES)</label>
          <input
            type="number"
            value={data.giftPrice || ""}
            onChange={e => { const v = Number(e.target.value); set("giftPrice", v); set("targetAmount", v); }}
            placeholder="e.g. 5000"
            className="w-full px-4 py-3 rounded-2xl border-2 border-brand/10 focus:border-brand focus:outline-none font-sans text-brand-deep bg-white"
          />
        </div>
      </div>

      {data.giftName && (
        <div className="p-4 rounded-2xl bg-success/5 border border-success/20 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-brand-deep">{data.giftName}</p>
            {data.giftPrice > 0 && <p className="text-xs text-brand-deep/60">Target: KES {data.giftPrice.toLocaleString()}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function StepPoolSetup({ data, set }: { data: WizardData; set: (k: keyof WizardData, v: unknown) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-brand-deep mb-2">Pool Title</label>
        <input
          value={data.title}
          onChange={e => set("title", e.target.value)}
          placeholder={`Gift Pool for ${data.recipientName || "Recipient"}`}
          className="w-full px-4 py-3 rounded-2xl border-2 border-brand/10 focus:border-brand focus:outline-none font-sans text-brand-deep bg-white"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-brand-deep mb-2">Message to Contributors <span className="text-brand-deep/40 font-normal">(optional)</span></label>
        <textarea
          value={data.description}
          onChange={e => set("description", e.target.value)}
          rows={3}
          placeholder={`Help us celebrate ${data.recipientName || "someone special"}!`}
          className="w-full px-4 py-3 rounded-2xl border-2 border-brand/10 focus:border-brand focus:outline-none font-sans text-brand-deep bg-white resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-brand-deep mb-2">Target (KES)</label>
          <input
            type="number"
            value={data.targetAmount || ""}
            onChange={e => set("targetAmount", Number(e.target.value))}
            className="w-full px-4 py-3 rounded-2xl border-2 border-brand/10 focus:border-brand focus:outline-none font-sans text-brand-deep bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-brand-deep mb-2">Min Contribution</label>
          <input
            type="number"
            value={data.minContribution || ""}
            onChange={e => set("minContribution", Number(e.target.value))}
            className="w-full px-4 py-3 rounded-2xl border-2 border-brand/10 focus:border-brand focus:outline-none font-sans text-brand-deep bg-white"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-brand-deep mb-2">
          <Calendar className="w-4 h-4 inline mr-1" />Deadline
        </label>
        <input
          type="date"
          value={data.deadline}
          min={new Date().toISOString().split("T")[0]}
          onChange={e => set("deadline", e.target.value)}
          className="w-full px-4 py-3 rounded-2xl border-2 border-brand/10 focus:border-brand focus:outline-none font-sans text-brand-deep bg-white"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-brand-deep mb-3">If we overshoot the target…</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { val: "wallet_credit", label: "💳 Platform Credit", desc: "Excess goes to your TouchGift wallet" },
            { val: "gift_upgrade", label: "⬆️ Upgrade Gift", desc: "We suggest a better gift from the catalogue" },
          ].map(opt => (
            <button
              key={opt.val}
              onClick={() => set("overTargetBehaviour", opt.val)}
              className={`p-3 rounded-2xl text-left border-2 transition-all ${data.overTargetBehaviour === opt.val ? "border-brand bg-brand/5" : "border-brand/10 hover:border-brand/30"}`}
            >
              <div className="font-semibold text-sm text-brand-deep">{opt.label}</div>
              <div className="text-xs text-brand-deep/50 mt-1">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepPrivacy({ data, set }: { data: WizardData; set: (k: keyof WizardData, v: unknown) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-brand-deep mb-3">Contributor Visibility</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { val: "named", icon: Globe, label: "Named", desc: "Wanjiru contributed KES 500 — warm and social" },
            { val: "anonymous", icon: Lock, label: "Anonymous", desc: "Only the total shown — total privacy" },
          ].map(opt => (
            <button
              key={opt.val}
              onClick={() => set("privacyMode", opt.val)}
              className={`p-4 rounded-2xl text-left border-2 transition-all ${data.privacyMode === opt.val ? "border-brand bg-brand/5" : "border-brand/10 hover:border-brand/30"}`}
            >
              <opt.icon className={`w-5 h-5 mb-2 ${data.privacyMode === opt.val ? "text-brand" : "text-brand/40"}`} />
              <div className="font-semibold text-sm text-brand-deep">{opt.label}</div>
              <div className="text-xs text-brand-deep/50 mt-1">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {[
        { key: "ghostModeAllowed", label: "👻 Allow Ghost Contributions", desc: "Contributors can pay without any name shown anywhere" },
        { key: "surpriseMode", label: "🎁 Surprise Mode", desc: "Recipient notified only when gift is dispatched" },
      ].map(toggle => (
        <div key={toggle.key} className="flex items-center justify-between p-4 rounded-2xl bg-brand/5 border border-brand/10">
          <div>
            <p className="font-semibold text-brand-deep text-sm">{toggle.label}</p>
            <p className="text-xs text-brand-deep/60 mt-0.5">{toggle.desc}</p>
          </div>
          <button
            onClick={() => set(toggle.key as keyof WizardData, !data[toggle.key as keyof WizardData])}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${data[toggle.key as keyof WizardData] ? "bg-brand" : "bg-gray-200"}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${data[toggle.key as keyof WizardData] ? "left-7" : "left-1"}`} />
          </button>
        </div>
      ))}
    </div>
  );
}

function StepPreview({ data }: { data: WizardData }) {
  const progress = data.targetAmount > 0 ? 0 : 0; // Starts at 0 before launch
  return (
    <div className="space-y-4">
      <p className="text-sm text-brand-deep/60 text-center">This is exactly what contributors will see when they open your pool link.</p>
      <div className="rounded-3xl overflow-hidden border-2 border-brand/10 shadow-lg">
        {/* Mock Pool Landing */}
        <div className="bg-gradient-to-br from-brand-deep to-brand p-6 text-white text-center">
          <div className="w-16 h-16 rounded-full bg-white/20 mx-auto mb-3 flex items-center justify-center text-3xl">
            {data.recipientPhoto ? <img src={data.recipientPhoto} className="w-full h-full object-cover rounded-full" alt="" /> : "🎁"}
          </div>
          <h3 className="font-display text-2xl font-bold italic">{data.title || `Gift Pool for ${data.recipientName}`}</h3>
          <p className="text-white/70 text-sm mt-1">{data.occasion === "✨ Other" ? data.customOccasion : data.occasion}</p>
        </div>
        <div className="bg-white p-5">
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-brand-deep">KES 0</span>
              <span className="text-brand-deep/50">of KES {data.targetAmount.toLocaleString()}</span>
            </div>
            <div className="h-3 rounded-full bg-brand/10 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-brand to-gold transition-all duration-1000" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-brand-deep/40 mt-1">0% funded · {data.deadline} deadline</p>
          </div>
          {data.description && <p className="text-sm text-brand-deep/70 italic mb-4">&ldquo;{data.description}&rdquo;</p>}
          <div className="space-y-2 text-xs text-brand-deep/50">
            <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5" /><span>{data.privacyMode === "named" ? "Contributors names visible" : "Anonymous contributions"}</span></div>
            {data.surpriseMode && <div className="flex items-center gap-2"><Gift className="w-3.5 h-3.5" /><span>Surprise mode — recipient notified on dispatch</span></div>}
          </div>
          <button className="mt-4 w-full py-3 bg-gradient-to-r from-brand to-brand-deep text-white rounded-2xl font-bold text-sm">Contribute Now</button>
        </div>
      </div>
    </div>
  );
}

function StepLaunch({ data, poolSlug }: { data: WizardData; poolSlug: string }) {
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/pool/${poolSlug}` : `/pool/${poolSlug}`;
  const whatsappMsg = encodeURIComponent(`🎁 *${data.title}*\n\nHelp us celebrate ${data.recipientName}! We're raising KES ${data.targetAmount.toLocaleString()} for their gift.\n\n👇 Contribute here:\n${shareUrl}`);

  return (
    <div className="space-y-5 text-center">
      <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-10 h-10 text-success" />
      </div>
      <div>
        <h3 className="font-display text-2xl font-bold italic text-brand-deep">Your pool is live! 🎉</h3>
        <p className="text-brand-deep/60 mt-1 text-sm">Share the link with friends and family to start collecting</p>
      </div>
      <div className="p-4 rounded-2xl bg-brand/5 border border-brand/10">
        <p className="text-xs text-brand-deep/50 mb-2 font-semibold uppercase tracking-wide">Your Pool Link</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-sm text-brand-deep bg-white px-3 py-2 rounded-xl border border-brand/10 truncate">{shareUrl}</code>
          <button
            onClick={() => navigator.clipboard?.writeText(shareUrl)}
            className="px-3 py-2 bg-brand text-white rounded-xl text-xs font-semibold hover:bg-brand/90 transition-colors"
          >
            Copy
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <a
          href={`https://wa.me/?text=${whatsappMsg}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 py-3 px-4 bg-green-500 text-white rounded-2xl font-semibold text-sm hover:bg-green-600 transition-colors"
        >
          <span>📱</span> WhatsApp
        </a>
        <a
          href={`/pool/${poolSlug}/manage`}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-brand/5 text-brand-deep border border-brand/15 rounded-2xl font-semibold text-sm hover:bg-brand/10 transition-colors"
        >
          <Target className="w-4 h-4" /> Dashboard
        </a>
      </div>
    </div>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────
export default function CreatePoolPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(defaultData);
  const [poolSlug, setPoolSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authState, setAuthState] = useState<"loading" | "signed_in" | "anonymous">("loading");

  // Pool creation is an account feature — guests can contribute but not organise
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setAuthState(data.user ? "signed_in" : "anonymous");
    });
  }, []);

  const set = useCallback((key: keyof WizardData, value: unknown) => {
    setData(prev => ({ ...prev, [key]: value }));
  }, []);

  const canNext = () => {
    if (step === 1) return data.recipientName.trim().length > 0;
    if (step === 2) return data.giftName.trim().length > 0 && data.giftPrice > 0;
    if (step === 3) return data.targetAmount > 0 && data.deadline;
    return true;
  };

  const handleLaunch = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/pools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: data.recipientName,
          recipientPhotoUrl: data.recipientPhoto || undefined,
          occasion: data.occasion === "✨ Other" ? data.customOccasion : (data.occasion || undefined),
          title: data.title || `Gift Pool for ${data.recipientName}`,
          description: data.description || undefined,
          giftName: data.giftName,
          giftPrice: data.giftPrice,
          giftImageUrl: data.giftImageUrl || undefined,
          targetAmount: data.targetAmount,
          minContribution: data.minContribution,
          overTargetBehaviour: data.overTargetBehaviour,
          expiresAt: new Date(data.deadline + "T23:59:59").toISOString(),
          privacyMode: data.privacyMode,
          surpriseMode: data.surpriseMode,
          ghostModeAllowed: data.ghostModeAllowed,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to create pool");
      setPoolSlug(json.pool.slug);
      setStep(6);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const stepComponents: Record<number, React.ReactNode> = {
    1: <StepRecipient data={data} set={set} />,
    2: <StepGift data={data} set={set} />,
    3: <StepPoolSetup data={data} set={set} />,
    4: <StepPrivacy data={data} set={set} />,
    5: <StepPreview data={data} />,
    6: <StepLaunch data={data} poolSlug={poolSlug} />,
  };

  const currentStep = STEPS[step - 1];

  // ─── Sign-in gate: organising a pool requires an account ───
  if (authState === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF5F8] to-[#FDF8F4] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (authState === "anonymous") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF5F8] to-[#FDF8F4] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-black/6 shadow-sm p-8 text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-brand/10 flex items-center justify-center">
            <UserRound className="w-7 h-7 text-brand" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-brand-deep">An account is needed to organise a pool</h1>
            <p className="text-sm text-brand-muted mt-2">
              You&apos;ll be the organiser — you pick the gift, invite contributors and track progress. Anyone can contribute to a pool without an account.
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            <a
              href="/login?mode=signup&next=/pool/create"
              className="w-full bg-brand text-white font-bold text-sm py-3 rounded-xl hover:bg-brand-dark hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Create account
            </a>
            <a
              href="/login?next=/pool/create"
              className="w-full bg-white text-brand-deep border border-surface-border font-bold text-sm py-3 rounded-xl hover:border-brand/40 transition-colors"
            >
              Sign in
            </a>
          </div>
          <p className="text-xs text-brand-muted">
            Want to contribute to someone&apos;s pool instead?{" "}
            <button onClick={() => router.push("/pool")} className="text-brand underline font-semibold">Browse pools</button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5F8] to-[#FDF8F4]">
      <div className="max-w-xl mx-auto px-4 py-8 pb-24">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand/5 rounded-full border border-brand/10 mb-4">
            <Gift className="w-4 h-4 text-brand" />
            <span className="text-xs font-semibold text-brand uppercase tracking-widest">Gift Pool</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold italic text-brand-deep">
            Create a Gift Pool
          </h1>
          <p className="text-brand-deep/60 mt-2 text-sm">Gather friends &amp; family to gift something extraordinary</p>
        </div>

        {/* Step Indicator */}
        {step < 6 && (
          <div className="flex items-center justify-center gap-1 mb-8">
            {STEPS.slice(0, 5).map((s, i) => (
              <div key={s.id} className="flex items-center">
                <button
                  onClick={() => i < step - 1 && setStep(s.id)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 text-xs font-bold ${
                    s.id === step
                      ? "bg-brand text-white scale-110 shadow-md"
                      : s.id < step
                      ? "bg-brand/20 text-brand cursor-pointer hover:bg-brand/30"
                      : "bg-brand/5 text-brand-deep/30"
                  }`}
                >
                  {s.id < step ? "✓" : s.id}
                </button>
                {i < 4 && <div className={`w-6 h-0.5 mx-1 transition-colors duration-500 ${s.id < step ? "bg-brand/30" : "bg-brand/10"}`} />}
              </div>
            ))}
          </div>
        )}

        {/* Step Card */}
        <div className="bg-white rounded-3xl shadow-card p-6 md:p-8">
          {step < 6 && (
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-brand/5">
              <div className="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center">
                <currentStep.icon className="w-5 h-5 text-brand" />
              </div>
              <div>
                <p className="text-xs font-bold text-brand/60 uppercase tracking-widest">Step {step} of 5</p>
                <h2 className="font-display text-xl font-bold text-brand-deep">{currentStep.desc}</h2>
              </div>
            </div>
          )}

          {stepComponents[step]}

          {error && <p className="mt-4 text-red-500 text-sm text-center">{error}</p>}
        </div>

        {/* Navigation */}
        {step < 6 && (
          <div className="flex justify-between mt-6">
            <button
              onClick={() => step > 1 && setStep(s => s - 1)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm transition-all ${
                step === 1 ? "opacity-0 pointer-events-none" : "text-brand-deep/60 hover:text-brand-deep hover:bg-brand/5"
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            {step < 5 ? (
              <button
                onClick={() => canNext() && setStep(s => s + 1)}
                disabled={!canNext()}
                className="flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-2xl font-semibold text-sm hover:bg-brand/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleLaunch}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-brand to-gold text-white rounded-2xl font-bold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                {loading ? "Launching..." : <>Launch Pool <ArrowRight className="w-4 h-4" /></>}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
