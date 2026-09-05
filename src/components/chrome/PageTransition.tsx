"use client";

import { motion, useReducedMotion } from "framer-motion";
import { pageEnter } from "@/lib/motion";

/**
 * A restrained page-entrance transition — a soft fade + 6px rise, the
 * quiet cousin of a UINavigationController push. Next.js App Router
 * doesn't wait for exit animations on navigation (template.tsx always
 * remounts fresh), so this is enter-only by design, not a limitation
 * worked around.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return <>{children}</>;

  return (
    <motion.div
      initial={pageEnter.initial}
      animate={pageEnter.animate}
      transition={pageEnter.transition}
    >
      {children}
    </motion.div>
  );
}
