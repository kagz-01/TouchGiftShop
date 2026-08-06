"use client";

import { useState } from "react";

export default function PoolShareLink({ slug, title }: { slug: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const poolUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/gift-lab/pool/${slug}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Pool a Gift for "${title}" 🎁\n\nJoin me in contributing to this group gift! Every contribution brings us closer to the target.\n\n${poolUrl}`)}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(poolUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = poolUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-surface-border space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">📤</span>
        <p className="text-sm font-semibold">Share this pool</p>
      </div>

      <p className="text-xs text-brand-muted">
        Share this link with friends and family. Everyone can contribute via M-Pesa.
      </p>

      <div className="bg-gray-50 border border-surface-border rounded-xl px-3 py-2 text-xs text-brand-muted break-all font-mono">
        {poolUrl}
      </div>

      <div className="flex gap-2">
        <button
          onClick={copyLink}
          className="flex-1 py-2.5 bg-gray-100 text-brand-muted rounded-xl text-xs font-semibold hover:bg-gray-200 transition-colors"
        >
          {copied ? "✓ Copied!" : "Copy Link"}
        </button>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2.5 bg-[#25D366] text-white rounded-xl text-xs font-semibold hover:bg-[#1fb855] transition-colors text-center"
        >
          Share on WhatsApp
        </a>
      </div>
    </div>
  );
}
