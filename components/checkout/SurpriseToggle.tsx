"use client";

import { useState } from "react";

// Section 3.3 — "The Surprise Safeguard".
// dontCallRecipient maps directly to orders.dont_call_recipient in the schema.
export default function SurpriseToggle({
  onChange,
}: {
  onChange?: (value: { anonymous: boolean; dontCall: boolean }) => void;
}) {
  const [anonymous, setAnonymous] = useState(false);
  const [dontCall, setDontCall] = useState(false);

  function update(next: { anonymous: boolean; dontCall: boolean }) {
    setAnonymous(next.anonymous);
    setDontCall(next.dontCall);
    onChange?.(next);
  }

  return (
    <div className="rounded-lg border border-gray-200 p-4 space-y-3">
      <label className="flex items-center justify-between">
        <span className="text-sm">
          This is a surprise — don&apos;t call or message the recipient
          before arrival
        </span>
        <input
          type="checkbox"
          checked={dontCall}
          onChange={(e) => update({ anonymous, dontCall: e.target.checked })}
        />
      </label>
      <label className="flex items-center justify-between">
        <span className="text-sm">
          Anonymous Mode — hide my identity and the price from the recipient
        </span>
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(e) => update({ anonymous: e.target.checked, dontCall })}
        />
      </label>
    </div>
  );
}
