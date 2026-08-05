// Section 3.5 / 8.1. Confirmed -> Wrapped -> Dispatched -> Delivered.
// Maps to orders.status enum in db/schema.sql.
const STEPS = ["Confirmed", "Wrapped", "Dispatched", "Delivered"];

export default function OrderStatusTimeline({
  currentStep = 0,
}: {
  currentStep?: number;
}) {
  return (
    <ol className="flex justify-between text-xs">
      {STEPS.map((step, i) => (
        <li
          key={step}
          className={`flex-1 text-center ${
            i <= currentStep ? "text-brand font-medium" : "text-gray-400"
          }`}
        >
          {step}
        </li>
      ))}
    </ol>
  );
}
