"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAdminToken, setAdminToken } from "@/lib/admin-client";
import { useTranslation } from "@/lib/use-translation";

export default function AdminLoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [form, setForm] = useState({ username: "admin", password: "Sinhnam2000@@" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (getAdminToken()) {
      router.replace("/admin");
    }
  }, [router]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(t("loginFailed"));
      }

      setAdminToken(data.token);
      router.push("/admin");
    } catch (loginError) {
      setError(loginError.message || t("loginFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f2ea] px-4 py-8">
      <form onSubmit={handleSubmit} className="luxury-card w-full max-w-md rounded-[32px] p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-stone-400">{t("logo")} ADMIN</p>
        <h1 className="mt-3 text-3xl font-bold text-stone-900">{t("loginTitle")}</h1>
        <p className="mt-2 text-sm text-stone-500">{t("loginDescription")}</p>

        <div className="mt-6 space-y-4">
          <label className="block space-y-2 text-sm text-stone-600">
            <span>{t("loginUsername")}</span>
            <input
              required
              value={form.username}
              onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
            />
          </label>

          <label className="block space-y-2 text-sm text-stone-600">
            <span>{t("loginPassword")}</span>
            <input
              required
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
            />
          </label>
        </div>

        {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-full bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#b38a45] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? t("loginSubmitting") : t("loginSubmit")}
        </button>
      </form>
    </div>
  );
}
