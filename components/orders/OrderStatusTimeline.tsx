import { Check, Gift, Truck, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Confirmed", icon: Check },
  { label: "Wrapped", icon: Gift },
  { label: "Dispatched", icon: Truck },
  { label: "Delivered", icon: Home },
];

export default function OrderStatusTimeline({ currentStep = 0 }: { currentStep?: number }) {
  // Normalize step between 0 and 3
  const step = Math.max(0, Math.min(currentStep, 3));
  const progressPercent = (step / 3) * 100;

  return (
    <div className="relative py-2">
      {/* Background Track */}
      <div className="absolute top-7 left-8 right-8 h-1 bg-gray-100 rounded-full" />
      
      {/* Progress Track */}
      <div 
        className="absolute top-7 left-8 h-1 bg-brand rounded-full transition-all duration-700 ease-out" 
        style={{ width: `calc(${progressPercent}% - ${step === 0 ? 0 : 32}px)` }}
      />

      <div className="relative flex justify-between">
        {STEPS.map((s, i) => {
          const isCompleted = i <= step;
          const isCurrent = i === step;
          const Icon = s.icon;

          return (
            <div key={s.label} className="flex flex-col items-center gap-2.5 relative z-10 w-16">
              <div 
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                  isCompleted 
                    ? "bg-brand text-white shadow-md ring-4 ring-brand/10 scale-105" 
                    : "bg-white text-gray-400 border-2 border-gray-200"
                )}
              >
                <Icon className="w-4 h-4 stroke-[2.5]" />
              </div>
              <p 
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider text-center transition-colors",
                  isCurrent ? "text-brand-deep font-extrabold" : isCompleted ? "text-brand" : "text-gray-400"
                )}
              >
                {s.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
