"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { cn } from "@/lib/utils";

const COLLECTIONS = [
  { id: "", label: "All" },
  { id: "new", label: "New items" },
  { id: "promo", label: "Promotional" },
] as const;

interface ShopCollectionTabsProps {
  currentCollection?: string;
  className?: string;
}

export function ShopCollectionTabs({ currentCollection = "", className }: ShopCollectionTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = currentCollection || "";

  const setCollection = useCallback(
    (collection: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (collection) params.set("collection", collection);
      else params.delete("collection");
      params.delete("page");
      router.push(`/shop?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className={cn("flex flex-wrap gap-2", className)} role="tablist" aria-label="Product collections">
      {COLLECTIONS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id || "all"}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => setCollection(tab.id)}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all",
              isActive
                ? "bg-gradient-to-r from-cyan via-royal-blue to-magenta text-pure-paper shadow-[0_0_20px_rgba(13,151,252,0.35)]"
                : "border border-white/15 bg-white/5 text-chrome-light hover:border-cyan/40 hover:text-pure-paper"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
