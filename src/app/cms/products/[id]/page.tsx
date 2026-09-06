import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/cms/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await db.productModel.findUnique({ where: { id } });
  if (!product) notFound();

  return (
    <div>
      <h1 className="font-body text-[18px] font-bold text-ink">Edit {product.name}</h1>
      <div className="mt-4">
        <ProductForm
          id={product.id}
          initial={{
            slug: product.slug,
            kind: product.kind,
            name: product.name,
            mrp: product.mrp,
            price: product.price,
            emiTenureMonths: product.emiTenureMonths,
            rangeKm: product.rangeKm ?? undefined,
            gears: product.gears ?? undefined,
            wheelSize: product.wheelSize ?? undefined,
            bestSeller: product.bestSeller,
            isNew: product.isNew,
            globalStock: product.globalStock,
            heroImage: product.heroImage ?? undefined,
            gallery: JSON.parse(product.gallery || "[]"),
            specs: JSON.parse(product.specsJson || "{}"),
            description: product.description ?? undefined,
            metaTitle: product.metaTitle ?? undefined,
            metaDescription: product.metaDescription ?? undefined,
          }}
        />
      </div>
    </div>
  );
}
