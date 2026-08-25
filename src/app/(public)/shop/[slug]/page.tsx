import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { ProductDetailExperience } from "@/components/shop/ProductDetailExperience";
import { getProductBySlug, getPublishedProducts } from "@/lib/public-data";
import { buttonVariants } from "@/components/ui/Button";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = await getPublishedProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.seo?.title || product.name,
    description: product.seo?.description || product.shortDescription,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <>
      <section className="border-b border-chrome-light/40 py-12 lg:py-16">
        <Container>
          <nav className="mb-8 text-sm text-chrome-mid">
            <Link href="/shop" className="hover:text-royal-blue">
              Shop
            </Link>
            <span className="mx-2">/</span>
            <span className="text-ink-black">{product.name}</span>
          </nav>

          <ProductDetailExperience
            product={{
              _id: String(product._id),
              name: product.name,
              slug: product.slug,
              sku: product.sku,
              categorySlug: product.categorySlug,
              shortDescription: product.shortDescription,
              pricingMode: product.pricingMode,
              price: product.price,
              currency: product.currency,
              minQuantity: product.minQuantity,
              quantityStep: product.quantityStep,
              images: product.images,
              blankImage: product.blankImage,
              customizedImage: product.customizedImage,
              allowsBlankPurchase: product.allowsBlankPurchase,
              allowsCustomization: product.allowsCustomization,
              designHelpSurcharge: product.designHelpSurcharge,
              customizer: product.customizer,
            }}
          />
        </Container>
      </section>

      {product.longDescription && (
        <section className="py-16">
          <Container className="max-w-3xl prose-dpm">
            <h2>Details</h2>
            <p>{product.longDescription}</p>
          </Container>
        </section>
      )}

      <section className="border-t border-chrome-light/40 py-12">
        <Container>
          <Link href="/shop" className={buttonVariants("secondary")}>
            ← Back to shop
          </Link>
        </Container>
      </section>
    </>
  );
}
