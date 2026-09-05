import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { MapPin, Phone, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

// Store detail (11a) — 1j was a list + map only; JBC was named on six
// screens with no page of its own. "The biggest local-SEO asset the
// site owns."
export default async function StoreDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await db.store.findUnique({ where: { slug } });
  if (!store) notFound();

  const hours = JSON.parse(store.hoursJson) as Record<string, string>;
  const services = JSON.parse(store.servicesJson) as string[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="aspect-video rounded-[var(--radius-card)] bg-surface-sunk" />
      <h1 className="mt-4 font-display text-[22px] font-bold text-ink">
        {store.name}
      </h1>
      <div className="mt-2 flex flex-col gap-1 text-[14px] text-ink-muted">
        <span className="flex items-center gap-1.5">
          <MapPin className="size-4" aria-hidden /> {store.address}, {store.city}{" "}
          {store.pincode}
        </span>
        <span className="flex items-center gap-1.5">
          <Phone className="size-4" aria-hidden /> {store.phone}
        </span>
        {Object.entries(hours).map(([days, time]) => (
          <span key={days} className="flex items-center gap-1.5">
            <Clock className="size-4" aria-hidden /> {days} · {time}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {services.map((s) => (
          <span
            key={s}
            className="rounded-[999px] border border-[var(--color-border)] px-3 py-1 text-[12px] text-ink-muted"
          >
            {s.replaceAll("-", " ")}
          </span>
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          href={`/test-ride`}
          className="flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-action px-5 py-2.5 font-body text-[13px] font-semibold text-white hover:bg-[var(--color-action-hover)]"
        >
          Book a test ride here
        </Link>
        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(store.address + ", " + store.city)}`}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-11 items-center justify-center rounded-[var(--radius-control)] border-[1.5px] border-ink px-5 py-2.5 font-body text-[13px] font-semibold text-ink hover:bg-surface-sunk"
        >
          Directions
        </a>
      </div>
    </div>
  );
}
