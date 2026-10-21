"use client";
import { useState, useEffect } from "react";
import { Users, Search, Plus, Mail, Phone, Building2, ChevronRight,
  X, Loader2, User, Tag, Star } from "lucide-react";

// DB columns: name, company, role, email, phone, location, tier, 
//             birthday, work_anniversary, total_gifts_sent, total_amount_spent, notes
interface Client {
  id: string; name: string; email: string | null;
  phone: string | null; company: string | null;
  department?: string | null; role: string | null;
  tier: string | null; total_gifts_sent: number | null;
  total_amount_spent: number | null; created_at: string;
  birthday?: string | null; work_anniversary?: string | null;
}

const TIER_COLORS: Record<string, string> = {
  platinum: "bg-violet-50 border-violet-200 text-violet-700",
  gold:     "bg-yellow-50 border-yellow-200 text-yellow-700",
  silver:   "bg-gray-100 border-gray-200 text-gray-500",
};

function ClientRow({ c, selected, onClick }: { c: Client; selected: boolean; onClick: () => void }) {
  return (
    <tr onClick={onClick} className={`cursor-pointer transition-colors border-b border-gray-50 ${selected ? "bg-amber-50" : "hover:bg-gray-50"}`}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-amber-700">{c.name.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{c.name}</p>
            {c.role && <p className="text-[10px] text-gray-400">{c.role}</p>}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">{c.email ?? "—"}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{c.company ?? "—"}</td>
      <td className="px-4 py-3">
        {c.tier && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${TIER_COLORS[c.tier] ?? "bg-gray-100 border-gray-200 text-gray-500"}`}>
            {c.tier}
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
      </td>
    </tr>
  );
}

function ClientDetail({ c, onClose }: { c: Client; onClose: () => void }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-amber-50 to-white border-b border-gray-100 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
            <span className="text-xl font-bold text-amber-700">{c.name.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h2 className="font-bold text-gray-900">{c.name}</h2>
            <p className="text-sm text-gray-500">{c.role ?? ""}
              {c.company ? ` · ${c.company}` : ""}
            </p>
            {c.tier && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${TIER_COLORS[c.tier] ?? "bg-gray-100 border-gray-200 text-gray-500"}`}>
                {c.tier}
              </span>
            )}
          </div>
        </div>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-gray-200 hover:bg-gray-50 shrink-0">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Details */}
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Email",    val: c.email,   icon: Mail },
            { label: "Phone",    val: c.phone,   icon: Phone },
            { label: "Company",  val: c.company, icon: Building2 },
            { label: "Role",     val: c.role,    icon: User },
          ].map(f => (
            <div key={f.label} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
              <f.icon className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{f.label}</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5 break-all">{f.val ?? "—"}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Gift stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-center">
            <p className="text-lg font-bold text-amber-800">{c.total_gifts_sent ?? 0}</p>
            <p className="text-xs text-amber-600">Gifts Sent</p>
          </div>
          <div className="p-3 bg-green-50 border border-green-100 rounded-lg text-center">
            <p className="text-lg font-bold text-green-800">
              KES {(Number(c.total_amount_spent ?? 0)).toLocaleString()}
            </p>
            <p className="text-xs text-green-600">Total Spent</p>
          </div>
        </div>

        {/* Key dates */}
        {(c.birthday || c.work_anniversary) && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Key Dates</p>
            {c.birthday && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span>🎂</span> Birthday: <strong>{new Date(c.birthday).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}</strong>
              </div>
            )}
            {c.work_anniversary && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span>🎊</span> Work Anniversary: <strong>{new Date(c.work_anniversary).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}</strong>
              </div>
            )}
          </div>
        )}

        {/* CTA buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          {c.email && (
            <a href={`mailto:${c.email}`}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors">
              <Mail className="w-4 h-4" /> Email
            </a>
          )}
          {c.phone && (
            <a href={`https://wa.me/${c.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2.5 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold rounded-lg hover:bg-green-100 transition-colors">
              💬 WhatsApp
            </a>
          )}
          <button className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:border-amber-300 transition-all">
            <Star className="w-4 h-4" /> Gift
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ClientsTab() {
  const [clients, setClients]   = useState<Client[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState<Client | null>(null);
  const [tier, setTier]         = useState("all");

  useEffect(() => {
    setLoading(true);
    fetch("/api/corporate/clients")
      .then(r => r.json())
      .then(d => setClients(Array.isArray(d) ? d : (d.clients ?? [])))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter(c => {
    const s = search.toLowerCase();
    const matchSearch = !s || c.name.toLowerCase().includes(s)
      || (c.email ?? "").toLowerCase().includes(s)
      || (c.company ?? "").toLowerCase().includes(s);
    const matchTier = tier === "all" || c.tier === tier;
    return matchSearch && matchTier;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">Clients & Recipients</h2>
          <p className="text-sm text-gray-500 mt-0.5">{clients.length} contacts in your directory</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:border-amber-300 text-sm text-gray-700 font-medium rounded-lg transition-all">
            Import CSV
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Add Client
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, company…"
            className="w-full pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"><X className="w-4 h-4" /></button>}
        </div>
        <div className="flex gap-1">
          {["all", "platinum", "gold", "silver"].map(t => (
            <button key={t} onClick={() => setTier(t)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                tier === t ? "bg-amber-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-amber-300"
              }`}>
              {t === "all" ? "All" : t}
            </button>
          ))}
        </div>
      </div>

      {/* Split view */}
      <div className={`grid gap-5 transition-all ${selected ? "lg:grid-cols-[1fr_360px]" : "grid-cols-1"}`}>
        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-amber-500 animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16">
              <Users className="w-10 h-10 text-gray-300 mb-3" />
              <p className="font-semibold text-gray-700">No clients found</p>
              <p className="text-sm text-gray-400 mt-1">{search ? "Try a different search." : "Add your first client contact."}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Name</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Email</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Company</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Tier</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <ClientRow key={c.id} c={c} selected={selected?.id === c.id} onClick={() => setSelected(c)} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {selected && <ClientDetail c={selected} onClose={() => setSelected(null)} />}
      </div>
    </div>
  );
}
