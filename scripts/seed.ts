import mongoose from "mongoose";
import { loadEnvFile } from "./load-env";
import { connectDB } from "../src/lib/db";
import { brandColors, siteDefaults } from "../src/lib/brand";
import SiteSettings from "../src/models/SiteSettings";
import ProductCategory from "../src/models/ProductCategory";
import Product from "../src/models/Product";
import Service from "../src/models/Service";
import GalleryCategory from "../src/models/GalleryCategory";
import FAQ from "../src/models/FAQ";
import Testimonial from "../src/models/Testimonial";
import BlogPost from "../src/models/BlogPost";
import Page, { IMediaRef, IPageSection } from "../src/models/Page";

loadEnvFile();

const DEMO_IMAGES = [
  "/demo/mug-white.svg",
  "/demo/tumbler.svg",
  "/demo/keychain.svg",
  "/demo/tshirt.svg",
  "/demo/pen.svg",
  "/demo/calendar.svg",
  "/demo/ornament.svg",
  "/demo/magnet.svg",
  "/demo/ink-lab.svg",
];

function demoImages(primary: string, name: string): IMediaRef[] {
  const urls = [primary, ...DEMO_IMAGES.filter((url) => url !== primary).slice(0, 4)];
  return urls.map((url, index) => ({
    url,
    alt: `${name} demo view ${index + 1}`,
  }));
}

function basicSection(
  key: string,
  type: string,
  order: number,
  heading: string,
  body?: string
): IPageSection {
  return {
    key,
    type,
    enabled: true,
    order,
    heading,
    body,
    images: DEMO_IMAGES.slice(0, 5).map((url, index) => ({
      url,
      alt: `${heading} visual ${index + 1}`,
    })),
  };
}

async function skipBySlug(model: mongoose.Model<any>, slug: string): Promise<boolean> {
  const existing = await model.findOne({ slug }).select("_id").lean();
  return Boolean(existing);
}

async function seedSiteSettings(): Promise<"created" | "skipped"> {
  const existing = await SiteSettings.findOne().select("_id").lean();
  if (existing) {
    console.log("SiteSettings already exists — skipping.");
    return "skipped";
  }

  await SiteSettings.create({
    general: {
      businessName: siteDefaults.businessName,
      shortName: siteDefaults.shortName,
      tagline: siteDefaults.tagline,
      announcement: "",
      announcementEnabled: false,
      logoPath: siteDefaults.logoPath,
      currency: siteDefaults.currency,
      defaultSeoTitle: siteDefaults.headline,
      defaultSeoDescription:
        "Custom printing on drinkware, apparel, gifts, promotional items, and seasonal products.",
    },
    brand: {
      colors: brandColors,
      fonts: ["Inter", "system-ui"],
    },
    contact: {
      email: siteDefaults.email,
      phone: siteDefaults.phone,
      phoneLink: siteDefaults.phoneLink,
      whatsappLink: siteDefaults.whatsappLink,
    },
    social: [
      {
        platform: "Instagram",
        handle: siteDefaults.socialHandle,
        isActive: false,
      },
    ],
    commerce: {
      taxMode: "none",
      shippingModes: [],
      pickupEnabled: false,
      defaultStockBehavior: "track",
      manualInvoiceInstructions:
        "We will send you an invoice with final pricing including shipping and taxes before payment is required.",
      returnNotes: "Contact us for return and exchange details before sending items back.",
    },
    customization: {
      acceptedFileTypes: ["image/png", "image/jpeg", "application/pdf"],
      maxFileSizeMB: 25,
      rightsConfirmationCopy:
        "I confirm that I have the right to use this artwork for printing purposes.",
      previewDisclaimer:
        "Preview only — final placement, colour, and sizing may vary from what is shown on screen.",
      artworkGuidance:
        "Upload high-resolution PNG, JPEG, or PDF artwork. Contact us if you need help preparing your file.",
    },
    booking: {
      methods: [
        "Phone call",
        "WhatsApp consultation",
        "Video call",
        "Design review",
        "Large/custom order",
        "Other",
      ],
      confirmationCopy:
        "Your consultation request has been received. We will contact you to confirm availability — this is not a confirmed appointment.",
    },
    footer: {
      description: siteDefaults.tagline,
      ctaText: "Start your custom order",
      ctaUrl: "/customize",
      copyright: `© ${new Date().getFullYear()} DPM Custom Prints and Ink Supplies`,
    },
    motion: {
      introEnabled: true,
      introOncePerSession: true,
      defaultIntensity: "medium",
    },
  });

  console.log("SiteSettings seeded.");
  return "created";
}

