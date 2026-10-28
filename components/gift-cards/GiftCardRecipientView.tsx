"use client";

import { useState } from "react";
import Link from "next/link";
import GiftCardPreview, { GiftCardStyle } from "./GiftCardPreview";
import { formatKsh } from "@/lib/utils";
import { Copy, CheckCircle2, ShoppingBag, Wallet, ArrowRight, Loader2, AlertCircle, Sparkles } from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { validatePhone, formatPhoneDisplay } from "@/lib/phone";

interface RecipientViewProps {
  code: string;
  amount: number;
  balance: number;
  recipientName: string;
  senderName: string | null;
  message: string | null;
  style?: GiftCardStyle;
  expiresAt: string | null;
  isExpired: boolean;
}

export default function GiftCardRecipientView({
  code,
  amount,
  balance: initialBalance,
  recipientName,
  senderName,
  message,
  style,
  expiresAt,
  isExpired,
}: RecipientViewProps) {
  const [balance, setBalance] = useState(initialBalance);
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const { width, height } = useWindowSize();

  // Wallet claim state
  const [showClaimBox, setShowClaimBox] = useState(false);
  const [claimPhone, setClaimPhone] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState("");
  const [claimedWallet, setClaimedWallet] = useState<{ newBalance: number; phone: string } | null>(null);

  const phoneValidation = validatePhone(claimPhone);
  const isClaimed = balance === 0 || !!claimedWallet;

  const handleCopy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaimToWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setClaimError("");

    if (!phoneValidation.isValid) {
      setClaimError(phoneValidation.error || "Enter a valid phone number");
      return;
    }

    setClaiming(true);
    try {
      const res = await fetch("/api/wallet/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          phone: phoneValidation.normalized,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setClaimError(data.error || "Failed to claim gift card");
        setClaiming(false);
        return;
      }

      setBalance(0);
      setClaimedWallet({
        newBalance: data.newBalance,
        phone: data.phone,
      });
      setShowConfetti(true);
    } catch {
      setClaimError("Network error. Please try again.");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg flex flex-col pt-12 pb-24 px-4 sm:px-6">
      {showConfetti && !isExpired && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={400}
          gravity={0.15}
          onConfettiComplete={() => setShowConfetti(false)}
        />
      )}

      <div className="max-w-xl w-full mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <p className="text-sm font-bold uppercase tracking-widest text-brand">
            You received a gift!
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-black text-theme-heading">
            Happy Gifting, {recipientName}
          </h1>
          {senderName && (
            <p className="text-theme-muted text-lg">
              Sent with love from <span className="font-semibold text-theme-heading">{senderName}</span>
            </p>
          )}
        </div>

        {/* The Card preview */}
        <div className="flex justify-center -mx-4 sm:mx-0 drop-shadow-2xl">
          <div className="w-full max-w-[520px]">
            <GiftCardPreview
              amount={amount}
              recipientName={recipientName}
              senderName={senderName || ""}
              message={message || ""}
              code={code}
              style={style}
            />
          </div>
        </div>

        {/* Details & Actions Card */}
        <div className="bg-theme-surface border border-surface-border rounded-3xl p-6 md:p-8 space-y-6">
          {message && (
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest font-bold text-theme-muted mb-2">
                Personal Note
              </p>
              <p className="text-theme-heading font-medium italic text-lg leading-relaxed">
                &ldquo;{message}&rdquo;
              </p>
            </div>
          )}

          {/* Value and Balance Row */}
          <div className="grid grid-cols-2 gap-4 border-t border-b border-surface-border py-6">
            <div className="text-center border-r border-surface-border">
              <p className="text-xs text-theme-muted font-bold uppercase tracking-widest mb-1">
                Original Value
              </p>
              <p className="text-2xl font-black text-theme-heading">{formatKsh(amount)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-theme-muted font-bold uppercase tracking-widest mb-1">
                Remaining Balance
              </p>
              <p className={`text-2xl font-black ${isClaimed ? "text-gray-400 line-through" : "text-brand"}`}>
                {formatKsh(balance)}
              </p>
            </div>
          </div>

          {/* Success Claimed Banner */}
          {claimedWallet && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-3 text-emerald-900">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Deposited into Your TouchGift Wallet!</h4>
                  <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                    <strong>{formatKsh(amount)}</strong> has been credited to wallet for <span className="font-mono font-semibold">{formatPhoneDisplay(claimedWallet.phone)}</span>.
                    Your new wallet balance is <strong>{formatKsh(claimedWallet.newBalance)}</strong>.
                  </p>
                </div>
              </div>
              <div className="flex gap-2.5 pt-1">
                <Link
                  href="/account/wallet"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl text-center shadow-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <Wallet className="w-3.5 h-3.5" /> Open My Wallet
                </Link>
                <Link
                  href="/shop"
                  className="flex-1 py-2.5 bg-white border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl text-center hover:bg-emerald-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> Shop Now
                </Link>
              </div>
            </div>
          )}

          {/* Action options when not yet claimed */}
          {!isClaimed && !isExpired && (
            <div className="space-y-3">
              {/* Option A: Claim to Wallet */}
              {!showClaimBox ? (
                <button
                  type="button"
                  onClick={() => setShowClaimBox(true)}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all"
                >
                  <Wallet className="w-4 h-4" />
                  Claim {formatKsh(balance)} to My Wallet
                </button>
              ) : (
                <form onSubmit={handleClaimToWallet} className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-emerald-700" />
                      Deposit into Your TouchGift Wallet
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowClaimBox(false)}
                      className="text-[11px] text-emerald-700 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Enter your Safaricom or Airtel phone number to deposit this balance into your stored wallet for 1-tap checkout.
                  </p>

                  <div className="space-y-1">
                    <input
                      type="tel"
                      value={claimPhone}
                      onChange={(e) => setClaimPhone(e.target.value)}
                      placeholder="e.g. 0712 345 678"
                      className="w-full bg-white border border-emerald-300 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                    {claimPhone && (
                      <p className={`text-[10px] font-semibold ${phoneValidation.isValid ? "text-emerald-700" : "text-amber-700"}`}>
                        {phoneValidation.isValid ? `✓ Formatted: ${phoneValidation.display}` : phoneValidation.error}
                      </p>
                    )}
                  </div>

                  {claimError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-xl text-xs flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{claimError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={claiming || !phoneValidation.isValid}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {claiming ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Crediting Wallet...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Deposit {formatKsh(balance)} to Wallet
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Option B: Copy Code */}
              <button
                type="button"
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-theme-bg border border-surface-border text-theme-heading font-semibold text-xs hover:border-brand/30 transition-all group"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Code Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-theme-muted group-hover:text-brand transition-colors" />
                    Copy Code: <span className="font-mono tracking-wider font-bold">{code}</span>
                  </>
                )}
              </button>

              {/* Option C: Shop Now & Redeem at Checkout */}
              <Link
                href="/shop"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-brand text-white font-bold text-xs shadow-sm hover:bg-brand-dark transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                Shop Gifts & Redeem at Checkout
              </Link>
            </div>
          )}

          {isExpired && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center">
              <p className="text-red-600 font-medium text-xs">This gift card has expired.</p>
            </div>
          )}

          {expiresAt && !isExpired && !isClaimed && (
            <p className="text-center text-xs text-theme-muted">
              Valid until {new Date(expiresAt).toLocaleDateString("en-KE", { dateStyle: "long" })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
