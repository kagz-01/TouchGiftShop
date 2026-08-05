// Reminders tab — saved dates + wishlist/registry manager (Section 3.6, 4).
export default function RemindersPage() {
  return (
    <div className="px-4 md:px-8 py-6 space-y-6">
      <h1 className="text-xl font-semibold">Reminders</h1>
      <div className="rounded-lg border border-gray-200 p-4 text-sm text-brand-muted">
        Saved occasion dates will appear here. TODO: "Add a date" form +
        WhatsApp/push nudge scheduling.
      </div>
      <div>
        <h2 className="font-medium mb-2">Your wishlists</h2>
        <a href="/wishlist/create" className="text-sm underline">
          Create a wishlist to share
        </a>
      </div>
    </div>
  );
}
