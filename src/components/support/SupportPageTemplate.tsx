// 4e — Service / Safety / Manual on one template, since the three are
// the same shape: a short intro plus a flat list, not distinct designs.
export function SupportPageTemplate({
  title,
  intro,
  items,
}: {
  title: string;
  intro: string;
  items: string[];
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-[24px] font-bold text-ink">{title}</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{intro}</p>
      <ul className="mt-6 flex flex-col gap-3">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-3 text-[14px] text-ink"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
