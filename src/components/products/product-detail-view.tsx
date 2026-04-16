"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CircleAlert,
  PackageX,
  Pencil,
  Plus,
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
import { getApiErrorMessage, productsApi, type VariantPayload } from "@/lib/api";
import type { Product, ProductVariant } from "@/types";

// ── Shared styles ─────────────────────────────────────────────────────────────
const inputCls =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100";

const categoryOptions = ["Apparel", "Clothing", "Electronics", "Accessories", "Footwear"];
const colorOptions = ["Black", "White", "Blue", "Red", "Green", "Gray", "Brown"];
const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];
const materialOptions = ["Cotton", "Polyester", "Leather", "Wool", "Denim", "Linen"];

// ── Label ─────────────────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{children}</p>
  );
}

// ── Modal shell ───────────────────────────────────────────────────────────────
function Modal({
  title,
  badge,
  onClose,
  children,
  footer,
}: {
  title: string;
  badge: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <span className="inline-block rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-700">
              {badge}
            </span>
            <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-950">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="space-y-4 p-6">{children}</div>
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
          {footer}
        </div>
      </div>
    </div>
  );
}

// ── Edit product modal ────────────────────────────────────────────────────────
function EditProductModal({
  product,
  onClose,
  onSaved,
}: {
  product: Product;
  onClose: () => void;
  onSaved: (p: Product) => void;
}) {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description ?? "");
  const [basePrice, setBasePrice] = useState(String(product.basePrice));
  const [category, setCategory] = useState(product.category ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Product name is required.");
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
    <Modal
      badge="Edit"
      title="Edit product"
      onClose={onClose}
      footer={
        <>
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
        </>
      }
    >
      <div className="space-y-1.5">
        <Label>Product name</Label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
      </div>
      <div className="space-y-1.5">
        <Label>Description</Label>
        <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Base price ($)</Label>
          <input type="number" min="0" step="0.01" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} className={inputCls} />
        </div>
        <div className="space-y-1.5">
          <Label>Category</Label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
            <option value="">Select category</option>
            {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
    </Modal>
  );
}

// ── Variant form (shared by add + edit) ───────────────────────────────────────
function VariantFormFields({
  color, setColor,
  size, setSize,
  material, setMaterial,
  price, setPrice,
  stock, setStock,
  sku, setSku,
}: {
  color: string; setColor: (v: string) => void;
  size: string; setSize: (v: string) => void;
  material: string; setMaterial: (v: string) => void;
  price: string; setPrice: (v: string) => void;
  stock: string; setStock: (v: string) => void;
  sku: string; setSku: (v: string) => void;
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Color</Label>
          <select value={color} onChange={(e) => setColor(e.target.value)} className={inputCls}>
            <option value="">Select</option>
            {colorOptions.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Size</Label>
          <select value={size} onChange={(e) => setSize(e.target.value)} className={inputCls}>
            <option value="">Select</option>
            {sizeOptions.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Material</Label>
          <select value={material} onChange={(e) => setMaterial(e.target.value)} className={inputCls}>
            <option value="">Select</option>
            {materialOptions.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Price ($)</Label>
          <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className={inputCls} placeholder="29.99" />
        </div>
        <div className="space-y-1.5">
          <Label>Stock</Label>
          <input type="number" min="0" step="1" value={stock} onChange={(e) => setStock(e.target.value)} className={inputCls} placeholder="10" />
        </div>
        <div className="space-y-1.5">
          <Label>SKU (optional)</Label>
          <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} className={inputCls} placeholder="SHIRT-BLK-M" />
        </div>
      </div>
    </>
  );
}

// ── Add variant modal ─────────────────────────────────────────────────────────
function AddVariantModal({
  productId,
  onClose,
  onAdded,
}: {
  productId: string;
  onClose: () => void;
  onAdded: (v: ProductVariant) => void;
}) {
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [material, setMaterial] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [sku, setSku] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!color || !size || !material) return toast.error("Color, size and material are required.");
    setSaving(true);
    try {
      const payload: VariantPayload = {
        attributes: { color, size, material },
        price: parseFloat(price) || 0,
        stock: parseInt(stock) || 0,
        sku: sku.trim() || undefined,
      };
      const added = await productsApi.addVariant(productId, payload);
      toast.success("Variant added.");
      onAdded(added);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to add variant."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      badge="New variant"
      title="Add variant"
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400">
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleAdd}
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            <Plus className="size-4" />
            {saving ? "Adding…" : "Add variant"}
          </button>
        </>
      }
    >
      <VariantFormFields
        color={color} setColor={setColor}
        size={size} setSize={setSize}
        material={material} setMaterial={setMaterial}
        price={price} setPrice={setPrice}
        stock={stock} setStock={setStock}
        sku={sku} setSku={setSku}
      />
    </Modal>
  );
}

