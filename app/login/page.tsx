"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase-browser";

type Step = "phone" | "otp" | "error";

export default function LoginPage() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const supabase = createClient();

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      phone: phone.replace(/\s/g, ""),
    });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setStep("otp");
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    const { error } = await supabase.auth.verifyOtp({
      phone: phone.replace(/\s/g, ""),
      token: otp,
      type: "sms",
    });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    window.location.href = "/account";
  }

  return (
    <div className="px-4 md:px-8 py-6 max-w-md mx-auto space-y-6">
      <div className="flex justify-center">
        <Image src="/logo.webp" alt="TouchGift" width={160} height={56} priority />
      </div>

      <div className="space-y-1 text-center">
        <h1 className="text-xl font-semibold">
          {step === "otp" ? "Enter the code" : "Sign in"}
        </h1>
        <p className="text-sm text-brand-muted">
          {step === "otp"
            ? `We sent a code to ${phone}`
            : "Enter your phone number and we'll send you a verification code."}
        </p>
      </div>

      {step === "phone" ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          {errorMessage && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {errorMessage}
            </p>
          )}
          <div>
            <label className="text-sm font-medium">Phone number</label>
            <input
              type="tel"
              required
              placeholder="07XX XXX XXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-brand text-white py-3 font-medium"
          >
            Send verification code
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          {errorMessage && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {errorMessage}
            </p>
          )}
          <div>
            <label className="text-sm font-medium">Verification code</label>
            <input
              type="text"
              inputMode="numeric"
              required
              placeholder="6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-brand text-white py-3 font-medium"
          >
            Verify & sign in
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("phone");
              setOtp("");
              setErrorMessage("");
            }}
            className="w-full text-sm text-brand-muted underline"
          >
            Use a different number
          </button>
        </form>
      )}

      <p className="text-xs text-center text-brand-muted">
        By signing in you agree to our terms. We&apos;ll never share your data.
      </p>
    </div>
  );
}
