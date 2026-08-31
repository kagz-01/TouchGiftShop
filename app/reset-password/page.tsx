"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { ArrowLeft, Loader2, CheckCircle2, Eye, EyeOff, KeyRound } from "lucide-react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exchanging, setExchanging] = useState(true);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const supabase = createClient();

  // Exchange the recovery code for a session on mount
  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        setExchanging(false);
        if (error) {
          setError("Invalid or expired reset link. Please request a new one.");
        } else {
          setSessionReady(true);
        }
      });
    } else {
      // No code — link may be malformed
      setExchanging(false);
      setError("Invalid reset link. Please request a new one from the login page.");
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
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
              className="rounded-full shadow-card hover:scale-100 transition-transform duration-300"
              priority
            />
          </Link>
          <h1 className="font-display text-2xl font-bold text-brand-deep mt-4">
            {done ? "Password updated" : "Set new password"}
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            {done
              ? "Your password has been changed successfully."
              : "Choose a strong password for your account."}
          </p>
        </div>

        {/* Glass card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-card-hover border border-surface-border p-8 space-y-5">
          {/* Loading state — exchanging code */}
          {exchanging && (
            <div className="text-center py-8 space-y-3">
              <Loader2 className="w-8 h-8 text-brand animate-spin mx-auto" />
              <p className="text-sm text-brand-muted">Verifying your reset link…</p>
            </div>
          )}

          {/* Success */}
          {done && (
            <div className="text-center space-y-4 py-4">
              <div className="flex justify-center">
                <CheckCircle2 className="w-14 h-14 text-green-500" />
              </div>
              <p className="font-semibold text-brand-deep">You&apos;re all set!</p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-brand text-white px-6 py-3 text-sm font-semibold hover:bg-brand-dark transition-colors"
              >
                Sign in with new password
              </Link>
            </div>
          )}

          {/* Error state */}
          {!exchanging && !done && error && !sessionReady && (
            <div className="text-center space-y-4 py-4">
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {error}
              </div>
              <Link
                href="/forgot-password"
                className="inline-flex items-center gap-1.5 text-sm text-brand hover:text-brand-dark font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                Request a new reset link
              </Link>
            </div>
          )}

          {/* Password form */}
          {!exchanging && !done && sessionReady && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-brand-deep block mb-1.5">
                  New password
                </label>
                <div className="flex items-center border-2 border-surface-border focus-within:border-brand rounded-xl overflow-hidden transition-colors">
                  <span className="px-3 py-3 bg-gray-50 border-r border-surface-border flex-shrink-0">
                    <KeyRound className="w-4 h-4 text-brand-muted" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    autoFocus
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 px-4 py-3 text-sm bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="px-3 py-3 text-brand-muted hover:text-brand transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-brand-deep block mb-1.5">
                  Confirm password
                </label>
                <div className="flex items-center border-2 border-surface-border focus-within:border-brand rounded-xl overflow-hidden transition-colors">
                  <span className="px-3 py-3 bg-gray-50 border-r border-surface-border flex-shrink-0">
                    <KeyRound className="w-4 h-4 text-brand-muted" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="flex-1 px-4 py-3 text-sm bg-white focus:outline-none"
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium">Passwords don&apos;t match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !password || !confirmPassword}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand text-white py-3.5 text-sm font-semibold hover:bg-brand-dark hover:shadow-[0_4px_16px_rgba(155,27,90,0.3)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update password"}
              </button>
            </form>
          )}
        </div>

        <p className="text-xs text-center text-brand-muted mt-6 px-4">
          <Link href="/login" className="underline hover:text-brand">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
