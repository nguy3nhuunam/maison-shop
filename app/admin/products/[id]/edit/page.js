import { notFound } from "next/navigation";
import AdminShell from "@/components/admin-shell";
import ProductForm from "@/components/product-form";
import { getProductById } from "@/lib/db";

export default async function EditProductPage({ params }) {
  const resolvedParams = await params;
  const productId = Number(resolvedParams?.id);

  if (!Number.isInteger(productId) || productId <= 0) {
    notFound();
  }

  const product = await getProductById(productId);

  if (!product) {
    notFound();
  }

  return (
    <AdminShell
      titleKey="productEditTitle"
      descriptionKey="productEditDescription"
    >
      <ProductForm product={product} />
    </AdminShell>
  );
}