async function seedProductCategories(): Promise<number> {
  const categories = [
    {
      name: "Drinkware",
      slug: "drinkware",
      description: "Mugs, tumblers, and personalized drinkware.",
      order: 1,
    },
    {
      name: "Apparel",
      slug: "apparel",
      description: "T-shirts, caps, hoodies, and wearable custom prints.",
      order: 2,
    },
    {
      name: "Gifts & Keepsakes",
      slug: "gifts-keepsakes",
      description: "Meaningful gifts and keepsake items.",
      order: 3,
    },
    {
      name: "Home & Office",
      slug: "home-office",
      description: "Home décor, office items, and everyday essentials.",
      order: 4,
    },
    {
      name: "Business & Promotional",
      slug: "business-promotional",
      description: "Promotional products for teams, events, and branding.",
      order: 5,
    },
    {
      name: "Seasonal",
      slug: "seasonal",
      description: "Seasonal prints, ornaments, and calendars.",
      order: 6,
    },
  ];

  let created = 0;
  for (const category of categories) {
    if (await skipBySlug(ProductCategory, category.slug)) continue;
    await ProductCategory.create({ ...category, status: "active" });
    created += 1;
  }

  console.log(`Product categories: ${created} created, ${categories.length - created} skipped.`);
  return created;
}

async function getCategoryMap(): Promise<Map<string, mongoose.Types.ObjectId>> {
  const categories = await ProductCategory.find({}, { slug: 1 }).lean();
  return new Map(categories.map((category) => [category.slug, category._id]));
}

