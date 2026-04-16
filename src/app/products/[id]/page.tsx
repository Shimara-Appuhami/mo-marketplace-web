type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-12 sm:px-6">
      <span className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
        Product Detail
      </span>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
        Product detail for {id}
      </h1>
      <p className="max-w-2xl text-sm leading-6 text-slate-600">
        This route remains public. Variant selection and quick buy will be implemented in the
        next priority.
      </p>
    </section>
  );
}
