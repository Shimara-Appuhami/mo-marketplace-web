"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRight,
  ChartNoAxesCombined,
  PackageCheck,
  PackageSearch,
  Sparkles,
  Warehouse,
} from "lucide-react";
import { EmptyProductsState } from "@/components/products/empty-products-state";
import { ProductCard } from "@/components/products/product-card";
import { cn } from "@/lib/utils";
import { parsePrice } from "@/lib/products";
import type { Product } from "@/types";

const sortOptions = [
  { label: "Newest first", value: "newest" },
  { label: "Name A-Z", value: "name-asc" },
  { label: "Price low-high", value: "price-asc" },
  { label: "Price high-low", value: "price-desc" },
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
  if (!product.variants.length) {
    return parsePrice(product.basePrice);
  }

  return Math.min(...product.variants.map((variant) => parsePrice(variant.price)));
}

export function CatalogExperience({ products, initialFilters }: CatalogExperienceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(initialFilters.q ?? "");
  const category = initialFilters.category ?? "all";
  const availability = initialFilters.availability ?? "all";
  const sort = initialFilters.sort ?? "newest";

  useEffect(() => {
    setSearch(initialFilters.q ?? "");
  }, [initialFilters.q]);

  const categories = useMemo(
    () =>
      Array.from(new Set(products.map((product) => product.category).filter(Boolean))).sort(
        (left, right) => left.localeCompare(right)
      ),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const query = initialFilters.q?.trim().toLowerCase() ?? "";

    return [...products]
      .filter((product) => {
        const matchesQuery =
          !query ||
          [product.name, product.description, product.category]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(query));

        const matchesCategory =
          category === "all" ||
          product.category.toLowerCase() === category.toLowerCase();

        const stock = getInventory(product);
        const matchesAvailability =
          availability === "all" ||
          (availability === "in-stock" && stock > 0) ||
          (availability === "low-stock" && stock > 0 && stock <= 10) ||
          (availability === "out-of-stock" && stock <= 0);

        return matchesQuery && matchesCategory && matchesAvailability;
      })
      .sort((left, right) => {
        if (sort === "name-asc") {
          return left.name.localeCompare(right.name);
        }

        if (sort === "price-asc") {
          return getStartingPrice(left) - getStartingPrice(right);
        }

        if (sort === "price-desc") {
          return getStartingPrice(right) - getStartingPrice(left);
        }

        return (
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
        );
      });
  }, [availability, category, initialFilters.q, products, sort]);

  const summary = useMemo(() => {
    const totalInventory = products.reduce((sum, product) => sum + getInventory(product), 0);
    const activeProducts = products.filter((product) => getInventory(product) > 0).length;
    const lowStockProducts = products.filter((product) => {
      const stock = getInventory(product);
      return stock > 0 && stock <= 10;
    }).length;

    return {
      totalInventory,
      activeProducts,
      lowStockProducts,
    };
  }, [products]);

  const updateSearchParams = (nextValues: Record<string, string>) => {
    const params = new URLSearchParams();

    if (initialFilters.q) {
      params.set("q", initialFilters.q);
    }

    if (initialFilters.category) {
      params.set("category", initialFilters.category);
    }

    if (initialFilters.availability) {
      params.set("availability", initialFilters.availability);
    }

    if (initialFilters.sort) {
      params.set("sort", initialFilters.sort);
    }

    Object.entries(nextValues).forEach(([key, value]) => {
      if (!value || value === "all" || (key === "sort" && value === "newest")) {
        params.delete(key);
        return;
      }

      params.set(key, value);
    });

    const queryString = params.toString();

    startTransition(() => {
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    });
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateSearchParams({ q: search.trim() });
  };

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
      <div className="overflow-hidden rounded-2xl border border-white/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(26,36,66,0.96)_50%,rgba(8,145,178,0.78))] text-white shadow-[0_32px_80px_-44px_rgba(8,15,35,0.6)]">
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
          <div className="relative space-y-6">
            <div className="absolute -left-10 top-0 h-28 w-28 rounded-full bg-cyan-300/15 blur-3xl" />
            <span className="relative inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100">
              <Sparkles className="size-3.5" />
              Marketplace Console
            </span>
            <div className="relative space-y-4">
              <h1 className="max-w-3xl font-serif text-4xl leading-tight tracking-tight text-white sm:text-5xl">
                Run a cleaner product catalog with search, stock signals, and faster buying.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
                Browse the marketplace, narrow results instantly, and move from discovery to
                purchase or creation without losing context.
              </p>
            </div>

            <form className="relative flex flex-col gap-3 sm:flex-row" onSubmit={handleSearchSubmit}>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by product, category, or description"
                className="min-h-14 flex-1 rounded-full border border-white/15 bg-white/10 px-5 text-sm text-white outline-none backdrop-blur placeholder:text-slate-300 focus:border-cyan-300/60"
              />
              <button
                type="submit"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-slate-950 transition hover:bg-cyan-50"
              >
                Search catalog
                <ArrowRight className="size-4" />
              </button>
            </form>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-lg border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Products live</p>
              <p className="mt-3 text-3xl font-semibold">{products.length}</p>
              <p className="mt-2 text-sm text-slate-200">Total items currently synced from the API.</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Inventory units</p>
              <p className="mt-3 text-3xl font-semibold">{summary.totalInventory}</p>
              <p className="mt-2 text-sm text-slate-200">Combined stock across all visible variants.</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Low stock watch</p>
              <p className="mt-3 text-3xl font-semibold">{summary.lowStockProducts}</p>
              <p className="mt-2 text-sm text-slate-200">Products that may need replenishment soon.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.55)] backdrop-blur">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">
                  Catalog controls
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                  Refine the list instead of scrolling blind.
                </h2>
              </div>
              <Link
                href="/products/create"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Create product
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Category</span>
                <select
                  value={category}
                  onChange={(event) => updateSearchParams({ category: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400"
                >
                  <option value="all">All categories</option>
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Availability</span>
                <select
                  value={availability}
                  onChange={(event) => updateSearchParams({ availability: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400"
                >
                  <option value="all">All stock levels</option>
                  <option value="in-stock">In stock</option>
                  <option value="low-stock">Low stock</option>
                  <option value="out-of-stock">Out of stock</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Sort by</span>
                <select
                  value={sort}
                  onChange={(event) => updateSearchParams({ sort: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  startTransition(() => {
                    router.replace(pathname, { scroll: false });
                  });
                }}
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
              >
                Reset filters
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-slate-600">
              Showing <span className="font-semibold text-slate-950">{filteredProducts.length}</span>{" "}
              of <span className="font-semibold text-slate-950">{products.length}</span> products
            </p>
            <div
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold",
                isPending ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
              )}
            >
              {isPending ? "Updating view..." : "Live filters ready"}
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="space-y-4">
              {products.length === 0 ? (
                <EmptyProductsState />
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white/80 p-10 text-center shadow-[0_24px_60px_-48px_rgba(15,23,42,0.5)]">
                  <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-cyan-100 text-cyan-800">
                    <PackageSearch className="size-7" />
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
                    No products match these filters.
                  </h3>
                  <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">
                    Try broadening the search term, switching categories, or clearing the stock
                    filter to bring products back into view.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      startTransition(() => {
                        router.replace(pathname, { scroll: false });
                      });
                    }}
                    className="mt-6 inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.55)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">
              Operations snapshot
            </p>
            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-4 rounded-lg bg-slate-50 p-4">
                <div className="flex size-11 items-center justify-center rounded-full bg-cyan-100 text-cyan-800">
                  <PackageCheck className="size-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-950">{summary.activeProducts} active products</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Items with stock available for immediate quick-buy actions.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-lg bg-slate-50 p-4">
                <div className="flex size-11 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                  <Warehouse className="size-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-950">{summary.lowStockProducts} low stock alerts</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Products below the watch threshold of ten total units.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-lg bg-slate-50 p-4">
                <div className="flex size-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                  <ChartNoAxesCombined className="size-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-950">Catalog controls are shareable</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Search, filters, and sorting stay in the URL so teams can share the exact view.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
