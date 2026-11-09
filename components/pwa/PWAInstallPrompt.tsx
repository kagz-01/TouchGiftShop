"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { X, Download, Share2, PlusSquare, Sparkles, Check } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Routes where we consciously avoid interrupting the user's high-intent flow
const SUPPRESSED_PREFIXES = [
  "/shop/checkout",
  "/corporate/checkout",
  "/payment-success",
  "/track",
  "/admin",
  "/admin-access-2026",
  "/gift-lab/build-hamper",
];

const SNOOZE_STORAGE_KEY = "touchgift_pwa_dismissed_until";
const INSTALLED_STORAGE_KEY = "touchgift_pwa_installed";
const SNOOZE_DURATION_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export default function PWAInstallPrompt() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // 1. Service worker registration & standalone check
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Register service worker for offline shell & Chrome installability requirement
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Silently fail if SW registration is restricted
      });
    }

    // Check if already in standalone display mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(ua) && !("MSStream" in window);
    setIsIOS(isAppleDevice);

    // Capture Chrome/Android/Edge beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      localStorage.setItem(INSTALLED_STORAGE_KEY, "true");
      setIsInstalled(true);
      setOpen(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Allow other components (footer, nav) to explicitly open the prompt on demand
    const handleManualOpen = () => {
      setOpen(true);
      setShowIOSGuide(isAppleDevice && !handleBeforeInstall);
    };
    window.addEventListener("touchgift:open-pwa-prompt", handleManualOpen);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("touchgift:open-pwa-prompt", handleManualOpen);
    };
  }, []);

  // 2. 4-second HCI delay before showing prompt
  useEffect(() => {
    if (typeof window === "undefined" || isInstalled) return;

    // Check suppressed routes
    if (SUPPRESSED_PREFIXES.some((p) => pathname.startsWith(p))) {
      setOpen(false);
      return;
    }

    // Check snooze timestamp
    const dismissedUntil = localStorage.getItem(SNOOZE_STORAGE_KEY);
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      return;
    }

    // Check if user already installed
    if (localStorage.getItem(INSTALLED_STORAGE_KEY) === "true") {
      return;
    }

    const timer = setTimeout(() => {
      setOpen(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, [pathname, isInstalled]);

  // Handle Dismiss (Snooze for 14 days per HCI forgiveness principle)
  const handleDismiss = useCallback(() => {
    setOpen(false);
    setShowIOSGuide(false);
    try {
      localStorage.setItem(
        SNOOZE_STORAGE_KEY,
        String(Date.now() + SNOOZE_DURATION_MS)
      );
    } catch {
      // Ignore localStorage quotas
    }
  }, []);

  // Handle ESC key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleDismiss();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, handleDismiss]);

  // Handle Install Action
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          localStorage.setItem(INSTALLED_STORAGE_KEY, "true");
          setIsInstalled(true);
          setOpen(false);
        } else {
          handleDismiss();
        }
      } catch {
        handleDismiss();
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // Fallback for browsers that don't support programmatic install
      handleDismiss();
    }
  };

  if (!open || isInstalled) return null;

  return (
    <aside
      role="region"
      aria-label="Install TouchGift App"
      className="fixed bottom-20 inset-x-3 sm:inset-x-auto sm:right-5 sm:bottom-6 z-[250] max-w-sm sm:w-[380px] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-brand/15 dark:border-white/10 rounded-2xl shadow-2xl p-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
    >
      {/* Header & Logo */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-xl overflow-hidden shadow-sm border border-brand/10 shrink-0 bg-brand-bg flex items-center justify-center">
            <Image
              src="/logo/logo.webp"
              alt="TouchGift Logo"
              width={44}
              height={44}
              className="object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                Install TouchGift
              </h3>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 bg-brand/10 text-brand dark:text-brand-light rounded-full">
                <Sparkles className="w-2.5 h-2.5" /> App
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-zinc-400 mt-0.5 leading-snug">
              Instant order tracking, offline gifts & faster checkout.
            </p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
          aria-label="Dismiss install prompt"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* iOS Step-by-Step Guide Accordion / View */}
      {showIOSGuide ? (
        <div className="mt-3.5 pt-3 border-t border-gray-100 dark:border-zinc-800 space-y-2.5 text-xs text-gray-700 dark:text-zinc-300 animate-in fade-in duration-200">
          <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
            Follow these 2 quick steps on Safari:
          </p>
          <ol className="space-y-2 text-xs bg-gray-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-gray-100 dark:border-zinc-800">
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-brand/10 text-brand dark:text-brand-light font-bold flex items-center justify-center shrink-0 text-[11px]">
                1
              </span>
              <span>
                Tap the <Share2 className="w-3.5 h-3.5 inline text-blue-500 mx-0.5" /> <strong>Share</strong> button in the browser bar.
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-brand/10 text-brand dark:text-brand-light font-bold flex items-center justify-center shrink-0 text-[11px]">
                2
              </span>
              <span>
                Scroll down and select <PlusSquare className="w-3.5 h-3.5 inline text-gray-700 dark:text-zinc-300 mx-0.5" /> <strong>Add to Home Screen</strong>.
              </span>
            </li>
          </ol>
          <div className="flex justify-end pt-1">
            <button
              onClick={handleDismiss}
              className="text-xs font-semibold px-3 py-1.5 bg-brand text-white rounded-lg hover:bg-brand-light transition-colors flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" /> Got it
            </button>
          </div>
        </div>
      ) : (
        /* Action Buttons */
        <div className="mt-3.5 pt-2.5 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-end gap-2">
          <button
            onClick={handleDismiss}
            className="text-xs font-medium text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            Not now
          </button>
          <button
            onClick={handleInstallClick}
            className="text-xs font-semibold px-3.5 py-1.5 bg-brand hover:bg-brand-light active:scale-95 text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            {isIOS ? "How to Install" : "Install App"}
          </button>
        </div>
      )}
    </aside>
  );
}
