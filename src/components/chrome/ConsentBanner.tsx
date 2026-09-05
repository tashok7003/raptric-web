"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { setConsentAction } from "@/lib/actions/consent";
import { springSheet } from "@/lib/motion";

// 11e — DPDP consent gate. 8d's analytics can't fire before this
// exists (12c), so the banner is the first thing that has to ship, not
// an afterthought bolted onto an already-instrumented site.
export function ConsentBanner({ initiallyShown }: { initiallyShown: boolean }) {
  const [visible, setVisible] = useState(initiallyShown);
  const [pending, startTransition] = useTransition();
  const reduceMotion = useReducedMotion();

  function choose(choice: "accepted" | "necessary_only") {
    startTransition(async () => {
      await setConsentAction(choice);
      setVisible(false);
    });
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={reduceMotion ? undefined : { y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduceMotion ? undefined : { y: 80, opacity: 0 }}
          transition={springSheet}
          className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--color-border)] bg-surface px-4 py-4 shadow-2xl"
        >
          <div className="mx-auto flex max-w-4xl flex-col items-start gap-3 sm:flex-row sm:items-center">
            <p className="text-[13px] text-ink-muted">
              We use cookies for analytics to understand how riders shop —
              never to sell your data. See our{" "}
              <Link href="/legal/privacy" className="text-action hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
            <div className="flex shrink-0 gap-2 sm:ml-auto">
              <Button
                variant="secondary"
                loading={pending}
                onClick={() => choose("necessary_only")}
              >
                Necessary only
              </Button>
              <Button variant="primary" loading={pending} onClick={() => choose("accepted")}>
                Accept
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
