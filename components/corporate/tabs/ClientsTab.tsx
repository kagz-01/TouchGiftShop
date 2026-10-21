"use client";
import { useState, useEffect } from "react";
import { Users, Search, Plus, Mail, Phone, Building2, ChevronRight, X, Loader2, User, Tag } from "lucide-react";

interface Client {
  id: string; full_name: string; email: string | null;
  phone: string | null; company_name: string | null;
  department: string | null; role: string | null;
  tags: string[] | null; created_at: string;
}

function ClientRow({ c, onClick }: { c: Client; onClick: () => void }) {
  return (
    <tr onClick={onClick} className="hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-amber-700">{c.full_name.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{c.full_name}</p>
            {c.role && <p className="text-[10px] text-gray-400">{c.role}</p>}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">{c.email ?? "—"}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{c.company_name ?? "—"}</td>
      <td className="px-4 py-3 text-sm text-gray-500">{c.department ?? "—"}</td>
      <td className="px-4 py-3">
        {c.tags?.slice(0, 2).map(t => (
          <span key={t} className="inline-flex items-center px-1.5 py-0.5 mr-1 bg-gray-100 text-gray-600 text-[10px] font-medium rounded">{t}</span>
        ))}
      </td>
      <td className="px-4 py-3 text-right">
        <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
      </td>
    </tr>
  );
}

function ClientDetail({ c, onClose }: { c: Client; onClose: () => void }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center">
            <span className="text-xl font-bold text-amber-700">{c.full_name.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-lg">{c.full_name}</h2>
            {c.role && <p className="text-sm text-gray-500">{c.role}{c.company_name ? ` · ${c.company_name}` : ""}</p>}
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Email", val: c.email, icon: Mail },
          { label: "Phone", val: c.phone, icon: Phone },
          { label: "Company", val: c.company_name, icon: Building2 },
          { label: "Department", val: c.department, icon: User },
        ].map(f => (
          <div key={f.label} className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-lg">
            <f.icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{f.label}</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">{f.val ?? "—"}</p>
            </div>
          </div>
        ))}
      </div>

      {c.tags && c.tags.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> Tags</p>
          <div className="flex flex-wrap gap-1.5">
            {c.tags.map(t => (
              <span key={t} className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium rounded-lg">{t}</span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
        <a href={`mailto:${c.email}`} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors">
          <Mail className="w-4 h-4" /> Send Email
        </a>
        {c.phone && (
          <a href={`https://wa.me/${c.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold rounded-lg hover:bg-green-100 transition-colors">
            💬 WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}

export default function ClientsTab() {
  const [clients, setClients]     = useState<Client[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [selected, setSelected]   = useState<Client | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/corporate/clients")
      .then(r => r.json()).then(d => setClients(Array.isArray(d) ? d : d.clients ?? []))
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter(c =>
    !search ||
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (c.company_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header */}
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, company…"
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"><X className="w-4 h-4" /></button>}
      </div>

      {/* Split view */}
      <div className={`grid gap-5 ${selected ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16">
              <Users className="w-10 h-10 text-gray-300 mb-3" />
              <p className="font-semibold text-gray-700">No clients found</p>
              <p className="text-sm text-gray-400 mt-1">{search ? "Try a different search." : "Add your first client contact."}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Name</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Email</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Company</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Department</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Tags</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <ClientRow key={c.id} c={c} onClick={() => setSelected(c)} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && <ClientDetail c={selected} onClose={() => setSelected(null)} />}
      </div>
    </div>
  );
}
