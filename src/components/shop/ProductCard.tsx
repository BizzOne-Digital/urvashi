import Link from "next/link";
import { getProductPriceDisplay } from "@/lib/pricing";
import { DpmProductImage } from "@/components/ui/DpmProductImage";
import { cn } from "@/lib/utils";

interface ProductCardProduct {
  _id: string;
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
}

interface ProductCardProps {
  product: ProductCardProduct;
  className?: string;
  priority?: boolean;
  showDpmMark?: boolean;
}

export function ProductCard({ product, className, priority = false, showDpmMark = true }: ProductCardProps) {
  const image = product.images?.[0];
  const { display, isQuote } = getProductPriceDisplay(product, product.currency || "CAD");

  return (
    <article className={cn("card-product group flex h-full flex-col", className)} data-reveal-item>
      <Link href={`/shop/${product.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-chrome-light/30 via-pure-paper to-chrome-light/20">
          {image ? (
            <DpmProductImage
              src={image.url}
              alt={image.alt || product.name}
              fill
              showDpmMark={showDpmMark}
              centeredMark
              markSize="lg"
              imageClassName="object-contain p-6 transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-chrome-mid">No image</div>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-royal-blue/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          {product.featured && (
            <span className="absolute left-3 top-3 rounded-sm bg-gradient-to-r from-royal-blue to-cyan px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-pure-paper shadow-lg">
              Featured
            </span>
          )}
          {product.onSale && (
            <span className="absolute right-3 top-3 rounded-sm bg-gradient-to-r from-magenta to-deep-magenta px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-pure-paper shadow-lg">
              Sale
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-4">
          {product.categorySlug && (
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan">
              {product.categorySlug.replace(/-/g, " ")}
            </p>
          )}
          <h3 className="mt-1 font-display text-lg font-semibold text-ink-black transition-colors group-hover:text-royal-blue">
            {product.name}
          </h3>
          {product.shortDescription && (
            <p className="mt-1 line-clamp-2 text-sm text-carbon">{product.shortDescription}</p>
          )}
          <p className={cn("mt-auto pt-3 text-lg font-bold", isQuote ? "text-deep-magenta" : "text-royal-blue")}>
            {display}
          </p>
        </div>
      </Link>
    </article>
  );
}
