export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] p-8 text-center">
      <h1 className="font-body text-[16px] font-bold text-ink">{title}</h1>
      <p className="mt-2 text-[13px] text-ink-muted">{detail}</p>
    </div>
  );
}