// ── Edit variant modal ────────────────────────────────────────────────────────
function EditVariantModal({
  productId,
  variant,
  onClose,
  onSaved,
}: {
  productId: string;
  variant: ProductVariant;
  onClose: () => void;
  onSaved: (v: ProductVariant) => void;
}) {
  const [color, setColor] = useState(variant.attributes.color ?? "");
  const [size, setSize] = useState(variant.attributes.size ?? "");
  const [material, setMaterial] = useState(variant.attributes.material ?? "");
  const [price, setPrice] = useState(String(variant.price));
  const [stock, setStock] = useState(String(variant.stock));
  const [sku, setSku] = useState(variant.sku ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await productsApi.updateVariant(productId, variant.id, {
        attributes: { color, size, material },
        price: parseFloat(price) || 0,
        stock: parseInt(stock) || 0,
        sku: sku.trim() || undefined,
      });
      toast.success("Variant updated.");
      onSaved(updated);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to update variant."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      badge="Edit variant"
      title="Edit variant"
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400">
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
        </>
      }
    >
      <VariantFormFields
        color={color} setColor={setColor}
        size={size} setSize={setSize}
        material={material} setMaterial={setMaterial}
        price={price} setPrice={setPrice}
        stock={stock} setStock={setStock}
        sku={sku} setSku={setSku}
      />
    </Modal>
  );
}

