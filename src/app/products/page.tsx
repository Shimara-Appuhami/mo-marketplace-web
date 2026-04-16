export default function ProductsPage() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-12 sm:px-6">
      <span className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
        Products
      </span>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
        Product listing is next.
      </h1>
      <p className="max-w-2xl text-sm leading-6 text-slate-600">
        Priority 1 auth is now wired into the app. This route stays public and will host the
        product grid in the next step.
      </p>
    </section>
  );
}
