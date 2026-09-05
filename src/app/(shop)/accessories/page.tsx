import { db } from "@/lib/db";
import { ProductCard } from "@/components/ui/ProductCard";

export const dynamic = "force-dynamic";

// Accessories listing (4b) — re-cut price-first, spares priced openly.
export default async function AccessoriesPage() {
  const items = await db.productModel.findMany({
    where: { status: "LIVE", kind: "ACCESSORY" },
    orderBy: { price: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="font-body text-[22px] font-semibold text-ink">
        Accessories · {items.length} items
      </h1>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map((a) => (
          <ProductCard
            key={a.id}
            product={{
              id: a.id,
              slug: a.slug,
              name: a.name,
              kind: a.kind,
              price: a.price,
              mrp: a.mrp,
              outOfStock: a.globalStock <= 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
