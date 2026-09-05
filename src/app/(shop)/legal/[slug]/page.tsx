import { notFound } from "next/navigation";
import { LEGAL_PAGES } from "@/lib/legalContent";

// Shared legal template (4e) — one component, five routes. Content is
// a placeholder pending legal review (12d's launch-blocker list); the
// template and URLs are real.
export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = LEGAL_PAGES[slug];
  if (!page) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-[24px] font-bold text-ink">{page.title}</h1>
      <p className="mt-2 text-[12px] text-caution">
        Draft — pending legal review before launch.
      </p>
      <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">{page.body}</p>
    </div>
  );
}