async function seedProducts(categoryMap: Map<string, mongoose.Types.ObjectId>): Promise<number> {
  const products = [
    {
      name: "Custom White Mug 11oz",
      slug: "custom-white-mug-11oz",
      sku: "DPM-MUG-11",
      categorySlug: "drinkware",
      price: 14.99,
      primaryImage: "/demo/mug-white.svg",
      featured: true,
      customizer: true,
    },
    {
      name: "Tumbler",
      slug: "tumbler",
      sku: "DPM-TUMB",
      categorySlug: "drinkware",
      price: 19.99,
      primaryImage: "/demo/tumbler.svg",
      featured: true,
    },
    {
      name: "Key Chain",
      slug: "key-chain",
      sku: "DPM-KEY",
      categorySlug: "business-promotional",
      price: 5.99,
      primaryImage: "/demo/keychain.svg",
    },
    {
      name: "T-Shirt Front Only",
      slug: "t-shirt-front-only",
      sku: "DPM-TSH-F",
      categorySlug: "apparel",
      price: 19.99,
      primaryImage: "/demo/tshirt.svg",
      printLocations: [{ id: "front", label: "Front only" }],
      customizer: true,
    },
    {
      name: "T-Shirt Front and Back",
      slug: "t-shirt-front-and-back",
      sku: "DPM-TSH-FB",
      categorySlug: "apparel",
      price: 25.99,
      primaryImage: "/demo/tshirt.svg",
      printLocations: [
        { id: "front", label: "Front" },
        { id: "back", label: "Back" },
      ],
      customizer: true,
    },
    {
      name: "Calendar",
      slug: "calendar",
      sku: "DPM-CAL",
      categorySlug: "seasonal",
      price: 29.99,
      primaryImage: "/demo/calendar.svg",
    },
    {
      name: "Custom Pen",
      slug: "custom-pen",
      sku: "DPM-PEN",
      categorySlug: "business-promotional",
      price: 3.99,
      minQuantity: 5,
      primaryImage: "/demo/pen.svg",
    },
    {
      name: "Round Ornament",
      slug: "round-ornament",
      sku: "DPM-ORN",
      categorySlug: "seasonal",
      price: 5.99,
      primaryImage: "/demo/ornament.svg",
    },
    {
      name: "Magnet",
      slug: "magnet",
      sku: "DPM-MAG",
      categorySlug: "business-promotional",
      price: 9.99,
      primaryImage: "/demo/magnet.svg",
    },
    {
      name: "Blanket Cover",
      slug: "blanket-cover",
      sku: "DPM-BLANKET",
      categorySlug: "home-office",
      quote: true,
      primaryImage: "/demo/ink-lab.svg",
    },
    {
      name: "Couch Pillow Case",
      slug: "couch-pillow-case",
      sku: "DPM-PILLOW",
      categorySlug: "home-office",
      quote: true,
      primaryImage: "/demo/ink-lab.svg",
    },
    {
      name: "Cap",
      slug: "cap",
      sku: "DPM-CAP",
      categorySlug: "apparel",
      quote: true,
      primaryImage: "/demo/tshirt.svg",
    },
    {
      name: "Hoodie",
      slug: "hoodie",
      sku: "DPM-HOODIE",
      categorySlug: "apparel",
      quote: true,
      primaryImage: "/demo/tshirt.svg",
    },
  ];

  let created = 0;
  for (const product of products) {
    if (await skipBySlug(Product, product.slug)) continue;

    const isQuote = Boolean(product.quote);
    await Product.create({
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      categoryId: categoryMap.get(product.categorySlug),
      categorySlug: product.categorySlug,
      tags: [product.categorySlug.replace("-", " ")],
      shortDescription: `Custom printed ${product.name.toLowerCase()} from DPM Custom Prints.`,
      longDescription: `Personalize your ${product.name.toLowerCase()} with artwork, text, or branding. Contact us for help with your design.`,
      pricingMode: isQuote ? "quote" : "fixed",
      price: isQuote ? undefined : product.price,
      currency: "CAD",
      minQuantity: product.minQuantity || 1,
      quantityStep: 1,
      availability: isQuote ? "quote_only" : "in_stock",
      printLocations: product.printLocations || [],
      customizationFields: isQuote
        ? []
        : [
            {
              id: "instructions",
              label: "Design instructions",
              type: "instructions",
              required: false,
            },
            {
              id: "artwork",
              label: "Upload artwork",
              type: "artwork",
              required: false,
            },
          ],
      images: demoImages(product.primaryImage, product.name),
      customizer: {
        enabled: Boolean(product.customizer) && !isQuote,
        previewDisclaimer:
          "Preview only — final placement, colour, and sizing may vary from what is shown on screen.",
      },
      featured: Boolean(product.featured),
      status: "published",
      seo: {
        title: `${product.name} | DPM Custom Prints`,
        description: `Order ${product.name} with custom printing from DPM Custom Prints.`,
      },
    });
    created += 1;
  }

  console.log(`Products: ${created} created, ${products.length - created} skipped.`);
  return created;
}

