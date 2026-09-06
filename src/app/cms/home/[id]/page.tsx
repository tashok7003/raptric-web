import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { HomeSectionForm } from "@/components/cms/HomeSectionForm";
import { HOME_SECTION_TYPES, type HomeSectionType } from "@/lib/homeSections";

export default async function EditHomeSectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const section = await db.homeSection.findUnique({ where: { id } });
  if (!section) notFound();

  const type = section.type as HomeSectionType;
  const label = HOME_SECTION_TYPES.find((t) => t.value === type)?.label ?? type;

  return (
    <div>
      <h1 className="font-body text-[18px] font-bold text-ink">Edit {label} section</h1>
      <div className="mt-4">
        <HomeSectionForm
          id={section.id}
          type={type}
          initial={{
            heading: section.heading ?? "",
            body: section.body ?? "",
            imageUrl: section.imageUrl ?? "",
            ctaLabel: section.ctaLabel ?? "",
            ctaHref: section.ctaHref ?? "",
            config: JSON.parse(section.configJson || "{}"),
          }}
        />
      </div>
    </div>
  );
}
