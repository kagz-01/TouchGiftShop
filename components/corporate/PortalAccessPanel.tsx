"use client";

import { useCallback, useEffect, useState } from "react";
import { UserPlus, Loader2, X, Check, AlertCircle } from "lucide-react";

type Account = { id: string; company_name: string; is_verified: boolean };
type Member = {
  id: string;
  email: string;
  role: string;
  status: string;
  full_name: string | null;
};

const ROLES = [
  { value: "owner", label: "Owner — everything, including spend" },
  { value: "member", label: "Member — quotes, orders and spend" },
  { value: "viewer", label: "Viewer — quotes and orders only" },
];

/**
 * Staff-side access control. The members API is admin-only on purpose: a client
 * who could invite a colleague would be handing out their own company's access,
 * and the invite list is the one place that turns an email address into a
 * signed-in customer.
 */
export default function PortalAccessPanel() {
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [accountId, setAccountId] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/corporate/accounts", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const list: Account[] = d.accounts ?? [];
        setAccounts(list);
        if (list.length) setAccountId(list[0].id);
      })
      .catch(() => setAccounts([]));
  }, []);

  const loadMembers = useCallback(async (id: string) => {
    if (!id) return;
    const res = await fetch(`/api/corporate/portal/members?corporate_account_id=${id}`, {
      cache: "no-store",
    });
    const data = await res.json();
    setMembers(data.members ?? []);
  }, []);

  useEffect(() => {
    loadMembers(accountId);
  }, [accountId, loadMembers]);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      const res = await fetch("/api/corporate/portal/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ corporate_account_id: accountId, email, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not send the invite");
      setDone(`${email.trim().toLowerCase()} can now sign in with a magic link.`);
      setEmail("");
      await loadMembers(accountId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the invite");
    } finally {
      setBusy(false);
    }
  }

  async function revoke(membershipId: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/corporate/portal/members?membership_id=${membershipId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not remove that person");
      await loadMembers(accountId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove that person");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
      <h3 className="text-xs font-bold text-white mb-1 flex items-center gap-2">
        <UserPlus className="w-4 h-4 text-amber-400" /> Client Portal Access
      </h3>
      <p className="text-[10px] text-white/35 mb-4 leading-relaxed">
        Inviting is the only way someone gets into a client portal. There is no
        self-service sign-up, because a company name on a quote request is free text.
      </p>

      {accounts === null ? (
        <div className="flex items-center gap-2 py-4 text-[11px] text-white/40">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading accounts…
        </div>
      ) : accounts.length === 0 ? (
        <p className="rounded-lg bg-white/[0.03] border border-white/10 px-3 py-3 text-[11px] text-white/45 leading-relaxed">
          No corporate accounts yet. One is created automatically the first time a
          company sends a quote request.
        </p>
      ) : (
        <>
          <label className="block text-[10px] text-white/40 mb-1.5">Company</label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full appearance-none bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white mb-3 focus:border-amber-400 focus:outline-none"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id} className="bg-[#0A0A12]">
                {a.company_name}
              </option>
            ))}
          </select>

          <form onSubmit={invite} className="space-y-2.5">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.co.ke"
              aria-label="Email to invite"
              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/25 focus:border-amber-400 focus:outline-none"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              aria-label="Role"
              className="w-full appearance-none bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value} className="bg-[#0A0A12]">
                  {r.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={busy || !email.trim()}
              className="w-full flex items-center justify-center gap-2 py-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/25 text-amber-400 text-xs font-bold rounded-lg transition-all disabled:opacity-40"
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
              Invite to portal
            </button>
          </form>

          {error && (
            <p className="mt-2.5 flex items-start gap-1.5 text-[11px] text-red-300">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-px" /> {error}
            </p>
          )}
          {done && (
            <p className="mt-2.5 flex items-start gap-1.5 text-[11px] text-emerald-300">
              <Check className="w-3.5 h-3.5 shrink-0 mt-px" /> {done}
            </p>
          )}

          {members.length > 0 && (
            <ul className="mt-4 space-y-1.5 border-t border-white/10 pt-3">
              {members.map((m) => (
                <li key={m.id} className="flex items-center gap-2 text-[11px]">
                  <span className="min-w-0 flex-1 truncate text-white/70">
                    {m.full_name ?? m.email}
                  </span>
                  <span className="text-white/35">{m.role}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] ${
                      m.status === "active"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-white/5 text-white/40"
                    }`}
                  >
                    {m.status}
                  </span>
                  {m.status !== "revoked" && (
                    <button
                      onClick={() => revoke(m.id)}
                      disabled={busy}
                      aria-label={`Remove ${m.email}`}
                      className="text-white/25 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
