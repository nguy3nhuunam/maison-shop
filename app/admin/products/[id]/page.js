import { redirect } from "next/navigation";

export default async function LegacyEditProductPage({ params }) {
  const resolvedParams = await params;

  if (!resolvedParams?.id) {
    redirect("/admin/products");
  }

  redirect(`/admin/products/${resolvedParams.id}/edit`);
}
