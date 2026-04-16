"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { getApiErrorMessage, productsApi } from "@/lib/api";
import {
  createVariantFormSchema,
  type CreateVariantFormValues,
  updateVariantFormSchema,
  type UpdateVariantFormValues,
} from "@/lib/validations";
import { formatPrice, parsePrice } from "@/lib/products";
import type { ProductVariant } from "@/types";

// ── Shared styles ─────────────────────────────────────────────────────────────
const inputCls =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100";
const labelCls =
  "block text-xs font-semibold uppercase tracking-wider text-slate-500";

const colorOptions = ["Black", "White", "Blue", "Red", "Green", "Gray", "Brown"];
const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];
const materialOptions = ["Cotton", "Polyester", "Leather", "Wool", "Denim", "Linen"];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-rose-600">{message}</p>;
}

// ── Shared variant field set ───────────────────────────────────────────────────
function VariantFields({
  register,
  errors,
}: {
  register: ReturnType<typeof useForm<CreateVariantFormValues>>["register"];
  errors: ReturnType<typeof useForm<CreateVariantFormValues>>["formState"]["errors"];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="space-y-1.5">
        <label className={labelCls}>Color</label>
        <select className={inputCls} {...register("color")}>
          <option value="">Select</option>
          {colorOptions.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <FieldError message={errors.color?.message} />
      </div>

      <div className="space-y-1.5">
        <label className={labelCls}>Size</label>
        <select className={inputCls} {...register("size")}>
          <option value="">Select</option>
          {sizeOptions.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <FieldError message={errors.size?.message} />
      </div>

      <div className="space-y-1.5">
        <label className={labelCls}>Material</label>
        <select className={inputCls} {...register("material")}>
          <option value="">Select</option>
          {materialOptions.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <FieldError message={errors.material?.message} />
      </div>

      <div className="space-y-1.5">
        <label className={labelCls}>Price ($)</label>
        <input
          type="number" min="0" step="0.01" placeholder="29.99"
          className={inputCls}
          {...register("price", { valueAsNumber: true })}
        />
        <FieldError message={errors.price?.message} />
      </div>

      <div className="space-y-1.5">
        <label className={labelCls}>Stock</label>
        <input
          type="number" min="0" step="1" placeholder="10"
          className={inputCls}
          {...register("stock", { valueAsNumber: true })}
        />
        <FieldError message={errors.stock?.message} />
      </div>

      <div className="space-y-1.5">
        <label className={labelCls}>SKU (optional)</label>
        <input
          type="text" placeholder="SHIRT-BLK-M"
          className={inputCls}
          {...register("sku")}
        />
        <FieldError message={errors.sku?.message} />
      </div>
    </div>
  );
}

function EditVariantFields({
  register,
  errors,
  variant,
}: {
  register: ReturnType<typeof useForm<UpdateVariantFormValues>>["register"];
  errors: ReturnType<typeof useForm<UpdateVariantFormValues>>["formState"]["errors"];
  variant: ProductVariant;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="space-y-1.5 sm:col-span-3">
        <label className={labelCls}>Variant</label>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
          {[variant.attributes.color, variant.attributes.size, variant.attributes.material]
            .filter(Boolean)
            .join(" / ") || "Variant"}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelCls}>Price ($)</label>
        <input
          type="number" min="0" step="0.01" placeholder="29.99"
          className={inputCls}
          {...register("price", { valueAsNumber: true })}
        />
        <FieldError message={errors.price?.message} />
      </div>

      <div className="space-y-1.5">
        <label className={labelCls}>Stock</label>
        <input
          type="number" min="0" step="1" placeholder="10"
          className={inputCls}
          {...register("stock", { valueAsNumber: true })}
        />
        <FieldError message={errors.stock?.message} />
      </div>

      <div className="space-y-1.5">
        <label className={labelCls}>SKU (optional)</label>
        <input
          type="text" placeholder="SHIRT-BLK-M"
          className={inputCls}
          {...register("sku")}
        />
        <FieldError message={errors.sku?.message} />
      </div>
    </div>
  );
}

// ── POST /products/:id/variants ────────────────────────────────────────────────
function AddVariantForm({
  productId,
  onAdded,
  onCancel,
}: {
  productId: string;
  onAdded: (v: ProductVariant) => void;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateVariantFormValues>({
    resolver: zodResolver(createVariantFormSchema),
    defaultValues: { color: "", size: "", material: "", price: 0, stock: 0, sku: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const added = await productsApi.addVariant(productId, {
        attributes: { color: values.color, size: values.size, material: values.material },
        price: values.price,
        stock: values.stock,
        sku: values.sku?.trim() || undefined,
      });
      toast.success("Variant added.");
      onAdded(added);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to add variant."));
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4 border-t border-slate-100 bg-slate-50/60 p-5">
      <VariantFields register={register} errors={errors} />
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400"
        >
          <X className="size-4" /> Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          <Plus className="size-4" />
          {isSubmitting ? "Adding…" : "Add variant"}
        </button>
      </div>
    </form>
  );
}

// ── PUT /products/:id/variants/:variantId ──────────────────────────────────────
function EditVariantForm({
  productId,
  variant,
  onSaved,
  onCancel,
}: {
  productId: string;
  variant: ProductVariant;
  onSaved: (updated: ProductVariant) => void;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateVariantFormValues>({
    resolver: zodResolver(updateVariantFormSchema),
    defaultValues: {
      price: parsePrice(variant.price),
      stock: variant.stock,
      sku: variant.sku ?? "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const updated = await productsApi.updateVariant(productId, variant.id, {
        price: values.price,
        stock: values.stock,
        sku: values.sku?.trim() || undefined,
      });
      toast.success("Variant updated.");
      onSaved(updated);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to update variant."));
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <EditVariantFields register={register} errors={errors} variant={variant} />
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400"
        >
          <X className="size-4" /> Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          <Save className="size-4" />
          {isSubmitting ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

// ── Main export — controlled by parent's variants state ────────────────────────
export function VariantManager({
  productId,
  variants,
  onVariantsChange,
  isAuthenticated,
}: {
  productId: string;
  variants: ProductVariant[];
  onVariantsChange: (variants: ProductVariant[]) => void;
  isAuthenticated: boolean;
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // POST — add
  const handleAdded = (variant: ProductVariant) => {
    onVariantsChange([...variants, variant]);
    setShowAddForm(false);
  };

  // PUT — update
  const handleSaved = (updated: ProductVariant) => {
    onVariantsChange(variants.map((v) => (v.id === updated.id ? updated : v)));
    setEditingId(null);
  };

  // DELETE — remove
  const handleDelete = async (variant: ProductVariant) => {
    const label = [
      variant.attributes.color,
      variant.attributes.size,
      variant.attributes.material,
    ]
      .filter(Boolean)
      .join(" / ");

    if (!window.confirm(`Delete variant "${label}"? This cannot be undone.`)) return;

    setDeletingId(variant.id);
    try {
      await productsApi.deleteVariant(productId, variant.id);
      onVariantsChange(variants.filter((v) => v.id !== variant.id));
      toast.success("Variant deleted.");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to delete variant."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-8 rounded-xl border border-slate-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
        <div>
          <span className="inline-block rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-700">
            Inventory
          </span>
          <h2 className="mt-1 text-base font-bold text-slate-950">
            All variants ({variants.length})
          </h2>
        </div>

        {isAuthenticated && !showAddForm && (
          <button
            type="button"
            onClick={() => { setShowAddForm(true); setEditingId(null); }}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-400 hover:text-blue-600"
          >
            <Plus className="size-4" />
            Add variant
          </button>
        )}
      </div>

      {/* Empty state */}
      {variants.length === 0 && !showAddForm ? (
        <div className="px-6 py-10 text-center text-sm text-slate-400">
          No variants yet.{" "}
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
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
                  <th
                    key={h}
                    className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400"
                  >
                    {h}
                  </th>
                ))}
                {isAuthenticated && <th className="px-4 py-3" />}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {variants.map((v) =>
                editingId === v.id ? (
                  <tr key={v.id}>
                    <td colSpan={isAuthenticated ? 7 : 6} className="px-4 py-4">
                      <EditVariantForm
                        productId={productId}
                        variant={v}
                        onSaved={handleSaved}
                        onCancel={() => setEditingId(null)}
                      />
                    </td>
                  </tr>
                ) : (
                  <tr key={v.id} className="group transition hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {v.attributes.color ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {v.attributes.size ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {v.attributes.material ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-blue-600">
                      {formatPrice(parsePrice(v.price))}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                          v.stock === 0
                            ? "bg-rose-100 text-rose-700"
                            : v.stock <= 10
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {v.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">
                      {v.sku || "—"}
                    </td>

                    {isAuthenticated && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1 opacity-0 transition group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => { setEditingId(v.id); setShowAddForm(false); }}
                            className="rounded-full p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === v.id}
                            onClick={() => handleDelete(v)}
                            className="rounded-full p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* POST form — shown below table */}
      {showAddForm && (
        <AddVariantForm
          productId={productId}
          onAdded={handleAdded}
          onCancel={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
}
