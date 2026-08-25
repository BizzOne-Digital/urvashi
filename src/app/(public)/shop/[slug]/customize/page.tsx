import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/public-data";
import { ProductCustomizeForm } from "@/components/shop/ProductCustomizeForm";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductCustomizePage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || product.status !== "published") notFound();
  if (product.allowsCustomization === false || product.customizer?.enabled === false) notFound();

  return (
    <ProductCustomizeForm
      product={{
        _id: String(product._id),
        name: product.name,
        slug: product.slug,
        price: product.price,
        currency: product.currency,
        minQuantity: product.minQuantity,
        designHelpSurcharge: product.designHelpSurcharge,
        blankImage: product.blankImage,
        customizedImage: product.customizedImage,
        images: product.images,
        customizer: product.customizer,
      }}
    />
  );
}
