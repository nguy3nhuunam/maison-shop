"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin-shell";
import { adminFetch } from "@/lib/admin-client";
import { useTranslation } from "@/lib/use-translation";

const initialForm = {
  id: null,
  title: "",
  content: "",
  type: "sales",
  isActive: true,
};

export default function AdminFomoPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadItems() {
      try {
        const data = await adminFetch("/api/fomo?includeAll=true");
        setItems(data.items);
      } catch (error) {
        setMessage(error.message || t("fomoLoadError"));
      } finally {
        setLoading(false);
      }
    }

    loadItems();
  }, [t]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      if (form.id) {
        const data = await adminFetch(`/api/fomo/${form.id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        setItems((current) =>
          current.map((item) => (item.id === form.id ? data.item : item)),
        );
      } else {
        const data = await adminFetch("/api/fomo", {
          method: "POST",
          body: JSON.stringify(form),
        });
        setItems((current) => [data.item, ...current]);
      }

      setForm(initialForm);
      setMessage(t("fomoSaved"));
    } catch (error) {
      setMessage(error.message || t("fomoSaveError"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm(t("fomoDeleteConfirm"))) {
      return;
    }

    try {
      await adminFetch(`/api/fomo/${id}`, {
        method: "DELETE",
      });
      setItems((current) => current.filter((item) => item.id !== id));
      if (form.id === id) {
        setForm(initialForm);
      }
    } catch (error) {
      setMessage(error.message || t("fomoDeleteError"));
    }
  }

  return (
    <AdminShell titleKey="fomoPageTitle" descriptionKey="fomoPageDescription">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={handleSubmit} className="luxury-card space-y-5 rounded-[32px] p-6">
          <div>
            <h2 className="text-xl font-bold text-stone-900">
              {form.id ? t("fomoCreateEdit") : t("fomoCreateNew")}
            </h2>
            <p className="mt-2 text-sm text-stone-500">{t("fomoVariables")}</p>
          </div>

          <label className="block space-y-2 text-sm text-stone-600">
            <span>{t("fomoFieldTitle")}</span>
            <input
              required
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
            />
          </label>

          <label className="block space-y-2 text-sm text-stone-600">
            <span>{t("fomoFieldContent")}</span>
            <textarea
              required
              rows={5}
              value={form.content}
              onChange={(event) =>
                setForm((current) => ({ ...current, content: event.target.value }))
              }
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
            />
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2 text-sm text-stone-600">
              <span>{t("fomoFieldType")}</span>
              <select
                value={form.type}
                onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
              >
                <option value="sales">{t("fomoTypeSales")}</option>
                <option value="stock">{t("fomoTypeStock")}</option>
                <option value="custom">{t("fomoTypeCustom")}</option>
              </select>
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  setForm((current) => ({ ...current, isActive: event.target.checked }))
                }
              />
              {t("fomoFieldActive")}
            </label>
          </div>

          {message ? <p className="text-sm text-stone-600">{message}</p> : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#b38a45] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? t("commonLoading")
                : form.id
                  ? t("fomoSaveUpdate")
                  : t("fomoSaveCreate")}
            </button>
            {form.id ? (
              <button
                type="button"
                onClick={() => setForm(initialForm)}
                className="rounded-full border border-stone-300 px-6 py-3 text-sm text-stone-600"
              >
                {t("fomoCancelEdit")}
              </button>
            ) : null}
          </div>
        </form>

        <section className="luxury-card rounded-[32px] p-6">
          <h2 className="text-xl font-bold text-stone-900">{t("fomoAllMessages")}</h2>
          <p className="mt-2 text-sm text-stone-500">{t("fomoAllMessagesDescription")}</p>

          {loading ? <p className="mt-5 text-sm text-stone-500">{t("commonLoading")}</p> : null}

          <div className="mt-5 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-3xl border border-stone-200 bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-stone-900">{item.title}</p>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${
                          item.isActive
                            ? "bg-orange-100 text-orange-600"
                            : "bg-stone-100 text-stone-500"
                        }`}
                      >
                        {item.isActive ? t("commonActive") : t("commonInactive")}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-stone-500">{item.content}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-stone-400">
                      {item.type === "sales"
                        ? t("fomoTypeSales")
                        : item.type === "stock"
                          ? t("fomoTypeStock")
                          : t("fomoTypeCustom")}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setForm(item)}
                      className="rounded-full border border-stone-300 px-4 py-2 text-xs text-stone-600"
                    >
                      {t("commonEdit")}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="rounded-full border border-red-200 px-4 py-2 text-xs text-red-500"
                    >
                      {t("commonDelete")}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {!loading && items.length === 0 ? (
              <p className="text-sm text-stone-500">{t("fomoNoData")}</p>
            ) : null}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
