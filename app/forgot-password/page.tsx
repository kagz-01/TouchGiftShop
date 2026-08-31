"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase-browser";
import { ArrowLeft, Loader2, CheckCircle2, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="min-h-screen [&_:not([data-theme=dark])]:bg-section-theme-a [data-theme=dark]:bg-section-theme-f flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/">
            <Image
              src="/logo/logo.webp"
              alt="TouchGift"
              width={64}
              height={64}
              className="rounded-full shadow-card hover:scale-105 transition-transform duration-300"
              priority
            />
          </Link>
          <h1 className="font-display text-2xl font-bold text-brand-deep mt-4">
            Reset your password
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {/* Glass card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-card-hover border border-surface-border p-8 space-y-5">
          {sent ? (
            <div className="text-center space-y-4 py-4">
              <div className="flex justify-center">
                <CheckCircle2 className="w-14 h-14 text-green-500" />
              </div>
              <div>
                <p className="font-semibold text-brand-deep">Check your inbox!</p>
                <p className="text-sm text-brand-muted mt-1">
                  We sent a password reset link to{" "}
                  <span className="font-medium text-brand-deep">{email}</span>.
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm text-brand hover:text-brand-dark font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-deep transition-colors -mt-1 mb-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </Link>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-brand-deep block mb-1.5">
                  Email address
                </label>
                <div className="flex items-center border-2 border-surface-border focus-within:border-brand rounded-xl overflow-hidden transition-colors">
                  <span className="px-3 py-3 bg-gray-50 border-r border-surface-border flex-shrink-0">
                    <Mail className="w-4 h-4 text-brand-muted" />
                  </span>
                  <input
                    type="email"
                    required
                    autoFocus
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-4 py-3 text-sm bg-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand text-white py-3.5 text-sm font-semibold hover:bg-brand-dark hover:shadow-[0_4px_16px_rgba(155,27,90,0.3)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send reset link"}
              </button>
            </form>
          )}
        </div>

        <p className="text-xs text-center text-brand-muted mt-6 px-4">
          Remember your password?{" "}
          <Link href="/login" className="underline hover:text-brand">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
