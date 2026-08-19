import Image from "next/image";
import Link from "next/link";
import { getProductPriceDisplay } from "@/lib/pricing";
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
}

export function ProductCard({ product, className, priority = false }: ProductCardProps) {
  const image = product.images?.[0];
  const { display, isQuote } = getProductPriceDisplay(
    product,
    product.currency || "CAD"
  );

  return (
    <article className={cn("card-product flex h-full flex-col", className)}>
      <Link href={`/shop/${product.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-square overflow-hidden bg-chrome-light/20">
          {image ? (
            <Image
              src={image.url}
              alt={image.alt || product.name}
              fill
              className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-chrome-mid">No image</div>
          )}
          {product.featured && (
            <span className="absolute left-3 top-3 rounded-sm bg-royal-blue px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-pure-paper">
              Featured
            </span>
          )}
          {product.onSale && (
            <span className="absolute right-3 top-3 rounded-sm bg-magenta px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-pure-paper">
              Sale
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-4">
          {product.categorySlug && (
            <p className="text-xs font-medium uppercase tracking-wider text-chrome-mid">
              {product.categorySlug.replace(/-/g, " ")}
            </p>
          )}
          <h3 className="mt-1 font-display text-lg font-semibold text-ink-black group-hover:text-royal-blue">
            {product.name}
          </h3>
          {product.shortDescription && (
            <p className="mt-1 line-clamp-2 text-sm text-carbon">{product.shortDescription}</p>
          )}
          <p className={cn("mt-auto pt-3 font-semibold", isQuote ? "text-deep-magenta" : "text-ink-black")}>
            {display}
          </p>
        </div>
      </Link>
    </article>
  );
}
