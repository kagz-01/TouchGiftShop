"use client";

import { useState } from "react";
import { MapPin, CheckCircle, Share2 } from "lucide-react";
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
      <div className="bg-brand/5 border border-brand/10 rounded-3xl p-5 flex items-start gap-4">
        <CheckCircle className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-brand-deep">Link sent!</p>
          <p className="text-xs text-brand-muted mt-1">
            {recipientName} can now drop their delivery pin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-brand/5 border border-brand/10 rounded-3xl p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-brand" />
            </div>
            <div>
              <p className="text-sm font-bold text-brand-deep">Pin drop link</p>
              <p className="text-xs text-brand-muted mt-0.5">
                {recipientName} needs to drop their pin.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(!showModal)}
            className="shrink-0 px-4 py-2 text-xs font-bold text-brand bg-white border border-brand/20 rounded-xl shadow-sm hover:bg-brand hover:text-white transition-all flex items-center gap-1.5"
          >
            {showModal ? "Cancel" : <><Share2 className="w-3.5 h-3.5" /> Send link</>}
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
