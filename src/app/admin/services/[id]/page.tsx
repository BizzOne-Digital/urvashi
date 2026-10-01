import { connectDB } from "@/lib/db";
import Service from "@/models/Service";
import { serialize } from "@/lib/serialize";
import { notFound } from "next/navigation";
import { ServiceForm } from "../ServiceForm";

type Params = { params: Promise<{ id: string }> };

export default async function AdminServiceEditPage({ params }: Params) {
  const { id } = await params;

  if (id === "new") {
    return <ServiceForm serviceId="new" />;
  }

  await connectDB();
  const service = await Service.findById(id).lean();
  if (!service) notFound();

  const data = serialize(service);
  return (
    <ServiceForm
      serviceId={id}
      initialData={{
        title: data.title,
        slug: data.slug,
        shortDescription: data.shortDescription,
        icon: data.icon,
        accentColor: data.accentColor,
        ctaText: data.ctaText,
        ctaUrl: data.ctaUrl,
        order: data.order,
        status: data.status,
        cardImage: data.cardImage,
        heroHeading: data.detail?.heroHeading,
        heroSubheading: data.detail?.heroSubheading,
        overview: data.detail?.overview,
        suitableUses: data.detail?.suitableUses,
        productOptions: data.detail?.productOptions,
        customizationOptions: data.detail?.customizationOptions,
        artworkGuidance: data.detail?.artworkGuidance,
        pricingNote: data.detail?.pricingNote,
        minimumOrderNote: data.detail?.minimumOrderNote,
        importantNotes: data.detail?.importantNotes,
        detailCtaText: data.detail?.ctaText,
        detailCtaUrl: data.detail?.ctaUrl,
        heroImage: data.detail?.heroImage,
        seoTitle: data.seo?.title,
        seoDescription: data.seo?.description,
      }}
    />
  );
}
