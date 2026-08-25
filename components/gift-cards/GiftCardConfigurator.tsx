"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Gift, CheckCircle2, ChevronRight, UserRound, Mail, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const AMOUNTS = [2500, 5000, 10000, 20000];

export default function GiftCardConfigurator() {
  const router = useRouter();
  const [amount, setAmount] = useState<number>(5000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [message, setMessage] = useState("");

  const handleAmountClick = (value: number) => {
    setAmount(value);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setCustomAmount(val);
    if (val && parseInt(val) >= 500) {
      setAmount(parseInt(val));
    }
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (amount < 500) {
        alert("Minimum gift card amount is KSh 500");
        return;
      }
      setStep(2);
    } else {
      handleCheckout();
    }
  };

  const handleCheckout = async () => {
    if (!recipientName || !senderName) {
      alert("Please fill in all required fields.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const searchParams = new URLSearchParams({
        type: 'gift_card',
        amount: amount.toString(),
        recipientName,
        senderName,
      });
      if (recipientEmail) searchParams.set('recipientEmail', recipientEmail);
      if (message) searchParams.set('message', message);
      
      router.push(`/checkout?${searchParams.toString()}`);
    } catch (error) {
      console.error(error);
      alert("An error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card-theme border border-brand/10 p-6 md:p-8 rounded-3xl shadow-soft">
      {/* Step Indicators */}
      <div className="flex items-center mb-8">
        <div className={cn("flex flex-col", step >= 1 ? "text-brand" : "text-theme-muted")}>
          <span className="text-xs font-bold uppercase tracking-wider mb-1">Step 1</span>
          <span className="font-display font-semibold">Select Value</span>
        </div>
        <div className="flex-1 h-px bg-theme-border mx-4">
          <div className={cn("h-full bg-brand transition-all duration-500", step === 2 ? "w-full" : "w-0")} />
        </div>
        <div className={cn("flex flex-col text-right", step === 2 ? "text-brand" : "text-theme-muted")}>
          <span className="text-xs font-bold uppercase tracking-wider mb-1">Step 2</span>
          <span className="font-display font-semibold">Personalize</span>
        </div>
      </div>

      <form onSubmit={handleContinue}>
        {/* Step 1: Amount */}
        <div className={cn("transition-all duration-500", step === 1 ? "block opacity-100" : "hidden opacity-0")}>
          <h3 className="text-2xl font-display font-bold text-theme-heading mb-6">Choose an amount</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {AMOUNTS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleAmountClick(val)}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all duration-200 text-center relative overflow-hidden",
                  amount === val && !customAmount
                    ? "border-brand bg-brand/5 text-brand"
                    : "border-theme-border text-theme-heading hover:border-brand/30 hover:bg-theme-surface"
                )}
              >
                {amount === val && !customAmount && (
                  <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-brand" />
                )}
                <span className="font-display font-bold text-lg">KSh {val.toLocaleString()}</span>
              </button>
            ))}
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-theme-body mb-2">Or enter a custom amount (Min KSh 500)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted font-display font-bold">KSh</span>
              <input
                type="text"
                value={customAmount}
                onChange={handleCustomAmountChange}
                placeholder="Enter amount..."
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-theme-border bg-theme-bg text-theme-heading focus:outline-none focus:ring-2 focus:ring-brand/50 font-display font-bold text-lg"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-full shape-premium-button text-white font-bold flex items-center justify-center gap-2 group"
          >
            Continue to Personalize
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Step 2: Personalization */}
        <div className={cn("transition-all duration-500", step === 2 ? "block opacity-100" : "hidden opacity-0")}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-display font-bold text-theme-heading">Personalize your gift</h3>
            <button 
              type="button" 
              onClick={() => setStep(1)}
              className="text-sm text-theme-muted hover:text-brand transition-colors"
            >
              Back to amounts
            </button>
          </div>

          <div className="space-y-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-theme-body mb-2 flex items-center gap-2">
                  <UserRound className="w-4 h-4" /> Recipient Name *
                </label>
                <input
                  required
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-theme-border bg-theme-bg text-theme-heading focus:outline-none focus:ring-2 focus:ring-brand/50"
                  placeholder="e.g. Jane Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-theme-body mb-2 flex items-center gap-2">
                  <UserRound className="w-4 h-4" /> Your Name (Sender) *
                </label>
                <input
                  required
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-theme-border bg-theme-bg text-theme-heading focus:outline-none focus:ring-2 focus:ring-brand/50"
                  placeholder="e.g. John Smith"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-theme-body mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Recipient Email (Optional)
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-theme-border bg-theme-bg text-theme-heading focus:outline-none focus:ring-2 focus:ring-brand/50"
                placeholder="Where should we send the code?"
              />
              <p className="text-xs text-theme-muted mt-1">If left blank, we will send the code to you to forward manually.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-theme-body mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Gift Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-theme-border bg-theme-bg text-theme-heading focus:outline-none focus:ring-2 focus:ring-brand/50 resize-none"
                placeholder="Write a lovely note to accompany your gift..."
              />
            </div>
          </div>

          <div className="p-4 bg-brand/5 rounded-xl border border-brand/10 mb-6 flex items-center justify-between">
            <span className="font-medium text-theme-heading">Gift Card Value:</span>
            <span className="font-display font-bold text-xl text-brand">KSh {amount.toLocaleString()}</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-full shape-premium-button text-white font-bold flex items-center justify-center gap-2 group disabled:opacity-70"
          >
            {isSubmitting ? "Processing..." : "Proceed to Checkout"}
            {!isSubmitting && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </button>
        </div>
      </form>
    </div>
  );
}
