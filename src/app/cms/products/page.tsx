import Link from "next/link";
import { db } from "@/lib/db";
import { ProductStatusToggle } from "@/components/cms/ProductStatusToggle";

export default async function CmsProductsPage() {
  const products = await db.productModel.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-body text-[18px] font-bold text-ink">Products</h1>
        <Link
          href="/cms/products/new"
          className="rounded-[var(--radius-control)] bg-action px-4 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-action-hover)]"
        >
          New product
        </Link>
      </div>

      <table className="mt-4 w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-left text-ink-muted">
            <th className="py-2">Name</th>
            <th className="py-2">Kind</th>
            <th className="py-2">Price</th>
            <th className="py-2">Stock</th>
            <th className="py-2">Status</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-[var(--color-border)]">
              <td className="py-2 font-medium text-ink">{p.name}</td>
              <td className="py-2 text-ink-muted">{p.kind}</td>
              <td className="py-2 tabular-nums">₹{p.price.toLocaleString("en-IN")}</td>
              <td className="py-2 tabular-nums">{p.globalStock}</td>
              <td className="py-2">
                <ProductStatusToggle id={p.id} status={p.status} />
              </td>
              <td className="py-2 text-right">
                <Link href={`/cms/products/${p.id}`} className="text-action hover:underline">
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
