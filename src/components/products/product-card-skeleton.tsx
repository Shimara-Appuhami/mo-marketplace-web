export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="aspect-square w-full animate-pulse bg-slate-200" />
      <div className="space-y-2 pt-3">
        <div className="flex items-start justify-between gap-2">
          <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-12 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  );
}
