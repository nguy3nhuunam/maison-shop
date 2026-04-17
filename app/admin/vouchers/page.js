"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin-shell";
import { adminFetch } from "@/lib/admin-client";
import { useTranslation } from "@/lib/use-translation";

const initialForm = {
  id: null,
  code: "",
  discountPercent: "",
  isActive: true,
  maxUsage: "",
};

export default function AdminVouchersPage() {
  const { t } = useTranslation();
  const [vouchers, setVouchers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadVouchers() {
      try {
        const data = await adminFetch("/api/vouchers");
        setVouchers(data.vouchers);
      } catch (error) {
        setMessage(error.message || t("voucherInvalid"));
      } finally {
        setLoading(false);
      }
    }

    loadVouchers();
  }, [t]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const payload = {
        code: form.code,
        discountPercent: Number(form.discountPercent),
        isActive: form.isActive,
        maxUsage: Number(form.maxUsage || 0),
      };

      if (form.id) {
        const data = await adminFetch(`/api/vouchers/${form.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setVouchers((current) =>
          current.map((voucher) => (voucher.id === form.id ? data.voucher : voucher)),
        );
      } else {
        const data = await adminFetch("/api/vouchers", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setVouchers((current) => [data.voucher, ...current]);
      }

      setForm(initialForm);
      setMessage(t("voucherSaved"));
    } catch (error) {
      setMessage(error.message || t("voucherInvalid"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm(t("voucherDeleteConfirm"))) {
      return;
    }

    try {
      await adminFetch(`/api/vouchers/${id}`, {
        method: "DELETE",
      });
      setVouchers((current) => current.filter((voucher) => voucher.id !== id));
      if (form.id === id) {
        setForm(initialForm);
      }
      setMessage(t("voucherDeleted"));
    } catch (error) {
      setMessage(error.message || t("voucherInvalid"));
    }
  }

  return (
    <AdminShell titleKey="adminVouchers" descriptionKey="voucherListDescription">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={handleSubmit} className="luxury-card space-y-5 rounded-[32px] p-6">
          <div>
            <h2 className="text-xl font-bold text-stone-900">
              {form.id ? t("voucherEditTitle") : t("voucherCreateTitle")}
            </h2>
          </div>

          <label className="block space-y-2 text-sm text-stone-600">
            <span>{t("voucherCode")}</span>
            <input
              required
              value={form.code}
              onChange={(event) =>
                setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))
              }
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
            />
          </label>

          <label className="block space-y-2 text-sm text-stone-600">
            <span>{t("voucherPercent")}</span>
            <input
              required
              min="1"
              max="100"
              type="number"
              value={form.discountPercent}
              onChange={(event) =>
                setForm((current) => ({ ...current, discountPercent: event.target.value }))
              }
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
            />
          </label>

          <label className="block space-y-2 text-sm text-stone-600">
            <span>{t("voucherMaxUsage")}</span>
            <input
              min="0"
              type="number"
              value={form.maxUsage}
              onChange={(event) =>
                setForm((current) => ({ ...current, maxUsage: event.target.value }))
              }
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
            />
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                setForm((current) => ({ ...current, isActive: event.target.checked }))
              }
            />
            {t("voucherActive")}
          </label>

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
                  ? t("voucherUpdate")
                  : t("voucherCreate")}
            </button>
            {form.id ? (
              <button
                type="button"
                onClick={() => setForm(initialForm)}
                className="rounded-full border border-stone-300 px-6 py-3 text-sm text-stone-600"
              >
                {t("commonCancel")}
              </button>
            ) : null}
          </div>
        </form>

        <section className="luxury-card rounded-[32px] p-6">
          <h2 className="text-xl font-bold text-stone-900">{t("voucherListTitle")}</h2>
          {loading ? <p className="mt-5 text-sm text-stone-500">{t("commonLoading")}</p> : null}

          <div className="mt-5 space-y-3">
            {vouchers.map((voucher) => (
              <div key={voucher.id} className="rounded-3xl border border-stone-200 bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-stone-900">{voucher.code}</p>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${
                          voucher.isActive
                            ? "bg-orange-100 text-orange-600"
                            : "bg-stone-100 text-stone-500"
                        }`}
                      >
                        {voucher.isActive ? t("commonActive") : t("commonInactive")}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-stone-500">
                      {t("discountBadge", { percent: voucher.discountPercent })}
                    </p>
                    <p className="mt-1 text-sm text-stone-400">
                      {t("voucherUsage")}: {voucher.usedCount}/{voucher.maxUsage || "∞"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          id: voucher.id,
                          code: voucher.code,
                          discountPercent: String(voucher.discountPercent),
                          isActive: voucher.isActive,
                          maxUsage: String(voucher.maxUsage),
                        })
                      }
                      className="rounded-full border border-stone-300 px-4 py-2 text-xs text-stone-600"
                    >
                      {t("commonEdit")}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(voucher.id)}
                      className="rounded-full border border-red-200 px-4 py-2 text-xs text-red-500"
                    >
                      {t("commonDelete")}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {!loading && vouchers.length === 0 ? (
              <p className="text-sm text-stone-500">{t("voucherNoData")}</p>
            ) : null}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
