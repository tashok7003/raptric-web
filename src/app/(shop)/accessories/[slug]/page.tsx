import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/pdp/AddToCartButton";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Accessory full PDP (9f) — promised on 1n's drawer and 4b, never built
// until turn 9. Each SKU gets its own URL, per that promise.
export default async function AccessoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await db.productModel.findUnique({ where: { slug } });
  if (!item || item.kind !== "ACCESSORY" || item.status !== "LIVE") notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-square rounded-[var(--radius-card)] bg-surface-sunk" />
        <div className="flex flex-col gap-3">
          <h1 className="font-display text-[22px] font-bold text-ink">
            {item.name}
          </h1>
          <div className="font-display text-[22px] font-bold tabular-nums text-ink">
            ₹{item.price.toLocaleString("en-IN")}
          </div>
          <span className="text-[13px] text-ink-muted">
            {item.globalStock > 0 ? "In stock" : "Out of stock"}
          </span>
          <AddToCartButton
            modelId={item.id}
            outOfStock={item.globalStock <= 0}
            className="mt-2 w-full"
          />
        </div>
      </div>
    </div>
  );
}
