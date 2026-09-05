import { db } from "@/lib/db";
import { FaqSearch } from "@/components/faq/FaqSearch";

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const faqs = await db.faqItem.findMany({
    where: { status: "LIVE" },
    orderBy: { order: "asc" },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="font-display text-[22px] font-bold text-ink">FAQ</h1>
      <FaqSearch
        items={faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer, category: f.category }))}
      />
    </div>
  );
}
