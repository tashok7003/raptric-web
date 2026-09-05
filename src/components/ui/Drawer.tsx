"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { springSheet, shouldDismissSheet } from "@/lib/motion";
import { cn } from "@/lib/cn";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  side?: "right" | "bottom";
}

// 10e — desktop: right drawer 380px. Mobile: bottom sheet, half height,
// drag handle. Scrim ink 40%, fades under reduced-motion. Apple-style
// spring for the slide-in/out and a draggable dismiss on the mobile sheet,
// matching iOS sheet behaviour.
export function Drawer({ open, onClose, title, children, side = "right" }: DrawerProps) {
  const reduceMotion = useReducedMotion();
  const containerRef = useFocusTrap(open, onClose);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-ink/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduceMotion ? { duration: 0.001 } : { duration: 0.18 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            drag={side === "bottom" ? "y" : "x"}
            dragConstraints={side === "bottom" ? { top: 0, bottom: 0 } : { left: 0, right: 0 }}
            dragElastic={side === "bottom" ? { top: 0, bottom: 0.5 } : { left: 0, right: 0.5 }}
            onDragEnd={(_, info) => {
              const offset = side === "bottom" ? info.offset.y : info.offset.x;
              const velocity = side === "bottom" ? info.velocity.y : info.velocity.x;
              if (shouldDismissSheet(offset, velocity)) onClose();
            }}
            initial={
              side === "right"
                ? { x: "100%" }
                : { y: "100%" }
            }
            animate={side === "right" ? { x: 0 } : { y: 0 }}
            exit={side === "right" ? { x: "100%" } : { y: "100%" }}
            transition={reduceMotion ? { duration: 0.09 } : springSheet}
            className={cn(
              "fixed z-50 flex flex-col bg-surface shadow-2xl",
              side === "right" &&
                "right-0 top-0 h-full w-full max-w-[380px] border-l border-[var(--color-border)]",
              side === "bottom" &&
                "bottom-0 left-0 right-0 max-h-[60vh] rounded-t-2xl border-t border-[var(--color-border)]",
            )}
          >
            {side === "bottom" && (
              <div className="flex justify-center pt-2">
                <div className="h-1 w-9 rounded-full bg-[var(--color-border)]" />
              </div>
            )}
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
              <h2 className="font-body text-[15px] font-bold text-ink">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid size-11 place-items-center rounded-full hover:bg-surface-sunk"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
