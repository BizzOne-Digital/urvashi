import { brandColors } from "./brand";

export interface DefaultService {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  cardImage?: { url: string; alt?: string };
  icon?: string;
  accentColor?: string;
  ctaText?: string;
  ctaUrl?: string;
  order: number;
  status: "published";
  detail: {
    heroImage?: { url: string; alt?: string };
    heroHeading?: string;
    heroSubheading?: string;
    overview?: string;
    suitableUses?: string[];
    productOptions?: string[];
    customizationOptions?: string[];
    artworkGuidance?: string;
    processSteps?: Array<{ title: string; description: string; image?: { url: string; alt?: string } }>;
    pricingNote?: string;
    minimumOrderNote?: string;
    importantNotes?: string;
    sectionImages?: Array<{ url: string; alt?: string }>;
    faqs?: Array<{ question: string; answer: string }>;
    ctaText?: string;
    ctaUrl?: string;
  };
  seo?: { title?: string; description?: string };
  updatedAt?: string;
}

export const DEFAULT_SERVICES: DefaultService[] = [
  {
    _id: "service-custom-printing",
    title: "Custom printing",
    slug: "custom-printing",
    shortDescription:
      "Your idea. Your style. Printed with purpose — on drinkware, apparel, gifts, promotional items, and more.",
    cardImage: { url: "/home/process/product-lineup.png", alt: "Custom printing at DPM Custom Prints" },
    icon: "print",
    accentColor: brandColors.royalPrintBlue,
    ctaText: "Start your custom order",
    ctaUrl: "/customize",
    order: 0,
    status: "published",
    detail: {
      heroHeading: "Custom printing",
      heroSubheading:
        "Your idea. Your style. Printed with purpose — on drinkware, apparel, gifts, promotional items, and more.",
      heroImage: { url: "/images/hero/slide-products.png", alt: "Custom printing products" },
      overview:
        "Custom printing is our core service at DPM Custom Prints. Whether you need one personalized mug or a bulk run of branded pens, we help you turn artwork and text into high-quality printed products. Share your design, preview where available, and we handle production with care.",
      suitableUses: [
        "Personal gifts & keepsakes",
        "Business branding & promotions",
        "Events & team merchandise",
        "Seasonal & holiday printing",
        "Custom quote projects",
      ],
      productOptions: [
        "Mugs & drinkware",
        "Tumblers & glass tumblers",
        "Keychains & ornaments",
        "Pens & stationery",
        "Desk calendars",
        "Apparel & caps (quote)",
        "Blankets & home items (quote)",
      ],
      customizationOptions: [
        "Custom text & names",
        "Uploaded artwork (PNG, JPEG, PDF)",
        "Colour and font choices",
        "Live preview on select products",
      ],
      artworkGuidance:
        "Upload PNG, JPEG, or PDF artwork where customization is enabled. For best results, use high-resolution files with clear contrast. Email dpmsuppliesinfo@gmail.com if you need help preparing your file.",
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
      pricingNote:
        "Confirmed starting prices are listed on our Pricing page. Apparel, blankets, and bulk specialty items are quoted individually.",
      minimumOrderNote: "Some items have minimum quantities — for example, custom pens start at 5 units.",
      importantNotes:
        "On-screen previews are approximate. Final placement, colour, and sizing may vary slightly from what you see on screen.",
      sectionImages: [
        { url: "/products/sublimation-mug/customized.png", alt: "Custom sublimation mug" },
        { url: "/products/tumblers/customized.png", alt: "Custom tumbler" },
        { url: "/products/sublimation-pens/customized.png", alt: "Custom sublimation pens" },
        { url: "/products/keychains/customized.png", alt: "Custom keychains" },
        { url: "/products/sublimation-ornaments/customized.png", alt: "Custom ornaments" },
        { url: "/products/sublimation-desk-calendar/customized.png", alt: "Custom desk calendar" },
      ],
      faqs: [
        {
          question: "What products can you customize?",
          answer:
            "We print mugs, tumblers, glass tumblers, keychains, pens, ornaments, desk calendars, and more. Browse the Shop for confirmed pricing or contact us for apparel and specialty items.",
        },
        {
          question: "Can I preview my design before ordering?",
          answer:
            "Yes. Use the Customize page to add text, colours, and artwork on supported products before you add to cart or submit a request.",
        },
      ],
      ctaText: "Start your custom order",
      ctaUrl: "/customize",
    },
    seo: {
      title: "Custom printing | DPM Custom Prints",
      description:
        "Custom printing on drinkware, gifts, promotional items, and more. Your idea. Your style. Printed with purpose.",
    },
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

export function getDefaultServiceBySlug(slug: string): DefaultService | null {
  return DEFAULT_SERVICES.find((service) => service.slug === slug) ?? null;
}
