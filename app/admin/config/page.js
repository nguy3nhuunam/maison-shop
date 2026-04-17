"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin-shell";
import { adminFetch } from "@/lib/admin-client";
import { useTranslation } from "@/lib/use-translation";

const initialState = {
  currency: "TWD",
  messengerUrl: "https://m.me/yourpage",
};

export default function AdminConfigPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadConfig() {
      try {
        const data = await adminFetch("/api/config");
        setForm(data.settings);
      } catch (error) {
        setMessage(error.message || t("configLoadError"));
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, [t]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      await adminFetch("/api/config", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      setMessage(t("configSaved"));
    } catch (error) {
      setMessage(error.message || t("configSaveError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell titleKey="configTitle" descriptionKey="configDescriptionModern">
      <form onSubmit={handleSubmit} className="luxury-card space-y-5 rounded-[32px] p-6">
        {loading ? <p className="text-sm text-stone-500">{t("commonLoading")}</p> : null}

        {!loading ? (
          <>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2 text-sm text-stone-600">
                <span>{t("configCurrency")}</span>
                <select
                  value={form.currency}
                  onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value }))}
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
                >
                  <option value="TWD">TWD</option>
                  <option value="VND">VND</option>
                </select>
              </label>

              <label className="space-y-2 text-sm text-stone-600">
                <span>{t("configMessengerUrl")}</span>
                <input
                  value={form.messengerUrl}
                  onChange={(event) => setForm((current) => ({ ...current, messengerUrl: event.target.value }))}
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
                />
              </label>
            </div>
            <div className="rounded-[28px] border border-stone-200 bg-white p-5 text-sm text-stone-500">
              <p className="font-semibold text-stone-900">{t("configInfraTitle")}</p>
              <p className="mt-2">{t("configInfraDescription")}</p>
            </div>

            {message ? <p className="text-sm text-stone-600">{message}</p> : null}

            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#b38a45] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? t("configSaving") : t("configSave")}
            </button>
          </>
        ) : null}
      </form>
    </AdminShell>
  );
}
