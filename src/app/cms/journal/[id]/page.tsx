import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { JournalForm } from "@/components/cms/JournalForm";

export default async function EditJournalPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, products] = await Promise.all([
    db.journalPost.findUnique({ where: { id } }),
    db.productModel.findMany({ where: { status: "LIVE" } }),
  ]);
  if (!post) notFound();

  const body = JSON.parse(post.bodyJson) as { text?: string };

  return (
    <div>
      <h1 className="font-body text-[18px] font-bold text-ink">Edit {post.title}</h1>
      <div className="mt-4">
        <JournalForm
          id={post.id}
          initial={{
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt ?? "",
            body: body.text ?? "",
            productCalloutModelId: post.productCalloutModelId ?? undefined,
          }}
          productOptions={products.map((p) => ({ id: p.id, name: p.name }))}
        />
      </div>
    </div>
  );
}
