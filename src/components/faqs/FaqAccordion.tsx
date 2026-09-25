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
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
    );
  }, [faqs, search]);

  const categories = useMemo(
    () => [...new Set(faqs.map((f) => f.category))].sort(),
    [faqs]
  );

  return (
    <div>
      <input
        id="faq-search"
        type="search"
        placeholder="Search questions…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 w-full rounded-sm border border-white/15 bg-white/5 px-4 py-3 text-sm text-pure-paper placeholder:text-chrome-mid shadow-sm transition-all focus:border-cyan/50 focus:outline-none focus:ring-2 focus:ring-cyan/25"
        data-reveal
      />

      <div className="mb-8 flex flex-wrap gap-2" data-reveal>
        {categories.map((cat) => (
          <span
            key={cat}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-chrome-light"
          >
            {cat}
          </span>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-chrome-light">No FAQs match your search.</p>
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
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white/5"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-pure-paper">{faq.question}</span>
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan to-magenta text-lg font-bold text-pure-paper shadow-[0_0_12px_rgba(13,151,252,0.35)] transition-transform",
                      isOpen && "rotate-45"
                    )}
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <div className="border-t border-white/10 bg-white/[0.03] px-5 py-4 text-sm leading-relaxed text-chrome-light">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-cyan">
                      {faq.category}
                    </p>
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
