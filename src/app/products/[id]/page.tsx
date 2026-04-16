import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { ProductDetailView } from "@/components/products/product-detail-view";
import { productsApi } from "@/lib/api";

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  let product = null;
  let status: number | null = null;

  try {
    product = await productsApi.getById(id);
  } catch (error: unknown) {
    status =
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof error.response === "object" &&
      error.response !== null &&
      "status" in error.response
        ? Number(error.response.status)
        : null;
  }

  if (status === 404) {
    notFound();
  }

  if (!product) {
    return (
      <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <div className="space-y-4 rounded-xl border border-rose-200 bg-rose-50 p-8">
          <div className="flex size-12 items-center justify-center rounded-full bg-rose-100">
            <AlertTriangle className="size-5 text-rose-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-950">Unable to load this product</h1>
            <p className="mt-1 text-sm text-rose-700">
              The product detail request failed. Retry or return to the catalog.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/products/${id}`}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Retry
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
            >
              <ArrowLeft className="size-4" />
              Back to catalog
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return <ProductDetailView product={product} />;
}