// ── Delete confirm ────────────────────────────────────────────────────────────
function DeleteConfirm({
  title,
  description,
  onClose,
  onConfirm,
  deleting,
}: {
  title: string;
  description: string;
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
          <h2 className="mt-4 text-lg font-bold text-slate-950">{title}</h2>
          <p className="mt-2 text-sm text-slate-500">{description}</p>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button type="button" onClick={onClose} disabled={deleting} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400 disabled:opacity-50">
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

// ── Main view ─────────────────────────────────────────────────────────────────
function getInitialAttributes(product: Product) {
  const first = product.variants.find((v) => v.stock > 0);
  return first?.attributes ?? product.variants[0]?.attributes ?? {};
}

type ModalState =
  | { type: "none" }
  | { type: "edit-product" }
  | { type: "delete-product" }
  | { type: "add-variant" }
  | { type: "edit-variant"; variant: ProductVariant }
  | { type: "delete-variant"; variant: ProductVariant };

export function ProductDetailView({ product: initialProduct }: { product: Product }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(initialProduct);
  const [variants, setVariants] = useState(product.variants);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(
    getInitialAttributes(product)
  );
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [deleting, setDeleting] = useState(false);

  const productWithCurrentVariants = useMemo(() => ({ ...product, variants }), [product, variants]);
  const outOfStock = isProductOutOfStock(productWithCurrentVariants);

  const selectedVariant =
    variants.find((v) =>
      Object.entries(selectedAttributes).every(([k, val]) => v.attributes[k] === val)
    ) ?? variants[0] ?? null;

  const handleSelectAttribute = (key: string, value: string) =>
    setSelectedAttributes((cur) => ({ ...cur, [key]: value }));

  const handlePurchased = (nextStock: number) => {
    if (!selectedVariant) return;
    setVariants((cur) =>
      cur.map((v) => (v.id === selectedVariant.id ? { ...v, stock: nextStock } : v))
    );
  };

  const handleProductSaved = (updated: Product) => {
    setProduct(updated);
    setVariants(updated.variants);
    setModal({ type: "none" });
  };

  const handleDeleteProduct = async () => {
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

  const handleVariantAdded = (v: ProductVariant) => {
    setVariants((cur) => [...cur, v]);
    setModal({ type: "none" });
  };

  const handleVariantSaved = (updated: ProductVariant) => {
    setVariants((cur) => cur.map((v) => (v.id === updated.id ? updated : v)));
    setModal({ type: "none" });
  };

  const handleDeleteVariant = async (variant: ProductVariant) => {
    setDeleting(true);
    try {
      await productsApi.deleteVariant(product.id, variant.id);
      setVariants((cur) => cur.filter((v) => v.id !== variant.id));
      toast.success("Variant deleted.");
      setModal({ type: "none" });
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to delete variant."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {/* ── Modals ─────────────────────────────────────────── */}
      {modal.type === "edit-product" && (
        <EditProductModal
          product={product}
          onClose={() => setModal({ type: "none" })}
          onSaved={handleProductSaved}
        />
      )}
      {modal.type === "delete-product" && (
        <DeleteConfirm
          title="Delete product?"
          description={`"${product.name}" and all its variants will be permanently removed. This cannot be undone.`}
          onClose={() => setModal({ type: "none" })}
          onConfirm={handleDeleteProduct}
          deleting={deleting}
        />
      )}
      {modal.type === "add-variant" && (
        <AddVariantModal
          productId={product.id}
          onClose={() => setModal({ type: "none" })}
          onAdded={handleVariantAdded}
        />
      )}
      {modal.type === "edit-variant" && (
        <EditVariantModal
          productId={product.id}
          variant={modal.variant}
          onClose={() => setModal({ type: "none" })}
          onSaved={handleVariantSaved}
        />
      )}
      {modal.type === "delete-variant" && (
        <DeleteConfirm
          title="Delete variant?"
          description={`The ${modal.variant.attributes.color ?? ""} / ${modal.variant.attributes.size ?? ""} / ${modal.variant.attributes.material ?? ""} variant will be removed.`}
          onClose={() => setModal({ type: "none" })}
          onConfirm={() => handleDeleteVariant(modal.variant)}
          deleting={deleting}
        />
      )}

      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        {/* ── Page header ───────────────────────────── */}
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

          {isAuthenticated && (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setModal({ type: "edit-product" })}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-400 hover:text-blue-600"
              >
                <Pencil className="size-4" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => setModal({ type: "delete-product" })}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-rose-400 hover:text-rose-600"
              >
                <Trash2 className="size-4" />
                Delete
              </button>
            </div>
          )}
        </div>

        {/* ── Content grid ──────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Left — image + stats */}
          <div className="space-y-6">
            <div className={`relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 ${outOfStock ? "opacity-80" : ""}`}>
              <div className="aspect-[4/3] w-full" />
              <div className="absolute inset-0 flex items-center justify-center opacity-10 select-none">
                <span className="text-[200px] font-black uppercase leading-none text-white">
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
                { label: "Base price", value: formatPrice(parsePrice(product.basePrice)) },
                { label: "Variants", value: String(variants.length) },
                { label: "Availability", value: outOfStock ? "Out of stock" : "In stock" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</p>
                  <p className="mt-2 text-lg font-bold text-slate-950">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — variant selector + purchase */}
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

            {/* Purchase panel */}
            <div className="rounded-xl border border-slate-950 bg-slate-950 text-white">
              <div className="flex items-start justify-between gap-4 px-5 pt-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Selected price</p>
                  <p className="mt-1.5 text-3xl font-black tracking-tight">
                    {selectedVariant
                      ? formatPrice(parsePrice(selectedVariant.price))
                      : formatPrice(parsePrice(product.basePrice))}
                  </p>
                </div>
                {selectedVariant?.stock === 0 ? (
                  <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-300">
                    <PackageX className="size-3.5" />Out of stock
                  </span>
                ) : (
                  <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                    <ShieldCheck className="size-3.5" />Ready
                  </span>
                )}
              </div>

              <div className="mx-5 mt-4 grid grid-cols-2 gap-3 rounded-lg bg-white/5 p-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Stock</p>
                  <p className="mt-1.5 text-sm font-semibold">{selectedVariant ? `${selectedVariant.stock} available` : "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">SKU</p>
                  <p className="mt-1.5 text-sm font-medium text-slate-300">{selectedVariant?.sku ?? "Not assigned"}</p>
                </div>
              </div>

              {selectedVariant ? (
                <div className="mx-5 mt-3 flex flex-wrap gap-2">
                  {Object.entries(selectedVariant.attributes).map(([k, v]) => (
                    <span key={`${k}-${v}`} className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
                      {formatAttributeLabel(k)}: {v}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="mx-5 mt-3 flex items-center gap-2 rounded-lg bg-amber-500/15 px-4 py-3 text-sm text-amber-200">
                  <CircleAlert className="size-4" />Pick a valid combination to continue.
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

        {/* ── Variants management table ──────────────── */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <span className="inline-block rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-700">
                Inventory
              </span>
              <h2 className="mt-1 text-base font-bold text-slate-950">
                All variants ({variants.length})
              </h2>
            </div>
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => setModal({ type: "add-variant" })}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-400 hover:text-blue-600"
              >
                <Plus className="size-4" />
                Add variant
              </button>
            )}
          </div>

          {variants.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-slate-400">
              No variants yet.{" "}
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => setModal({ type: "add-variant" })}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Add the first one →
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left">
                    {["Color", "Size", "Material", "Price", "Stock", "SKU"].map((h) => (
                      <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {h}
                      </th>
                    ))}
                    {isAuthenticated && <th className="px-4 py-3" />}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {variants.map((v) => (
                    <tr key={v.id} className="group transition hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{v.attributes.color ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-600">{v.attributes.size ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-600">{v.attributes.material ?? "—"}</td>
                      <td className="px-4 py-3 font-semibold text-blue-600">{formatPrice(parsePrice(v.price))}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${v.stock === 0 ? "bg-rose-100 text-rose-700" : v.stock <= 10 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                          {v.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">{v.sku || "—"}</td>
                      {isAuthenticated && (
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1 opacity-0 transition group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => setModal({ type: "edit-variant", variant: v })}
                              className="rounded-full p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Pencil className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setModal({ type: "delete-variant", variant: v })}
                              className="rounded-full p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
