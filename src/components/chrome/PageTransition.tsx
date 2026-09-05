"use client";

import { motion } from "framer-motion";
import { pageEnter, useReducedMotion } from "@/lib/motion";

/**
 * A restrained page-entrance transition — a soft fade + 6px rise, the
 * quiet cousin of a UINavigationController push. Next.js App Router
 * doesn't wait for exit animations on navigation (template.tsx always
 * remounts fresh), so this is enter-only by design, not a limitation
 * worked around.
 *
 * Always renders motion.div (rather than branching to a bare fragment
 * for reduced motion) so server and first client render stay identical
 * — see useReducedMotion in @/lib/motion for why.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : pageEnter.initial}
      animate={pageEnter.animate}
      transition={reduceMotion ? { duration: 0 } : pageEnter.transition}
    >
      {children}
    </motion.div>
  );
}
