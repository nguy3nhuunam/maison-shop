import AdminShell from "@/components/admin-shell";
import ProductForm from "@/components/product-form";

export default function NewProductPage() {
  return (
    <AdminShell
      titleKey="productCreateTitle"
      descriptionKey="productCreateDescription"
    >
      <ProductForm />
    </AdminShell>
  );
}
