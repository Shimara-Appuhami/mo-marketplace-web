import Link from "next/link";
import { ArrowUpRight, Boxes, PackageX } from "lucide-react";
import { getProductPriceRange, isProductOutOfStock } from "@/lib/products";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  const outOfStock = isProductOutOfStock(product);

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_30px_70px_-35px_rgba(15,23,42,0.4)]"
    >
      <div className="relative flex min-h-44 items-end overflow-hidden bg-[linear-gradient(135deg,#e2e8f0_0%,#f8fafc_45%,#dbeafe_100%)] p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(148,163,184,0.22),transparent_42%)]" />
        <div className="relative flex w-full items-start justify-between gap-3">
          <div>
            <span className="inline-flex rounded-full border border-white/80 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600 backdrop-blur">
              {product.category || "Uncategorized"}
            </span>
          </div>
          {outOfStock ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white">
              <PackageX className="size-3.5" />
              Out of stock
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 p-6">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl font-semibold tracking-tight text-slate-950 transition group-hover:text-slate-700">
              {product.name}
            </h2>
            <ArrowUpRight className="mt-1 size-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-700" />
          </div>
          <p className="line-clamp-3 text-sm leading-6 text-slate-600">
            {product.description || "No description provided for this product."}
          </p>
        </div>

        <div className="mt-auto flex items-end justify-between gap-4 border-t border-slate-100 pt-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Price range
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-950">
              {getProductPriceRange(product)}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-100 px-3 py-2 text-right">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Boxes className="size-4" />
              {product.variants.length}
            </p>
            <p className="text-xs text-slate-500">
              {product.variants.length === 1 ? "variant" : "variants"}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
