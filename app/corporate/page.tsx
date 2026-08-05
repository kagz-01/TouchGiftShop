import CorporateOrder from "@/components/corporate/CorporateOrder";

export default function CorporatePage() {
  return (
    <div className="px-4 md:px-8 py-6 max-w-2xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Corporate & Bulk Gifting</h1>
        <p className="text-sm text-brand-muted">
          Send the same gift to multiple recipients — employee appreciation,
          client thank-yous, event giveaways. One order, many deliveries.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg border border-gray-200 p-3">
          <p className="text-lg font-semibold">1</p>
          <p className="text-xs text-brand-muted">Choose a gift</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-3">
          <p className="text-lg font-semibold">2</p>
          <p className="text-xs text-brand-muted">Add recipients</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-3">
          <p className="text-lg font-semibold">3</p>
          <p className="text-xs text-brand-muted">One payment</p>
        </div>
      </div>

      <CorporateOrder />
    </div>
  );
}
