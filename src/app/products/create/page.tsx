import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { CreateProductForm } from "@/components/products/create-product-form";

export default function CreateProductPage() {
  return (
    <ProtectedRoute title="Verifying access to create products">
      <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        {/* ── Page header ── */}
        <div className="mb-8 space-y-3">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-slate-700"
          >
            <ArrowLeft className="size-3.5" />
            Back to catalog
          </Link>
          <div>
            <span className="inline-block rounded bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-700">
              New Listing
            </span>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
              Create a Product.
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Fill in the product details then build your variant combinations. Duplicate
              colour&nbsp;+&nbsp;size&nbsp;+&nbsp;material combos are caught before submission.
            </p>
          </div>
        </div>

        <CreateProductForm />
      </section>
    </ProtectedRoute>
  );
}
