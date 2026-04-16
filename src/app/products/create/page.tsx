import { ProtectedRoute } from "@/components/auth/protected-route";
import { CreateProductForm } from "@/components/products/create-product-form";

export default function CreateProductPage() {
  return (
    <ProtectedRoute title="Verifying access to create products">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6">
        <div className="space-y-1">
          <span className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
            New product
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Create a product
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            Fill in the product details and build your variant combinations. Duplicate
            colour&nbsp;+&nbsp;size&nbsp;+&nbsp;material combos are caught before submission.
          </p>
        </div>

        <CreateProductForm />
      </section>
    </ProtectedRoute>
  );
}
