"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useCompareIds, pruneCompareIds } from "@/lib/compareTray";
import { getCompareModelsAction } from "@/lib/actions/compare";
import { springSheet, useReducedMotion } from "@/lib/motion";
import { useRegisterBottomBar } from "@/lib/stickyBar";

// 1e/2a — floating tray, never nav-level, and the single compare
// affordance (a duplicate header "Compare (N)" pill used to sit alongside
// it, saying the same thing twice for the same action).
//
// Names are looked up here rather than passed in from the host page —
// this used to take an id->name map built from whatever products that
// specific page happened to have loaded, so switching the type/budget
// filter (or a selection surviving past a product being deleted or
// recreated with a new id) rendered raw database ids with no name.
export function CompareTray() {
  const ids = useCompareIds();
  const reduceMotion = useReducedMotion();
  const [names, setNames] = useState<Record<string, string>>({});
  useRegisterBottomBar(ids.length > 0);

  useEffect(() => {
    if (ids.length === 0) return;
    let cancelled = false;
    getCompareModelsAction(ids).then((models) => {
      if (cancelled) return;
      setNames(Object.fromEntries(models.map((m) => [m.id, m.name])));
      pruneCompareIds(models.map((m) => m.id));
    });
    return () => {
      cancelled = true;
    };
  }, [ids]);

  return (
    <AnimatePresence>
      {ids.length > 0 && (
        <motion.div
          initial={reduceMotion ? undefined : { y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduceMotion ? undefined : { y: 80, opacity: 0 }}
          transition={springSheet}
          className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-border)] bg-[var(--color-surface-sunk)] px-4 py-3"
        >
          <div className="mx-auto flex max-w-6xl items-center gap-3">
            <span className="text-[13px] text-ink-muted">
              Comparing: {ids.map((id) => names[id]).filter(Boolean).join(" · ") || "…"}
            </span>
            <Link
              href={`/compare?ids=${ids.join(",")}`}
              className="ml-auto flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-action px-4 py-2 font-body text-[13px] font-semibold text-white hover:bg-[var(--color-action-hover)]"
            >
              Compare {ids.length} →
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
