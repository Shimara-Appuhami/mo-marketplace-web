import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { EmptyProductsState } from "@/components/products/empty-products-state";
import { ProductCard } from "@/components/products/product-card";
import { productsApi } from "@/lib/api";

export default async function ProductsPage() {
  let products;

  try {
    products = await productsApi.list();
  } catch {
    return (
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-12 sm:px-6">
        <div className="flex max-w-xl flex-col gap-4 rounded-[2rem] border border-rose-200 bg-rose-50 p-8 text-rose-900">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-rose-100">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Unable to load products</h1>
              <p className="text-sm text-rose-800">
                The API request failed. Check the connection and try again.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/products"
              className="inline-flex items-center rounded-full bg-rose-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-800"
            >
              Retry
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-5 rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_48%,#dbeafe_100%)] p-8 shadow-[0_28px_70px_-45px_rgba(15,23,42,0.38)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <span className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              Products
            </span>
            <div className="space-y-3">
              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950">
                Browse the marketplace catalog.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-600">
                Explore public products, compare variant pricing, and open any item to view
                the available combinations in detail.
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-3 self-start rounded-full bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
            <span>{products.length} products</span>
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <EmptyProductsState />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
