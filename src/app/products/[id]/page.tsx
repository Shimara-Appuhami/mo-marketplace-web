import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle } from "lucide-react";
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
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-12 sm:px-6">
        <div className="flex max-w-xl flex-col gap-4 rounded-[2rem] border border-rose-200 bg-rose-50 p-8 text-rose-900">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-rose-100">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Unable to load this product</h1>
              <p className="text-sm text-rose-800">
                The product detail request failed. Retry or return to the catalog.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/products/${id}`}
              className="inline-flex items-center rounded-full bg-rose-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-800"
            >
              Retry
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-900 transition hover:border-rose-400"
            >
              Back to products
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return <ProductDetailView product={product} />;
}
