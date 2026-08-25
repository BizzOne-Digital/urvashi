import { unstable_cache } from "next/cache";
import { connectDB } from "./db";
import { CACHE_TAGS } from "./revalidation";
import Product, { IProduct } from "@/models/Product";
import ProductCategory from "@/models/ProductCategory";
import Service, { IService } from "@/models/Service";
import Testimonial from "@/models/Testimonial";
import FAQ from "@/models/FAQ";
import BlogPost from "@/models/BlogPost";
import MediaAsset from "@/models/MediaAsset";
import GalleryCategory from "@/models/GalleryCategory";
import PricingRule from "@/models/PricingRule";
import Page from "@/models/Page";

export const DEMO_IMAGES = [
  "/demo/mug-white.svg",
  "/demo/tumbler.svg",
  "/demo/keychain.svg",
  "/demo/tshirt.svg",
  "/demo/pen.svg",
  "/demo/calendar.svg",
  "/demo/ornament.svg",
  "/demo/magnet.svg",
  "/demo/ink-lab.svg",
] as const;

export function toPlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    await connectDB();
    return await fn();
  } catch (error) {
    console.error("[public-data] Database query failed:", error);
    return fallback;
  }
}

async function withDb<T>(fn: () => Promise<T>): Promise<T> {
  await connectDB();
  return fn();
}

export type PlainProduct = ReturnType<typeof toPlain<IProduct>>;
export type PlainService = ReturnType<typeof toPlain<IService>>;

export async function getFeaturedProducts(limit = 8) {
  return withDb(async () => {
    let products = await Product.find({ status: "published", featured: true })
      .sort({ name: 1 })
      .limit(limit)
      .lean();

    if (products.length === 0) {
      products = await Product.find({ status: "published" }).sort({ name: 1 }).limit(limit).lean();
    }

    return toPlain(products);
  });
}

export async function getPublishedProducts() {
  return withDb(async () => {
    const products = await Product.find({ status: "published" }).sort({ name: 1 }).lean();
    return toPlain(products);
  });
}

