"use client";

import { useMemo, useState } from "react";
import { Boxes, CircleAlert, PackageX, ShieldCheck } from "lucide-react";
import { QuickBuyButton } from "@/components/products/quick-buy-button";
import { VariantSelector } from "@/components/products/variant-selector";
import {
  formatAttributeLabel,
  formatPrice,
  isProductOutOfStock,
  parsePrice,
} from "@/lib/products";
import type { Product } from "@/types";

function getInitialAttributes(product: Product) {
  const firstInStockVariant = product.variants.find((variant) => variant.stock > 0);
  return firstInStockVariant?.attributes ?? product.variants[0]?.attributes ?? {};
}

export function ProductDetailView({ product }: { product: Product }) {
  const [variants, setVariants] = useState(product.variants);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(
    getInitialAttributes(product)
  );

  const productWithCurrentVariants = useMemo(
    () => ({ ...product, variants }),
    [product, variants]
  );

  const selectedVariant =
    variants.find((variant) =>
      Object.entries(selectedAttributes).every(
        ([key, value]) => variant.attributes[key] === value
      )
    ) ?? variants[0] ?? null;

  const outOfStock = isProductOutOfStock(productWithCurrentVariants);

  const handleSelectAttribute = (attributeKey: string, value: string) => {
    setSelectedAttributes((current) => ({
      ...current,
      [attributeKey]: value,
    }));
  };

  const handlePurchased = (nextStock: number) => {
    if (!selectedVariant) {
      return;
    }

    setVariants((current) =>
      current.map((variant) =>
        variant.id === selectedVariant.id ? { ...variant, stock: nextStock } : variant
      )
    );
  };

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_28px_70px_-45px_rgba(15,23,42,0.38)]">
          <div className="relative flex min-h-[300px] items-end overflow-hidden bg-[linear-gradient(135deg,#dbeafe_0%,#f8fafc_45%,#e2e8f0_100%)] p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_36%)]" />
            <div className="relative space-y-5">
              <span className="inline-flex rounded-full bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-700 backdrop-blur">
                {product.category || "Uncategorized"}
              </span>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  {product.name}
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  {product.description || "No description provided for this product."}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 border-t border-slate-100 p-8 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Base price
              </p>
              <p className="mt-3 text-xl font-semibold text-slate-950">
                {formatPrice(parsePrice(product.basePrice))}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Variants
              </p>
              <p className="mt-3 inline-flex items-center gap-2 text-xl font-semibold text-slate-950">
                <Boxes className="size-5 text-slate-500" />
                {variants.length}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Availability
              </p>
              <p className="mt-3 text-xl font-semibold text-slate-950">
                {outOfStock ? "Out of stock" : "Available"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_28px_70px_-45px_rgba(15,23,42,0.38)] sm:p-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Select a variant
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Choose your configuration
              </h2>
            </div>

            {variants.length ? (
              <VariantSelector
                variants={variants}
                selectedAttributes={selectedAttributes}
                onSelectAttribute={handleSelectAttribute}
              />
            ) : (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                No variants are available for this product yet.
              </div>
            )}

            <div className="space-y-4 rounded-[1.5rem] bg-slate-950 p-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Selected price
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight">
                    {selectedVariant
                      ? formatPrice(parsePrice(selectedVariant.price))
                      : formatPrice(parsePrice(product.basePrice))}
                  </p>
                </div>

                {selectedVariant?.stock === 0 ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-rose-500/20 px-3 py-2 text-xs font-semibold text-rose-100">
                    <PackageX className="size-4" />
                    Out of stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-100">
                    <ShieldCheck className="size-4" />
                    Ready to buy
                  </span>
                )}
              </div>

              <div className="grid gap-3 rounded-[1.25rem] bg-white/5 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Stock</p>
                  <p className="mt-2 text-lg font-semibold">
                    {selectedVariant ? `${selectedVariant.stock} available` : "Unavailable"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">SKU</p>
                  <p className="mt-2 text-sm font-medium text-slate-100">
                    {selectedVariant?.sku ?? "Not assigned"}
                  </p>
                </div>
              </div>

              {selectedVariant ? (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(selectedVariant.attributes).map(([key, value]) => (
                    <span
                      key={`${key}-${value}`}
                      className="rounded-full bg-white/10 px-3 py-2 text-xs font-medium text-slate-100"
                    >
                      {formatAttributeLabel(key)}: {value}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-2xl bg-amber-500/15 px-4 py-3 text-sm text-amber-100">
                  <CircleAlert className="size-4" />
                  Pick a valid combination to continue.
                </div>
              )}

              <QuickBuyButton
                productId={product.id}
                variantId={selectedVariant?.id ?? null}
                disabled={!selectedVariant || selectedVariant.stock <= 0}
                onPurchased={handlePurchased}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
