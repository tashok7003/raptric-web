"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Accordion } from "@/components/ui/Accordion";
import { logFaqSearchAction } from "@/lib/actions/faq";

interface FaqItemData {
  id: string;
  question: string;
  answer: string;
  category: string;
}

// 4g/4d/2g/6a — the zero-result state that says what RAPTRIC isn't and
// logs the query as catalogue-gap demand, per the site-search spec this
// FAQ box shares its convention with.
export function FaqSearch({ items }: { items: FaqItemData[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (i) => i.question.toLowerCase().includes(q) || i.answer.toLowerCase().includes(q),
    );
  }, [query, items]);

  useEffect(() => {
    if (!query.trim()) return;
    const timeout = setTimeout(() => {
      logFaqSearchAction(query, filtered.length);
    }, 600);
    return () => clearTimeout(timeout);
  }, [query, filtered.length]);

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search FAQ"
          aria-label="Search FAQ"
          className="w-full rounded-[6px] border border-[var(--color-border)] py-2.5 pl-9 pr-3 text-[15px] outline-none focus:border-ink"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] p-8 text-center">
          <p className="text-[14px] font-semibold text-ink">
            Nothing matched &ldquo;{query}&rdquo;
          </p>
          <p className="mt-1 text-[13px] text-ink-muted">
            RAPTRIC sells eBikes, mBikes and accessories — not spare parts
            for other brands or ride-share. If this should be here, we've
            logged it.
          </p>
        </div>
      ) : (
        <Accordion
          items={filtered.map((f) => ({ id: f.id, title: f.question, content: f.answer }))}
        />
      )}
    </div>
  );
}
