import { db } from "@/lib/db";
import { TestRideFlow } from "@/components/testride/TestRideFlow";

export const dynamic = "force-dynamic";

export default async function TestRidePage({
  searchParams,
}: {
  searchParams: Promise<{ model?: string }>;
}) {
  const { model } = await searchParams;
  const [models, stores] = await Promise.all([
    db.productModel.findMany({
      where: { status: "LIVE", kind: { in: ["EBIKE", "MBIKE"] } },
      orderBy: { bestSeller: "desc" },
    }),
    db.store.findMany(),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="font-display text-[22px] font-bold text-ink">
        Book a test ride
      </h1>
      <p className="mt-1 text-[14px] text-ink-muted">
        15 minutes, no commitment. Bring any ID.
      </p>
      <TestRideFlow models={models} stores={stores} preselectedSlug={model} />
    </div>
  );
}
