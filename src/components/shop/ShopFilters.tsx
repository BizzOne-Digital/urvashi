"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { cn } from "@/lib/utils";

interface ShopFiltersProps {
  categories: Array<{ slug: string; name: string }>;
  currentCategory?: string;
  currentSearch?: string;
  currentSort?: string;
  className?: string;
}

export function ShopFilters({ categories, currentCategory, currentSearch, currentSort, className }: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      params.delete("page");
      router.push(`/shop?${params.toString()}`);
    },
    [router, searchParams]
  );

  const fieldClass = "rounded-sm border border-chrome-light bg-pure-paper px-3 py-2 text-sm";

  return (
    <div className={cn("flex min-w-0 flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end", className)}>
      <div className="min-w-0 w-full sm:flex-1 sm:min-w-[12rem]">
        <label htmlFor="shop-search" className="mb-1 block text-xs font-medium uppercase tracking-wider text-chrome-mid">Search</label>
        <input
          id="shop-search"
          type="search"
          defaultValue={currentSearch}
          placeholder="Search products…"
          className={cn(fieldClass, "w-full")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateParams({ search: (e.target as HTMLInputElement).value || undefined });
            }
          }}
        />
      </div>
      <div className="min-w-0 w-full sm:w-auto">
        <label htmlFor="shop-category" className="mb-1 block text-xs font-medium uppercase tracking-wider text-chrome-mid">Category</label>
        <select
          id="shop-category"
          value={currentCategory || ""}
          onChange={(e) => updateParams({ category: e.target.value || undefined })}
          className={cn(fieldClass, "w-full max-w-full sm:w-auto")}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="w-full min-w-0 sm:w-auto">
        <label htmlFor="shop-sort" className="mb-1 block text-xs font-medium uppercase tracking-wider text-chrome-mid">Sort</label>
        <select
          id="shop-sort"
          value={currentSort || "name"}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className={cn(fieldClass, "w-full max-w-full sm:w-auto")}
        >
          <option value="name">Name A–Z</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="newest">Newest</option>
        </select>
      </div>
    </div>
  );
}