async function seedServices(): Promise<number> {
  const services = [
    {
      title: "Custom Drinkware Printing",
      slug: "custom-drinkware-printing",
      shortDescription: "Personalized mugs, tumblers, and drinkware for gifts, teams, and events.",
      order: 1,
      overview: "Turn everyday drinkware into branded or personal keepsakes with custom artwork and text.",
      suitableUses: ["Corporate gifts", "Family gifts", "Events", "Team merchandise"],
      productOptions: ["Custom White Mug 11oz", "Tumbler"],
    },
    {
      title: "Custom T-Shirt & Apparel Printing",
      slug: "custom-t-shirt-apparel-printing",
      shortDescription: "Front-only and front-and-back apparel printing for personal and business use.",
      order: 2,
      overview: "Create wearable custom prints with clear front-only or front-and-back options.",
      suitableUses: ["Events", "Teams", "Personal gifts", "Promotional apparel"],
      productOptions: ["T-Shirt Front Only", "T-Shirt Front and Back", "Cap", "Hoodie"],
    },
    {
      title: "Personalized Gifts & Keepsakes",
      slug: "personalized-gifts-keepsakes",
      shortDescription: "Meaningful keepsakes and gift items customized for any occasion.",
      order: 3,
      overview: "From ornaments to home accents, personalize gifts that feel thoughtful and unique.",
      suitableUses: ["Birthdays", "Anniversaries", "Family gifts", "Special occasions"],
      productOptions: ["Round Ornament", "Magnet", "Key Chain", "Couch Pillow Case"],
    },
    {
      title: "Promotional Pens, Magnets & Key Chains",
      slug: "promotional-pens-magnets-key-chains",
      shortDescription: "Small-format promotional products for businesses, events, and giveaways.",
      order: 4,
      overview: "Brand your business with practical promotional items in useful quantities.",
      suitableUses: ["Trade shows", "Client gifts", "Team handouts", "Local promotions"],
      productOptions: ["Custom Pen", "Magnet", "Key Chain"],
      minimumOrderNote: "Custom pens require a minimum order of 5.",
    },
    {
      title: "Seasonal Printing & Calendars",
      slug: "seasonal-printing-calendars",
      shortDescription: "Seasonal keepsakes and custom calendars for personal and business use.",
      order: 5,
      overview: "Celebrate seasons and milestones with ornaments, calendars, and themed print items.",
      suitableUses: ["Holiday gifting", "Family calendars", "Business promotions", "Seasonal campaigns"],
      productOptions: ["Calendar", "Round Ornament"],
    },
    {
      title: "Artwork Setup & Custom Order Support",
      slug: "artwork-setup-custom-order-support",
      shortDescription: "Help preparing artwork and reviewing custom orders before production.",
      order: 6,
      overview: "Need help with file setup or a product without listed pricing? We can review your artwork and provide a quote.",
      suitableUses: ["Custom quotes", "Artwork review", "Large orders", "Special requests"],
      productOptions: ["Blanket Cover", "Couch Pillow Case", "Cap", "Hoodie"],
      pricingNote: "Products without confirmed pricing require contact for a quote.",
    },
  ];

  let created = 0;
  for (const service of services) {
    if (await skipBySlug(Service, service.slug)) continue;

    await Service.create({
      title: service.title,
      slug: service.slug,
      shortDescription: service.shortDescription,
      cardImage: { url: "/demo/ink-lab.svg", alt: `${service.title} demo card image` },
      icon: "print",
      accentColor: brandColors.royalPrintBlue,
      ctaText: "Start your custom order",
      ctaUrl: "/customize",
      order: service.order,
      status: "published",
      detail: {
        heroImage: { url: "/demo/ink-lab.svg", alt: `${service.title} hero image` },
        heroHeading: service.title,
        heroSubheading: service.shortDescription,
        overview: service.overview,
        suitableUses: service.suitableUses,
        productOptions: service.productOptions,
        customizationOptions: ["Custom text", "Uploaded artwork", "Print location where available"],
        artworkGuidance:
          "Upload PNG, JPEG, or PDF artwork. Contact us at dpmsuppliesinfo@gmail.com if you need help preparing your file.",
        processSteps: [
          {
            title: "Share your idea",
            description: "Tell us what you want printed and upload artwork if you have it.",
            image: { url: "/demo/ink-lab.svg", alt: "Share your idea" },
          },
          {
            title: "Review and confirm",
            description: "We review your request and confirm pricing, options, and next steps.",
            image: { url: "/demo/tshirt.svg", alt: "Review and confirm" },
          },
          {
            title: "Print and deliver",
            description: "Once approved, we produce your order and coordinate pickup or shipping details with you.",
            image: { url: "/demo/mug-white.svg", alt: "Print and deliver" },
          },
        ],
        pricingNote: service.pricingNote,
        minimumOrderNote: service.minimumOrderNote,
        importantNotes:
          "Final placement, colour, and sizing may vary from on-screen previews. Contact us before launch to confirm currency and fulfillment details.",
        sectionImages: demoImages("/demo/ink-lab.svg", service.title),
        faqs: service.minimumOrderNote
          ? [
              {
                question: "What is the minimum order for custom pens?",
                answer: "Custom pens require a minimum order of 5 pens at $3.99 each.",
              },
            ]
          : [],
        ctaText: "Contact us",
        ctaUrl: "/contact",
      },
      seo: {
        title: `${service.title} | DPM Custom Prints`,
        description: service.shortDescription,
      },
    });
    created += 1;
  }

  console.log(`Services: ${created} created, ${services.length - created} skipped.`);
  return created;
}

