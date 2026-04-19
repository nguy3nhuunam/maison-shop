"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin-shell";
import { adminFetch } from "@/lib/admin-client";
import { useTranslation } from "@/lib/use-translation";

export default function AdminOrdersPage() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await adminFetch("/api/orders");
        setOrders(data.orders);
        setLoadError("");
      } catch (loadError) {
        setLoadError(loadError.message || t("ordersLoadError"));
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [t]);

  async function handleDeleteOrder(orderId) {
    if (!window.confirm(t("ordersDeleteConfirm"))) {
      return;
    }

    setDeletingId(orderId);
    setActionError("");
    setNotice("");

    try {
      await adminFetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });
      setOrders((current) => current.filter((order) => order.id !== orderId));
      setNotice(t("ordersDeleteSuccess"));
    } catch (deleteError) {
      setActionError(deleteError.message || t("ordersDeleteError"));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AdminShell titleKey="ordersTitle" descriptionKey="ordersDescriptionModern">
      <section className="luxury-card rounded-[32px] p-6">
        {loading ? <p className="text-sm text-stone-500">{t("commonLoading")}</p> : null}
        {loadError ? <p className="text-sm text-red-500">{loadError}</p> : null}
        {actionError ? <p className="text-sm text-red-500">{actionError}</p> : null}
        {notice ? <p className="text-sm text-emerald-600">{notice}</p> : null}

        {!loading && !loadError ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-stone-400">
                <tr>
                  <th className="pb-4">{t("ordersTime")}</th>
                  <th className="pb-4">{t("ordersCustomer")}</th>
                  <th className="pb-4">{t("ordersItems")}</th>
                  <th className="pb-4">Nguồn</th>
                  <th className="pb-4">{t("ordersTotal")}</th>
                  <th className="pb-4 text-right">{t("productAction")}</th>
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
                    <td className="py-4 text-stone-500">
                      <div className="space-y-1">
                        <p>{order.sourceLabel}</p>
                        <p className="text-xs text-stone-400">{order.channel}</p>
                      </div>
                    </td>
                    <td className="py-4 font-semibold text-stone-900">{order.total}</td>
                    <td className="py-4 text-right">
                      <button
                        type="button"
                        disabled={deletingId === order.id}
                        onClick={() => handleDeleteOrder(order.id)}
                        className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId === order.id ? t("ordersDeleting") : t("commonDelete")}
                      </button>
                    </td>
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
