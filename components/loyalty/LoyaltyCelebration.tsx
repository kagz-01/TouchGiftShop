"use client";

import { useEffect, useState } from "react";
import { Crown } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

export default function LoyaltyCelebration() {
  const [show, setShow] = useState(false);
  const [tierName, setTierName] = useState("");

  useEffect(() => {
    const supabase = createClient();
    let interval: NodeJS.Timeout;

    supabase.auth.getUser().then(({ data }) => {
      if (!data.user || data.user.is_anonymous) return;

      let initialTier = "";

      const checkLoyalty = async () => {
        try {
          const res = await fetch("/api/loyalty");
          const json = await res.json();

          if (!initialTier) {
            initialTier = json.tierConfig?.name || "Bronze";
            return;
          }

          if (json.tierConfig?.name && json.tierConfig.name !== initialTier) {
            setTierName(json.tierConfig.name);
            setShow(true);
            triggerConfetti();
            clearInterval(interval);
          }
        } catch {
          // ignore
        }
      };

      checkLoyalty();
      interval = setInterval(checkLoyalty, 5000);
      setTimeout(() => clearInterval(interval), 30000);
    });

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  function triggerConfetti() {
    // Dynamic import to avoid SSR issues
    import("canvas-confetti").then((mod) => {
      const confetti = mod.default;
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#FFD700", "#9B1B5A", "#E5E4E2"],
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#FFD700", "#9B1B5A", "#E5E4E2"],
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    });
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
        style={{ animation: "zoomIn 0.3s ease-out" }}
      >
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-yellow-300 flex items-center justify-center mb-6">
          <Crown className="w-10 h-10 text-brand-deep" />
        </div>
        <h2 className="text-3xl font-display font-bold text-brand-deep mb-2">
          Congratulations! 🎉
        </h2>
        <p className="text-brand-muted mb-6">
          You just unlocked the{" "}
          <strong className="text-yellow-600">{tierName} Tier</strong>! Enjoy
          exclusive perks and bigger discounts on all future orders.
        </p>
        <button
          onClick={() => setShow(false)}
          className="w-full py-3 bg-brand text-white font-bold rounded-xl hover:bg-brand-dark transition-colors"
        >
          Awesome, let's go! 🚀
        </button>
      </div>
    </div>
  );
}
