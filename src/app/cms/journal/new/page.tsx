import { db } from "@/lib/db";
import { JournalForm } from "@/components/cms/JournalForm";

export default async function NewJournalPostPage() {
  const products = await db.productModel.findMany({ where: { status: "LIVE" } });
  return (
    <div>
      <h1 className="font-body text-[18px] font-bold text-ink">New journal post</h1>
      <div className="mt-4">
        <JournalForm productOptions={products.map((p) => ({ id: p.id, name: p.name }))} />
      </div>
    </div>
  );
}
