"use client";

import { useMemo, useState, useEffect } from "react";
import AdminShell from "@/components/admin-shell";
import { adminFetch } from "@/lib/admin-client";
import { slugifyTagName } from "@/lib/tag-utils";
import { useTranslation } from "@/lib/use-translation";

const initialForm = {
  name: "",
};

export default function AdminTagsPage() {
  const { t } = useTranslation();
  const [tags, setTags] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const slugPreview = useMemo(() => slugifyTagName(form.name), [form.name]);

  useEffect(() => {
    async function loadTags() {
      try {
        const data = await adminFetch("/api/tags?includeAll=true");
        setTags(data.tags);
      } catch (error) {
        setMessage(error.message || t("tagsLoadError"));
      } finally {
        setLoading(false);
      }
    }

    loadTags();
  }, [t]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const data = await adminFetch("/api/tags", {
        method: "POST",
        body: JSON.stringify({ name: form.name }),
      });
      setTags((current) => [...current, data.tag].sort((left, right) => left.name.localeCompare(right.name)));
      setForm(initialForm);
    } catch (error) {
      setMessage(error.message || t("tagSaveError"));
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(tag) {
    setMessage("");

    try {
      const data = await adminFetch(`/api/tags/${tag.id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !tag.isActive }),
      });
      setTags((current) => current.map((item) => (item.id === tag.id ? data.tag : item)));
    } catch (error) {
      setMessage(error.message || t("tagSaveError"));
    }
  }

  async function handleDelete(tag) {
    if (!window.confirm(t("tagDeleteConfirm"))) {
      return;
    }

    setMessage("");

    try {
      await adminFetch(`/api/tags/${tag.id}`, {
        method: "DELETE",
      });
      setTags((current) => current.filter((item) => item.id !== tag.id));
    } catch (error) {
      setMessage(error.message || t("tagSaveError"));
    }
  }

  return (
    <AdminShell titleKey="tagsTitle" descriptionKey="tagsDescription">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={handleSubmit} className="luxury-card space-y-5 rounded-[32px] p-6">
          <div>
            <h2 className="text-xl font-bold text-stone-900">{t("tagsCreateTitle")}</h2>
            <p className="mt-2 text-sm text-stone-500">{t("tagCreateHelp")}</p>
          </div>

          <label className="block space-y-2 text-sm text-stone-600">
            <span>{t("tagFieldName")}</span>
            <input
              required
              value={form.name}
              onChange={(event) => setForm({ name: event.target.value })}
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
            />
          </label>

          <div className="rounded-3xl border border-stone-200 bg-white px-4 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-400">{t("tagFieldSlug")}</p>
            <p className="mt-2 text-sm font-medium text-stone-700">{slugPreview || "-"}</p>
          </div>

          {message ? <p className="text-sm text-stone-600">{message}</p> : null}

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#b38a45] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? t("commonLoading") : t("tagCreate")}
          </button>
        </form>

        <section className="luxury-card rounded-[32px] p-6">
          <h2 className="text-xl font-bold text-stone-900">{t("tagsTitle")}</h2>
          <p className="mt-2 text-sm text-stone-500">{t("tagsDescription")}</p>

          {loading ? <p className="mt-5 text-sm text-stone-500">{t("commonLoading")}</p> : null}

          <div className="mt-5 space-y-3">
            {tags.map((tag) => (
              <div key={tag.id} className="rounded-3xl border border-stone-200 bg-white p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-stone-900">{tag.name}</p>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${
                          tag.isActive ? "bg-orange-100 text-orange-600" : "bg-stone-100 text-stone-500"
                        }`}
                      >
                        {tag.isActive ? t("commonActive") : t("commonInactive")}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-stone-500">/{tag.slug}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggle(tag)}
                      className="rounded-full border border-stone-300 px-4 py-2 text-xs text-stone-600"
                    >
                      {tag.isActive ? t("commonInactive") : t("commonActive")}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(tag)}
                      className="rounded-full border border-red-200 px-4 py-2 text-xs text-red-500"
                    >
                      {t("commonDelete")}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {!loading && tags.length === 0 ? (
              <p className="text-sm text-stone-500">{t("tagsEmpty")}</p>
            ) : null}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
