"use client";

import { useState } from "react";
import PinDropSendModal from "./PinDropSendModal";

interface ResendPinDropButtonProps {
  orderId: string;
  recipientName: string;
  recipientPhone?: string;
}

export default function ResendPinDropButton({
  orderId,
  recipientName,
  recipientPhone,
}: ResendPinDropButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="bg-brand/5 border border-brand/10 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">✅</span>
          <div>
            <p className="text-xs font-semibold">Link sent</p>
            <p className="text-xs text-brand-muted">
              {recipientName} can now drop their delivery pin.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-brand/5 border border-brand/10 rounded-2xl p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">📍</span>
            <div>
              <p className="text-xs font-semibold">Pin drop link</p>
              <p className="text-xs text-brand-muted">
                {recipientName} needs to drop their delivery pin.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(!showModal)}
            className="shrink-0 px-3 py-1.5 text-xs font-semibold text-brand border border-brand/20 rounded-lg hover:bg-brand/5 transition-colors"
          >
            {showModal ? "Close" : "Send link"}
          </button>
        </div>
      </div>

      {showModal && (
        <PinDropSendModal
          orderId={orderId}
          recipientName={recipientName}
          recipientPhone={recipientPhone}
          onSent={() => {
            setSent(true);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
