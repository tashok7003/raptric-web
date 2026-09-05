"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import { springStandard } from "@/lib/motion";

interface StatusCardProps {
  tone: "success" | "caution" | "danger" | "info";
  label: string;
  title: string;
  detail?: string;
  action?: React.ReactNode;
  className?: string;
}

const toneClasses = {
  success: "bg-success-bg border-success-border text-success",
  caution: "bg-caution-bg border-caution-border text-caution",
  danger: "bg-danger-bg border-danger-border text-danger",
  info: "bg-info-bg border-info-border text-action",
};

// 10e — four tones, always one action. "A tone with neither is decoration."
// Entrance is a soft scale+fade — the same shape iOS uses for an alert or
// banner arriving, not a slide (these appear in place, they don't travel
// from off-screen).
export function StatusCard({
  tone,
  label,
  title,
  detail,
  action,
  className,
}: StatusCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={springStandard}
      className={cn(
        "flex flex-col gap-1.5 rounded-[var(--radius-card)] border px-3 py-3",
        toneClasses[tone],
        className,
      )}
    >
      <span className="font-body text-[12px] font-semibold uppercase tracking-[0.06em]">
        {label}
      </span>
      <span className="font-body text-[15px] font-bold text-ink">{title}</span>
      {detail && <span className="text-[13px] text-ink-muted">{detail}</span>}
      {action}
    </motion.div>
  );
}
