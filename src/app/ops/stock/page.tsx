import { db } from "@/lib/db";
import { StockEditor } from "@/components/ops/StockEditor";

export const dynamic = "force-dynamic";

export default async function OpsStockPage() {
  const [stores, models, stockRows] = await Promise.all([
    db.store.findMany(),
    db.productModel.findMany({ where: { status: "LIVE" }, orderBy: { name: "asc" } }),
    db.storeStock.findMany(),
  ]);

  const stockMap = new Map(stockRows.map((s) => [`${s.storeId}:${s.modelId}`, s]));

  return (
    <div>
      <h1 className="font-body text-[18px] font-bold text-ink">
        Per-store stock
      </h1>
      <p className="mt-1 text-[13px] text-ink-muted">
        The integration 2d deliberately didn't fake — a retailer-updated
        count with a real timestamp, not a live feed.
      </p>

      {stores.map((store) => (
        <div key={store.id} className="mt-6">
          <h2 className="font-body text-[14px] font-bold text-ink">{store.name}</h2>
          <div className="mt-2 flex flex-col gap-2">
            {models.map((model) => {
              const row = stockMap.get(`${store.id}:${model.id}`);
              return (
                <StockEditor
                  key={model.id}
                  storeId={store.id}
                  modelId={model.id}
                  modelName={model.name}
                  count={row?.count ?? 0}
                  updatedAt={row?.updatedAt.toISOString() ?? null}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
