export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
      <div className="h-44 animate-pulse bg-slate-200" />
      <div className="space-y-5 p-6">
        <div className="space-y-3">
          <div className="h-6 w-2/3 animate-pulse rounded-full bg-slate-200" />
          <div className="h-4 w-full animate-pulse rounded-full bg-slate-100" />
          <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-100" />
        </div>
        <div className="flex items-end justify-between border-t border-slate-100 pt-5">
          <div className="space-y-2">
            <div className="h-3 w-20 animate-pulse rounded-full bg-slate-100" />
            <div className="h-5 w-28 animate-pulse rounded-full bg-slate-200" />
          </div>
          <div className="space-y-2 rounded-2xl bg-slate-100 px-3 py-2">
            <div className="h-4 w-10 animate-pulse rounded-full bg-slate-200" />
            <div className="h-3 w-14 animate-pulse rounded-full bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
