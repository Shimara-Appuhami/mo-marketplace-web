import type { Product } from "@/types";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export function parsePrice(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatPrice(value: number) {
  return currencyFormatter.format(value);
}

export function getProductPriceRange(product: Product) {
  const prices = product.variants.length
    ? product.variants.map((variant) => parsePrice(variant.price))
    : [parsePrice(product.basePrice)];

  const min = Math.min(...prices);
  const max = Math.max(...prices);

  if (min === max) {
    return formatPrice(min);
  }

  return `${formatPrice(min)} - ${formatPrice(max)}`;
}

export function isProductOutOfStock(product: Product) {
  if (!product.variants.length) {
    return false;
  }

  return product.variants.every((variant) => variant.stock <= 0);
}
