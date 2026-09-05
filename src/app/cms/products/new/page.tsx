import { ProductForm } from "@/components/cms/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="font-body text-[18px] font-bold text-ink">New product</h1>
      <div className="mt-4">
        <ProductForm />
      </div>
    </div>
  );
}
