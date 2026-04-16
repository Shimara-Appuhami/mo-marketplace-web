"use client";

import { useId, useRef } from "react";
import {
  useFieldArray,
  useForm,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Layers3, Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getApiErrorMessage, productsApi } from "@/lib/api";
import { createProductSchema, type CreateProductFormValues } from "@/lib/validations";

const categoryOptions = ["Apparel", "Clothing", "Electronics", "Accessories", "Footwear"];
const colorOptions = ["Black", "White", "Blue", "Red", "Green", "Gray", "Brown"];
const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];
const materialOptions = ["Cotton", "Polyester", "Leather", "Wool", "Denim", "Linen"];

const defaultSizeRow = { size: "", price: 0, stock: 0, sku: "" };
const defaultVariantGroup = { color: "", material: "", sizes: [defaultSizeRow] };

function buildSkuSeed(parts: string[]) {
  return parts
    .map((p) => p.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "-"))
    .filter(Boolean)
    .join("-")
    .slice(0, 32);
}

// ── Shared input/select className ──────────────────────────────────────────────
const inputCls =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100";

// ── Field label ────────────────────────────────────────────────────────────────
function Label({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
      {children}
    </label>
  );
}

// ── Error message ──────────────────────────────────────────────────────────────
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-rose-600">{message}</p>;
}

