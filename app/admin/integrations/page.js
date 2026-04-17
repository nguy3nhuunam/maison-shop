"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin-shell";
import { adminFetch } from "@/lib/admin-client";
import { useTranslation } from "@/lib/use-translation";

const initialForm = {
  clientEmail: "",
  privateKey: "",
  sheetId: "",
  enabled: false,
};

export default function AdminIntegrationsPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [hasPrivateKey, setHasPrivateKey] = useState(false);
  const [privateKeyMasked, setPrivateKeyMasked] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await adminFetch("/api/admin/settings/google-sheets");
        setForm({
          clientEmail: data.settings.clientEmail || "",
          privateKey: "",
          sheetId: data.settings.sheetId || "",
          enabled: Boolean(data.settings.enabled),
        });
        setHasPrivateKey(Boolean(data.settings.hasPrivateKey));
        setPrivateKeyMasked(data.settings.privateKeyMasked || "");
      } catch (error) {
        setMessage(error.message || t("integrationsLoadError"));
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [t]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const data = await adminFetch("/api/admin/settings/google-sheets", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setForm((current) => ({
        ...current,
        clientEmail: data.settings.clientEmail || "",
        sheetId: data.settings.sheetId || "",
        enabled: Boolean(data.settings.enabled),
        privateKey: "",
      }));
      setHasPrivateKey(Boolean(data.settings.hasPrivateKey));
      setPrivateKeyMasked(data.settings.privateKeyMasked || "");
      setMessage(t("integrationsSaved"));
    } catch (error) {
      setMessage(error.message || t("integrationsSaveError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell titleKey="integrationsTitle" descriptionKey="integrationsDescription">
      <form onSubmit={handleSubmit} className="luxury-card space-y-6 rounded-[32px] p-6 md:p-8">
        {loading ? <p className="text-sm text-stone-500">{t("commonLoading")}</p> : null}

        {!loading ? (
          <>
            <section className="rounded-[28px] border border-stone-200 bg-white p-5 md:p-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold text-stone-900">
                  {t("integrationsGoogleSheetsTitle")}
                </h3>
                <p className="text-sm text-stone-500">{t("integrationsGoogleSheetsDescription")}</p>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <label className="space-y-3 text-sm text-stone-600">
                  <span>{t("integrationsClientEmail")}</span>
                  <input
                    value={form.clientEmail}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, clientEmail: event.target.value }))
                    }
                    className="min-h-14 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
                    placeholder="service-account@project.iam.gserviceaccount.com"
                  />
                </label>

                <label className="space-y-3 text-sm text-stone-600">
                  <span>{t("integrationsSheetId")}</span>
                  <input
                    value={form.sheetId}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, sheetId: event.target.value }))
                    }
                    className="min-h-14 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
                    placeholder="1AbCdEfGh..."
                  />
                </label>
              </div>

              <label className="mt-5 block space-y-3 text-sm text-stone-600">
                <div className="flex items-center justify-between gap-3">
                  <span>{t("integrationsPrivateKey")}</span>
                  {hasPrivateKey ? (
                    <span className="text-xs text-stone-400">
                      {t("integrationsPrivateKeyStored")}: {privateKeyMasked}
                    </span>
                  ) : null}
                </div>
                <textarea
                  rows={7}
                  value={form.privateKey}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, privateKey: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 leading-6"
                  placeholder={t("integrationsPrivateKeyPlaceholder")}
                />
                <p className="text-xs text-stone-400">{t("integrationsPrivateKeyHelp")}</p>
              </label>

              <label className="mt-5 flex min-h-14 items-center gap-3 rounded-2xl border border-stone-200 bg-[#fcfaf6] px-4 py-4 text-sm text-stone-700">
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, enabled: event.target.checked }))
                  }
                />
                <span>{t("integrationsEnableSync")}</span>
              </label>
            </section>

            <div className="rounded-[28px] border border-stone-200 bg-white p-5 text-sm text-stone-500">
              <p className="font-semibold text-stone-900">{t("integrationsSecurityTitle")}</p>
              <p className="mt-2">{t("integrationsSecurityDescription")}</p>
            </div>

            {message ? <p className="text-sm text-stone-600">{message}</p> : null}

            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#b38a45] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? t("integrationsSaving") : t("integrationsSave")}
            </button>
          </>
        ) : null}
      </form>
    </AdminShell>
  );
}
