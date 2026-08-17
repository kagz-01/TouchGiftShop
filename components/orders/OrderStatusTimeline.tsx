import { Check, Gift, Truck, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Confirmed", icon: Check },
  { label: "Wrapped", icon: Gift },
  { label: "Dispatched", icon: Truck },
  { label: "Delivered", icon: Home },
];

export default function OrderStatusTimeline({ currentStep = 0 }: { currentStep?: number }) {
  return (
    <div className="relative">
      {/* Background Track */}
      <div className="absolute top-5 left-8 right-8 h-1 bg-gray-100 rounded-full" />
      
      {/* Progress Track */}
      <div 
        className="absolute top-5 left-8 h-1 bg-brand rounded-full transition-all duration-700 ease-out" 
        style={{ width: `calc(${Math.min(currentStep, 3) * (100 / 3)}% - ${currentStep === 0 ? 0 : 32}px)` }}
      />

      <div className="relative flex justify-between">
        {STEPS.map((step, i) => {
          const isCompleted = i <= currentStep;
          const isActive = i === currentStep;
          const Icon = step.icon;

          return (
            <div key={step.label} className="flex flex-col items-center gap-3 relative z-10 w-16">
              <div 
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                  isCompleted 
                    ? "bg-brand text-white shadow-sm scale-110" 
                    : "bg-white text-gray-300 border-2 border-gray-100"
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <p 
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider text-center transition-colors",
                  isActive ? "text-brand-deep" : isCompleted ? "text-brand" : "text-gray-400"
                )}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