async function seedGalleryCategories(): Promise<number> {
  const categories = [
    {
      name: "Mugs & Drinkware",
      slug: "mugs-drinkware",
      description: "Demo gallery grouping for mugs and drinkware.",
      coverImage: "/demo/mug-white.svg",
      order: 1,
    },
    {
      name: "T-Shirts & Apparel",
      slug: "t-shirts-apparel",
      description: "Demo gallery grouping for apparel samples.",
      coverImage: "/demo/tshirt.svg",
      order: 2,
    },
    {
      name: "Gifts & Keepsakes",
      slug: "gifts-keepsakes",
      description: "Demo gallery grouping for gifts and keepsakes.",
      coverImage: "/demo/ornament.svg",
      order: 3,
    },
    {
      name: "Seasonal",
      slug: "seasonal",
      description: "Demo gallery grouping for seasonal print ideas.",
      coverImage: "/demo/calendar.svg",
      order: 4,
    },
    {
      name: "Business & Promotional",
      slug: "business-promotional",
      description: "Demo gallery grouping for promotional products.",
      coverImage: "/demo/pen.svg",
      order: 5,
    },
    {
      name: "Customer Creations",
      slug: "customer-creations",
      description: "Placeholder gallery category for approved customer work.",
      coverImage: "/demo/ink-lab.svg",
      order: 6,
    },
  ];

  let created = 0;
  for (const category of categories) {
    if (await skipBySlug(GalleryCategory, category.slug)) continue;
    await GalleryCategory.create({ ...category, status: "active" });
    created += 1;
  }

  console.log(`Gallery categories: ${created} created, ${categories.length - created} skipped.`);
  return created;
}

async function seedFaqs(): Promise<number> {
  const faqs = [
    {
      question: "How can I contact DPM Custom Prints?",
      answer:
        "Email dpmsuppliesinfo@gmail.com, call +1 613-970-3046, or message us on WhatsApp at the same number.",
      category: "Ordering",
      order: 1,
    },
    {
      question: "What is the minimum order for custom pens?",
      answer: "Custom pens are priced at $3.99 each with a minimum order of 5 pens.",
      category: "Minimum Quantities",
      order: 2,
    },
    {
      question: "How do I get pricing for blanket covers, pillow cases, caps, or hoodies?",
      answer:
        "Those products do not have confirmed public pricing yet. Please contact us at dpmsuppliesinfo@gmail.com or +1 613-970-3046 for a quote.",
      category: "Pricing",
      order: 3,
    },
    {
      question: "What currency do you use?",
      answer:
        "The site is seeded in CAD based on the supplied Canadian contact number. Confirm currency with us before placing an order.",
      category: "Pricing",
      order: 4,
    },
    {
      question: "Can I upload my own artwork?",
      answer:
        "Yes. You can upload PNG, JPEG, or PDF artwork where customization is enabled. Contact us if you need help preparing your file.",
      category: "Artwork",
      order: 5,
    },
  ];

  let created = 0;
  for (const faq of faqs) {
    const existing = await FAQ.findOne({ question: faq.question }).select("_id").lean();
    if (existing) continue;
    await FAQ.create({ ...faq, status: "published" });
    created += 1;
  }

  console.log(`FAQs: ${created} created, ${faqs.length - created} skipped.`);
  return created;
}

async function seedTestimonials(): Promise<number> {
  await Testimonial.deleteMany({ isDemo: true });

  const testimonials = [
    {
      customerName: "Sarah M.",
      title: "Custom mug order",
      location: "Ottawa, ON",
      testimonial:
        "I ordered custom mugs as gifts for my family and they turned out beautifully. The colours were vibrant, the text was crisp, and DPM walked me through the artwork before printing. I would absolutely order again.",
      rating: 5,
      order: 1,
      featured: true,
    },
    {
      customerName: "James T.",
      title: "Event t-shirts",
      location: "Kanata, ON",
      testimonial:
        "We needed shirts printed for a community event and the whole process felt straightforward. They answered my questions quickly, confirmed the design placement with me, and the final shirts looked exactly how we pictured them.",
      rating: 5,
      order: 2,
      featured: true,
    },
    {
      customerName: "Priya K.",
      title: "Promotional pens",
      location: "Orleans, ON",
      testimonial:
        "I ordered a small batch of personalized pens for my home business. The minimum quantity was explained clearly upfront, the pricing was fair, and the pens arrived looking professional. Great experience from start to finish.",
      rating: 5,
      order: 3,
      featured: true,
    },
  ];

  let created = 0;
  for (const testimonial of testimonials) {
    const existing = await Testimonial.findOne({ customerName: testimonial.customerName })
      .select("_id")
      .lean();
    if (existing) continue;

    await Testimonial.create({
      ...testimonial,
      image: { url: "/demo/mug-white.svg", alt: `${testimonial.customerName} order` },
      isDemo: false,
      status: "published",
    });
    created += 1;
  }

  console.log(`Testimonials: ${created} created, demo placeholders removed.`);
  return created;
}

