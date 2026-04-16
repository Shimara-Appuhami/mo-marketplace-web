"use client";

import { useId, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CircleAlert, PackageX, Pencil, ShieldCheck, Trash2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { ProductImage } from "@/components/products/product-image";
import { QuickBuyButton } from "@/components/products/quick-buy-button";
import { VariantManager } from "@/components/products/variant-manager";
import { VariantSelector } from "@/components/products/variant-selector";
import { getApiErrorMessage, productsApi } from "@/lib/api";
import { notifyDelete, notifyError, notifySuccess } from "@/lib/notify";
import {
  formatAttributeLabel,
  formatPrice,
  isProductOutOfStock,
  parsePrice,
} from "@/lib/products";
import { updateProductSchema, type UpdateProductFormValues } from "@/lib/validations";
import type { Product, ProductVariant } from "@/types";

function getInitialAttributes(product: Product) {
  const firstInStock = product.variants.find((variant) => variant.stock > 0);
  return firstInStock?.attributes ?? product.variants[0]?.attributes ?? {};
}

export function ProductDetailView({ product }: { product: Product }) {
  const router = useRouter();
  const imageInputId = useId();
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const { isAuthenticated } = useAuth();
  const [productState, setProductState] = useState(product);
  const [variants, setVariants] = useState(product.variants);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(
    getInitialAttributes(product)
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    clearErrors,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProductFormValues>({
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
      name: product.name,
      description: product.description ?? "",
      imageUrl: product.imageUrl ?? "",
      basePrice: parsePrice(product.basePrice),
      category: product.category,
    },
  });

  const selectedVariant =
    variants.find((variant) =>
      Object.entries(selectedAttributes).every(
        ([key, selectedValue]) => variant.attributes[key] === selectedValue
      )
    ) ?? variants[0] ?? null;

  const outOfStock = isProductOutOfStock({ ...productState, variants });
  const imageValue = watch("imageUrl");

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setValue("imageUrl", String(reader.result ?? ""), {
        shouldDirty: true,
        shouldValidate: true,
      });
      clearErrors("imageUrl");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setValue("imageUrl", "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    clearErrors("imageUrl");
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleSelectAttribute = (attributeKey: string, value: string) => {
    setSelectedAttributes((current) => ({ ...current, [attributeKey]: value }));
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

  const handleStartEdit = () => {
    reset({
      name: productState.name,
      description: productState.description ?? "",
      imageUrl: productState.imageUrl ?? "",
      basePrice: parsePrice(productState.basePrice),
      category: productState.category,
    });
    setIsEditing(true);
  };

  const handleUpdateProduct = handleSubmit(async (values) => {
    try {
      const updatedProduct = await productsApi.update(productState.id, {
        name: values.name,
        description: values.description?.trim() || undefined,
        imageUrl: values.imageUrl?.trim() || undefined,
        basePrice: values.basePrice,
        category: values.category,
      });

      setProductState(updatedProduct);
      setVariants(updatedProduct.variants);
      setIsEditing(false);
      notifySuccess("Product updated", "The product details were saved successfully.");
    } catch (error) {
      notifyError("Unable to update product", getApiErrorMessage(error, "Please try again."));
    }
  });

  const handleDeleteProduct = async () => {
    if (isDeleting) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this product? This action cannot be undone and will remove all variants."
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);
      await productsApi.delete(productState.id);
      notifyDelete("Product deleted", `${productState.name} was removed successfully.`);
      router.push("/products");
      router.refresh();
    } catch (error) {
      notifyError("Unable to delete product", getApiErrorMessage(error, "Please try again."));
      setIsDeleting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 space-y-2">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-slate-700"
        >
          <ArrowLeft className="size-3.5" />
          Back to catalog
        </Link>

        <div>
          {productState.category ? (
            <span className="inline-block rounded bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-700">
              {productState.category}
            </span>
          ) : null}

          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
            {productState.name}
          </h1>

          {productState.description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              {productState.description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div
            className={`relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 ${
              outOfStock ? "opacity-80" : ""
            }`}
          >
            <div className="aspect-[4/3] w-full" />
            <ProductImage
              product={productState}
              className="absolute inset-0 h-full w-full object-cover"
              fallbackClassName="absolute inset-0 flex items-center justify-center opacity-10 select-none text-[200px] font-black uppercase leading-none text-white"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.07),transparent_55%)]" />

            {outOfStock ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <span className="rounded border border-white/50 px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.22em] text-white/90">
                  Out of Stock
                </span>
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Base price", value: formatPrice(parsePrice(productState.basePrice)) },
              { label: "Variants", value: String(variants.length) },
              { label: "Availability", value: outOfStock ? "Out of stock" : "In stock" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {item.label}
                </p>
                <p className="mt-2 text-lg font-bold text-slate-950">{item.value}</p>
              </div>
            ))}
          </div>

          {isAuthenticated ? (
            <div className="rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                <div>
                  <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-600">
                    Manage
                  </span>
                  <h2 className="mt-1 text-base font-bold text-slate-950">Update or delete</h2>
                </div>
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                  >
                    <Pencil className="size-4" />
                    Edit product
                  </button>
                ) : null}
              </div>

              {isEditing ? (
                <form className="space-y-4 p-5" onSubmit={handleUpdateProduct}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Product name
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        {...register("name")}
                      />
                      {errors.name ? (
                        <p className="text-xs text-rose-600">{errors.name.message}</p>
                      ) : null}
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Description
                      </label>
                      <textarea
                        rows={4}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        {...register("description")}
                      />
                      {errors.description ? (
                        <p className="text-xs text-rose-600">{errors.description.message}</p>
                      ) : null}
                    </div>

                    <div className="space-y-3 sm:col-span-2">
                      <div className="flex items-center justify-between gap-3">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Product image
                        </label>
                        {imageValue ? (
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="text-xs font-semibold text-rose-600 transition hover:text-rose-700"
                          >
                            Remove image
                          </button>
                        ) : null}
                      </div>
                      <input
                        id={imageInputId}
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        onChange={handleImageFileChange}
                      />
                      {imageValue ? (
                        <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                          <img
                            src={imageValue}
                            alt="Product preview"
                            className="h-48 w-full object-cover"
                          />
                        </div>
                      ) : null}
                      {errors.imageUrl ? (
                        <p className="text-xs text-rose-600">{errors.imageUrl.message}</p>
                      ) : null}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Base price
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        {...register("basePrice", { valueAsNumber: true })}
                      />
                      {errors.basePrice ? (
                        <p className="text-xs text-rose-600">{errors.basePrice.message}</p>
                      ) : null}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Category
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        {...register("category")}
                      />
                      {errors.category ? (
                        <p className="text-xs text-rose-600">{errors.category.message}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Pencil className="size-4" />
                      {isSubmitting ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3 p-5">
                  <p className="text-sm text-slate-500">
                    Authenticated users can update the core product fields or remove the product.
                  </p>
                  <button
                    type="button"
                    onClick={handleDeleteProduct}
                    disabled={isDeleting}
                    className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 className="size-4" />
                    {isDeleting ? "Deleting..." : "Delete product"}
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-5 py-4">
              <span className="inline-block rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-700">
                Configure
              </span>
              <h2 className="mt-1 text-base font-bold text-slate-950">Select a variant</h2>
            </div>

            <div className="p-5">
              {variants.length ? (
                <VariantSelector
                  variants={variants}
                  selectedAttributes={selectedAttributes}
                  onSelectAttribute={handleSelectAttribute}
                />
              ) : (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  No variants available yet.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-950 bg-slate-950 text-white">
            <div className="flex items-start justify-between gap-4 px-5 pt-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Selected price
                </p>
                <p className="mt-1.5 text-3xl font-black tracking-tight">
                  {selectedVariant
                    ? formatPrice(parsePrice(selectedVariant.price))
                    : formatPrice(parsePrice(productState.basePrice))}
                </p>
              </div>

              {selectedVariant?.stock === 0 ? (
                <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-300">
                  <PackageX className="size-3.5" />
                  Out of stock
                </span>
              ) : (
                <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                  <ShieldCheck className="size-3.5" />
                  Ready
                </span>
              )}
            </div>

            <div className="mx-5 mt-4 grid grid-cols-2 gap-3 rounded-lg bg-white/5 p-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Stock
                </p>
                <p className="mt-1.5 text-sm font-semibold">
                  {selectedVariant ? `${selectedVariant.stock} available` : "-"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  SKU
                </p>
                <p className="mt-1.5 text-sm font-medium text-slate-300">
                  {selectedVariant?.sku ?? "Not assigned"}
                </p>
              </div>
            </div>

            {selectedVariant ? (
              <div className="mx-5 mt-3 flex flex-wrap gap-2">
                {Object.entries(selectedVariant.attributes).map(([key, value]) => (
                  <span
                    key={`${key}-${value}`}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200"
                  >
                    {formatAttributeLabel(key)}: {value}
                  </span>
                ))}
              </div>
            ) : (
              <div className="mx-5 mt-3 flex items-center gap-2 rounded-lg bg-amber-500/15 px-4 py-3 text-sm text-amber-200">
                <CircleAlert className="size-4" />
                Pick a valid combination to continue.
              </div>
            )}

            <div className="p-5">
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

      <VariantManager
        productId={productState.id}
        variants={variants}
        onVariantsChange={setVariants}
        isAuthenticated={isAuthenticated}
      />
    </section>
  );
}
