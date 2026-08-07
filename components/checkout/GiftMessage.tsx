"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type GiftMessageProps = {
  message: string;
  senderName: string;
  onMessageChange: (message: string) => void;
  onSenderNameChange: (name: string) => void;
  showRecipient?: boolean;
  recipientName?: string;
  onRecipientNameChange?: (name: string) => void;
};

const MESSAGE_TEMPLATES = [
  "Happy Birthday! Wishing you an amazing year ahead 🎂",
  "Congratulations on your special day! 🎉",
  "Thinking of you today and always 💝",
  "Thank you for everything you do! 🙏",
  "Wishing you all the love and happiness 💕",
  "Just because you're awesome ✨",
];

export default function GiftMessage({
  message,
  senderName,
  onMessageChange,
  onSenderNameChange,
  showRecipient = true,
  recipientName = "",
  onRecipientNameChange,
}: GiftMessageProps) {
  const [showTemplates, setShowTemplates] = useState(false);

  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg font-semibold flex items-center gap-2">
        <span className="text-xl">💌</span>
        Gift Message
      </h3>

      {/* Recipient name */}
      {showRecipient && onRecipientNameChange && (
        <div>
          <label className="block text-sm font-medium mb-1.5">To</label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => onRecipientNameChange(e.target.value)}
            placeholder="Recipient's name"
            className="w-full px-3 py-2.5 rounded-xl border border-surface-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
          />
        </div>
      )}

      {/* Message */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium">Your message</label>
          <button
            type="button"
            onClick={() => setShowTemplates(!showTemplates)}
            className="text-xs text-brand hover:underline"
          >
            {showTemplates ? "Hide templates" : "Use a template"}
          </button>
        </div>

        {/* Templates */}
        {showTemplates && (
          <div className="mb-3 p-3 bg-surface rounded-xl space-y-2">
            {MESSAGE_TEMPLATES.map((template) => (
              <button
                key={template}
                type="button"
                onClick={() => {
                  onMessageChange(template);
                  setShowTemplates(false);
                }}
                className={cn(
                  "w-full text-left p-2 rounded-lg text-xs hover:bg-white transition-colors",
                  message === template && "bg-white border border-brand/20"
                )}
              >
                {template}
              </button>
            ))}
          </div>
        )}

        <textarea
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Write a personal message..."
          rows={3}
          maxLength={200}
          className="w-full px-3 py-2.5 rounded-xl border border-surface-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand resize-none"
        />
        <p className="text-[10px] text-brand-muted mt-1 text-right">
          {message.length}/200 characters
        </p>
      </div>

      {/* Sender name */}
      <div>
        <label className="block text-sm font-medium mb-1.5">From</label>
        <input
          type="text"
          value={senderName}
          onChange={(e) => onSenderNameChange(e.target.value)}
          placeholder="Your name"
          className="w-full px-3 py-2.5 rounded-xl border border-surface-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
        />
      </div>
    </div>
  );
}
