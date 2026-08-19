"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface FaqItem {
  _id: string | { toString(): string };
  question: string;
  answer: string;
  category: string;
}

interface FaqAccordionProps {
  faqs: FaqItem[];
}

export function FaqAccordion({ faqs }: FaqAccordionProps) {
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(faqs[0] ? String(faqs[0]._id) : null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter(
      (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
    );
  }, [faqs, search]);

  return (
    <div>
      <label htmlFor="faq-search" className="sr-only">Search FAQs</label>
      <input
        id="faq-search"
        type="search"
        placeholder="Search questions…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-8 w-full rounded-sm border border-chrome-light bg-pure-paper px-4 py-3 text-sm focus:border-royal-blue focus:outline-none focus:ring-1 focus:ring-royal-blue"
      />

      {filtered.length === 0 ? (
        <p className="text-carbon">No FAQs match your search.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((faq) => {
            const id = String(faq._id);
            const isOpen = openId === id;
            return (
              <div key={id} className="rounded-sm border border-chrome-light/60 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold hover:bg-chrome-light/10"
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <span className={cn("text-royal-blue transition-transform", isOpen && "rotate-45")}>+</span>
                </button>
                {isOpen && (
                  <div className="border-t border-chrome-light/40 px-5 py-4 text-sm text-carbon leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
