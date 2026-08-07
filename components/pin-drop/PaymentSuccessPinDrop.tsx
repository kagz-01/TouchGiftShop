"use client";

import { useState, useEffect } from "react";
import PinDropSendModal from "./PinDropSendModal";

interface PaymentSuccessPinDropProps {
  orderId: string;
}

export default function PaymentSuccessPinDrop({
  orderId,
}: PaymentSuccessPinDropProps) {
  const [order, setOrder] = useState<{
    recipient_name: string;
    recipient_phone: string;
    recipient_pin_requested: boolean;
  } | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.order?.recipient_pin_requested) {
          setOrder(data.order);
        }
      })
      .catch(() => {});
  }, [orderId]);

  if (!order) return null;

  return (
    <div className="w-full max-w-sm mx-auto mt-4">
      {!showModal ? (
        <button
          onClick={() => setShowModal(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand/10 border border-brand/20 rounded-xl text-sm font-semibold text-brand hover:bg-brand/15 transition-colors"
        >
          <span className="text-lg">📍</span>
          Send pin-drop link to {order.recipient_name}
        </button>
      ) : (
        <PinDropSendModal
          orderId={orderId}
          recipientName={order.recipient_name}
          recipientPhone={order.recipient_phone}
          onSent={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
