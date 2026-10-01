import { loadEnvFile } from "./load-env";
import { connectDB } from "../src/lib/db";
import { PRICING_CATALOG } from "../src/lib/product-pricing";
import Product from "../src/models/Product";
import PricingRule from "../src/models/PricingRule";

loadEnvFile();

async function main() {
  await connectDB();

  let productsUpdated = 0;
  let rulesUpserted = 0;

  for (const entry of PRICING_CATALOG) {
    const product = await Product.findOne({ slug: entry.slug });
    if (!product) {
      console.warn(`Product not found: ${entry.slug}`);
      continue;
    }

    const isQuote = Boolean(entry.quote);

    if (isQuote) {
      await Product.updateOne(
        { _id: product._id },
        {
          $set: {
            pricingMode: "quote",
            minQuantity: entry.minQuantity || 1,
            availability: "quote_only",
            currency: "CAD",
          },
          $unset: { price: "" },
        }
      );
    } else {
      await Product.updateOne(
        { _id: product._id },
        {
          $set: {
            pricingMode: "fixed",
            price: entry.price,
            minQuantity: entry.minQuantity || 1,
            availability: "in_stock",
            currency: "CAD",
          },
        }
      );
    }
    productsUpdated += 1;

    if (isQuote) {
      await PricingRule.updateOne(
        { productSlug: entry.slug },
        {
          $set: {
            productId: product._id,
            productSlug: entry.slug,
            productName: entry.displayName,
            pricingMode: "quote",
            currency: "CAD",
            minQuantity: 1,
            publicNote: "Contact for price",
            isActive: true,
          },
          $unset: { basePrice: "" },
        },
        { upsert: true }
      );
    } else {
      await PricingRule.updateOne(
        { productSlug: entry.slug },
        {
          $set: {
            productId: product._id,
            productSlug: entry.slug,
            productName: entry.displayName,
            basePrice: entry.price,
            pricingMode: "fixed",
            currency: "CAD",
            minQuantity: entry.minQuantity || 1,
            publicNote: entry.note,
            isActive: true,
          },
        },
        { upsert: true }
      );
    }
    rulesUpserted += 1;

    console.log(`Synced ${entry.displayName}: ${isQuote ? "quote" : `$${entry.price?.toFixed(2)} CAD`}`);
  }

  console.log(`Done. ${productsUpdated} products updated, ${rulesUpserted} pricing rules upserted.`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Failed to sync pricing:", error);
  process.exit(1);
});
