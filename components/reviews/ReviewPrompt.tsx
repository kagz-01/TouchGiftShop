"use client";

import { useState } from "react";
import ReviewForm from "./ReviewForm";

interface ReviewPromptProps {
  orderId: string;
  productId: string;
  productName: string;
  productImage: string | null;
}

export default function ReviewPrompt({
  orderId,
  productId,
  productName,
  productImage,
}: ReviewPromptProps) {
  const [dismissed, setDismissed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (dismissed || submitted) return null;

  return (
    <div className="bg-gradient-warm border border-gold/20 rounded-2xl p-6 mb-6">
      <div className="flex items-start gap-4">
        {productImage && (
          <img
            src={productImage}
            alt={productName}
            className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1">
          <h3 className="font-display font-bold text-brand-deep mb-1">
            How was your experience?
          </h3>
          <p className="text-sm text-brand-muted mb-4">
            Share your thoughts about <strong>{productName}</strong> to help
            other gift-givers.
          </p>

          <ReviewForm
            productId={productId}
            orderId={orderId}
            onSuccess={() => setSubmitted(true)}
            onCancel={() => setDismissed(true)}
          />
        </div>
      </div>
    </div>
  );
}
