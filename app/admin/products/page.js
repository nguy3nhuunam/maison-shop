"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminShell from "@/components/admin-shell";
import { adminFetch } from "@/lib/admin-client";
import { useTranslation } from "@/lib/use-translation";

function getVariantSummary(product) {
  return product.variants
    .map((variant) => `${variant.size}/${variant.color} (${variant.stock})`)
    .join(", ");
}

export default function AdminProductsPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await adminFetch("/api/products?includeHidden=true");
        setProducts(data.products);
      } catch (loadError) {
        setError(loadError.message || t("productSaveError"));
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [t]);

  async function handleDelete(id) {
    if (!window.confirm(t("productDeleteConfirm"))) {
      return;
    }

    try {
      await adminFetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      setProducts((current) => current.filter((product) => product.id !== id));
    } catch (deleteError) {
      setError(deleteError.message || t("productSaveError"));
    }
  }

  return (
    <AdminShell titleKey="productsTitle" descriptionKey="productsDescription">
      <section className="luxury-card rounded-[32px] p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-stone-900">{t("productsAll")}</h2>
            <p className="mt-1 text-sm text-stone-500">{t("productsAllDescription")}</p>
          </div>
          <Link
            href="/admin/products/new"
            className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#b38a45]"
          >
            {t("productAdd")}
          </Link>
        </div>

        {loading ? <p className="mt-6 text-sm text-stone-500">{t("commonLoading")}</p> : null}
        {error ? <p className="mt-6 text-sm text-red-500">{error}</p> : null}

        {!loading ? (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-stone-400">
                <tr>
                  <th className="pb-4">{t("adminProducts")}</th>
                  <th className="pb-4">{t("productVariants")}</th>
                  <th className="pb-4">{t("productFieldPrice")}</th>
                  <th className="pb-4">{t("promotionTitle")}</th>
                  <th className="pb-4">{t("productVariantStock")}</th>
                  <th className="pb-4">{t("productFieldStatus")}</th>
                  <th className="pb-4 text-right">{t("productAction")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="py-4 align-top">
                      <div className="flex items-center gap-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-16 w-14 rounded-2xl object-cover"
                        />
                        <div>
                          <p className="font-semibold text-stone-900">{product.name}</p>
                          <p className="mt-1 text-stone-500">
                            {product.category === "nam" ? t("categoryNam") : t("categoryNu")}
                          </p>
                          <p className="mt-1 max-w-sm text-stone-400">
                            {product.shortDescription || product.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 align-top text-stone-500">
                      <div className="max-w-sm leading-6">{getVariantSummary(product)}</div>
                    </td>
                    <td className="py-4 align-top text-stone-500">{product.basePrice}</td>
                    <td className="py-4 align-top text-stone-500">
                      <div className="flex flex-wrap gap-2">
                        {product.discountPercent > 0 ? (
                          <span className="rounded-full bg-stone-900 px-3 py-1 text-xs text-white">
                            {t("discountBadge", { percent: product.discountPercent })}
                          </span>
                        ) : null}
                        {product.isFreeShip ? (
                          <span className="rounded-full bg-[#f6efe2] px-3 py-1 text-xs text-[#b38a45]">
                            {t("freeShipBadge")}
                          </span>
                        ) : null}
                        {product.discountPercent <= 0 && !product.isFreeShip ? (
                          <span className="text-xs text-stone-400">{t("promotionNone")}</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="py-4 align-top text-stone-500">{product.totalStock}</td>
                    <td className="py-4 align-top">
                      <span className="rounded-full bg-stone-100 px-3 py-1 text-xs uppercase tracking-[0.2em] text-stone-600">
                        {product.status === "active" ? t("statusActive") : t("statusHidden")}
                      </span>
                    </td>
                    <td className="py-4 align-top">
                      <div className="flex justify-end gap-3">
                        {product.id ? (
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="rounded-full border border-stone-300 px-4 py-2 text-xs text-stone-600"
                          >
                            {t("commonEdit")}
                          </Link>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => handleDelete(product.id)}
                          className="rounded-full border border-red-200 px-4 py-2 text-xs text-red-500"
                        >
                          {t("commonDelete")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {products.length === 0 ? (
              <p className="pt-6 text-sm text-stone-500">{t("productsEmpty")}</p>
            ) : null}
          </div>
        ) : null}
      </section>
    </AdminShell>
  );
}
