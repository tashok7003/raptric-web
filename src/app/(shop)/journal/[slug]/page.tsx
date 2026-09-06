import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { PriceBlock } from "@/components/ui/PriceBlock";

export const dynamic = "force-dynamic";

// Journal article template (4f) — the product callout pulls live
// price/stock from the model id, never a copied number that drifts.
export default async function JournalArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await db.journalPost.findUnique({ where: { slug } });
  if (!post || post.status !== "LIVE") notFound();

  const body = JSON.parse(post.bodyJson) as { text?: string };
  const callout = post.productCalloutModelId
    ? await db.productModel.findUnique({ where: { id: post.productCalloutModelId } })
    : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="aspect-video rounded-[var(--radius-card)] bg-surface-sunk" />
      <h1 className="mt-4 font-display text-[26px] font-bold text-ink">
        {post.title}
      </h1>
      <div className="mt-4 whitespace-pre-line text-[16px] leading-[1.55] text-ink">
        {body.text}
      </div>

      {callout && (
        <div className="mt-6 flex items-center gap-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface-raised p-4">
          <div className="size-16 shrink-0 rounded-[6px] bg-surface-sunk" />
          <div className="flex-1">
            <span className="font-body text-[14px] font-semibold text-ink">
              {callout.name}
            </span>
            {callout.emiMonthly ? (
              <PriceBlock
                form="emi"
                monthly={callout.emiMonthly}
                tenureMonths={callout.emiTenureMonths}
                mrp={callout.mrp}
                price={callout.price}
              />
            ) : (
              <PriceBlock form="flat" price={callout.price} />
            )}
          </div>
          <Link
            href={`/bikes/${callout.slug}`}
            className="text-[13px] font-semibold text-action hover:underline"
          >
            View →
          </Link>
        </div>
      )}
    </div>
  );
}
