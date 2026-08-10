"use client";

import { useSubscription } from "@/components/reminders/SubscriptionProvider";
import { useRouter } from "next/navigation";
import { formatKsh, cn } from "@/lib/utils";

export default function SubscriptionFloatingBar() {
  const { isBuildingSubscription, subscriptionItems, cancelBuildingSubscription } = useSubscription();
  const router = useRouter();

  if (!isBuildingSubscription) return null;

  const total = subscriptionItems.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="fixed bottom-20 md:bottom-6 left-0 right-0 z-50 px-4 pointer-events-none">
      <div className="max-w-2xl mx-auto bg-surface border-2 border-brand rounded-2xl shadow-xl p-4 flex items-center justify-between pointer-events-auto animate-fade-in-up">
        <div>
          <p className="font-bold text-brand-deep text-sm">
            {subscriptionItems.length === 0
              ? "Select items to add to your subscription"
              : `${subscriptionItems.length} item${subscriptionItems.length === 1 ? "" : "s"} added to Subscription`}
          </p>
          <p className="text-xs text-brand-muted mt-0.5">
            Total: <span className="font-semibold text-brand">{formatKsh(total)}</span> / delivery
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={cancelBuildingSubscription}
            className="text-xs font-semibold text-brand-muted hover:text-brand transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => router.push("/reminders?building=true")}
            disabled={subscriptionItems.length === 0}
            className={cn(
              "text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-button",
              subscriptionItems.length === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                : "bg-brand text-white hover:bg-brand-dark"
            )}
          >
            Complete Setup
          </button>
        </div>
      </div>
    </div>
  );
}
