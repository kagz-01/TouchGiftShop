"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowRight, Check, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

/**
 * Portal sign-in.
 *
 * Invite-only, deliberately. There is no "create a company account" path here,
 * because `company_name` on a quote request is free text that anyone can type —
 * a self-service claim would let a stranger walk into a real client's account by
 * guessing a name. Access is granted by TouchGift staff, then redeemed on the
 * first sign-in.
 */
export default function PortalSignInForm({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean)) {
      setState("error");
      setError("That does not look like an email address.");
      return;
    }

    setState("sending");
    setError(null);

    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOtp({
      email: clean,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });

    if (err) {
      // Deliberately vague: telling a stranger whether an address is registered
      // is an account-enumeration oracle.
      setState("error");
      setError("We could not send that link. Try again in a moment, or email your account manager.");
      return;
    }

    setState("sent");
  }

  return (
    <div className="corporate-portal min-h-screen bg-[color:var(--portal-bg)] text-[color:var(--portal-text)]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-8 sm:px-8">
        <Link
          href="/corporate"
          className="-ml-1 inline-flex min-h-11 items-center gap-2.5 px-1 text-[color:var(--portal-text-muted)] transition-colors hover:text-[color:var(--portal-text)]"
        >
          <Image src="/logo/logo.webp" alt="" width={28} height={28} className="rounded-full" />
          <span className="font-display text-lg">TouchGift</span>
        </Link>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">
            {state === "sent" ? (
              <div className="portal-card p-8">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--portal-positive-tint)] text-[color:var(--portal-positive)]">
                  <Check className="h-5 w-5" />
                </span>
                <h1 className="font-display mt-5 text-2xl font-bold">Check your email</h1>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--portal-text-muted)]">
                  If <span className="text-[color:var(--portal-text)]">{email.trim().toLowerCase()}</span>{" "}
                  has been invited to a TouchGift company account, a sign-in link is on its
                  way. It opens this portal directly and expires shortly.
                </p>
                <p className="mt-4 text-xs leading-relaxed text-[color:var(--portal-text-faint)]">
                  Nothing arrived? Your account manager can resend the invitation, or you
                  can request a new link below.
                </p>
                <button
                  onClick={() => setState("idle")}
                  className="mt-6 text-sm font-medium text-[color:var(--portal-accent)] hover:underline"
                >
                  Use a different email
                </button>
              </div>
            ) : (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--portal-text-faint)]">
                  Client portal
                </p>
                <h1 className="font-display mt-3 text-3xl font-bold leading-tight sm:text-4xl">
                  Sign in to your
                  <br />
                  company account
                </h1>
                <p className="mt-4 text-sm leading-relaxed text-[color:var(--portal-text-muted)]">
                  Follow your quotes and orders in one place, and see what you are
                  spending with us.
                </p>

                <form onSubmit={handleSubmit} className="mt-8">
                  <label htmlFor="email" className="text-xs font-medium text-[color:var(--portal-text-muted)]">
                    Work email
                  </label>
                  <div className="mt-2 flex items-center gap-2.5 rounded-xl border border-[color:var(--portal-border)] bg-[color:var(--portal-surface)] px-4 py-3 transition-colors focus-within:border-[color:var(--portal-accent)]">
                    <Mail className="h-4 w-4 flex-shrink-0 text-[color:var(--portal-text-faint)]" />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.co.ke"
                      className="w-full min-w-0 bg-transparent text-base text-[color:var(--portal-text)] outline-none placeholder:text-[color:var(--portal-text-faint)]"
                    />
                  </div>

                  {error && (
                    <p role="alert" className="mt-3 text-sm leading-relaxed text-[color:var(--portal-stop)]">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={state === "sending"}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold transition-all disabled:opacity-60"
                    style={{
                      background: "var(--portal-accent)",
                      color: "var(--portal-accent-text)",
                    }}
                  >
                    {state === "sending" ? "Sending…" : "Email me a sign-in link"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>

                <div className="mt-8 flex gap-3 rounded-xl bg-[color:var(--portal-surface-2)] p-4">
                  <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[color:var(--portal-text-faint)]" />
                  <p className="text-xs leading-relaxed text-[color:var(--portal-text-muted)]">
                    Access is by invitation from your account manager. We will not create
                    an account for a company name typed into a form — that is how one
                    company&rsquo;s portal would end up showing another company&rsquo;s
                    invoices.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-[color:var(--portal-text-faint)]">
          Not a corporate client yet?{" "}
          <Link href="/corporate" className="text-[color:var(--portal-accent)] hover:underline">
            Talk to our team
          </Link>
        </p>
      </div>
    </div>
  );
}
