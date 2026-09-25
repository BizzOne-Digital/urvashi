export interface DefaultFaq {
  _id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

export const DEFAULT_FAQS: DefaultFaq[] = [
  {
    _id: "faq-contact",
    question: "How can I contact DPM Custom Prints?",
    answer:
      "Email dpmsuppliesinfo@gmail.com, call +1 613-970-3046, or message us on WhatsApp. We are happy to help with orders, artwork questions, and custom quotes.",
    category: "Ordering",
    order: 1,
  },
  {
    _id: "faq-shipping",
    question: "How is shipping calculated at checkout?",
    answer:
      "Enter your shipping address at checkout to see Canada Post Standard and Express options with tracking. Shipping and provincial taxes are calculated automatically before you place your order.",
    category: "Shipping",
    order: 2,
  },
  {
    _id: "faq-turnaround",
    question: "How long does production take?",
    answer:
      "Most custom print orders are produced within a few business days after artwork approval. Larger or complex orders may take longer — we will confirm timing when we review your order.",
    category: "Production",
    order: 3,
  },
  {
    _id: "faq-artwork",
    question: "What file types can I upload for custom printing?",
    answer:
      "We accept PNG, JPEG, and PDF artwork where customization is enabled. For best results, use high-resolution files with clear contrast. Contact us if you need help preparing your artwork.",
    category: "Artwork",
    order: 4,
  },
  {
    _id: "faq-pens-min",
    question: "What is the minimum order for custom pens?",
    answer: "Custom sublimation pens are priced at $3.99 each with a minimum order of 5 pens.",
    category: "Minimum quantities",
    order: 5,
  },
  {
    _id: "faq-pricing",
    question: "Are prices shown in CAD?",
    answer:
      "Yes. Listed prices on the shop are starting prices in Canadian dollars (CAD). Final totals at checkout include selected shipping and applicable taxes for your province.",
    category: "Pricing",
    order: 6,
  },
  {
    _id: "faq-quote",
    question: "How do I get a quote for apparel, blankets, or bulk orders?",
    answer:
      "Some items require a custom quote based on size, material, and print options. Use the Contact page or email dpmsuppliesinfo@gmail.com with your product, quantity, and artwork details.",
    category: "Pricing",
    order: 7,
  },
  {
    _id: "faq-customize",
    question: "Can I preview my design before ordering?",
    answer:
      "Yes. Use the Customize page or product customizer to add text, colours, and artwork upload. You will see a live preview before adding items to your cart or submitting a request.",
    category: "Customization",
    order: 8,
  },
  {
    _id: "faq-pickup",
    question: "Is local pickup available?",
    answer:
      "We are based in the Ottawa area. Contact us to discuss pickup options for your order if you prefer to collect locally instead of shipping.",
    category: "Shipping",
    order: 9,
  },
  {
    _id: "faq-returns",
    question: "What is your return policy for custom items?",
    answer:
      "Because most products are custom printed, returns and exchanges are handled case by case. Please contact us before sending anything back so we can review your situation.",
    category: "Returns",
    order: 10,
  },
  {
    _id: "faq-payment",
    question: "When do I pay for my order?",
    answer:
      "After you place your order, we will contact you with payment instructions. Your checkout total includes product pricing, shipping, and taxes so you know the full amount upfront.",
    category: "Payment",
    order: 11,
  },
  {
    _id: "faq-products",
    question: "What products can you customize?",
    answer:
      "We print mugs, tumblers, glass tumblers, keychains, pens, ornaments, desk calendars, and more. Browse the Shop for confirmed pricing or Contact us for apparel and specialty items.",
    category: "Products",
    order: 12,
  },
];
