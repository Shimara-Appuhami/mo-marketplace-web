"use client";

import {
  useFieldArray,
  useForm,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Layers3, Plus, Save, Shirt, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getApiErrorMessage, productsApi } from "@/lib/api";
import { createProductSchema, type CreateProductFormValues } from "@/lib/validations";

const categoryOptions = ["Apparel", "Clothing", "Electronics", "Accessories", "Footwear"];
const colorOptions = ["Black", "White", "Blue", "Red", "Green", "Gray", "Brown"];
const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];
const materialOptions = ["Cotton", "Polyester", "Leather", "Wool", "Denim", "Linen"];

const defaultSizeRow = {
  size: "",
  price: 0,
  stock: 0,
  sku: "",
};

const defaultVariantGroup = {
  color: "",
  material: "",
  sizes: [defaultSizeRow],
};

function buildSkuSeed(parts: string[]) {
  return parts
    .map((part) => part.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "-"))
    .filter(Boolean)
    .join("-")
    .slice(0, 32);
}

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
    <div className="space-y-5 rounded-[2rem] border border-slate-200 bg-slate-50/80 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Layers3 className="size-4 text-slate-500" />
            Color block {groupIndex + 1}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Set the shared color and material once, then add as many sizes as you need.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onRemoveGroup(groupIndex)}
          disabled={groupCount === 1}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:border-rose-400 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="size-4" />
          Remove block
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Color</label>
          <select
            className="w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            {...register(`variantGroups.${groupIndex}.color`)}
          >
            <option value="">Select color</option>
            {colorOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.variantGroups?.[groupIndex]?.color ? (
            <p className="text-sm text-rose-600">
              {errors.variantGroups[groupIndex]?.color?.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Material</label>
          <select
            className="w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            {...register(`variantGroups.${groupIndex}.material`)}
          >
            <option value="">Select material</option>
            {materialOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.variantGroups?.[groupIndex]?.material ? (
            <p className="text-sm text-rose-600">
              {errors.variantGroups[groupIndex]?.material?.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Sizes in this block</p>
            <p className="text-xs text-slate-500">
              Example: one black cotton shirt with sizes S, M, and L.
            </p>
          </div>
          <button
            type="button"
            onClick={() => append(defaultSizeRow)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-950 hover:text-slate-950"
          >
            <Plus className="size-4" />
            Add size
          </button>
        </div>

        <div className="space-y-4">
          {fields.map((field, sizeIndex) => (
            <div
              key={field.id}
              className="grid gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 md:grid-cols-[0.95fr_1fr_0.8fr_1fr_auto]"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Size</label>
                <select
                  className="w-full rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  {...register(`variantGroups.${groupIndex}.sizes.${sizeIndex}.size`)}
                >
                  <option value="">Select size</option>
                  {sizeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.variantGroups?.[groupIndex]?.sizes?.[sizeIndex]?.size ? (
                  <p className="text-sm text-rose-600">
                    {errors.variantGroups[groupIndex]?.sizes?.[sizeIndex]?.size?.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="34.99"
                  className="w-full rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  {...register(`variantGroups.${groupIndex}.sizes.${sizeIndex}.price`, {
                    valueAsNumber: true,
                  })}
                />
                {errors.variantGroups?.[groupIndex]?.sizes?.[sizeIndex]?.price ? (
                  <p className="text-sm text-rose-600">
                    {errors.variantGroups[groupIndex]?.sizes?.[sizeIndex]?.price?.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Stock</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="10"
                  className="w-full rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  {...register(`variantGroups.${groupIndex}.sizes.${sizeIndex}.stock`, {
                    valueAsNumber: true,
                  })}
                />
                {errors.variantGroups?.[groupIndex]?.sizes?.[sizeIndex]?.stock ? (
                  <p className="text-sm text-rose-600">
                    {errors.variantGroups[groupIndex]?.sizes?.[sizeIndex]?.stock?.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">SKU (optional)</label>
                <input
                  type="text"
                  placeholder="TSHIRT-BLK-M-COT"
                  className="w-full rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  {...register(`variantGroups.${groupIndex}.sizes.${sizeIndex}.sku`)}
                />
                <button
                  type="button"
                  onClick={() => onGenerateSku(groupIndex, sizeIndex)}
                  className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700 hover:text-teal-800"
                >
                  Generate SKU
                </button>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => remove(sizeIndex)}
                  disabled={fields.length === 1}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-3 text-sm font-medium text-slate-600 hover:border-rose-400 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CreateProductForm() {
  const router = useRouter();
  const {
    control,
    register,
    handleSubmit,
    setError,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: "",
      description: "",
      basePrice: 0,
      category: "",
      variantGroups: [defaultVariantGroup],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variantGroups",
  });

  const onGenerateSku = (groupIndex: number, sizeIndex: number) => {
    const values = getValues();
    const group = values.variantGroups[groupIndex];
    const sizeRow = group?.sizes[sizeIndex];

    if (!group || !sizeRow) {
      return;
    }

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
    <form className="space-y-8" onSubmit={onSubmit}>
      <div className="grid gap-6 rounded-xl border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.55)] sm:grid-cols-2 sm:p-8">
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="name">
              Product name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Classic T-Shirt"
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              {...register("name")}
            />
            {errors.name ? <p className="text-sm text-rose-600">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              rows={5}
              placeholder="A comfortable cotton t-shirt for everyday wear."
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              {...register("description")}
            />
            {errors.description ? (
              <p className="text-sm text-rose-600">{errors.description.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="basePrice">
              Base price
            </label>
            <input
              id="basePrice"
              type="number"
              min="0"
              step="0.01"
              placeholder="29.99"
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              {...register("basePrice", { valueAsNumber: true })}
            />
            {errors.basePrice ? (
              <p className="text-sm text-rose-600">{errors.basePrice.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              {...register("category")}
            >
              <option value="">Select a category</option>
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.category ? (
              <p className="text-sm text-rose-600">{errors.category.message}</p>
            ) : null}
          </div>
      </div>

      <div className="space-y-5 rounded-xl border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.55)] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
                Variant builder
              </p>
              <h2 className="mt-2 inline-flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-950">
                <Shirt className="size-6 text-slate-500" />
                Build real product options
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Create one block per color and material, then add multiple sizes beneath it.
              </p>
            </div>
            <button
              type="button"
              onClick={() => append(defaultVariantGroup)}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-950 hover:text-slate-950"
            >
              <Plus className="size-4" />
              Add color block
            </button>
          </div>

          {errors.variantGroups && !Array.isArray(errors.variantGroups) ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errors.variantGroups.message}
            </div>
          ) : null}

          <div className="space-y-5">
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

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              <Save className="size-4" />
              {isSubmitting ? "Creating product..." : "Create product"}
            </button>
          </div>
      </div>
    </form>
  );
}
