"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type ShareButtonProps = {
  productName: string;
  productUrl: string;
  productImage?: string;
  className?: string;
};

export default function ShareButton({
  productName,
  productUrl,
  productImage,
  className,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const shareText = `Check out this gift: ${productName}`;
  const fullUrl = typeof window !== "undefined"
    ? `${window.location.origin}${productUrl}`
    : productUrl;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard?.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = fullUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: shareText,
          url: fullUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      setShowMenu(!showMenu);
    }
  };

  const shareLinks = [
    {
      name: "WhatsApp",
      emoji: "💬",
      url: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${fullUrl}`)}`,
      color: "bg-green-500",
    },
    {
      name: "Twitter",
      emoji: "🐦",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(fullUrl)}`,
      color: "bg-sky-500",
    },
    {
      name: "Facebook",
      emoji: "👤",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
      color: "bg-blue-600",
    },
    {
      name: "Instagram",
      emoji: "📸",
      url: "#",
      color: "bg-gradient-to-br from-purple-500 to-pink-500",
    },
  ];

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={handleNativeShare}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-surface-border bg-white hover:bg-surface text-sm font-medium transition-all"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Share
      </button>

      {/* Share menu for browsers without Web Share API */}
      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-surface-border p-2 z-50 animate-fade-in">
            {shareLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors"
              >
                <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-lg">
                  {link.emoji}
                </span>
                <span className="text-sm font-medium">{link.name}</span>
              </a>
            ))}
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors"
            >
              <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-lg">
                {copied ? "✅" : "🔗"}
              </span>
              <span className="text-sm font-medium">{copied ? "Copied!" : "Copy Link"}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
