import { loadEnvFile } from "./load-env";

import { connectDB } from "../src/lib/db";

import Product from "../src/models/Product";

import ProductCategory from "../src/models/ProductCategory";

import { SHOP_PRODUCTS } from "../src/lib/product-catalog";



loadEnvFile();



async function main() {

  await connectDB();



  const categories = await ProductCategory.find({}, { slug: 1 }).lean();

  const categoryMap = new Map(categories.map((c) => [c.slug, c._id]));



  const slugs = SHOP_PRODUCTS.map((p) => p.slug);



  // Resolve SKU conflicts from legacy products (e.g. slug changed from tumbler → tumblers)

  for (const item of SHOP_PRODUCTS) {

    const bySlug = await Product.findOne({ slug: item.slug }).lean();

    if (bySlug) continue;



    const legacy = await Product.findOne({ sku: item.sku, slug: { $ne: item.slug } }).lean();

    if (legacy) {

      await Product.updateOne({ _id: legacy._id }, { $set: { slug: item.slug, status: "published" } });

      console.log(`Migrated legacy SKU ${item.sku} to slug ${item.slug}`);

    }

  }



  for (const item of SHOP_PRODUCTS) {

    const blankImage = { url: item.primaryImage, alt: `${item.name} blank` };

    const customizedImage = {

      url: item.customizedImage,

      alt: `${item.name} customized example`,

    };

    const cardImage =
      "cardImage" in item && item.cardImage
        ? { url: item.cardImage, alt: `${item.name} blank and customized comparison` }
        : undefined;



    const payload = {

      name: item.name,

      slug: item.slug,

      sku: item.sku,

      categoryId: categoryMap.get(item.categorySlug),

      categorySlug: item.categorySlug,

      tags: [item.categorySlug.replace(/-/g, " ")],

      shortDescription: `Order ${item.name.toLowerCase()} blank or customized with your artwork.`,

      longDescription: `Choose a blank ${item.name.toLowerCase()} or submit your design for a customized version. Design help is available for an additional fee.`,

      pricingMode: "fixed" as const,

      price: item.price,

      currency: "CAD",

      minQuantity: "minQuantity" in item ? item.minQuantity : 1,

      quantityStep: 1,

      availability: "in_stock" as const,

      blankImage,

      customizedImage,

      ...(cardImage ? { cardImage } : {}),

      images: cardImage ? [cardImage, blankImage, customizedImage] : [blankImage, customizedImage],

      allowsBlankPurchase: true,

      allowsCustomization: true,

      designHelpSurcharge: 5,

      customizer: {

        enabled: true,

        printArea: { x: 12, y: 18, width: 76, height: 58 },

        previewDisclaimer:

          "Preview is approximate. Final placement, colour, and sizing may vary from what is shown.",

      },

      featured: item.featured,

      status: "published" as const,

      seo: {

        title: `${item.name} | DPM Custom Prints`,

        description: `Blank or customized ${item.name.toLowerCase()} from DPM Custom Prints.`,

      },

    };



    await Product.findOneAndUpdate({ slug: item.slug }, { $set: payload }, { upsert: true, new: true });

    console.log(`Synced ${item.name}`);

  }



  const archived = await Product.updateMany(

    { slug: { $nin: slugs } },

    { $set: { status: "archived" } }

  );



  console.log(`Archived ${archived.modifiedCount} other product(s).`);

  process.exit(0);

}



main().catch((error) => {

  console.error("Failed to sync products:", error);

  process.exit(1);

});

