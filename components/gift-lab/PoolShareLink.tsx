"use client";

import { useState } from "react";

export default function PoolShareLink({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const poolUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/gift-lab/pool/${slug}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(poolUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
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
    <div className="rounded-lg border border-gray-200 p-4 space-y-2">
      <p className="text-sm font-medium">Share this link</p>
      <p className="text-xs text-brand-muted break-all">{poolUrl}</p>
      <button
        onClick={copyLink}
        className="w-full rounded-lg border border-gray-300 py-2 text-sm font-medium"
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
