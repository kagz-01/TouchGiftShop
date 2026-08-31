"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users, Gift, TrendingUp, Calendar, Star, Heart,
  Plus, Search, Filter, ArrowRight, Check, Phone,
  Mail, Building2, MapPin, Clock, DollarSign, Sparkles
} from "lucide-react";

type Client = {
  id: string;
  name: string;
  company: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  tier: "platinum" | "gold" | "silver";
  totalGifts: number;
  totalSpent: number;
  lastGiftDate: string;
  nextOccasion: string;
  nextOccasionDate: string;
  notes: string;
  relationship: number; // 1-100
};

const TIER_CONFIG = {
  platinum: { label: "Platinum", color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-500/10", icon: <Star className="w-3 h-3" /> },
  gold: { label: "Gold", color: "text-gold", bg: "bg-gold/10", icon: <Star className="w-3 h-3" /> },
  silver: { label: "Silver", color: "text-gray-400", bg: "bg-gray-100 dark:bg-white/5", icon: <Star className="w-3 h-3" /> },
};

export default function ClientAppreciationNetwork() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch("/api/corporate/clients");
        const data = await res.json();
        if (data.clients) {
          setClients(data.clients.map((c: Record<string, unknown>) => ({
            id: c.id,
            name: c.name,
            company: c.company || "",
            role: c.role || "",
            email: c.email || "",
            phone: c.phone || "",
            location: c.location || "",
            tier: c.tier,
            totalGifts: c.total_gifts_sent || 0,
            totalSpent: c.total_amount_spent || 0,
            lastGiftDate: c.last_gift_date || "",
            nextOccasion: c.next_occasion || "",
            nextOccasionDate: c.next_occasion_date || "",
            notes: c.notes || "",
            relationship: c.relationship_strength || 50,
          })));
        }
      } catch {
        // Use empty state on error
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const filtered = clients.filter((c) => {
    const matchesSearch = search === "" || c.name.toLowerCase().includes(search.toLowerCase()) || c.company.toLowerCase().includes(search.toLowerCase());
    const matchesTier = tierFilter === "all" || c.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const stats = {
    totalClients: clients.length,
    totalSpent: clients.reduce((sum, c) => sum + c.totalSpent, 0),
    avgRelationship: Math.round(clients.reduce((sum, c) => sum + c.relationship, 0) / clients.length),
    upcomingOccasions: clients.filter((c) => {
      const days = Math.ceil((new Date(c.nextOccasionDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return days <= 30 && days > 0;
    }).length,
  };

  return (
    <div className="min-h-screen section-theme-a">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-surface-border">
        <div className="page-container-capped py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display italic text-2xl font-bold">Client Appreciation Network</h1>
              <p className="text-theme-muted text-sm">Nurture relationships with thoughtful, automated gifting.</p>
            </div>
            <Link
              href="/corporate/clients/add"
              className="px-5 py-3 bg-brand text-white shape-premium-card font-semibold text-sm hover:bg-brand-dark transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Client
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Clients", value: stats.totalClients, icon: <Users className="w-5 h-5" />, color: "text-brand" },
              { label: "Total Invested", value: `KSh ${(stats.totalSpent / 1000).toFixed(0)}K`, icon: <DollarSign className="w-5 h-5" />, color: "text-gold" },
              { label: "Avg Relationship", value: `${stats.avgRelationship}%`, icon: <Heart className="w-5 h-5" />, color: "text-pink-500" },
              { label: "Upcoming (30d)", value: stats.upcomingOccasions, icon: <Calendar className="w-5 h-5" />, color: "text-violet-500" },
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

          {/* Search & filter */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
              <input
                type="text"
                placeholder="Search clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/50 border border-surface-border shape-premium-card pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              />
            </div>
            <div className="flex gap-2">
              {["all", "platinum", "gold", "silver"].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setTierFilter(tier)}
                  className={`px-3 py-2 shape-premium-button text-xs font-medium capitalize transition-all ${
                    tierFilter === tier
                      ? "bg-brand text-white"
                      : "bg-white/80 border border-surface-border text-theme-muted hover:border-brand/30"
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="page-container-capped py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client list */}
          <div className="lg:col-span-2 space-y-3">
            {filtered.map((client) => {
              const tierCfg = TIER_CONFIG[client.tier];
              const daysUntilOccasion = Math.ceil((new Date(client.nextOccasionDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

              return (
                <div
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`bg-white/80 backdrop-blur-sm shape-premium-card p-5 border shadow-sm cursor-pointer transition-all hover:shadow-card-hover ${
                    selectedClient?.id === client.id ? "border-brand shadow-ribbon" : "border-surface-border"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-brand/10 shape-premium-card flex items-center justify-center text-brand font-bold text-lg">
                        {client.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-theme-heading">{client.name}</h3>
                        <p className="text-xs text-theme-muted">{client.role} · {client.company}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-semibold shape-premium-button flex items-center gap-1 ${tierCfg.color} ${tierCfg.bg}`}>
                      {tierCfg.icon} {tierCfg.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-theme-muted mb-3">
                    <span className="flex items-center gap-1"><Gift className="w-3 h-3" /> {client.totalGifts} gifts</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> KSh {(client.totalSpent / 1000).toFixed(0)}K spent</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {client.location}</span>
                  </div>

                  {/* Relationship bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-theme-muted">Relationship strength</span>
                      <span className={`font-semibold ${client.relationship >= 80 ? "text-success" : client.relationship >= 50 ? "text-gold" : "text-amber-500"}`}>
                        {client.relationship}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          client.relationship >= 80 ? "bg-success" : client.relationship >= 50 ? "bg-gold" : "bg-amber-500"
                        }`}
                        style={{ width: `${client.relationship}%` }}
                      />
                    </div>
                  </div>

                  {/* Next occasion */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-violet-500" />
                      <span className="text-xs text-theme-heading font-semibold">
                        {client.nextOccasion} · {daysUntilOccasion <= 0 ? "Today!" : `in ${daysUntilOccasion} days`}
                      </span>
                    </div>
                    <button className="px-3 py-1 bg-brand text-white shape-premium-button text-xs font-semibold hover:bg-brand-dark transition-colors flex items-center gap-1">
                      <Gift className="w-3 h-3" /> Send Gift
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Client detail sidebar */}
          <div className="space-y-4">
            {selectedClient ? (
              <>
                {/* Profile card */}
                <div className="bg-white/80 backdrop-blur-sm shape-premium-card p-6 border border-surface-border shadow-sm text-center">
                  <div className="w-20 h-20 mx-auto bg-brand/10 shape-premium-card flex items-center justify-center text-brand font-bold text-2xl mb-3">
                    {selectedClient.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <h3 className="font-display italic text-lg font-bold text-theme-heading">{selectedClient.name}</h3>
                  <p className="text-sm text-theme-muted">{selectedClient.role}</p>
                  <p className="text-sm font-semibold text-brand">{selectedClient.company}</p>

                  <div className="flex justify-center gap-4 mt-4 text-xs text-theme-muted">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> Email</span>
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> Call</span>
                  </div>
                </div>

                {/* Gift history */}
                <div className="bg-white/80 backdrop-blur-sm shape-premium-card p-5 border border-surface-border shadow-sm">
                  <h3 className="text-sm font-semibold text-theme-heading mb-3">Gift History</h3>
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="w-10 h-10 rounded-full bg-theme-muted/10 flex items-center justify-center mb-3">
                      <Gift className="w-5 h-5 text-theme-muted" />
                    </div>
                    <p className="text-sm font-medium text-theme-heading">No gift history yet</p>
                    <p className="text-xs text-theme-muted mt-1">Gifts sent to this client will appear here</p>
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-white/80 backdrop-blur-sm shape-premium-card p-5 border border-surface-border shadow-sm">
                  <h3 className="text-sm font-semibold text-theme-heading mb-2">Notes</h3>
                  <p className="text-sm text-theme-body">{selectedClient.notes}</p>
                </div>

                {/* Quick actions */}
                <div className="bg-white/80 backdrop-blur-sm shape-premium-card p-5 border border-surface-border shadow-sm space-y-2">
                  <Link
                    href="/corporate/build"
                    className="flex items-center gap-3 p-3 bg-brand/5 hover:bg-brand/10 shape-premium-card transition-colors text-sm font-medium text-brand"
                  >
                    <Gift className="w-4 h-4" /> Send a Gift
                  </Link>
                  <Link
                    href="/corporate/pool/create"
                    className="flex items-center gap-3 p-3 bg-violet-50 dark:bg-violet-500/10 hover:bg-violet-100 dark:hover:bg-violet-500/20 shape-premium-card transition-colors text-sm font-medium text-violet-600"
                  >
                    <Users className="w-4 h-4" /> Create Pool
                  </Link>
                  <button className="w-full flex items-center gap-3 p-3 bg-gold/10 hover:bg-gold/20 shape-premium-card transition-colors text-sm font-medium text-gold">
                    <Sparkles className="w-4 h-4" /> Schedule Auto-Gift
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm shape-premium-card p-8 border border-surface-border shadow-sm text-center">
                <Users className="w-10 h-10 text-theme-muted mx-auto mb-3" />
                <p className="text-sm text-theme-muted">Select a client to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
