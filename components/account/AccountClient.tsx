"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase-browser";
import { cn, formatKsh } from "@/lib/utils";
import { getLoyaltyTier, getNextTier, LOYALTY_TIERS } from "@/lib/loyalty";
import {
  User, ShoppingBag, Gift, Settings, ChevronRight,
  Camera, Check, Copy, Star, LogOut, Bell, Eye, EyeOff
} from "lucide-react";

interface AccountClientProps {
  userId: string;
  phone: string | null;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
}

const NAV_ITEMS = [
  { id: "profile", label: "Profile", Icon: User },
  { id: "activity", label: "Activity", Icon: ShoppingBag },
  { id: "rewards", label: "Rewards", Icon: Gift },
  { id: "settings", label: "Settings", Icon: Settings },
];

const STATUS_COLORS: Record<string, string> = {
  pending_payment: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  wrapped: "bg-purple-100 text-purple-700",
  dispatched: "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};
const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Awaiting payment",
  processing: "Processing",
  wrapped: "Wrapped & ready",
  dispatched: "Out for delivery",
  delivered: "Delivered",
  failed: "Payment failed",
};

const TIER_ICONS: Record<string, string> = {
  Bronze: "🥉",
  Silver: "🥈",
  Gold: "🥇",
  Platinum: "💎",
};

