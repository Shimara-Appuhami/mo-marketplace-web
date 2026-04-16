"use client";

import { useState } from "react";
import type { Product } from "@/types";

type ProductImageProps = {
  product: Product;
  className?: string;
  fallbackClassName?: string;
  sizes?: string;
};

export function ProductImage({
  product,
  className = "",
  fallbackClassName = "",
  sizes,
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);
  const imageUrl = product.imageUrl?.trim() ?? "";
  const showImage = imageUrl.length > 0 && !hasError;

  if (showImage) {
    return (
      <img
        src={imageUrl}
        alt={product.name}
        className={className}
        sizes={sizes}
        loading="lazy"
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <div className={fallbackClassName}>
      <span className="text-inherit">{product.name.charAt(0)}</span>
    </div>
  );
}
