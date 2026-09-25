import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { ProductDetailExperience } from "@/components/shop/ProductDetailExperience";
import { getProductBySlug, getPublishedProducts } from "@/lib/public-data";
import { buttonVariants } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

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
      <section className="border-b border-white/10 bg-[#050508] py-12 lg:py-16">
        <Container>
          <nav className="mb-8 text-sm text-chrome-mid">
            <Link href="/shop" className="hover:text-cyan">
              Shop
            </Link>
            <span className="mx-2">/</span>
            <span className="text-chrome-light">{product.name}</span>
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
        <section className="border-t border-white/10 bg-[#0a0c14] py-16 text-chrome-light">
          <Container className="max-w-3xl">
            <h2 className="heading-section text-pure-paper">Details</h2>
            <div className="card-vibrant mt-6 p-6 sm:p-8 prose-dpm">
              {product.longDescription.split(/\n\n+/).map((paragraph) => (
                <p key={paragraph.slice(0, 32)} className="!text-white leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="border-t border-white/10 bg-[#050508] py-12">
        <Container>
          <Link href="/shop" className={buttonVariants("secondary")}>
            ← Back to shop
          </Link>
        </Container>
      </section>
    </>
  );
}
