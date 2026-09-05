"use client";

import { useState, useId } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Plus, Minus, Link2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { springGentle, fadeEnterExit } from "@/lib/motion";

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  /** shown instead of hiding the section — "an empty accordion says why
   * it's empty rather than vanishing" (10e) */
  emptyReason?: string;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpenId?: string;
  className?: string;
}

// 10e — one open at a time, deep-linkable anchor via #<id>, copy-link
// affordance on the open section.
export function Accordion({ items, defaultOpenId, className }: AccordionProps) {
  const [openId, setOpenId] = useState<string | undefined>(defaultOpenId);
  const reduceMotion = useReducedMotion();
  const groupId = useId();

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        const isEmpty = !!item.emptyReason;
        return (
          <div
            key={item.id}
            id={item.id}
            className={cn(
              "scroll-mt-20 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white px-3 py-2.5",
              isOpen && "border-ink",
              isEmpty && "opacity-45",
            )}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`${groupId}-${item.id}-panel`}
              disabled={isEmpty}
              onClick={() => setOpenId(isOpen ? undefined : item.id)}
              className="flex w-full min-h-11 items-center justify-between gap-2 text-left"
            >
              <span className="font-body text-[15px] font-bold text-ink">
                {item.title}
              </span>
              {isEmpty ? (
                <span className="text-[12px] text-ink-muted">
                  {item.emptyReason}
                </span>
              ) : isOpen ? (
                <Minus className="size-4 shrink-0 text-ink-muted" aria-hidden />
              ) : (
                <Plus className="size-4 shrink-0 text-ink-muted" aria-hidden />
              )}
            </button>
            <AnimatePresence initial={false}>
              {isOpen && !isEmpty && (
                <motion.div
                  id={`${groupId}-${item.id}-panel`}
                  key="content"
                  initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                  transition={reduceMotion ? fadeEnterExit : springGentle}
                  className="overflow-hidden"
                >
                  <div className="pt-2.5 text-[15px] text-ink-muted">
                    {item.content}
                  </div>
                  <a
                    href={`#${item.id}`}
                    className="mt-2 inline-flex items-center gap-1 text-[12px] text-action hover:underline"
                  >
                    <Link2 className="size-3" aria-hidden /> Copy link to this
                    section
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
