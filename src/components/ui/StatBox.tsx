import { cn } from "@/lib/cn";

interface StatBoxProps {
  items: { label: string; icon?: React.ReactNode }[];
  className?: string;
}

// 10e — stat/trust box, 4-up, never 9. Static values only — never a
// counting animation (the wireframe calls this out explicitly).
export function StatBox({ items, className }: StatBoxProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-2 sm:grid-cols-4", className)}>
      {items.slice(0, 4).map((item, i) => (
        <div
          key={i}
          className="flex flex-col items-center justify-center gap-1 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white px-2 py-3 text-center"
        >
          {item.icon}
          <span className="font-body text-[13px] font-semibold text-ink">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
