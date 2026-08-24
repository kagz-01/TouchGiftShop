"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase-browser";
import { useSearchParams, useRouter } from "next/navigation";
import { Smartphone, Mail, ArrowLeft, Loader2, CheckCircle2, MessageCircle } from "lucide-react";

type Method = "choose" | "phone" | "phone-otp" | "email" | "email-sent";

export default function LoginPage() {
  const [method, setMethod] = useState<Method>("choose");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [activeChannel, setActiveChannel] = useState<"sms" | "whatsapp">("sms");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams()!;
  const router = useRouter();
  const supabase = createClient();

  const next = searchParams.get("next") ?? "/account";
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const [authMode, setAuthMode] = useState<"login" | "signup">(initialMode);
  const [error, setError] = useState<string>(
    searchParams.get("error") === "auth_failed"
      ? "Sign-in was cancelled or failed. Please try again."
      : ""
  );

  // If already signed in, redirect
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace(next);
    });
  }, []);

  function reset() {
    setError("");
    setPhone("");
    setEmail("");
    setOtp("");
    setLoading(false);
  }

  // ─── Phone OTP ────────────────────────────────────────────────
  async function handleSendOtp(e: React.FormEvent, channel: "sms" | "whatsapp" = "sms") {
    e.preventDefault();
    setError("");
    setLoading(true);
    setActiveChannel(channel);

    // Normalise Kenyan number to E.164
    const digits = phone.replace(/\D/g, "");
    const e164 =
      digits.startsWith("254")
        ? `+${digits}`
        : digits.startsWith("0")
        ? `+254${digits.slice(1)}`
        : `+254${digits}`;

    const { error } = await supabase.auth.signInWithOtp({
      phone: e164,
      options: { 
        channel,
        shouldCreateUser: authMode === "signup"
      },
    });
    
    setLoading(false);
    if (error) { 
      let msg = error.message;
      if (msg.toLowerCase().includes("signups not allowed") || msg.toLowerCase().includes("user not found") || msg.toLowerCase().includes("not allowed to sign up")) {
        msg = "No account found for this phone number. Please create an account instead.";
      }
      setError(msg); 
      return; 
    }
    setPhone(e164);
    setMethod("phone-otp");
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: "sms",
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.replace(next);
  }

  // ─── Email magic link ──────────────────────────────────────────
  async function handleEmailLink(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: authMode === "signup",
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setLoading(false);
    if (error) { 
      let msg = error.message;
      if (msg.toLowerCase().includes("signups not allowed") || msg.toLowerCase().includes("user not found") || msg.toLowerCase().includes("not allowed to sign up")) {
        msg = "No account found for this email. Please create an account instead.";
      }
      setError(msg); 
      return; 
    }
    setMethod("email-sent");
  }

  // ─── Google OAuth ──────────────────────────────────────────────
  async function handleGoogle() {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  return (
    <div className="min-h-screen [&_:not([data-theme=dark])]:bg-section-theme-a [data-theme=dark]:bg-section-theme-f flex flex-col items-center justify-center px-4 py-12">
      {/* Card */}
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/">
            <Image
              src="/logo.webp"
              alt="TouchGift"
              width={64}
              height={64}
              className="rounded-full shadow-card hover:scale-105 transition-transform duration-300"
              priority
            />
          </Link>
          <h1 className="font-display text-2xl font-bold text-brand-deep mt-4">
            {authMode === "signup" ? "Create an account" : "Welcome back"}
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            {method === "choose" && (authMode === "signup" ? "Sign up to start gifting" : "Sign in to your account")}
            {method === "phone" && "Enter your phone number"}
            {method === "phone-otp" && `Code sent to ${phone}`}
            {method === "email" && "Enter your email address"}
            {method === "email-sent" && "Check your inbox"}
          </p>
        </div>

        {/* Glass card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-card-hover border border-surface-border p-8 space-y-5">

          {/* ── Method chooser ── */}
          {method === "choose" && (
            <div className="space-y-3">
              {/* Google */}
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 border-surface-border hover:border-brand/30 hover:bg-brand/[0.02] transition-all duration-200 group disabled:opacity-50"
              >
                <span className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-50 group-hover:bg-white border border-surface-border transition-colors">
                  {/* Google G SVG */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </span>
                <span className="text-sm font-semibold text-brand-deep group-hover:text-brand transition-colors">
                  Continue with Google
                </span>
              </button>

              {/* Phone */}
              <button
                onClick={() => setMethod("phone")}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 border-surface-border hover:border-brand/30 hover:bg-brand/[0.02] transition-all duration-200 group"
              >
                <span className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full bg-green-50 group-hover:bg-green-100 transition-colors border border-green-100">
                  <Smartphone className="w-5 h-5 text-green-600" />
                </span>
                <span className="text-sm font-semibold text-brand-deep group-hover:text-brand transition-colors">
                  Continue with Phone number
                </span>
              </button>

              {/* Email */}
              <button
                onClick={() => setMethod("email")}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 border-surface-border hover:border-brand/30 hover:bg-brand/[0.02] transition-all duration-200 group"
              >
                <span className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors border border-blue-100">
                  <Mail className="w-5 h-5 text-blue-600" />
                </span>
                <span className="text-sm font-semibold text-brand-deep group-hover:text-brand transition-colors">
                  Continue with Email
                </span>
              </button>

              {/* Divider */}
              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-surface-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs text-brand-muted uppercase tracking-wider font-semibold">
                    OR
                  </span>
                </div>
              </div>

              {/* Mode Toggle */}
              <div className="text-center pt-2">
                <p className="text-sm text-brand-muted">
                  {authMode === "signup" ? "Already have an account?" : "New to TouchGift?"}{" "}
                  <button
                    type="button"
                    onClick={() => setAuthMode(authMode === "signup" ? "login" : "signup")}
                    className="font-semibold text-brand hover:underline"
                  >
                    {authMode === "signup" ? "Sign in" : "Create an account"}
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* ── Phone number entry ── */}
          {method === "phone" && (
            <form onSubmit={(e) => handleSendOtp(e, "whatsapp")} className="space-y-4">
              <BackButton onClick={() => { reset(); setMethod("choose"); }} />
              {error && <ErrorBox message={error} />}
              <div>
                <label className="text-sm font-medium text-brand-deep block mb-1.5">
                  Phone number
                </label>
                <div className="flex items-center border-2 border-surface-border focus-within:border-brand rounded-xl overflow-hidden transition-colors">
                  <span className="px-3 py-3 bg-gray-50 border-r border-surface-border text-sm font-medium text-brand-muted flex-shrink-0">
                    🇰🇪 +254
                  </span>
                  <input
                    type="tel"
                    required
                    autoFocus
                    placeholder="7XX XXX XXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 px-4 py-3 text-sm bg-white focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  onClick={(e) => handleSendOtp(e, "whatsapp")}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#25D366] text-white py-3 text-sm font-semibold hover:bg-[#20bd5a] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                >
                  {loading && activeChannel === "whatsapp" ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                  Send code via WhatsApp
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={(e) => handleSendOtp(e, "sms")}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-surface-background text-brand-deep border border-surface-border py-3 text-sm font-semibold hover:bg-gray-50 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading && activeChannel === "sms" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Send code via SMS
                </button>
              </div>
            </form>
          )}

          {/* ── Phone OTP verification ── */}
          {method === "phone-otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <BackButton onClick={() => { reset(); setMethod("phone"); }} />
              {error && <ErrorBox message={error} />}
              <div>
                <label className="text-sm font-medium text-brand-deep block mb-1.5">
                  6-digit code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full border-2 border-surface-border focus:border-brand rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono focus:outline-none transition-colors"
                />
                <p className="text-xs text-brand-muted mt-2 text-center">
                  Didn&apos;t get it?{" "}
                  <button
                    type="button"
                    onClick={(e) => { setOtp(""); handleSendOtp(e, activeChannel); }}
                    className="text-brand underline"
                  >
                    Resend
                  </button>
                </p>
              </div>
              <SubmitButton loading={loading} label="Verify & sign in" />
            </form>
          )}

          {/* ── Email magic link ── */}
          {method === "email" && (
            <form onSubmit={handleEmailLink} className="space-y-4">
              <BackButton onClick={() => { reset(); setMethod("choose"); }} />
              {error && <ErrorBox message={error} />}
              <div>
                <label className="text-sm font-medium text-brand-deep block mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-2 border-surface-border focus:border-brand rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                />
              </div>
              <SubmitButton loading={loading} label="Send magic link" />
              <p className="text-xs text-brand-muted text-center">
                We&apos;ll email you a link — no password needed.
              </p>
            </form>
          )}

          {/* ── Email sent confirmation ── */}
          {method === "email-sent" && (
            <div className="text-center space-y-4 py-4">
              <div className="flex justify-center">
                <CheckCircle2 className="w-14 h-14 text-green-500" />
              </div>
              <div>
                <p className="font-semibold text-brand-deep">Check your inbox!</p>
                <p className="text-sm text-brand-muted mt-1">
                  We sent a magic link to <span className="font-medium text-brand-deep">{email}</span>.
                  Click it to sign in — no password needed.
                </p>
              </div>
              <button
                onClick={() => { reset(); setMethod("email"); }}
                className="text-sm text-brand underline"
              >
                Use a different email
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-xs text-center text-brand-muted mt-6 px-4">
          By continuing you agree to our{" "}
          <Link href="/terms" className="underline hover:text-brand">Terms</Link>
          {" & "}
          <Link href="/privacy" className="underline hover:text-brand">Privacy Policy</Link>.
          We never share your data.
        </p>
      </div>
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-deep transition-colors -mt-1 mb-1"
    >
      <ArrowLeft className="w-4 h-4" />
      Back
    </button>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
      {message}
    </div>
  );
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand text-white py-3.5 text-sm font-semibold hover:bg-brand-dark hover:shadow-[0_4px_16px_rgba(155,27,90,0.3)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : label}
    </button>
  );
}
