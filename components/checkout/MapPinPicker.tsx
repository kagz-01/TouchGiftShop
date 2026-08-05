"use client";

// Section 3.2 — "Recipient-Led Delivery".
// TODO: integrate Google Maps JS API for interactive pin drop + landmark
// autocomplete. If recipientPinRequested is true, skip this picker entirely
// and instead show a note that a link will be sent to the recipient's phone.
export default function MapPinPicker() {
  return (
    <div className="rounded-lg border border-gray-200 p-4 space-y-2">
      <p className="text-sm font-medium">Delivery location</p>
      <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center text-sm text-brand-muted">
        Map pin picker placeholder
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" />
        I don&apos;t know their exact location — send them a link to drop
        their own pin
      </label>
    </div>
  );
}
