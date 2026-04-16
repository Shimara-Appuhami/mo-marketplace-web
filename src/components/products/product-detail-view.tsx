"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CircleAlert,
  PackageX,
  Pencil,
  Save,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { QuickBuyButton } from "@/components/products/quick-buy-button";
import { VariantSelector } from "@/components/products/variant-selector";
import { useAuth } from "@/components/auth/auth-provider";
import {
  formatAttributeLabel,
  formatPrice,
  isProductOutOfStock,
  parsePrice,
} from "@/lib/products";
import { getApiErrorMessage, productsApi } from "@/lib/api";
import type { Product } from "@/types";

// ── shared input class (matches create form) ─────────────────────────────────
const inputCls =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100";

const categoryOptions = ["Apparel", "Clothing", "Electronics", "Accessories", "Footwear"];

// ── Edit modal ────────────────────────────────────────────────────────────────
function EditModal({
  product,
  onClose,
  onSaved,
}: {
  product: Product;
  onClose: () => void;
  onSaved: (updated: Product) => void;
}) {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description ?? "");
  const [basePrice, setBasePrice] = useState(String(product.basePrice));
  const [category, setCategory] = useState(product.category ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Product name is required.");
      return;
    }
    setSaving(true);
    try {
      const updated = await productsApi.update(product.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        basePrice: parseFloat(basePrice) || 0,
        category: category.trim() || undefined,
      });
      toast.success("Product updated.");
      onSaved(updated);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Update failed."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <span className="inline-block rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-700">
              Edit
            </span>
            <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-950">
              Edit product
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 p-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Product name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
              placeholder="Classic T-Shirt"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputCls}
              placeholder="A short description…"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Base price ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className={inputCls}
                placeholder="29.99"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputCls}
              >
                <option value="">Select category</option>
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            <Save className="size-4" />
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete confirm ────────────────────────────────────────────────────────────
function DeleteConfirm({
  productName,
  onClose,
  onConfirm,
  deleting,
}: {
  productName: string;
  onClose: () => void;
  onConfirm: () => void;
  deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl">
        <div className="p-6">
          <div className="flex size-12 items-center justify-center rounded-full bg-rose-100">
            <Trash2 className="size-5 text-rose-600" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-950">Delete product?</h2>
          <p className="mt-2 text-sm text-slate-500">
            <span className="font-semibold text-slate-900">{productName}</span> will be permanently
            removed. This cannot be undone.
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={onConfirm}
            className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
          >
            <Trash2 className="size-4" />
            {deleting ? "Deleting…" : "Yes, delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main detail view ──────────────────────────────────────────────────────────
function getInitialAttributes(product: Product) {
  const firstInStock = product.variants.find((v) => v.stock > 0);
  return firstInStock?.attributes ?? product.variants[0]?.attributes ?? {};
}

export function ProductDetailView({ product: initialProduct }: { product: Product }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(initialProduct);
  const [variants, setVariants] = useState(product.variants);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(
    getInitialAttributes(product)
  );
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const productWithCurrentVariants = useMemo(
    () => ({ ...product, variants }),
    [product, variants]
  );

  const selectedVariant =
    variants.find((v) =>
      Object.entries(selectedAttributes).every(([k, val]) => v.attributes[k] === val)
    ) ??
    variants[0] ??
    null;

  const outOfStock = isProductOutOfStock(productWithCurrentVariants);

  const handleSelectAttribute = (key: string, value: string) =>
    setSelectedAttributes((cur) => ({ ...cur, [key]: value }));

  const handlePurchased = (nextStock: number) => {
    if (!selectedVariant) return;
    setVariants((cur) =>
      cur.map((v) => (v.id === selectedVariant.id ? { ...v, stock: nextStock } : v))
    );
  };

  const handleSaved = (updated: Product) => {
    setProduct(updated);
    setVariants(updated.variants);
    setEditOpen(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await productsApi.delete(product.id);
      toast.success("Product deleted.");
      router.push("/products");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Delete failed."));
      setDeleting(false);
    }
  };

  return (
    <>
      {/* Modals */}
      {editOpen && (
        <EditModal product={product} onClose={() => setEditOpen(false)} onSaved={handleSaved} />
      )}
      {deleteOpen && (
        <DeleteConfirm
          productName={product.name}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}

      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        {/* ── Page header ─────────────────────────────────── */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-slate-700"
            >
              <ArrowLeft className="size-3.5" />
              Back to catalog
            </Link>
            <div>
              {product.category && (
                <span className="inline-block rounded bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-700">
                  {product.category}
                </span>
              )}
              <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
                {product.name}
              </h1>
              {product.description && (
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  {product.description}
                </p>
              )}
            </div>
          </div>

          {/* Edit / Delete — only for authenticated users */}
          {isAuthenticated && (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-400 hover:text-blue-600"
              >
                <Pencil className="size-4" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-rose-400 hover:text-rose-600"
              >
                <Trash2 className="size-4" />
                Delete
              </button>
            </div>
          )}
        </div>

        {/* ── Content grid ────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Left column — image + stats */}
          <div className="space-y-6">
            {/* Product image area */}
            <div
              className={`relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 ${
                outOfStock ? "opacity-80" : ""
              }`}
            >
              <div className="aspect-[4/3] w-full" />

              {/* Decorative letter */}
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <span className="select-none text-[200px] font-black uppercase leading-none text-white">
                  {product.name.charAt(0)}
                </span>
              </div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.07),transparent_55%)]" />

              {outOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="rounded border border-white/50 px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.22em] text-white/90">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* Stat row */}
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  label: "Base price",
                  value: formatPrice(parsePrice(product.basePrice)),
                },
                {
                  label: "Variants",
                  value: `${variants.length}`,
                },
                {
                  label: "Availability",
                  value: outOfStock ? "Out of stock" : "In stock",
                },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-lg font-bold text-slate-950">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right column — variant selector + purchase */}
          <div className="space-y-4">
            {/* Variant selector panel */}
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
                    No variants available for this product yet.
                  </div>
                )}
              </div>
            </div>

            {/* Purchase panel */}
            <div className="rounded-xl border border-slate-950 bg-slate-950 text-white">
              {/* Price row */}
              <div className="flex items-start justify-between gap-4 px-5 pt-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Selected price
                  </p>
                  <p className="mt-1.5 text-3xl font-black tracking-tight">
                    {selectedVariant
                      ? formatPrice(parsePrice(selectedVariant.price))
                      : formatPrice(parsePrice(product.basePrice))}
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

              {/* Stock + SKU */}
              <div className="mx-5 mt-4 grid grid-cols-2 gap-3 rounded-lg bg-white/5 p-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Stock
                  </p>
                  <p className="mt-1.5 text-sm font-semibold">
                    {selectedVariant ? `${selectedVariant.stock} available` : "—"}
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

              {/* Attribute chips */}
              {selectedVariant ? (
                <div className="mx-5 mt-3 flex flex-wrap gap-2">
                  {Object.entries(selectedVariant.attributes).map(([k, v]) => (
                    <span
                      key={`${k}-${v}`}
                      className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200"
                    >
                      {formatAttributeLabel(k)}: {v}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="mx-5 mt-3 flex items-center gap-2 rounded-lg bg-amber-500/15 px-4 py-3 text-sm text-amber-200">
                  <CircleAlert className="size-4" />
                  Pick a valid combination to continue.
                </div>
              )}

              {/* Buy button */}
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
      </section>
    </>
  );
}
