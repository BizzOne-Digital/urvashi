import { loadEnvFile } from "./load-env";
import { connectDB } from "../src/lib/db";
import { brandColors } from "../src/lib/brand";
import Service from "../src/models/Service";

loadEnvFile();

const CUSTOM_PRINTING = {
  title: "Custom printing",
  slug: "custom-printing",
  shortDescription:
    "Your idea. Your style. Printed with purpose — on drinkware, apparel, gifts, promotional items, and more.",
  order: 0,
  overview:
    "Custom printing is our core service at DPM Custom Prints. Whether you need one personalized mug or a bulk run of branded pens, we help you turn artwork and text into high-quality printed products.",
  suitableUses: [
    "Personal gifts & keepsakes",
    "Business branding & promotions",
    "Events & team merchandise",
    "Seasonal & holiday printing",
    "Custom quote projects",
  ],
  productOptions: [
    "Drinkware (mugs, tumblers)",
    "Apparel (t-shirts, caps, hoodies)",
    "Gifts & keepsakes",
    "Pens, magnets & key chains",
    "Calendars & seasonal items",
  ],
};

async function main() {
  await connectDB();

  const payload = {
    title: CUSTOM_PRINTING.title,
    slug: CUSTOM_PRINTING.slug,
    shortDescription: CUSTOM_PRINTING.shortDescription,
    cardImage: { url: "/demo/ink-lab.svg", alt: "Custom printing at DPM" },
    icon: "print",
    accentColor: brandColors.royalPrintBlue,
    ctaText: "Start your custom order",
    ctaUrl: "/customize",
    order: CUSTOM_PRINTING.order,
    status: "published" as const,
    detail: {
      heroHeading: "Custom printing",
      heroSubheading: CUSTOM_PRINTING.shortDescription,
      heroImage: { url: "/demo/ink-lab.svg", alt: "Custom printing" },
      overview: CUSTOM_PRINTING.overview,
      suitableUses: CUSTOM_PRINTING.suitableUses,
      productOptions: CUSTOM_PRINTING.productOptions,
      processSteps: [
        {
          title: "Share your idea",
          description: "Tell us what you want printed, add text in the customizer, or upload your artwork.",
          image: { url: "/home/process/design-tablet.png", alt: "Share your custom print idea" },
        },
        {
          title: "Review & confirm",
          description: "We review your request, confirm pricing, placement, and timeline before production.",
          image: { url: "/home/process/heat-press.png", alt: "Review and confirm your order" },
        },
        {
          title: "Print & deliver",
          description: "Once approved, we produce your order and coordinate pickup or Canada Post shipping.",
          image: { url: "/home/process/product-lineup.png", alt: "Print and deliver your custom products" },
        },
      ],
      sectionImages: [
        { url: "/demo/mug-white.svg", alt: "Custom mug printing" },
        { url: "/demo/tumbler.svg", alt: "Custom tumbler printing" },
        { url: "/demo/tshirt.svg", alt: "Custom apparel printing" },
      ],
      ctaText: "Start your custom order",
      ctaUrl: "/customize",
    },
    seo: {
      title: "Custom printing | DPM Custom Prints",
      description: CUSTOM_PRINTING.shortDescription,
    },
  };

  const archived = await Service.updateMany(
    { slug: { $ne: CUSTOM_PRINTING.slug } },
    { $set: { status: "archived" } }
  );

  const existing = await Service.findOne({ slug: CUSTOM_PRINTING.slug });
  if (existing) {
    await Service.updateOne({ slug: CUSTOM_PRINTING.slug }, { $set: payload });
    console.log("Custom printing service updated.");
  } else {
    await Service.create(payload);
    console.log("Custom printing service created.");
  }

  console.log(`Archived ${archived.modifiedCount} other service(s). Only "Custom printing" is published.`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Failed to ensure Custom printing service:", error);
  process.exit(1);
});
