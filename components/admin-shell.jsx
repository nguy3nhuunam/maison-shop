"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { clearAdminToken, getAdminToken } from "@/lib/admin-client";
import { useTranslation } from "@/lib/use-translation";

export default function AdminShell({ title, titleKey, description, descriptionKey, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, t } = useTranslation();
  const [ready, setReady] = useState(false);

  const navItems = useMemo(
    () => [
      { href: "/admin", label: t("adminDashboard") },
      { href: "/admin/products", label: t("adminProducts") },
      { href: "/admin/tags", label: t("adminTags") },
      { href: "/admin/vouchers", label: t("adminVouchers") },
      { href: "/admin/fomo", label: t("adminFomo") },
      { href: "/admin/orders", label: t("adminOrders") },
      { href: "/admin/integrations", label: t("adminIntegrations") },
      { href: "/admin/config", label: t("adminConfig") },
    ],
    [t],
  );
  const resolvedTitle = titleKey ? t(titleKey) : title;
  const resolvedDescription = descriptionKey ? t(descriptionKey) : description;

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-stone-500">
        {t("adminLoading")}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f2ea] text-stone-900">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[240px_1fr] lg:px-6">
        <aside className="luxury-card flex flex-col rounded-[32px] p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-stone-400">{t("logo")}</p>
            <h1 className="mt-3 text-2xl font-extrabold tracking-[0.2em]">{t("adminPanel")}</h1>
            <p className="mt-2 text-sm text-stone-500">maisonshop.store</p>
          </div>

          <div className="mt-6 flex items-center rounded-full border border-stone-200 bg-white/90 p-1 shadow-sm">
            {[
              { key: "vi", label: t("languageVi"), flag: "🇻🇳" },
              { key: "zh", label: t("languageZh"), flag: "🇹🇼" },
            ].map((option) => {
              const active = language === option.key;

              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setLanguage(option.key)}
                  className={`rounded-full px-3 py-2 text-sm transition ${
                    active
                      ? "bg-stone-900 font-semibold text-white"
                      : "text-stone-700 hover:bg-[#f6efe2] hover:text-[#b38a45]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{option.label}</span>
                    <span aria-hidden="true">{option.flag}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-2xl px-4 py-3 text-sm transition ${
                    active
                      ? "bg-stone-900 text-white"
                      : "bg-white/60 text-stone-600 hover:bg-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => {
              clearAdminToken();
              router.push("/admin/login");
            }}
            className="mt-auto rounded-2xl border border-stone-300 px-4 py-3 text-sm text-stone-700 transition hover:border-stone-900 hover:text-stone-900"
          >
            {t("adminLogout")}
          </button>
        </aside>

        <main className="space-y-6">
          <header className="luxury-card rounded-[32px] px-6 py-6">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-400">{t("adminPanel")}</p>
            <h2 className="mt-2 text-3xl font-bold text-stone-900">{resolvedTitle}</h2>
            {resolvedDescription ? (
              <p className="mt-2 max-w-2xl text-sm text-stone-500">{resolvedDescription}</p>
            ) : null}
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}
