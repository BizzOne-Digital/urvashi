import { ProductCard } from "./ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: Array<{
    _id: string | { toString(): string };
    name: string;
    slug: string;
    shortDescription?: string;
    images?: Array<{ url: string; alt?: string }>;
    pricingMode?: "fixed" | "quote";
    availability?: string;
    price?: number;
    currency?: string;
    featured?: boolean;
    onSale?: boolean;
    categorySlug?: string;
  }>;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export function ProductGrid({
  products,
  emptyTitle = "No products found",
  emptyDescription = "Try adjusting your filters or check back soon.",
  className,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel="View all products"
        actionHref="/shop"
      />
    );
  }

  return (
    <div className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", className)}>
      {products.map((product, index) => (
        <ProductCard key={String(product._id)} product={{ ...product, _id: String(product._id) }} priority={index < 4} />
      ))}
    </div>
  );
}