// ── Section card ───────────────────────────────────────────────────────────────
function SectionCard({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-6 py-4">
        <span className="inline-block rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-700">
          {label}
        </span>
        <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-950">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ── Variant group ──────────────────────────────────────────────────────────────
type VariantGroupFieldsProps = {
  control: Control<CreateProductFormValues>;
  errors: FieldErrors<CreateProductFormValues>;
  groupIndex: number;
  groupCount: number;
  register: UseFormRegister<CreateProductFormValues>;
  onRemoveGroup: (index: number) => void;
  onGenerateSku: (groupIndex: number, sizeIndex: number) => void;
};

function VariantGroupFields({
  control,
  errors,
  groupIndex,
  groupCount,
  register,
  onRemoveGroup,
  onGenerateSku,
}: VariantGroupFieldsProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `variantGroups.${groupIndex}.sizes`,
  });

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50">
      {/* Group header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <Layers3 className="size-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-900">
            Variant block {groupIndex + 1}
          </span>
          <span className="text-xs text-slate-400">— shared color &amp; material</span>
        </div>
        <button
          type="button"
          onClick={() => onRemoveGroup(groupIndex)}
          disabled={groupCount === 1}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500 transition hover:border-rose-300 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 className="size-3" />
          Remove
        </button>
      </div>

      <div className="space-y-4 p-4">
        {/* Color + Material */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Color</Label>
            <select className={inputCls} {...register(`variantGroups.${groupIndex}.color`)}>
              <option value="">Select color</option>
              {colorOptions.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            <FieldError message={errors.variantGroups?.[groupIndex]?.color?.message} />
          </div>
          <div className="space-y-1.5">
            <Label>Material</Label>
            <select className={inputCls} {...register(`variantGroups.${groupIndex}.material`)}>
              <option value="">Select material</option>
              {materialOptions.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            <FieldError message={errors.variantGroups?.[groupIndex]?.material?.message} />
          </div>
        </div>

        {/* Sizes table */}
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <span className="text-xs font-semibold text-slate-700">
              Sizes ({fields.length})
            </span>
            <button
              type="button"
              onClick={() => append(defaultSizeRow)}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-blue-400 hover:text-blue-600"
            >
              <Plus className="size-3" />
              Add size
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {fields.map((field, sizeIndex) => (
              <div
                key={field.id}
                className="grid items-start gap-3 px-4 py-3 md:grid-cols-[1fr_1fr_0.7fr_1fr_auto]"
              >
                {/* Size */}
                <div className="space-y-1">
                  <Label>Size</Label>
                  <select
                    className={inputCls}
                    {...register(`variantGroups.${groupIndex}.sizes.${sizeIndex}.size`)}
                  >
                    <option value="">Select</option>
                    {sizeOptions.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                  <FieldError
                    message={errors.variantGroups?.[groupIndex]?.sizes?.[sizeIndex]?.size?.message}
                  />
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <Label>Price ($)</Label>
                  <input
                    type="number" min="0" step="0.01" placeholder="34.99"
                    className={inputCls}
                    {...register(`variantGroups.${groupIndex}.sizes.${sizeIndex}.price`, {
                      valueAsNumber: true,
                    })}
                  />
                  <FieldError
                    message={errors.variantGroups?.[groupIndex]?.sizes?.[sizeIndex]?.price?.message}
                  />
                </div>

                {/* Stock */}
                <div className="space-y-1">
                  <Label>Stock</Label>
                  <input
                    type="number" min="0" step="1" placeholder="10"
                    className={inputCls}
                    {...register(`variantGroups.${groupIndex}.sizes.${sizeIndex}.stock`, {
                      valueAsNumber: true,
                    })}
                  />
                  <FieldError
                    message={errors.variantGroups?.[groupIndex]?.sizes?.[sizeIndex]?.stock?.message}
                  />
                </div>

                {/* SKU */}
                <div className="space-y-1">
                  <Label>SKU (optional)</Label>
                  <input
                    type="text" placeholder="SHIRT-BLK-M"
                    className={inputCls}
                    {...register(`variantGroups.${groupIndex}.sizes.${sizeIndex}.sku`)}
                  />
                  <button
                    type="button"
                    onClick={() => onGenerateSku(groupIndex, sizeIndex)}
                    className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700"
                  >
                    Auto-generate
                  </button>
                </div>

                {/* Delete row */}
                <div className="flex items-center pt-6">
                  <button
                    type="button"
                    onClick={() => remove(sizeIndex)}
                    disabled={fields.length === 1}
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 p-2 text-slate-400 transition hover:border-rose-300 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main form ──────────────────────────────────────────────────────────────────
export function CreateProductForm() {
  const router = useRouter();
  const imageInputId = useId();
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const {
    control,
    register,
    handleSubmit,
    setError,
    setValue,
    getValues,
    clearErrors,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      basePrice: 0,
      category: "",
      variantGroups: [defaultVariantGroup],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variantGroups",
  });
  const imageValue = watch("imageUrl");

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("imageUrl", {
        type: "validate",
        message: "Choose an image file.",
      });
      event.target.value = "";
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

  const onGenerateSku = (groupIndex: number, sizeIndex: number) => {
    const values = getValues();
    const group = values.variantGroups[groupIndex];
    const sizeRow = group?.sizes[sizeIndex];
    if (!group || !sizeRow) return;
    const generated = buildSkuSeed([
      values.name || "PRODUCT",
      group.color || "COLOR",
      sizeRow.size || "SIZE",
      group.material || "MATERIAL",
    ]);
    setValue(`variantGroups.${groupIndex}.sizes.${sizeIndex}.sku`, generated, {
      shouldDirty: true,
    });
    toast.success("SKU generated.");
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload = {
        name: values.name,
        description: values.description,
        imageUrl: values.imageUrl?.trim() || undefined,
        basePrice: values.basePrice,
        category: values.category,
        variants: values.variantGroups.flatMap((group) =>
          group.sizes.map((sizeRow) => ({
            attributes: {
              color: group.color,
              size: sizeRow.size,
              material: group.material,
            },
            price: sizeRow.price,
            stock: sizeRow.stock,
            sku: sizeRow.sku?.trim() || undefined,
          }))
        ),
      };

      const product = await productsApi.create(payload);
      toast.success("Product created successfully.");
      router.push(`/products/${product.id}`);
    } catch (error) {
      const status =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "status" in error.response
          ? Number(error.response.status)
          : null;

      if (status === 409) {
        setError("variantGroups", {
          type: "server",
          message: "A duplicate variant combination was rejected by the API.",
        });
        toast.error("Duplicate variant combination. Adjust the conflicting size rows.");
        return;
      }

      toast.error(getApiErrorMessage(error, "Unable to create the product."));
    }
  });

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      {/* ── Product details ── */}
      <SectionCard label="Step 1" title="Product Details">
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Name */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name">Product name</Label>
            <input
              id="name" type="text" placeholder="Classic T-Shirt"
              className={inputCls}
              {...register("name")}
            />
            <FieldError message={errors.name?.message} />
          </div>

          {/* Description */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description" rows={4}
              placeholder="A comfortable cotton t-shirt for everyday wear."
              className={inputCls}
              {...register("description")}
            />
            <FieldError message={errors.description?.message} />
          </div>

          <div className="space-y-3 sm:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor={imageInputId}>Product image</Label>
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
              className={inputCls}
              onChange={handleImageFileChange}
            />
            {imageValue ? (
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageValue}
                  alt="Product preview"
                  className="h-48 w-full object-cover"
                />
              </div>
            ) : null}
            <FieldError message={errors.imageUrl?.message} />
          </div>

          {/* Base price */}
          <div className="space-y-1.5">
            <Label htmlFor="basePrice">Base price ($)</Label>
            <input
              id="basePrice" type="number" min="0" step="0.01" placeholder="29.99"
              className={inputCls}
              {...register("basePrice", { valueAsNumber: true })}
            />
            <FieldError message={errors.basePrice?.message} />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <select id="category" className={inputCls} {...register("category")}>
              <option value="">Select a category</option>
              {categoryOptions.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            <FieldError message={errors.category?.message} />
          </div>
        </div>
      </SectionCard>

      {/* ── Variant builder ── */}
      <SectionCard label="Step 2" title="Variants">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              One block = one colour + material. Add a size row per size inside it.
            </p>
            <button
              type="button"
              onClick={() => append(defaultVariantGroup)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-600"
            >
              <Plus className="size-3.5" />
              Add block
            </button>
          </div>

          {errors.variantGroups && !Array.isArray(errors.variantGroups) && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errors.variantGroups.message}
            </div>
          )}

          <div className="space-y-4">
            {fields.map((field, groupIndex) => (
              <VariantGroupFields
                key={field.id}
                control={control}
                errors={errors}
                groupIndex={groupIndex}
                groupCount={fields.length}
                register={register}
                onRemoveGroup={remove}
                onGenerateSku={onGenerateSku}
              />
            ))}
          </div>
        </div>
      </SectionCard>

      {/* ── Submit bar ── */}
      <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-4">
        <p className="text-xs text-slate-400">
          Duplicate colour + size + material combos are blocked before submission.
        </p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="size-4" />
          {isSubmitting ? "Creating…" : "Create product"}
        </button>
      </div>
    </form>
  );
}
