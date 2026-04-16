"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, Search, SlidersHorizontal, X } from "lucide-react";
import { EmptyProductsState } from "@/components/products/empty-products-state";
import { ProductCard } from "@/components/products/product-card";
import { cn } from "@/lib/utils";
import { parsePrice } from "@/lib/products";
import type { Product } from "@/types";

const sortOptions = [
  { label: "Newest first", value: "newest" },
  { label: "Name A–Z", value: "name-asc" },
  { label: "Price ↑", value: "price-asc" },
  { label: "Price ↓", value: "price-desc" },
];

type CatalogExperienceProps = {
  products: Product[];
  initialFilters: {
    q?: string;
    category?: string;
    availability?: string;
    sort?: string;
  };
};

function getInventory(product: Product) {
  return product.variants.reduce((total, variant) => total + variant.stock, 0);
}

function getStartingPrice(product: Product) {
  if (!product.variants.length) return parsePrice(product.basePrice);
  return Math.min(...product.variants.map((v) => parsePrice(v.price)));
}

export function CatalogExperience({ products, initialFilters }: CatalogExperienceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(initialFilters.q ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = initialFilters.category ?? "all";
  const availability = initialFilters.availability ?? "all";
  const sort = initialFilters.sort ?? "newest";

  useEffect(() => {
    setSearch(initialFilters.q ?? "");
  }, [initialFilters.q]);

  const categories = useMemo(
    () =>
      Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const q = initialFilters.q?.trim().toLowerCase() ?? "";
    return [...products]
      .filter((p) => {
        const matchesQ =
          !q ||
          [p.name, p.description, p.category]
            .filter(Boolean)
            .some((f) => f.toLowerCase().includes(q));
        const matchesCat =
          category === "all" || p.category.toLowerCase() === category.toLowerCase();
        const stock = getInventory(p);
        const matchesAv =
          availability === "all" ||
          (availability === "in-stock" && stock > 0) ||
          (availability === "low-stock" && stock > 0 && stock <= 10) ||
          (availability === "out-of-stock" && stock <= 0);
        return matchesQ && matchesCat && matchesAv;
      })
      .sort((a, b) => {
        if (sort === "name-asc") return a.name.localeCompare(b.name);
        if (sort === "price-asc") return getStartingPrice(a) - getStartingPrice(b);
        if (sort === "price-desc") return getStartingPrice(b) - getStartingPrice(a);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [availability, category, initialFilters.q, products, sort]);

  const updateParams = (next: Record<string, string>) => {
    const params = new URLSearchParams();
    const merged: Record<string, string> = {
      ...(initialFilters.q ? { q: initialFilters.q } : {}),
      ...(initialFilters.category ? { category: initialFilters.category } : {}),
      ...(initialFilters.availability ? { availability: initialFilters.availability } : {}),
      ...(initialFilters.sort ? { sort: initialFilters.sort } : {}),
      ...next,
    };
    Object.entries(merged).forEach(([k, v]) => {
      if (v && v !== "all" && !(k === "sort" && v === "newest")) params.set(k, v);
    });
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateParams({ q: search.trim() });
  };

  const clearAll = () => {
    setSearch("");
    startTransition(() => router.replace(pathname, { scroll: false }));
  };

  const hasActiveFilters =
    !!initialFilters.q || category !== "all" || availability !== "all" || sort !== "newest";

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      {/* ── Page header ─────────────────────────────────────── */}
      <div className="mb-8 space-y-3">
        <span className="inline-block rounded bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-700">
          Curated Collection
        </span>
        <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
          Premium Products.
        </h1>
        <p className="max-w-xl text-sm leading-6 text-slate-500">
          Browse the full catalog, filter by category or stock level, and find exactly what you
          need.
        </p>
      </div>

      {/* ── Category tabs + filter toggle ───────────────────── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex flex-wrap items-center gap-1">
          {/* All Items tab */}
          <button
            type="button"
            onClick={() => updateParams({ category: "all" })}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition",
              category === "all"
                ? "bg-slate-950 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            )}
          >
            All Items
          </button>

          {/* Dynamic category tabs */}
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => updateParams({ category: cat })}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition",
                category === cat
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
            >
              <X className="size-3" />
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition",
              filtersOpen
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-300 text-slate-700 hover:border-slate-500"
            )}
          >
            <SlidersHorizontal className="size-4" />
            Filters
          </button>
          <Link
            href="/products/create"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            + New
          </Link>
        </div>
      </div>

      {/* ── Expanded filter panel ────────────────────────────── */}
      {filtersOpen && (
        <div className="mb-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-[1fr_auto_auto_auto]">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </form>

          {/* Availability */}
          <select
            value={availability}
            onChange={(e) => updateParams({ availability: e.target.value })}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400"
          >
            <option value="all">All stock</option>
            <option value="in-stock">In stock</option>
            <option value="low-stock">Low stock</option>
            <option value="out-of-stock">Out of stock</option>
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value })}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          {/* Apply search */}
          <button
            type="button"
            onClick={() => updateParams({ q: search.trim() })}
            className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Apply
          </button>
        </div>
      )}

      {/* ── Result meta bar ──────────────────────────────────── */}
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-slate-900">{filteredProducts.length}</span> of{" "}
          <span className="font-semibold text-slate-900">{products.length}</span> products
        </p>
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
            isPending ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
          )}
        >
          <LayoutGrid className="size-3" />
          {isPending ? "Loading…" : "Live"}
        </div>
      </div>

      {/* ── Product grid ─────────────────────────────────────── */}
      {filteredProducts.length === 0 ? (
        products.length === 0 ? (
          <EmptyProductsState />
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-14 text-center">
            <p className="text-lg font-semibold text-slate-900">No products match these filters.</p>
            <p className="mt-2 text-sm text-slate-500">
              Try changing the category or clearing the active filters.
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Clear filters
            </button>
          </div>
        )
      ) : (
        <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