export async function getShopProducts(params: {
  search?: string;
  category?: string;
  page?: number;
  perPage?: number;
  sort?: string;
}) {
  const { search, category, page = 1, perPage = 12, sort = "name" } = params;

  return withDb(async () => {
    const filter: Record<string, unknown> = { status: "published" };
    if (category) filter.categorySlug = category;
    if (search?.trim()) {
      filter.$text = { $search: search.trim() };
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      name: { name: 1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      newest: { createdAt: -1 },
    };

    const query = Product.find(filter);
    if (search?.trim()) {
      query.select({ score: { $meta: "textScore" } });
    }

    const total = await Product.countDocuments(filter);
    const products = await query
      .sort(sortMap[sort] || sortMap.name)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean();

    return { products: toPlain(products), total, page, perPage, totalPages: Math.ceil(total / perPage) };
  });
}

export async function getProductBySlug(slug: string) {
  return withDb(async () => {
    const product = await Product.findOne({ slug, status: "published" }).lean();
    return product ? toPlain(product) : null;
  });
}

export const getProductCategories = unstable_cache(
  async () =>
    safeQuery(async () => {
      const categories = await ProductCategory.find({ status: "active" }).sort({ order: 1 }).lean();
      return toPlain(categories);
    }, []),
  ["product-categories"],
  { tags: [CACHE_TAGS.products], revalidate: 60 }
);

export const getPublishedServices = unstable_cache(
  async () =>
    safeQuery(async () => {
      const services = await Service.find({ status: "published" }).sort({ order: 1 }).lean();
      return toPlain(services);
    }, []),
  ["published-services"],
  { tags: [CACHE_TAGS.services], revalidate: 60 }
);

export async function getServiceBySlug(slug: string) {
  return safeQuery(async () => {
    const service = await Service.findOne({ slug, status: "published" }).lean();
    return service ? toPlain(service) : null;
  }, null);
}

export const getPublishedTestimonials = unstable_cache(
  async (featuredOnly = false) =>
    safeQuery(async () => {
      const filter: Record<string, unknown> = { status: "published", isDemo: { $ne: true } };
      if (featuredOnly) filter.featured = true;
      const testimonials = await Testimonial.find(filter).sort({ order: 1 }).lean();
      return toPlain(testimonials);
    }, []),
  ["testimonials"],
  { tags: [CACHE_TAGS.testimonials], revalidate: 60 }
);

export const getPublishedFaqs = unstable_cache(
  async () =>
    safeQuery(async () => {
      const faqs = await FAQ.find({ status: "published" }).sort({ order: 1 }).lean();
      return toPlain(faqs);
    }, []),
  ["faqs"],
  { tags: [CACHE_TAGS.faqs], revalidate: 60 }
);

export const getPublishedBlogPosts = unstable_cache(
  async () =>
    safeQuery(async () => {
      const posts = await BlogPost.find({ status: "published" })
        .sort({ publishedAt: -1, createdAt: -1 })
        .lean();
      return toPlain(posts);
    }, []),
  ["blog-posts"],
  { tags: [CACHE_TAGS.blog], revalidate: 60 }
);

export async function getBlogPostBySlug(slug: string) {
  return safeQuery(async () => {
    const post = await BlogPost.findOne({ slug, status: "published" }).lean();
    return post ? toPlain(post) : null;
  }, null);
}

export const getGalleryItems = unstable_cache(
  async () =>
    safeQuery(async () => {
      const assets = await MediaAsset.find({ isPublished: true, isPrivate: false })
        .sort({ order: 1, createdAt: -1 })
        .lean();

      if (assets.length > 0) return toPlain(assets);

      const products = await Product.find({ status: "published" })
        .select("name slug images categorySlug")
        .lean();

      const fallback = products.flatMap((p) =>
        (p.images || []).map((img, i) => ({
          _id: `${p._id}-${i}`,
          originalName: p.name,
          publicUrl: img.url,
          alt: img.alt || p.name,
          caption: img.caption,
          category: p.categorySlug,
          isFeatured: i === 0,
          order: i,
        }))
      );

      return toPlain(fallback);
    }, []),
  ["gallery-items"],
  { tags: [CACHE_TAGS.gallery], revalidate: 60 }
);

export const getGalleryCategories = unstable_cache(
  async () =>
    safeQuery(async () => {
      const categories = await GalleryCategory.find({ status: "active" }).sort({ order: 1 }).lean();
      return toPlain(categories);
    }, []),
  ["gallery-categories"],
  { tags: [CACHE_TAGS.gallery], revalidate: 60 }
);

export const getActivePricingRules = unstable_cache(
  async () =>
    safeQuery(async () => {
      const rules = await PricingRule.find({ isActive: true }).sort({ productName: 1 }).lean();
      return toPlain(rules);
    }, []),
  ["pricing-rules"],
  { tags: [CACHE_TAGS.pricing], revalidate: 60 }
);

export const getCustomizerProducts = unstable_cache(
  async () =>
    safeQuery(async () => {
      const products = await Product.find({
        status: "published",
        "customizer.enabled": true,
      })
        .sort({ name: 1 })
        .lean();
      return toPlain(products);
    }, []),
  ["customizer-products"],
  { tags: [CACHE_TAGS.products], revalidate: 60 }
);

export async function getPageBySlug(slug: string) {
  return safeQuery(async () => {
    const page = await Page.findOne({ slug }).lean();
    return page ? toPlain(page) : null;
  }, null);
}

function cachedPublishedPage(slug: string) {
  return unstable_cache(
    async () =>
      safeQuery(async () => {
        const page = await Page.findOne({ slug, status: "published" }).lean();
        return page ? toPlain(page) : null;
      }, null),
    ["published-page", slug],
    { tags: [CACHE_TAGS.pages], revalidate: 60 }
  );
}

export async function getPublishedPageBySlug(slug: string) {
  return cachedPublishedPage(slug)();
}
