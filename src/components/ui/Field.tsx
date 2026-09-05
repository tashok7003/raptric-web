"use client";

import { useId } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/cn";

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  success?: string;
  readOnlyDerived?: boolean; // "derived from pincode", not disabled-looking-broken
}

// 10d — label always visible, never a placeholder-as-label. Error surfaces
// on blur, not per keystroke (validated by the caller). Success is
// rationed: only where it tells you something new (e.g. serviceability).
export function Field({
  label,
  hint,
  error,
  success,
  readOnlyDerived,
  className,
  id,
  ...props
}: FieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const describedBy = error || success || hint ? `${inputId}-desc` : undefined;

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={inputId}
        className="font-body text-[13px] font-semibold uppercase tracking-[0.08em] text-ink-muted"
      >
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        readOnly={readOnlyDerived}
        className={cn(
          "rounded-[6px] border px-3 py-2.5 text-[15px] text-ink bg-white outline-none transition-colors",
          "border-[var(--color-border)] focus:border-ink",
          error && "border-danger text-danger",
          success && "border-success",
          readOnlyDerived && "bg-surface-sunk text-ink-muted",
          className,
        )}
        {...props}
      />
      {error && (
        <span
          id={describedBy}
          className="flex items-center gap-1 text-[13px] text-danger"
        >
          <AlertCircle className="size-3.5" aria-hidden /> {error}
        </span>
      )}
      {!error && success && (
        <span
          id={describedBy}
          className="flex items-center gap-1 text-[13px] text-success"
        >
          <CheckCircle2 className="size-3.5" aria-hidden /> {success}
        </span>
      )}
      {!error && !success && hint && (
        <span id={describedBy} className="text-[13px] text-ink-muted">
          {hint}
        </span>
      )}
    </div>
  );
}
