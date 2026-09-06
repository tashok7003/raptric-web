import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { WARRANTY } from "@/lib/siteConfig";

export const dynamic = "force-dynamic";

// Compare (1g/2c) — 2-3 models, differences highlighted. Kept as a
// tray-only destination (2a) — never reachable from the nav directly.
export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids } = await searchParams;
  const idList = ids ? ids.split(",").filter(Boolean).slice(0, 3) : [];

  const models = idList.length
    ? await db.productModel.findMany({ where: { id: { in: idList } } })
    : [];

  if (models.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-body text-[20px] font-bold text-ink">
          Nothing to compare yet
        </h1>
        <p className="mt-2 text-[14px] text-ink-muted">
          Pick 2–3 models from the listing using the compare icon, and
          they&apos;ll show up here.
        </p>
        <Link
          href="/bikes"
          className="mt-4 inline-block text-[13px] font-semibold text-action hover:underline"
        >
          Browse eBikes →
        </Link>
      </div>
    );
  }

  // Union of CMS-editable spec keys (src/components/cms/ProductForm.tsx)
  // across the compared models — a spec set by an editor on any one of
  // them becomes its own comparison row, rather than the fixed Price/EMI/
  // Range/Gears set silently showing "—" across the board whenever the
  // compared kind doesn't have that attribute (e.g. Gears for eBikes).
  const specKeys = Array.from(
    new Set(
      models.flatMap((m) => {
        try {
          return Object.keys(JSON.parse(m.specsJson || "{}"));
        } catch {
          return [];
        }
      }),
    ),
  );
  const modelSpecs = new Map(
    models.map((m) => {
      let specs: Record<string, string> = {};
      try {
        specs = JSON.parse(m.specsJson || "{}");
      } catch {
        // fall through with empty specs
      }
      return [m.id, specs];
    }),
  );

  type Model = (typeof models)[number];
  const rows: { label: string; get: (m: Model) => string }[] = [
    { label: "Price", get: (m: Model) => `₹${m.price.toLocaleString("en-IN")}` },
    {
      label: "MRP",
      get: (m: Model) => (m.mrp > m.price ? `₹${m.mrp.toLocaleString("en-IN")}` : "—"),
    },
    {
      label: "EMI",
      get: (m: Model) => (m.emiMonthly ? `₹${m.emiMonthly.toLocaleString("en-IN")}/mo` : "—"),
    },
    { label: "Range", get: (m: Model) => (m.rangeKm ? `${m.rangeKm} km` : "—") },
    { label: "Gears", get: (m: Model) => (m.gears ? `${m.gears}-speed` : "—") },
    { label: "Wheel size", get: (m: Model) => m.wheelSize ?? "—" },
    ...specKeys.map((key) => ({
      label: key,
      get: (m: Model) => modelSpecs.get(m.id)?.[key] ?? "—",
    })),
    { label: "Warranty", get: () => WARRANTY.headline },
  ]
    // A row where every model reads "—" conveys nothing — e.g. "Gears"
    // across an all-eBike comparison — and reads as broken rather than
    // absent, so it's dropped rather than shown.
    .filter((row) => models.some((m) => row.get(m) !== "—"));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="font-body text-[22px] font-semibold text-ink">
        Compare {models.map((m) => m.name).join(" · ")}
      </h1>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-[14px]">
          <thead>
            <tr>
              <th className="w-32 text-left text-ink-muted"></th>
              {models.map((m) => (
                <th key={m.id} className="p-2 text-left">
                  <div className="relative aspect-4/3 w-full max-w-40 overflow-hidden rounded-[var(--radius-card)] bg-surface-sunk">
                    {m.heroImage ? (
                      <Image
                        src={m.heroImage}
                        alt={m.name}
                        fill
                        sizes="160px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <span className="mt-2 block font-semibold text-ink">
                    {m.name}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const values = models.map((m) => row.get(m));
              const differs = new Set(values).size > 1;
              return (
                <tr key={row.label} className="border-t border-[var(--color-border)]">
                  <td className="p-2 font-medium text-ink-muted">{row.label}</td>
                  {values.map((v, i) => (
                    <td
                      key={i}
                      className={
                        differs
                          ? "p-2 font-semibold text-action"
                          : "p-2 text-ink"
                      }
                    >
                      {v}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
