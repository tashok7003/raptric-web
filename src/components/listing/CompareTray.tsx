"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { getCompareIds } from "@/lib/compareTray";
import { springSheet } from "@/lib/motion";

interface CompareTrayProps {
  names: Record<string, string>; // id -> display name, for the ones known on this page
}

// 1e/2a — floating tray, never nav-level. Shows across the listing and
// PDP so a shopper can build a 2-3 model comparison as they browse.
export function CompareTray({ names }: CompareTrayProps) {
  const [ids, setIds] = useState<string[]>([]);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setIds(getCompareIds());
    const onChange = () => setIds(getCompareIds());
    window.addEventListener("raptric:compare-change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("raptric:compare-change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

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
              Comparing: {ids.map((id) => names[id] ?? id).join(" · ")}
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
