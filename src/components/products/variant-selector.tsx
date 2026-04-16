"use client";

import { cn } from "@/lib/utils";
import { formatAttributeLabel } from "@/lib/products";
import type { ProductVariant } from "@/types";

type VariantSelectorProps = {
  variants: ProductVariant[];
  selectedAttributes: Record<string, string>;
  onSelectAttribute: (attributeKey: string, value: string) => void;
};

export function VariantSelector({
  variants,
  selectedAttributes,
  onSelectAttribute,
}: VariantSelectorProps) {
  const attributeKeys = Array.from(
    new Set(variants.flatMap((variant) => Object.keys(variant.attributes)))
  );

  return (
    <div className="space-y-6">
      {attributeKeys.map((attributeKey) => {
        const values = Array.from(
          new Set(
            variants
              .map((variant) => variant.attributes[attributeKey])
              .filter((value): value is string => Boolean(value))
          )
        );

        return (
          <div key={attributeKey} className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                {formatAttributeLabel(attributeKey)}
              </p>
              <p className="text-xs text-slate-400">
                {selectedAttributes[attributeKey] ?? "Choose an option"}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {values.map((value) => {
                const candidateAttributes = {
                  ...selectedAttributes,
                  [attributeKey]: value,
                };

                const matchingVariants = variants.filter((variant) =>
                  Object.entries(candidateAttributes).every(
                    ([key, selectedValue]) =>
                      !selectedValue || variant.attributes[key] === selectedValue
                  )
                );

                const selectable = matchingVariants.some((variant) => variant.stock > 0);
                const active = selectedAttributes[attributeKey] === value;

                return (
                  <button
                    key={value}
                    type="button"
                    disabled={!selectable}
                    onClick={() => onSelectAttribute(attributeKey, value)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-medium transition",
                      "disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400",
                      active
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:border-slate-500 hover:text-slate-950"
                    )}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
