"use client";

import Link from "next/link";
import { getProductPriceRange, isProductOutOfStock } from "@/lib/products";
import type { Product } from "@/types";

function getCardAccent(product: Product) {
  const hues: Record<string, string> = {
    Apparel: "from-slate-700 via-slate-800 to-slate-900",
    Clothing: "from-zinc-700 via-zinc-800 to-zinc-900",
    Electronics: "from-slate-800 via-slate-900 to-slate-950",
    Accessories: "from-neutral-700 via-neutral-800 to-neutral-900",
    Footwear: "from-stone-700 via-stone-800 to-stone-900",
  };
  return hues[product.category] ?? "from-slate-700 via-slate-800 to-slate-900";
}

function isRecentProduct(product: Product) {
  const created = new Date(product.createdAt).getTime();
  const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
  return created > threeDaysAgo;
}

export function ProductCard({ product }: { product: Product }) {
  const outOfStock = isProductOutOfStock(product);
  const isNew = isRecentProduct(product);
  const gradient = getCardAccent(product);

  return (
    <Link href={`/products/${product.id}`} className="group flex flex-col">
      {/* ── Image area ─────────────────────────────────── */}
      <div className={`relative aspect-square overflow-hidden bg-gradient-to-br ${gradient}`}>
        {/* Subtle inner highlight */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.06),transparent_55%)]" />

        {/* Category initial overlay – decorative */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 transition-opacity duration-300 group-hover:opacity-5">
          <span className="text-[120px] font-black uppercase leading-none tracking-tighter text-white">
            {(product.category || product.name).charAt(0)}
          </span>
        </div>

        {/* NEW ARRIVAL badge (top-left) */}
        {isNew && !outOfStock && (
          <span className="absolute left-3 top-3 z-10 rounded bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-800 shadow-sm">
            New Arrival
          </span>
        )}

        {product.variants.length >= 4 && !outOfStock && (
          <span className="absolute right-3 top-3 z-10 rounded bg-orange-500 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm">
            Bestseller
          </span>
        )}

        {outOfStock && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
            <span className="rounded border border-white/50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/90">
              Out of Stock
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-white/0 transition-all duration-300 group-hover:bg-white/5" />
      </div>

      <div className="pt-3">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-sm font-semibold leading-snug text-slate-900 transition-colors group-hover:text-slate-600">
            {product.name}
          </h2>
          {product.variants.length > 0 && (
            <span className="mt-0.5 shrink-0 whitespace-nowrap rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {product.variants.length}&nbsp;{product.variants.length === 1 ? "variant" : "variants"}
            </span>
          )}
        </div>
        <p
          className={`mt-1 text-sm font-semibold ${
            outOfStock ? "text-slate-400" : "text-blue-600"
          }`}
        >
          {getProductPriceRange(product)}
        </p>
      </div>
    </Link>
  );
}