export default function AccountClient({ userId, phone, name, email, avatarUrl }: AccountClientProps) {
  const [activeSection, setActiveSection] = useState("profile");
  const [anonymousDefault, setAnonymousDefault] = useState(false);
  const [prefSaved, setPrefSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(name ?? "");
  const [nameSaved, setNameSaved] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(avatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayName = nameInput || name || phone || email || "Gift Sender";
  const initials = displayName.slice(0, 2).toUpperCase();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const meta = data.user?.user_metadata ?? {};
      setAnonymousDefault(meta.anonymous_default ?? false);
      const code = meta.referral_code || `TG-${userId.slice(0, 8).toUpperCase()}`;
      setReferralCode(code);
      if (!meta.referral_code) {
        supabase.auth.updateUser({ data: { referral_code: code } });
      }
    });
  }, [userId]);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.orders ?? []);
        setOrdersLoading(false);
      })
      .catch(() => setOrdersLoading(false));
  }, []);

  const orderCount = orders.length;
  const totalSpend = orders.reduce((sum: number, o: any) => sum + o.total_amount, 0);
  const tier = getLoyaltyTier(orderCount, totalSpend);
  const nextTier = getNextTier(orderCount, totalSpend);

  // Progress toward next tier (based on orders, capped at 100)
  const progressPct = nextTier
    ? Math.min(100, Math.round((orderCount / nextTier.minOrders) * 100))
    : 100;

  async function saveName() {
    const supabase = createClient();
    await supabase.auth.updateUser({ data: { full_name: nameInput } });
    setNameSaved(true);
    setEditingName(false);
    setTimeout(() => setNameSaved(false), 2000);
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `avatars/${userId}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setCurrentAvatarUrl(data.publicUrl);
      await supabase.auth.updateUser({ data: { avatar_url: data.publicUrl } });
    }
    setAvatarLoading(false);
  }

  async function toggleAnonymous() {
    const next = !anonymousDefault;
    setAnonymousDefault(next);
    setPrefSaved(false);
    const supabase = createClient();
    await supabase.auth.updateUser({ data: { anonymous_default: next } });
    setPrefSaved(true);
    setTimeout(() => setPrefSaved(false), 2000);
  }

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  async function copyReferral() {
    const url = `${window.location.origin}?ref=${referralCode}`;
    try { await navigator.clipboard.writeText(url); } catch { /* fallback */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-gradient-warm pb-24">
      {/* ─── HERO HEADER ─── */}
      <div className="bg-gradient-to-br from-brand-dark via-brand to-brand/80 px-4 pt-10 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Shop
            </Link>
          </div>

          <div className="flex items-center gap-5">
            {/* Avatar with upload */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center overflow-hidden border-2 border-white/30 shadow-xl hover:border-white/60 transition-all group"
              >
                {currentAvatarUrl ? (
                  <Image src={currentAvatarUrl} alt={displayName} width={80} height={80} className="object-cover w-full h-full" />
                ) : (
                  <span className="text-2xl font-display font-bold text-white">{initials}</span>
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                {avatarLoading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /></div>}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="font-display text-2xl md:text-3xl font-bold text-white truncate">{displayName}</h1>
              <p className="text-white/70 text-sm mt-0.5">{phone ?? email ?? "Gift Sender"}</p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full"
                  style={{ backgroundColor: tier.color + "33", color: "#fff", border: `1px solid ${tier.color}88` }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tier.color }} />
                  {tier.name} Member
                </span>
                <span className="text-white/50 text-xs">{orderCount} orders</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="max-w-5xl mx-auto px-4 -mt-14 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ─── SIDEBAR NAV ─── */}
          <div className="lg:w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-surface-border shadow-card overflow-hidden">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    "w-full text-left px-5 py-3.5 text-sm font-semibold transition-all border-b border-surface-border last:border-b-0 flex items-center gap-3",
                    activeSection === item.id
                      ? "bg-brand/5 text-brand border-l-2 border-l-brand pl-4"
                      : "text-brand-muted hover:text-brand-deep hover:bg-surface"
                  )}
                >
                  <item.Icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </button>
              ))}
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full text-left px-5 py-3.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors flex items-center gap-3"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                {loggingOut ? "Signing out…" : "Sign Out"}
              </button>
            </div>
          </div>

          {/* ─── CONTENT PANELS ─── */}
          <div className="flex-1 space-y-5">

            {/* ═══════════ PROFILE TAB ═══════════ */}
            {activeSection === "profile" && (
              <div className="space-y-5 animate-fade-in">
                {/* Name editing */}
                <div className="bg-white rounded-2xl border border-surface-border shadow-card p-6">
                  <h2 className="font-display font-bold text-brand-deep text-lg mb-5">Your Profile</h2>
                  <div className="space-y-4">
                    {/* Display name */}
                    <div>
                      <label className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-2 block">Display Name</label>
                      {editingName ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            autoFocus
                            className="flex-1 border border-surface-border rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-deep focus:outline-none focus:border-brand"
                          />
                          <button onClick={saveName} className="px-4 py-2.5 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand-dark transition-colors">
                            Save
                          </button>
                          <button onClick={() => { setEditingName(false); setNameInput(name ?? ""); }} className="px-4 py-2.5 bg-surface text-brand-muted rounded-xl text-sm font-bold">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between bg-surface rounded-xl px-4 py-3">
                          <span className="text-sm font-semibold text-brand-deep">{nameInput || "Not set"}</span>
                          <button onClick={() => setEditingName(true)} className="text-xs text-brand hover:text-brand-dark font-bold">Edit</button>
                        </div>
                      )}
                      {nameSaved && <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1"><Check className="w-3 h-3" /> Name saved!</p>}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-2 block">Phone</label>
                      <div className="flex items-center justify-between bg-surface rounded-xl px-4 py-3">
                        <span className="text-sm font-semibold text-brand-deep">{phone ?? "Not set"}</span>
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-2 block">Email</label>
                      <div className="flex items-center justify-between bg-surface rounded-xl px-4 py-3">
                        <span className="text-sm font-semibold text-brand-deep">{email ?? "Not set"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="bg-white rounded-2xl border border-surface-border shadow-card p-5">
                  <h2 className="font-display font-bold text-brand-deep mb-4">Quick Access</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { href: "/orders", label: "My Orders", d: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
                      { href: "/reminders", label: "Reminders", d: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
                      { href: "/gift-lab/pool", label: "Gift Pool", d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
                      { href: "/wishlist/create", label: "Wishlist", d: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
                    ].map((link) => (
                      <Link key={link.href} href={link.href} className="flex flex-col items-center gap-2 p-4 bg-surface rounded-xl hover:bg-brand/5 hover:border-brand/20 border border-transparent transition-all group text-center">
                        <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center group-hover:bg-brand/20 transition-colors">
                          <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={link.d} />
                          </svg>
                        </div>
                        <span className="text-xs font-bold text-brand-deep">{link.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Contact support */}
                <div className="bg-white rounded-2xl border border-surface-border shadow-card p-5">
                  <h2 className="font-display font-bold text-brand-deep mb-4">Need Help?</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <a href="https://wa.me/254142677898" target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 hover:shadow-card transition-all">
                      <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.535 5.855L.057 23.998l6.297-1.649A11.938 11.938 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.866 9.866 0 01-5.035-1.378l-.361-.214-3.741.98 1.001-3.649-.235-.374A9.862 9.862 0 012.106 12C2.106 6.527 6.527 2.106 12 2.106S21.894 6.527 21.894 12 17.473 21.894 12 21.894z"/></svg>
                      </div>
                      <div><p className="font-bold text-sm text-brand-deep">WhatsApp</p><p className="text-xs text-brand-muted">Chat support</p></div>
                    </a>
                    <a href="mailto:info@touchgiftshop.co.ke" className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 hover:shadow-card transition-all">
                      <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      </div>
                      <div><p className="font-bold text-sm text-brand-deep">Email Us</p><p className="text-xs text-brand-muted">info@touchgiftshop.co.ke</p></div>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════ ACTIVITY TAB ═══════════ */}
            {activeSection === "activity" && (
              <div className="space-y-5 animate-fade-in">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Orders", value: ordersLoading ? "…" : orderCount },
                    { label: "Total spent", value: ordersLoading ? "…" : formatKsh(totalSpend) },
                    { label: "Your tier", value: tier.name },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-2xl border border-surface-border p-5 text-center shadow-card">
                      <p className="font-display text-2xl font-bold text-brand-deep">{stat.value}</p>
                      <p className="text-xs text-brand-muted mt-1 font-medium">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Orders list */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display font-bold text-brand-deep text-xl">Order History</h2>
                    <Link href="/orders" className="text-xs font-bold text-brand hover:text-brand-dark">View all →</Link>
                  </div>
                  {ordersLoading ? (
                    <div className="flex justify-center py-12 bg-white rounded-2xl border border-surface-border">
                      <div className="w-7 h-7 border-4 border-brand border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-surface-border">
                      <ShoppingBag className="w-12 h-12 mx-auto text-brand/20 mb-3" />
                      <p className="font-semibold text-brand-deep mb-1">No orders yet</p>
                      <Link href="/shop" className="text-sm text-brand hover:underline">Browse gifts →</Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 6).map((order: any) => (
                        <Link key={order.id} href={`/orders/${order.id}`} className="block bg-white rounded-2xl border border-surface-border p-5 hover:shadow-card transition-shadow">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold text-brand-deep">{order.products?.name ?? "Custom Gift"}</p>
                              <p className="text-sm text-brand-muted mt-0.5">To: {order.recipient_name}</p>
                              <p className="text-xs text-brand-muted mt-1">{new Date(order.created_at).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-brand">{formatKsh(order.total_amount)}</p>
                              <span className={cn("inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1", STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-500")}>
                                {STATUS_LABELS[order.status] ?? order.status}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                      {orders.length > 6 && (
                        <Link href="/orders" className="block text-center py-3 text-sm font-bold text-brand hover:text-brand-dark">
                          View {orders.length - 6} more orders →
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══════════ REWARDS TAB ═══════════ */}
            {activeSection === "rewards" && (
              <div className="space-y-5 animate-fade-in">
                {/* Current tier hero */}
                <div className="bg-white rounded-2xl border border-surface-border shadow-card overflow-hidden">
                  <div className="p-6" style={{ background: `linear-gradient(135deg, ${tier.color}15 0%, transparent 100%)` }}>
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-md flex-shrink-0" style={{ backgroundColor: tier.color + "22", border: `2px solid ${tier.color}44` }}>
                        {TIER_ICONS[tier.name]}
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-brand-muted">Your current tier</p>
                        <h3 className="font-display text-2xl font-bold text-brand-deep">{tier.name}</h3>
                        <p className="text-sm text-brand-muted">{orderCount} orders · {formatKsh(totalSpend)} spent</p>
                      </div>
                      {tier.discount > 0 && (
                        <div className="ml-auto text-right">
                          <p className="font-display text-3xl font-bold" style={{ color: tier.color }}>{tier.discount}%</p>
                          <p className="text-xs text-brand-muted font-semibold">discount</p>
                        </div>
                      )}
                    </div>

                    {/* Progress to next tier */}
                    {nextTier ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span style={{ color: tier.color }}>{tier.name}</span>
                          <span className="text-brand-muted">{nextTier.name}</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-surface overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ backgroundColor: tier.color, width: `${progressPct}%` }}
                          />
                        </div>
                        <p className="text-xs text-brand-muted text-center">
                          {nextTier.minOrders - orderCount} more order{nextTier.minOrders - orderCount !== 1 ? "s" : ""} + {formatKsh(Math.max(0, nextTier.minSpend - totalSpend))} spend to reach <span className="font-bold">{nextTier.name}</span>
                        </p>
                      </div>
                    ) : (
                      <p className="text-center text-sm font-bold text-brand-muted bg-brand/5 rounded-xl py-3">
                        You&apos;ve reached the highest tier — Platinum Member!
                      </p>
                    )}
                  </div>

                  {/* Benefits */}
                  <div className="px-6 pb-6">
                    <p className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-3">Your {tier.name} benefits</p>
                    <div className="space-y-2">
                      {tier.benefits.map((b: string) => (
                        <div key={b} className="flex items-center gap-2 text-sm">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: tier.color + "22" }}>
                            <Check className="w-3 h-3" style={{ color: tier.color }} />
                          </div>
                          <span className="text-brand-deep">{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* All tiers overview */}
                <div className="bg-white rounded-2xl border border-surface-border shadow-card p-6">
                  <h3 className="font-display font-bold text-brand-deep mb-4">All Loyalty Tiers</h3>
                  <div className="space-y-3">
                    {LOYALTY_TIERS.map((t) => {
                      const isActive = t.name === tier.name;
                      const isUnlocked = orderCount >= t.minOrders && totalSpend >= t.minSpend;
                      return (
                        <div key={t.name} className={cn("flex items-center gap-4 p-4 rounded-xl transition-all border-2", isActive ? "border-brand/30" : "bg-surface border-transparent")} style={isActive ? { backgroundColor: t.color + "08" } : {}}>
                          <span className="text-2xl">{TIER_ICONS[t.name]}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-brand-deep text-sm">{t.name}</p>
                              {isActive && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: t.color }}>Current</span>}
                              {isUnlocked && !isActive && <Check className="w-3.5 h-3.5 text-green-500" />}
                            </div>
                            <p className="text-xs text-brand-muted">{t.minOrders}+ orders · {formatKsh(t.minSpend)}+ spend{t.discount > 0 ? ` · ${t.discount}% off` : ""}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Refer & Earn */}
                <div className="bg-white rounded-2xl border border-surface-border shadow-card p-6 space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Gift className="w-6 h-6 text-brand" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-xl text-brand-deep">Refer & Earn</h3>
                      <p className="text-sm text-brand-muted mt-1">Share your code — both of you get a discount on your next order.</p>
                    </div>
                  </div>

                  <div className="bg-surface rounded-xl p-4 text-center">
                    <p className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">Your Referral Code</p>
                    <p className="font-display text-3xl font-bold text-brand tracking-wider">{referralCode}</p>
                  </div>

                  <button onClick={copyReferral} className="w-full bg-brand text-white font-bold py-3.5 rounded-xl shadow-button hover:bg-brand-dark transition-colors text-sm flex items-center justify-center gap-2">
                    {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Referral Link</>}
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`Hey! I've been gifting via TouchGift — use my code ${referralCode} for a discount. ${typeof window !== "undefined" ? window.location.origin : ""}?ref=${referralCode}`)}`}
                      target="_blank" rel="noreferrer"
                      className="flex items-center justify-center gap-2 bg-green-50 text-green-700 font-bold text-sm py-3 rounded-xl border border-green-200 hover:bg-green-100 transition-colors"
                    >
                      Share on WhatsApp
                    </a>
                    <a
                      href={`mailto:?subject=A gift for you!&body=Hey! Use my code ${referralCode} on TouchGift for a discount: ${typeof window !== "undefined" ? window.location.origin : ""}?ref=${referralCode}`}
                      className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 font-bold text-sm py-3 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors"
                    >
                      Share via Email
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════ SETTINGS TAB ═══════════ */}
            {activeSection === "settings" && (
              <div className="space-y-5 animate-fade-in">
                <h2 className="font-display font-bold text-brand-deep text-xl">Settings</h2>

                {/* Preferences */}
                <div className="bg-white rounded-2xl border border-surface-border shadow-card p-6 space-y-5">
                  <h3 className="font-bold text-brand-deep flex items-center gap-2"><Eye className="w-4 h-4" /> Privacy & Gifting</h3>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-brand-deep text-sm">Default Anonymous Mode</p>
                      <p className="text-sm text-brand-muted mt-0.5">When enabled, the recipient won&apos;t see your name or the gift price on checkout.</p>
                    </div>
                    <button
                      onClick={toggleAnonymous}
                      className={cn("relative inline-flex h-7 w-12 items-center rounded-full transition-colors flex-shrink-0", anonymousDefault ? "bg-brand" : "bg-gray-200")}
                    >
                      <span className={cn("inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform", anonymousDefault ? "translate-x-6" : "translate-x-1")} />
                    </button>
                  </div>
                  {prefSaved && <p className="text-xs text-green-600 font-medium flex items-center gap-1"><Check className="w-3 h-3" /> Saved</p>}
                </div>

                {/* Legal */}
                <div className="bg-white rounded-2xl border border-surface-border shadow-card p-4">
                  <h3 className="font-bold text-brand-deep px-2 pb-3">Policies</h3>
                  {[
                    { href: "/privacy", label: "Privacy Policy" },
                    { href: "/terms", label: "Terms & Conditions" },
                    { href: "/returns", label: "Returns Policy" },
                    { href: "/delivery", label: "Delivery Info" },
                  ].map((link) => (
                    <Link key={link.href} href={link.href} className="flex items-center justify-between py-3 border-b border-surface-border last:border-b-0 hover:text-brand transition-colors px-2">
                      <span className="text-sm font-semibold text-brand-deep">{link.label}</span>
                      <ChevronRight className="w-4 h-4 text-brand-muted" />
                    </Link>
                  ))}
                </div>

                {/* Danger zone */}
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full bg-red-50 text-red-600 font-bold py-3.5 rounded-xl border border-red-200 hover:bg-red-100 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {loggingOut ? "Signing out…" : "Sign Out of Account"}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
