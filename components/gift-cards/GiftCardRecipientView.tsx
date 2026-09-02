"use client";

import { useState } from "react";
import Link from "next/link";
import GiftCardPreview, { GiftCardStyle } from "./GiftCardPreview";
import { formatKsh } from "@/lib/utils";
import { Copy, CheckCircle2, ShoppingBag } from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

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
  balance,
  recipientName,
  senderName,
  message,
  style,
  expiresAt,
  isExpired,
}: RecipientViewProps) {
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const { width, height } = useWindowSize();

  const handleCopy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

        {/* The Card itself */}
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

        {/* Details & Actions */}
        <div className="bg-theme-surface border border-surface-border rounded-3xl p-6 md:p-8 space-y-8">
          
          {message && (
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest font-bold text-theme-muted mb-3">
                Message
              </p>
              <p className="text-theme-heading font-medium italic text-lg leading-relaxed">
                "{message}"
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 border-t border-b border-surface-border py-6">
            <div className="text-center border-r border-surface-border">
              <p className="text-xs text-theme-muted font-bold uppercase tracking-widest mb-1">
                Value
              </p>
              <p className="text-2xl font-black text-theme-heading">{formatKsh(amount)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-theme-muted font-bold uppercase tracking-widest mb-1">
                Balance
              </p>
              <p className="text-2xl font-black text-brand">{formatKsh(balance)}</p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-theme-bg border border-surface-border text-theme-heading font-semibold hover:border-brand/30 transition-all group"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Code Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5 text-theme-muted group-hover:text-brand transition-colors" />
                  Copy Code: <span className="font-mono tracking-wider">{code}</span>
                </>
              )}
            </button>

            <Link
              href="/shop"
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-brand text-white font-semibold shadow-lg shadow-brand/20 hover:bg-brand/90 hover:scale-[1.02] transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
              Shop Now & Redeem
            </Link>
          </div>

          {isExpired && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
              <p className="text-red-600 font-medium">This gift card has expired.</p>
            </div>
          )}

          {expiresAt && !isExpired && (
            <p className="text-center text-xs text-theme-muted">
              Valid until {new Date(expiresAt).toLocaleDateString("en-KE", { dateStyle: "long" })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
