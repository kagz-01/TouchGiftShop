import { Check } from "lucide-react";

/**
 * Delivery progress, in the portal's language.
 *
 * `OrderStatusTimeline` is the consumer component: filled brand-pink circles,
 * hardcoded greys. A client's portal says status as a dot and a word, and
 * follows corporate_order_status — which has one more step than the consumer
 * order does, because "awaiting payment" is a real state here and pretending
 * otherwise would make an unpaid order look like a delivered one.
 */

const STEPS = [
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "In production" },
  { key: "wrapped", label: "Wrapped" },
  { key: "dispatched", label: "On the way" },
  { key: "delivered", label: "Delivered" },
];

const STEP_FOR_STATUS: Record<string, number> = {
  draft: 0,
  pending_payment: 0,
  processing: 1,
  wrapped: 2,
  dispatched: 3,
  delivered: 4,
};

/** Cancelled and refunded orders get their own ending rather than a stuck bar. */
const STOPPED = new Set(["cancelled", "refunded"]);

export default function PortalOrderTimeline({ status }: { status: string }) {
  const stopped = STOPPED.has(status);
  const current = STEP_FOR_STATUS[status] ?? 0;
  const filled = stopped ? 0 : current;
  const pct = (filled / (STEPS.length - 1)) * 100;

  return (
    <div className="relative pt-1">
      <div
        className="absolute left-2 right-2 top-[9px] h-px"
        style={{ background: "var(--portal-border)" }}
        aria-hidden
      />
      <div
        className="absolute left-2 top-[9px] h-px transition-[width] duration-700"
        style={{ width: `calc((100% - 1rem) * ${pct / 100})`, background: "var(--portal-accent)" }}
        aria-hidden
      />

      <ol className="relative flex justify-between">
        {STEPS.map((step, i) => {
          const done = i <= filled;
          const isCurrent = i === current && !stopped;
          const isStop = stopped && i === 0;

          return (
            <li key={step.key} className="flex w-14 flex-col items-center gap-2 text-center">
              <span
                className="flex h-[18px] w-[18px] items-center justify-center rounded-full"
                style={{
                  background: done || isStop ? "var(--portal-accent)" : "var(--portal-surface)",
                  border: `1px solid ${done || isStop ? "var(--portal-accent)" : "var(--portal-border)"}`,
                  color: "#fff",
                }}
              >
                {done && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
              </span>
              <span
                className="text-[11px] leading-tight"
                style={{
                  color:
                    done || isStop
                      ? "var(--portal-text)"
                      : "var(--portal-text-faint)",
                  fontWeight: isCurrent ? 600 : 400,
                }}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