async function seedBlogPosts(): Promise<number> {
  const posts = [
    {
      title: "Demo Post: Planning a Personalized Gift",
      slug: "demo-planning-a-personalized-gift",
      excerpt: "Demo draft post about choosing a personalized gift product.",
      category: "Gift Ideas",
      tags: ["demo", "gifts"],
      body: "<p>This is a demo draft blog post. Replace it with real content before publishing.</p>",
    },
    {
      title: "Demo Post: Preparing Artwork for Printing",
      slug: "demo-preparing-artwork-for-printing",
      excerpt: "Demo draft post about artwork file basics.",
      category: "Artwork Tips",
      tags: ["demo", "artwork"],
      body: "<p>This is a demo draft blog post about preparing artwork files. Contact us for project-specific guidance.</p>",
    },
    {
      title: "Demo Post: Seasonal Print Ideas",
      slug: "demo-seasonal-print-ideas",
      excerpt: "Demo draft post highlighting seasonal product inspiration.",
      category: "Seasonal Inspiration",
      tags: ["demo", "seasonal"],
      body: "<p>This is a demo draft blog post for seasonal inspiration. Replace with verified content before launch.</p>",
    },
  ];

  let created = 0;
  for (const post of posts) {
    if (await skipBySlug(BlogPost, post.slug)) continue;

    await BlogPost.create({
      ...post,
      coverImage: "/demo/ink-lab.svg",
      authorName: "DPM Custom Prints",
      inlineImages: DEMO_IMAGES.slice(0, 5).map((url, index) => ({
        url,
        alt: `${post.title} inline image ${index + 1}`,
      })),
      status: "draft",
      isDemo: true,
      seo: {
        title: post.title,
        description: post.excerpt,
      },
    });
    created += 1;
  }

  console.log(`Blog posts: ${created} created, ${posts.length - created} skipped.`);
  return created;
}

