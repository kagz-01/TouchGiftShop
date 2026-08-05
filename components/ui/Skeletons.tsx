export function ProductCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <div className="aspect-square bg-gray-100 rounded-md mb-2 skeleton" />
      <div className="h-4 bg-gray-100 rounded w-3/4 mb-1 skeleton" />
      <div className="h-3 bg-gray-100 rounded w-1/2 skeleton" />
    </div>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-100 rounded w-1/3 skeleton" />
          <div className="h-3 bg-gray-100 rounded w-1/4 skeleton" />
        </div>
        <div className="space-y-2 items-end">
          <div className="h-4 bg-gray-100 rounded w-16 skeleton" />
          <div className="h-3 bg-gray-100 rounded w-12 skeleton" />
        </div>
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="px-4 md:px-8 py-6 space-y-4">
      <div className="h-6 bg-gray-100 rounded w-1/3 skeleton" />
      <div className="h-4 bg-gray-100 rounded w-2/3 skeleton" />
      <div className="space-y-3 mt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-lg skeleton" />
        ))}
      </div>
    </div>
  );
}

export function InlineSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
