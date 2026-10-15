"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Gift, Clock, Users, Check, AlertCircle, Loader2, ShieldCheck } from "lucide-react";

type Pool = {
  slug: string;
  title: string;
  description: string | null;
  recipient_name: string;
  recipient_role: string | null;
  recipient_department: string | null;
  occasion: string;
  target_amount: number;
  current_balance: number;
  min_contribution: number;
  deadline: string;
  status: string;
  show_leaderboard: boolean;
  anonymous_contributions: boolean;
  contributor_count: number;
  company_match: { ratio: number; cap: number; used: number } | null;
};

type Contributor = { name: string; amount: number; created_at: string };

const money = (n: number) => `KES ${Math.round(n).toLocaleString("en-KE")}`;

/**
 * The public face of a corporate gift pool.
 *
 * This lives under /corporate/pool/ rather than /pool/ because the consumer
 * pool page reads a different table — so every corporate share link minted by
 * the ops dashboard used to resolve to nothing.
 *
 * Deliberately plain: someone opening this on a phone is contributing to a
 * colleague's gift, not shopping. One column, one form, the truth about what
 * happens to their money.
 */
export default function CorporatePoolPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug as string;

  const [pool, setPool] = useState<Pool | null>(null);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/corporate/pool/${encodeURIComponent(slug)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "This pool is no longer available");
      setPool(data.pool);
      setContributors(data.contributors ?? []);
      setPendingCount(data.pendingCount ?? 0);
      if (!amount) setAmount(String(Math.round(Number(data.pool.min_contribution ?? 500))));
    } catch (e) {
      setError(e instanceof Error ? e.message : "This pool is no longer available");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  async function contribute(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFormError(null);
    try {
      const res = await fetch(`/api/corporate/pool/${encodeURIComponent(slug)}/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          amount: Number(amount),
          message: message.trim() || undefined,
          isAnonymous: anonymous,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not record your contribution");
      setDone(data.message ?? "Recorded.");
      setName("");
      setPhone("");
      setMessage("");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not record your contribution");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <Shell>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-[color:var(--portal-text-faint)]" />
        </div>
      </Shell>
    );
  }

  if (error || !pool) {
    return (
      <Shell>
        <div className="mx-auto max-w-md py-24 text-center">
          <h1 className="font-display text-2xl font-bold">{error ?? "This pool is no longer available"}</h1>
          <p className="mt-3 text-sm leading-relaxed text-[color:var(--portal-text-muted)]">
            If you were expecting a gift pool here, the link may have expired. Ask
            whoever shared it with you for a current link.
          </p>
        </div>
      </Shell>
    );
  }

  const target = Number(pool.target_amount);
  const balance = Number(pool.current_balance);
  const pct = target > 0 ? Math.min((balance / target) * 100, 100) : 0;
  const remaining = Math.max(target - balance, 0);
  const closed = pool.status !== "active" || new Date(pool.deadline).getTime() < Date.now();
  const funded = target > 0 && balance >= target;

  return (
    <Shell>
      <div className="mx-auto max-w-lg py-10 sm:py-16">
        <div className="text-center">
          <span
            className="mx-auto flex h-11 w-11 items-center justify-center rounded-full"
            style={{ background: "var(--portal-accent-tint)" }}
          >
            <Gift className="h-4.5 w-4.5 text-[color:var(--portal-accent)]" />
          </span>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-[color:var(--portal-text-faint)]">
            Gift pool
          </p>
          <h1 className="font-display mt-2 text-3xl font-bold leading-tight sm:text-4xl">
            {pool.title}
          </h1>
          <p className="mt-2 text-sm text-[color:var(--portal-text-muted)]">
            For {pool.recipient_name}
            {pool.recipient_role ? ` · ${pool.recipient_role}` : ""}
            {pool.recipient_department ? ` · ${pool.recipient_department}` : ""}
          </p>
          {pool.description && (
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--portal-text-muted)]">
              {pool.description}
            </p>
          )}
        </div>

        {/* Progress */}
        <div className="portal-card mt-8 p-6">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-2xl font-semibold tabular-nums tracking-tight">
              {money(balance)}
            </span>
            <span className="text-sm tabular-nums text-[color:var(--portal-text-faint)]">
              of {money(target)}
            </span>
          </div>

          <div
            className="mt-3 h-1.5 overflow-hidden rounded-full"
            style={{ background: "var(--portal-surface-2)" }}
          >
            <div
              className="h-full rounded-full transition-[width] duration-700"
              style={{ width: `${Math.max(pct, 2)}%`, background: "var(--portal-accent)" }}
            />
          </div>

          <p className="mt-3 text-sm text-[color:var(--portal-text-muted)]">
            {funded
              ? "Fully funded — thank you."
              : `${money(remaining)} still to go, ${pool.contributor_count} ${
                  pool.contributor_count === 1 ? "person has" : "people have"
                } contributed.`}
            {pendingCount > 0 && (
              <p className="mt-1.5 text-xs text-[color:var(--portal-text-faint)]">
                {pendingCount} more{" "}
                {pendingCount === 1 ? "contribution is" : "contributions are"} recorded and
                waiting for confirmation. The total updates once we confirm the transfer.
              </p>
            )}
          </p>

          <p className="mt-3 flex items-center gap-1.5 text-xs text-[color:var(--portal-text-faint)]">
            <Clock className="h-3 w-3" />
            {closed
              ? "This pool has closed"
              : `Open until ${new Date(pool.deadline).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}`}
          </p>

          {pool.company_match && (
            <p className="mt-3 rounded-xl px-3.5 py-2.5 text-xs leading-relaxed"
               style={{ background: "var(--portal-positive-tint)", color: "var(--portal-positive)" }}>
              {pool.company_match.ratio}× company match is on, up to{" "}
              {money(Number(pool.company_match.cap))} — every contribution is doubled by
              their employer.
            </p>
          )}
        </div>

        {/* Contribute */}
        {!closed && !funded && (
          <div className="portal-card mt-6 p-6">
            {done ? (
              <div className="py-4 text-center">
                <span
                  className="mx-auto flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ background: "var(--portal-positive-tint)" }}
                >
                  <Check className="h-4 w-4 text-[color:var(--portal-positive)]" />
                </span>
                <h2 className="font-display mt-4 text-lg font-bold">Thank you</h2>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--portal-text-muted)]">
                  {done}
                </p>
                <button
                  onClick={() => setDone(null)}
                  className="mt-5 text-sm font-medium text-[color:var(--portal-accent)] hover:underline"
                >
                  Add another contribution
                </button>
              </div>
            ) : (
              <form onSubmit={contribute} className="space-y-4">
                <h2 className="font-display text-lg font-bold">Contribute</h2>

                <div>
                  <label htmlFor="amount" className="text-xs text-[color:var(--portal-text-muted)]">
                    Amount (KES)
                  </label>
                  <input
                    id="amount"
                    type="number"
                    inputMode="numeric"
                    min={Number(pool.min_contribution) || undefined}
                    step="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border bg-transparent px-4 py-3 text-base tabular-nums outline-none transition-colors"
                    style={{ borderColor: "var(--portal-border)", color: "var(--portal-text)" }}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="cname" className="text-xs text-[color:var(--portal-text-muted)]">
                      Your name
                    </label>
                    <input
                      id="cname"
                      required
                      maxLength={100}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border bg-transparent px-4 py-3 text-base outline-none transition-colors"
                      style={{ borderColor: "var(--portal-border)", color: "var(--portal-text)" }}
                    />
                  </div>
                  <div>
                    <label htmlFor="cphone" className="text-xs text-[color:var(--portal-text-muted)]">
                      M-Pesa number
                    </label>
                    <input
                      id="cphone"
                      type="tel"
                      inputMode="tel"
                      required
                      placeholder="07…"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border bg-transparent px-4 py-3 text-base outline-none transition-colors"
                      style={{ borderColor: "var(--portal-border)", color: "var(--portal-text)" }}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="cmessage" className="text-xs text-[color:var(--portal-text-muted)]">
                    A note for {pool.recipient_name.split(" ")[0]} (optional)
                  </label>
                  <textarea
                    id="cmessage"
                    rows={2}
                    maxLength={500}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mt-1.5 w-full resize-y rounded-xl border bg-transparent px-4 py-3 text-base outline-none transition-colors"
                    style={{ borderColor: "var(--portal-border)", color: "var(--portal-text)" }}
                  />
                </div>

                {pool.anonymous_contributions && (
                  <label className="flex items-center gap-2.5 text-sm text-[color:var(--portal-text-muted)]">
                    <input
                      type="checkbox"
                      checked={anonymous}
                      onChange={(e) => setAnonymous(e.target.checked)}
                      className="h-4 w-4"
                    />
                    Show my name on the pool
                  </label>
                )}

                {formError && (
                  <p
                    role="alert"
                    className="flex items-start gap-2 text-sm"
                    style={{ color: "var(--portal-stop)" }}
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="break-words">{formError}</span>
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-xl px-5 py-3.5 text-sm font-semibold disabled:opacity-60"
                  style={{ background: "var(--portal-accent)", color: "var(--portal-accent-text)" }}
                >
                  {busy ? "Recording…" : `Contribute ${amount ? money(Number(amount)) : ""}`}
                </button>

                <p className="flex items-start gap-2 text-xs leading-relaxed text-[color:var(--portal-text-faint)]">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  We record your contribution and send you the M-Pesa instructions.
                  Nothing is taken from your phone here.
                </p>
              </form>
            )}
          </div>
        )}

        {/* Contributors */}
        {contributors.length > 0 && (
          <section className="portal-card mt-6 divide-y overflow-hidden" style={{ borderColor: "var(--portal-border-soft)" }}>
            {contributors.map((c, i) => (
              <div key={`${c.created_at}-${i}`} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <span className="min-w-0 truncate text-sm">{c.name}</span>
                <span className="text-sm tabular-nums text-[color:var(--portal-text-muted)]">
                  {money(c.amount)}
                </span>
              </div>
            ))}
          </section>
        )}
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="corporate-portal min-h-screen bg-[color:var(--portal-bg)] text-[color:var(--portal-text)]">
      <div className="mx-auto max-w-2xl px-5 py-6">
        <div className="flex items-center gap-2.5">
          <Image src="/logo/logo.webp" alt="" width={28} height={28} className="rounded-full" />
          <span className="font-display text-lg">TouchGift</span>
        </div>
        {children}
        <p className="pb-6 text-center text-xs text-[color:var(--portal-text-faint)]">
          <Users className="mr-1 inline h-3 w-3" />
          A private gift pool shared by their colleagues
        </p>
      </div>
    </div>
  );
}
