import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { serialize } from "@/lib/serialize";
import { notFound } from "next/navigation";
import { ProductForm } from "../ProductForm";

type Params = { params: Promise<{ id: string }> };

export default async function AdminProductEditPage({ params }: Params) {
  const { id } = await params;

  if (id === "new") {
    return <ProductForm productId="new" />;
  }

  await connectDB();
  const product = await Product.findById(id).lean();
  if (!product) notFound();

  const data = serialize(product);
  return (
    <ProductForm
      productId={id}
      initialData={{
        name: data.name,
        slug: data.slug,
        sku: data.sku,
        shortDescription: data.shortDescription,
        longDescription: data.longDescription,
        pricingMode: data.pricingMode,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        currency: data.currency,
        minQuantity: data.minQuantity,
        quantityStep: data.quantityStep,
        stock: data.stock,
        availability: data.availability,
        status: data.status,
        featured: data.featured,
        onSale: data.onSale,
        tags: (data.tags || []).join(", "),
        seoTitle: data.seo?.title,
        seoDescription: data.seo?.description,
        images: data.images,
        blankImage: data.blankImage,
        customizedImage: data.customizedImage,
        allowsBlankPurchase: data.allowsBlankPurchase,
        allowsCustomization: data.allowsCustomization,
        designHelpSurcharge: data.designHelpSurcharge,
        customizer: data.customizer,
      }}
    />
  );
}
