export default function ProductDetailLoading() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white">
          <div className="h-[300px] animate-pulse bg-slate-200" />
          <div className="grid gap-4 p-8 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-2xl bg-slate-50 p-5">
                <div className="h-3 w-20 animate-pulse rounded-full bg-slate-200" />
                <div className="mt-3 h-6 w-24 animate-pulse rounded-full bg-slate-200" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8">
          <div className="space-y-6">
            <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200" />
            <div className="h-8 w-56 animate-pulse rounded-full bg-slate-200" />
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <div className="h-3 w-24 animate-pulse rounded-full bg-slate-100" />
                <div className="flex gap-3">
                  {Array.from({ length: 3 }).map((__, pillIndex) => (
                    <div
                      key={pillIndex}
                      className="h-10 w-24 animate-pulse rounded-full bg-slate-200"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
