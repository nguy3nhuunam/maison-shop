"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin-shell";
import { adminFetch } from "@/lib/admin-client";
import { useTranslation } from "@/lib/use-translation";

export default function AdminOrdersPage() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await adminFetch("/api/orders");
        setOrders(data.orders);
      } catch (loadError) {
        setError(loadError.message || t("ordersLoadError"));
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [t]);

  return (
    <AdminShell titleKey="ordersTitle" descriptionKey="ordersDescriptionModern">
      <section className="luxury-card rounded-[32px] p-6">
        {loading ? <p className="text-sm text-stone-500">{t("commonLoading")}</p> : null}
        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        {!loading && !error ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-stone-400">
                <tr>
                  <th className="pb-4">{t("ordersTime")}</th>
                  <th className="pb-4">{t("ordersCustomer")}</th>
                  <th className="pb-4">{t("ordersItems")}</th>
                  <th className="pb-4">{t("ordersTotal")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="py-4 text-stone-500">{order.time}</td>
                    <td className="py-4">
                      <p className="font-semibold text-stone-900">{order.name}</p>
                      <p className="mt-1 text-stone-500">{order.phone}</p>
                      <p className="mt-1 text-stone-400">{order.address}</p>
                      {order.addressImage ? (
                        <a
                          href={order.addressImage}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-block text-xs text-[#b38a45]"
                        >
                          {t("ordersViewAddressImage")}
                        </a>
                      ) : null}
                    </td>
                    <td className="py-4 text-stone-500">{order.summary}</td>
                    <td className="py-4 font-semibold text-stone-900">{order.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {orders.length === 0 ? (
              <p className="pt-6 text-sm text-stone-500">{t("ordersEmptyModern")}</p>
            ) : null}
          </div>
        ) : null}
      </section>
    </AdminShell>
  );
}
