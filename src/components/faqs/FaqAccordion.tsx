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
        className="mb-8 w-full rounded-sm border border-chrome-light bg-pure-paper px-4 py-3 text-sm shadow-sm transition-all focus:border-royal-blue focus:outline-none focus:ring-2 focus:ring-royal-blue/30"
        data-reveal
      />

      {filtered.length === 0 ? (
        <p className="text-carbon">No FAQs match your search.</p>
      ) : (
        <div className="space-y-3" data-reveal-stagger>
          {filtered.map((faq) => {
            const id = String(faq._id);
            const isOpen = openId === id;
            return (
              <div key={id} className="card-vibrant overflow-hidden" data-reveal-item>
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold transition-colors hover:bg-royal-blue/5"
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-royal-blue to-cyan text-lg font-bold text-pure-paper transition-transform",
                      isOpen && "rotate-45"
                    )}
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <div className="border-t border-chrome-light/40 bg-chrome-light/5 px-5 py-4 text-sm leading-relaxed text-carbon">
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
