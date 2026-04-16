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
  
  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between border-b border-slate-200 pb-4">
    
    <div className="space-y-1">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
        Products
      </span>

      <h1 className="text-2xl font-semibold text-slate-900">
        Browse the marketplace catalog
      </h1>

      <p className="max-w-lg text-sm text-slate-600">
        Explore public products, compare pricing, and view details.
      </p>
    </div>

    <div className="flex items-center gap-2 border border-slate-200 px-3 py-1.5 text-sm text-slate-700">
      <span className="h-2 w-2 bg-green-500"></span>
      <span>{products.length} products</span>
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
