import { revalidatePath, revalidateTag } from "next/cache";

export const CACHE_TAGS = {
  settings: "site-settings",
  products: "products",
  services: "services",
  pages: "pages",
  gallery: "gallery",
  testimonials: "testimonials",
  faqs: "faqs",
  blog: "blog",
  pricing: "pricing",
} as const;

export function revalidateSettings() {
  revalidateTag(CACHE_TAGS.settings);
  revalidatePath("/", "layout");
  revalidatePath("/contact");
  revalidatePath("/booking");
}

export function revalidateProducts() {
  revalidateTag(CACHE_TAGS.products);
  revalidateTag(CACHE_TAGS.pricing);
  revalidatePath("/shop");
  revalidatePath("/");
}

export function revalidateProduct(slug: string) {
  revalidateProducts();
  revalidatePath(`/shop/${slug}`);
}

export function revalidateServices() {
  revalidateTag(CACHE_TAGS.services);
  revalidatePath("/services");
  revalidatePath("/");
}

export function revalidateService(slug: string) {
  revalidateServices();
  revalidatePath(`/services/${slug}`);
}

export function revalidateGallery() {
  revalidateTag(CACHE_TAGS.gallery);
  revalidatePath("/gallery");
  revalidatePath("/");
}

export function revalidateTestimonials() {
  revalidateTag(CACHE_TAGS.testimonials);
  revalidatePath("/testimonials");
  revalidatePath("/");
}

export function revalidateFaqs() {
  revalidateTag(CACHE_TAGS.faqs);
  revalidatePath("/faqs");
  revalidatePath("/");
}

export function revalidateBlog() {
  revalidateTag(CACHE_TAGS.blog);
  revalidatePath("/blog");
}

export function revalidateBlogPost(slug: string) {
  revalidateBlog();
  revalidatePath(`/blog/${slug}`);
}

export function revalidatePage(slug: string) {
  revalidateTag(CACHE_TAGS.pages);
  const pathMap: Record<string, string> = {
    home: "/",
    about: "/about",
    services: "/services",
    shop: "/shop",
    customize: "/customize",
    gallery: "/gallery",
    testimonials: "/testimonials",
    faqs: "/faqs",
    booking: "/booking",
    contact: "/contact",
    "shipping-returns": "/shipping-returns",
    privacy: "/privacy",
    terms: "/terms",
  };
  const path = pathMap[slug];
  if (path) revalidatePath(path);
}
