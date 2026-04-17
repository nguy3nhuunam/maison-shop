"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin-shell";
import { adminFetch } from "@/lib/admin-client";
import { useTranslation } from "@/lib/use-translation";

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [productsData, ordersData, settingsData] = await Promise.all([
          adminFetch("/api/products?includeHidden=true"),
          adminFetch("/api/orders"),
          adminFetch("/api/config"),
        ]);
        setProducts(productsData.products);
        setOrders(ordersData.orders);
        setSettings(settingsData.settings);
      } catch (loadError) {
        setError(loadError.message || t("configLoadError"));
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [t]);

  const totalVariants = products.reduce(
    (sum, product) => sum + (product.variants?.length || 0),
    0,
  );

  return (
    <AdminShell titleKey="dashboardTitle" descriptionKey="dashboardDescription">
      {loading ? (
        <div className="luxury-card rounded-[32px] p-6 text-sm text-stone-500">{t("commonLoading")}</div>
      ) : null}

      {error ? (
        <div className="luxury-card rounded-[32px] p-6 text-sm text-red-500">{error}</div>
      ) : null}

      {!loading && !error ? (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <div className="luxury-card rounded-[32px] p-6">
              <p className="text-sm text-stone-500">{t("dashboardTotalProducts")}</p>
              <p className="mt-3 text-4xl font-bold text-stone-900">{products.length}</p>
            </div>
            <div className="luxury-card rounded-[32px] p-6">
              <p className="text-sm text-stone-500">{t("dashboardTotalVariants")}</p>
              <p className="mt-3 text-4xl font-bold text-stone-900">{totalVariants}</p>
            </div>
            <div className="luxury-card rounded-[32px] p-6">
              <p className="text-sm text-stone-500">{t("dashboardRecentOrders")}</p>
              <p className="mt-3 text-4xl font-bold text-stone-900">{orders.length}</p>
            </div>
            <div className="luxury-card rounded-[32px] p-6">
              <p className="text-sm text-stone-500">{t("dashboardCurrentCurrency")}</p>
              <p className="mt-3 text-4xl font-bold text-stone-900">{settings?.currency || "TWD"}</p>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <div className="luxury-card rounded-[32px] p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-stone-900">{t("dashboardRecentOrders")}</h2>
                <a href="/admin/orders" className="text-sm text-[#b38a45]">
                  {t("dashboardViewAll")}
                </a>
              </div>

              <div className="mt-5 space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="rounded-3xl border border-stone-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-stone-900">{order.name}</p>
                        <p className="mt-1 text-sm text-stone-500">{order.summary}</p>
                      </div>
                      <p className="text-sm text-stone-400">{order.time}</p>
                    </div>
                  </div>
                ))}

                {orders.length === 0 ? (
                  <p className="text-sm text-stone-500">{t("dashboardNoOrdersMongo")}</p>
                ) : null}
              </div>
            </div>

            <div className="luxury-card rounded-[32px] p-6">
              <h2 className="text-xl font-bold text-stone-900">{t("dashboardStatusTitle")}</h2>
              <div className="mt-5 space-y-3 text-sm text-stone-600">
                <div className="rounded-3xl bg-white p-4">
                  <p className="font-semibold text-stone-900">{t("dashboardMongo")}</p>
                  <p className="mt-1">
                    {settings?.mongodbConfigured
                      ? t("dashboardConfigured")
                      : t("dashboardMissingMongo")}
                  </p>
                </div>
                <div className="rounded-3xl bg-white p-4">
                  <p className="font-semibold text-stone-900">{t("dashboardCloudinary")}</p>
                  <p className="mt-1">
                    {settings?.cloudinaryConfigured
                      ? t("dashboardConfigured")
                      : t("dashboardMissingCloudinary")}
                  </p>
                </div>
                <div className="rounded-3xl bg-white p-4">
                  <p className="font-semibold text-stone-900">{t("dashboardMessenger")}</p>
                  <p className="mt-1 break-all">{settings?.messengerUrl || "https://m.me/yourpage"}</p>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : null}
    </AdminShell>
  );
}
