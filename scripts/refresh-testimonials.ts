/**
 * One-time refresh: removes demo testimonials and inserts starter customer stories.
 * Run: npx tsx scripts/refresh-testimonials.ts
 */
import "./load-env";
import mongoose from "mongoose";
import Testimonial from "../src/models/Testimonial";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/dpm_custom_prints";

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

async function main() {
  await mongoose.connect(MONGODB_URI);
  const removed = await Testimonial.deleteMany({ isDemo: true });
  console.log(`Removed ${removed.deletedCount} demo testimonial(s).`);

  let created = 0;
  for (const t of testimonials) {
    const exists = await Testimonial.findOne({ customerName: t.customerName });
    if (exists) {
      await Testimonial.updateOne(
        { customerName: t.customerName },
        {
          $set: {
            ...t,
            testimonial: t.testimonial,
            isDemo: false,
            status: "published",
            image: { url: "/demo/mug-white.svg", alt: `${t.customerName} order` },
          },
        }
      );
      continue;
    }
    await Testimonial.create({
      ...t,
      image: { url: "/demo/mug-white.svg", alt: `${t.customerName} order` },
      isDemo: false,
      status: "published",
    });
    created++;
  }

  console.log(`Added ${created} new testimonial(s).`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
