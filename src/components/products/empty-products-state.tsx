"use client";

import Link from "next/link";
import { PackageSearch, Plus } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";

export function EmptyProductsState() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex min-h-[45vh] items-center justify-center">
      <div className="max-w-md rounded-[2rem] border border-dashed border-slate-300 bg-white px-8 py-10 text-center shadow-sm">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
          <PackageSearch className="size-7" />
        </div>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
          No products yet
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {isAuthenticated
            ? "Start the catalog by creating your first product. Once the backend returns items, they will appear here automatically."
            : "No products are available yet. Sign in if you need to manage the catalog or create the first listing."}
        </p>
        <Link
          href={isAuthenticated ? "/products/create" : "/login?next=/products/create"}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus className="size-4" />
          {isAuthenticated ? "Create product" : "Sign in to create"}
        </Link>
      </div>
    </div>
  );
}
