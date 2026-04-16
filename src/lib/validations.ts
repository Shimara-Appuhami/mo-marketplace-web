import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(60, "Name must be 60 characters or fewer."),
  email: z.email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Za-z]/, "Password must contain at least one letter.")
    .regex(/\d/, "Password must contain at least one number."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;

// ─── Create product ────────────────────────────────────────────────────────────

const sizeRowSchema = z.object({
  size: z.string().min(1, "Select a size."),
  price: z.number("Enter a valid price.").min(0, "Price must be 0 or more."),
  stock: z
    .number("Enter a valid stock count.")
    .check(z.int("Stock must be a whole number."))
    .min(0, "Stock must be 0 or more."),
  sku: z.string().optional(),
});

const variantGroupSchema = z.object({
  color: z.string().min(1, "Select a colour."),
  material: z.string().min(1, "Select a material."),
  sizes: z.array(sizeRowSchema).min(1, "Add at least one size."),
});

export const createProductSchema = z
  .object({
    name: z.string().trim().min(1, "Product name is required.").max(120, "Name too long."),
    description: z.string().max(2000, "Description too long.").optional(),
    basePrice: z.number("Enter a valid base price.").min(0, "Base price must be 0 or more."),
    category: z.string().min(1, "Select a category."),
    variantGroups: z.array(variantGroupSchema).min(1, "Add at least one variant block."),
  })
  .superRefine((data, ctx) => {
    const seen = new Set<string>();

    data.variantGroups.forEach((group, gi) => {
      group.sizes.forEach((row, si) => {
        const key = [group.color, row.size, group.material].join("||").toLowerCase();

        if (seen.has(key)) {
          ctx.addIssue({
            code: "custom",
            message: `Duplicate combination: ${group.color} / ${row.size} / ${group.material}. Each colour + size + material combo must be unique.`,
            path: ["variantGroups", gi, "sizes", si, "size"],
          });
        } else {
          seen.add(key);
        }
      });
    });
  });

export type CreateProductFormValues = z.infer<typeof createProductSchema>;

