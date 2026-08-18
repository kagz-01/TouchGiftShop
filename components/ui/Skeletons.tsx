export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-card">
      <div className="aspect-[4/5] bg-blush skeleton" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-blush rounded w-3/4 skeleton" />
        <div className="h-5 bg-gold/30 rounded w-1/3 skeleton" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-card border border-surface-border">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-blush rounded w-1/3 skeleton" />
          <div className="h-3 bg-blush rounded w-1/4 skeleton" />
        </div>
        <div className="space-y-2 items-end">
          <div className="h-4 bg-blush rounded w-16 skeleton" />
          <div className="h-3 bg-blush rounded w-12 skeleton" />
        </div>
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="page-container py-6 space-y-4">
      <div className="h-6 bg-blush rounded w-1/3 skeleton" />
      <div className="h-4 bg-blush rounded w-2/3 skeleton" />
      <div className="space-y-3 mt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-blush rounded-2xl skeleton" />
        ))}
      </div>
    </div>
  );
}

export function InlineSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="w-8 h-8 border-2 border-brand border-t-gold rounded-full animate-spin" />
    </div>
  );
}