async function seedPages(): Promise<number> {
  const pages = [
    {
      slug: "home",
      title: "Home",
      sections: [
        basicSection("hero", "hero", 1, siteDefaults.headline, siteDefaults.tagline),
        basicSection("category-rail", "category-rail", 2, "Shop by category"),
        basicSection("process", "process", 3, "From idea to object"),
        basicSection("featured-products", "featured-products", 4, "Featured products"),
        basicSection("services", "services", 5, "What we print"),
        basicSection("gallery-preview", "gallery-preview", 6, "Recent work"),
        basicSection("testimonials-preview", "testimonials-preview", 7, "Customer stories"),
        basicSection("faq-preview", "faq-preview", 8, "Questions answered"),
        basicSection("contact-cta", "contact-cta", 9, "Ready to start?"),
      ],
    },
    {
      slug: "about",
      title: "About",
      sections: [
        basicSection("hero", "hero", 1, "Ideas deserve to become something you can hold."),
        basicSection("story", "story", 2, "About DPM Custom Prints"),
        basicSection("philosophy", "philosophy", 3, "Creative philosophy"),
        basicSection("process", "process", 4, "How we work with you"),
        basicSection("values", "values", 5, "Quality, reliability, innovation, solutions"),
        basicSection("cta", "cta", 6, "Start your next custom project"),
      ],
    },
    {
      slug: "services",
      title: "Services",
      sections: [
        basicSection("hero", "hero", 1, "Custom printing services"),
        basicSection("overview", "overview", 2, "Built around your products and artwork"),
        basicSection("grid", "services-grid", 3, "Explore our services"),
        basicSection("process", "process", 4, "How custom orders work"),
        basicSection("artwork", "artwork-guidance", 5, "Artwork guidance"),
        basicSection("cta", "cta", 6, "Book a consultation"),
      ],
    },
    {
      slug: "shop",
      title: "Shop",
      sections: [
        basicSection("hero", "hero", 1, "Shop custom print products"),
        basicSection("filters", "filters", 2, "Find the right product"),
        basicSection("grid", "product-grid", 3, "Browse the catalogue"),
      ],
    },
    {
      slug: "customize",
      title: "Customize",
      sections: [
        basicSection("hero", "hero", 1, "Start your custom order"),
        basicSection("studio", "customizer", 2, "Personalization studio"),
        basicSection("steps", "steps", 3, "Choose, customize, and confirm"),
      ],
    },
    {
      slug: "pricing",
      title: "Pricing",
      sections: [
        basicSection("hero", "hero", 1, "Clear starting points. Custom possibilities."),
        basicSection("table", "pricing-table", 2, "Confirmed starting prices"),
        basicSection("quote-note", "quote-note", 3, "Need a quote?"),
      ],
    },
    {
      slug: "gallery",
      title: "Gallery",
      sections: [
        basicSection("hero", "hero", 1, "Print portfolio"),
        basicSection("filters", "filters", 2, "Browse by category"),
        basicSection("grid", "gallery-grid", 3, "Featured demo work"),
      ],
    },
    {
      slug: "testimonials",
      title: "Testimonials",
      sections: [
        basicSection("hero", "hero", 1, "Customer stories"),
        basicSection("slider", "testimonial-slider", 2, "Featured reviews"),
        basicSection("wall", "review-wall", 3, "More feedback"),
      ],
    },
    {
      slug: "faqs",
      title: "FAQs",
      sections: [
        basicSection("hero", "hero", 1, "Frequently asked questions"),
        basicSection("accordion", "faq-accordion", 2, "Answers you can trust"),
        basicSection("cta", "cta", 3, "Still have questions?"),
      ],
    },
    {
      slug: "booking",
      title: "Booking",
      sections: [
        basicSection("hero", "hero", 1, "Book a custom print consultation"),
        basicSection("form", "booking-form", 2, "Tell us about your project"),
        basicSection("process", "process", 3, "What happens next"),
      ],
    },
    {
      slug: "contact",
      title: "Contact",
      sections: [
        basicSection("hero", "hero", 1, "Contact DPM Custom Prints"),
        basicSection("details", "contact-details", 2, "Reach us directly"),
        basicSection("form", "contact-form", 3, "Send a message"),
      ],
    },
    {
      slug: "shipping-returns",
      title: "Shipping & Returns",
      sections: [
        basicSection("hero", "hero", 1, "Shipping and returns"),
        basicSection("shipping", "shipping", 2, "Shipping information"),
        basicSection("returns", "returns", 3, "Return policy"),
      ],
    },
    {
      slug: "privacy",
      title: "Privacy Policy",
      sections: [
        basicSection("hero", "hero", 1, "Privacy policy"),
        basicSection("content", "legal-content", 2, "How we handle your information"),
      ],
    },
    {
      slug: "terms",
      title: "Terms of Service",
      sections: [
        basicSection("hero", "hero", 1, "Terms of service"),
        basicSection("content", "legal-content", 2, "Terms and conditions"),
      ],
    },
  ];

  let created = 0;
  for (const page of pages) {
    if (await skipBySlug(Page, page.slug)) continue;

    await Page.create({
      slug: page.slug,
      title: page.title,
      status: "published",
      sections: page.sections,
      seo: {
        title: `${page.title} | DPM Custom Prints`,
        description: `${page.title} page for DPM Custom Prints and Ink Supplies.`,
      },
    });
    created += 1;
  }

  console.log(`Pages: ${created} created, ${pages.length - created} skipped.`);
  return created;
}

async function main() {
  console.log("Starting DPM Custom Prints seed...");
  await connectDB();

  await seedSiteSettings();
  await seedProductCategories();
  const categoryMap = await getCategoryMap();
  await seedProducts(categoryMap);
  await seedServices();
  await seedGalleryCategories();
  await seedFaqs();
  await seedTestimonials();
  await seedBlogPosts();
  await seedPages();

  console.log("Seed complete.");
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (error) => {
  console.error("Seed failed:", error);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore disconnect errors during failure handling
  }
  process.exit(1);
});
