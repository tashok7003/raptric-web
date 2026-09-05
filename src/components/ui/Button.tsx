"use client";

import { forwardRef } from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { pressScale, springTap, pulseTransition } from "@/lib/motion";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: Variant;
  loading?: boolean;
  loadingLabel?: string;
  /** Bounce the button once — Apple reserves real overshoot for delight
   * moments (a completed action), not chrome. Toggle true→false→true is
   * not needed; pass a value that changes (e.g. a counter) if it should
   * re-fire, since React only replays `animate` on prop change. */
  pulse?: boolean;
  children: React.ReactNode;
}

// 10d — one primary per view (never enforced in code, but the variant list
// stops at three on purpose). Disabled is never used for "out of stock":
// that becomes a Notify-me ghost/secondary action instead, decided by the
// caller, not this component.
const variantClasses: Record<Variant, string> = {
  primary:
    "bg-action text-white hover:bg-[var(--color-action-hover)] active:bg-[var(--color-action-active)] disabled:bg-[var(--color-border)] disabled:text-[var(--color-surface)]",
  secondary:
    "border-[1.5px] border-ink text-ink hover:bg-surface-sunk disabled:border-[var(--color-border)] disabled:text-[var(--color-border)]",
  ghost:
    "text-action hover:underline disabled:text-[var(--color-border)] px-1",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      loading = false,
      loadingLabel,
      pulse = false,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const reduceMotion = useReducedMotion();
    const isGhost = variant === "ghost";

    return (
      <motion.button
        ref={ref}
        whileTap={reduceMotion || disabled || loading ? undefined : pressScale}
        animate={pulse && !reduceMotion ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        transition={pulse ? pulseTransition : springTap}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] font-body font-semibold text-[13px] transition-colors",
          !isGhost && "min-h-11 px-4 py-2.5",
          isGhost && "min-h-11",
          variantClasses[variant],
          className,
        )}
        {...props}
      >
        {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
        <span>{loading ? (loadingLabel ?? children) : children}</span>
      </motion.button>
    );
  },
);
Button.displayName = "Button";
