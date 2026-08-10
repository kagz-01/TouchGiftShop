"use client";

import { useState } from "react";
import {
  createGroupGift,
  joinGroupGift,
  getTotalCollected,
  getRemainingAmount,
  getGroupGiftProgress,
  generateShareMessage,
  type GroupGift,
} from "@/lib/group-gift";
import BackToHome from "@/components/ui/BackToHome";

type GroupGiftBuilderProps = {
  product: {
    id: string;
    name: string;
    price: number;
    image?: string;
  };
  onClose?: () => void;
};

type View = "setup" | "invite" | "status";

export default function GroupGiftBuilder({ product, onClose }: GroupGiftBuilderProps) {
  const [view, setView] = useState<View>("setup");
  const [groupGift, setGroupGift] = useState<GroupGift | null>(null);
  const [copied, setCopied] = useState(false);

  // Setup form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [targetAmount, setTargetAmount] = useState(product.price.toString());

  // Join form
  const [joinCode, setJoinCode] = useState("");
  const [joinName, setJoinName] = useState("");
  const [joinEmail, setJoinEmail] = useState("");
  const [joinAmount, setJoinAmount] = useState("");
  const [joinError, setJoinError] = useState("");

  function handleCreate() {
    if (!name.trim() || !email.trim()) return;

    const gg = createGroupGift(
      { id: product.id, name: product.name, price: product.price },
      { name: name.trim(), email: email.trim() },
      parseInt(targetAmount) || product.price,
      message.trim() || undefined
    );

    setGroupGift(gg);
    setView("invite");
  }

  function handleJoin() {
    if (!joinName.trim() || !joinEmail.trim() || !joinAmount.trim()) return;

    const result = joinGroupGift(joinCode.toUpperCase(), {
      name: joinName.trim(),
      email: joinEmail.trim(),
    }, parseInt(joinAmount));

    if (result.success && result.groupGift) {
      setGroupGift(result.groupGift);
      setView("status");
      setJoinError("");
    } else {
      setJoinError(result.error || "Failed to join");
    }
  }

  function handleCopyLink() {
    if (!groupGift) return;
    const msg = generateShareMessage(groupGift);
    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleShareWhatsApp() {
    if (!groupGift) return;
    const msg = generateShareMessage(groupGift);
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  }

  // ---- SETUP VIEW ----
  if (view === "setup" && !groupGift) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Start a Group Gift</h3>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          )}
        </div>

        <div className="mb-4 rounded-xl bg-purple-50 p-4">
          <p className="text-sm font-medium text-purple-800">{product.name}</p>
          <p className="text-lg font-bold text-purple-900">
            KSh {product.price.toLocaleString()}
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Wanjiku"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Your Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Target Amount (KSh)
            </label>
            <input
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Group Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Let's surprise them together!"
              rows={2}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
            />
          </div>

          <button
            onClick={handleCreate}
            disabled={!name.trim() || !email.trim()}
            className="w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
          >
            Create Group Gift
          </button>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <BackToHome />
        </div>

        {/* Join existing */}
        <div className="mt-4 border-t border-gray-100 pt-4">
          <p className="mb-2 text-xs font-medium text-gray-400">Have a code? Join instead</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="INVITE CODE"
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono uppercase focus:border-purple-500 focus:outline-none"
              maxLength={6}
            />
            <button
              onClick={() => {
                if (joinCode.length === 6) {
                  setJoinError("");
                  setView("invite");
                }
              }}
              disabled={joinCode.length !== 6}
              className="rounded-lg border border-purple-200 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50 disabled:opacity-50"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- INVITE VIEW (organizer) or JOIN VIEW ----
  if (view === "invite" && groupGift) {
    const collected = getTotalCollected(groupGift);
    const remaining = getRemainingAmount(groupGift);
    const progress = getGroupGiftProgress(groupGift);

    // If user arrived via join code, show join form
    if (!groupGift.recipients.find((r) => r.email === email)) {
      return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-2 text-lg font-bold text-gray-900">Join Group Gift</h3>
          <p className="mb-4 text-sm text-gray-500">
            Contributing to: <span className="font-medium text-gray-700">{groupGift.productName}</span>
          </p>

          {/* Progress */}
          <div className="mb-4">
            <div className="mb-1 flex justify-between text-xs text-gray-500">
              <span>{collected.toLocaleString()} KSh raised</span>
              <span>{groupGift.targetAmount.toLocaleString()} KSh goal</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-purple-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Your Name</label>
              <input
                type="text"
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Your Email</label>
              <input
                type="email"
                value={joinEmail}
                onChange={(e) => setJoinEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Your Contribution (KSh)
              </label>
              <input
                type="number"
                value={joinAmount}
                onChange={(e) => setJoinAmount(e.target.value)}
                placeholder={`Suggested: ${Math.ceil(remaining / 2).toLocaleString()}`}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>

            {joinError && (
              <p className="text-sm text-red-600">{joinError}</p>
            )}

            <button
              onClick={handleJoin}
              disabled={!joinName.trim() || !joinEmail.trim() || !joinAmount.trim()}
              className="w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
            >
              Join & Contribute
            </button>
          </div>
        </div>
      );
    }

    // Organizer invite view
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-2 text-lg font-bold text-gray-900">Group Gift Created!</h3>
        <p className="mb-4 text-sm text-gray-500">
          Share the invite code with friends and family.
        </p>

        {/* Code */}
        <div className="mb-4 rounded-xl bg-purple-50 p-4 text-center">
          <p className="text-xs text-purple-600">Your Invite Code</p>
          <p className="mt-1 text-3xl font-bold tracking-widest text-purple-900">
            {groupGift.inviteCode}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="mb-1 flex justify-between text-xs text-gray-500">
            <span>{collected.toLocaleString()} KSh raised</span>
            <span>{groupGift.targetAmount.toLocaleString()} KSh goal</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-purple-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-gray-400">
            {groupGift.recipients.length} contributor{groupGift.recipients.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Contributors */}
        <div className="mb-4 space-y-2">
          {groupGift.recipients.map((r, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-gray-800">{r.name}</p>
                <p className="text-xs text-gray-400">{r.email}</p>
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {r.amount.toLocaleString()} KSh
              </span>
            </div>
          ))}
        </div>

        {/* Share buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleCopyLink}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {copied ? "Copied!" : "Copy Invite"}
          </button>
          <button
            onClick={handleShareWhatsApp}
            className="flex-1 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
          >
            Share on WhatsApp
          </button>
        </div>

        {remaining > 0 && (
          <p className="mt-3 text-center text-xs text-gray-400">
            {remaining.toLocaleString()} KSh still needed · Expires in 7 days
          </p>
        )}
      </div>
    );
  }

  // ---- STATUS VIEW (after joining) ----
  if (view === "status" && groupGift) {
    const collected = getTotalCollected(groupGift);
    const remaining = getRemainingAmount(groupGift);
    const progress = getGroupGiftProgress(groupGift);

    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-2 text-lg font-bold text-gray-900">You Joined! 🎉</h3>
        <p className="mb-4 text-sm text-gray-500">
          Thanks for contributing to <span className="font-medium text-gray-700">{groupGift.productName}</span>.
        </p>

        <div className="mb-4">
          <div className="mb-1 flex justify-between text-xs text-gray-500">
            <span>{collected.toLocaleString()} KSh raised</span>
            <span>{groupGift.targetAmount.toLocaleString()} KSh goal</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-green-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          {remaining === 0 && (
            <p className="mt-2 text-sm font-semibold text-green-600">Goal reached! 🎉</p>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Done
        </button>
      </div>
    );
  }

  return null;
}
