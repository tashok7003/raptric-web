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
          they'll show up here.
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

  const rows: { label: string; get: (m: (typeof models)[number]) => string }[] = [
    { label: "Price", get: (m) => `₹${m.price.toLocaleString("en-IN")}` },
    {
      label: "EMI",
      get: (m) => (m.emiMonthly ? `₹${m.emiMonthly.toLocaleString("en-IN")}/mo` : "—"),
    },
    { label: "Range", get: (m) => (m.rangeKm ? `${m.rangeKm} km` : "—") },
    { label: "Gears", get: (m) => (m.gears ? `${m.gears}-speed` : "—") },
    { label: "Warranty", get: () => WARRANTY.headline },
  ];

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
