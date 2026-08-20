import { formatKsh } from "@/lib/utils";

type OrderSummaryProps = {
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  deliveryPrice: number;
  giftWrapping?: boolean;
  giftWrappingPrice?: number;
};

export default function OrderSummary({
  items,
  deliveryPrice,
  giftWrapping = false,
  giftWrappingPrice = 0,
}: OrderSummaryProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const wrappingCost = giftWrapping ? giftWrappingPrice : 0;
  const total = subtotal + deliveryPrice + wrappingCost;

  return (
    <div className="bg-white rounded-2xl border border-surface-border p-5 space-y-4">
      <h3 className="font-display text-lg font-semibold">Order Summary</h3>

      {/* Items */}
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            {item.image && (
              <div className="w-12 h-12 bg-blush rounded-lg overflow-hidden shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.name}</p>
              <p className="text-xs text-brand-muted">Qty: {item.quantity}</p>
            </div>
            <p className="text-sm font-semibold">{formatKsh(item.price * item.quantity)}</p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-surface-border" />

      {/* Totals */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-brand-muted">Subtotal</span>
          <span>{formatKsh(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-brand-muted">Delivery</span>
          <span>{deliveryPrice === 0 ? "Free" : formatKsh(deliveryPrice)}</span>
        </div>
        {giftWrapping && (
          <div className="flex justify-between">
            <span className="text-brand-muted">Gift wrapping 🎁</span>
            <span>{wrappingCost === 0 ? "Free" : formatKsh(wrappingCost)}</span>
          </div>
        )}
        <div className="flex justify-between pt-2 border-t border-surface-border font-semibold text-base">
          <span>Total</span>
          <span className="text-brand">{formatKsh(total)}</span>
        </div>
      </div>

      {/* M-Pesa note */}
      <div className="bg-brand/5 rounded-xl p-3 text-xs text-on-theme flex items-start gap-2">
        <span className="text-lg">📱</span>
        <p>
          Payment via <strong className="text-brand-deep">M-Pesa Lipa Na M-Pesa</strong>.
          You&apos;ll receive an STK push on your phone to complete the payment.
        </p>
      </div>
    </div>
  );
}
