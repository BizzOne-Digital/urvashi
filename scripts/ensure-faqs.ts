import { loadEnvFile } from "./load-env";
import { connectDB } from "../src/lib/db";
import FAQ from "../src/models/FAQ";
import { DEFAULT_FAQS } from "../src/lib/default-faqs";

loadEnvFile();

async function main() {
  await connectDB();

  let created = 0;
  let updated = 0;

  for (const faq of DEFAULT_FAQS) {
    const existing = await FAQ.findOne({ question: faq.question });
    if (existing) {
      existing.answer = faq.answer;
      existing.category = faq.category;
      existing.order = faq.order;
      existing.status = "published";
      await existing.save();
      updated += 1;
      continue;
    }

    await FAQ.create({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      order: faq.order,
      status: "published",
    });
    created += 1;
  }

  console.log(`FAQs: ${created} created, ${updated} updated.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
