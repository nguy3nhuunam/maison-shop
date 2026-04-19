"use client";

import Link from "next/link";
import { useState } from "react";
import StorefrontHeader from "@/components/StorefrontHeader";
import { getLocalizedHomepageText } from "@/lib/homepage-config";
import { sanitizeSupportPages } from "@/lib/support-pages-config";
import { useTranslation } from "@/lib/use-translation";

const BRAND_LOGO_SRC = "/brand/maison-logo.png";

export default function SupportPageClient({ currentPage, supportPages }) {
  const { language } = useTranslation();
  const [logoVisible, setLogoVisible] = useState(true);
  const pages = sanitizeSupportPages(supportPages);
  const resolvedPage =
    pages.find((page) => page.slug === currentPage?.slug) || currentPage || pages[0] || null;

  if (!resolvedPage) {
    return null;
  }

  const pageTitle = getLocalizedHomepageText(
    language,
    resolvedPage.titleVi,
    resolvedPage.titleZh,
    resolvedPage.labelVi,
  );
  const pageSummary = getLocalizedHomepageText(
    language,
    resolvedPage.summaryVi,
    resolvedPage.summaryZh,
  );
  const pageContent = getLocalizedHomepageText(
    language,
    resolvedPage.contentVi,
    resolvedPage.contentZh,
  );

  return (
    <div className="min-h-screen bg-[#f7f2ea] pb-16 text-stone-900">
      <StorefrontHeader
        brandLogoSrc={BRAND_LOGO_SRC}
        logoVisible={logoVisible}
        onLogoError={() => setLogoVisible(false)}
        cartCount={0}
        onCartOpen={() => {}}
      />

      <main className="mx-auto max-w-7xl px-4 pt-8 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <article className="luxury-card rounded-[32px] px-6 py-8 sm:px-8 sm:py-10">
            <Link
              href="/"
              className="inline-flex items-center rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-600 transition hover:border-stone-900 hover:text-stone-900"
            >
              {language === "zh" ? "返回首頁" : "Quay lại trang chủ"}
            </Link>

            <div className="mt-6 border-b border-stone-100 pb-6">
              <p className="text-xs uppercase tracking-[0.32em] text-[#b38a45]">
                {language === "zh" ? "支援資訊" : "Thông tin hỗ trợ"}
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-stone-900 sm:text-4xl">
                {pageTitle}
              </h1>
              {pageSummary ? (
                <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-500">{pageSummary}</p>
              ) : null}
            </div>

            <div className="mt-8 whitespace-pre-line text-[15px] leading-8 text-stone-700">
              {pageContent}
            </div>
          </article>

          <aside className="space-y-4">
            <div className="luxury-card rounded-[28px] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-900">
                {language === "zh" ? "更多支援" : "Các trang hỗ trợ"}
              </p>

              <div className="mt-4 space-y-3">
                {pages.map((page) => {
                  const isActive = page.slug === resolvedPage.slug;
                  const label = getLocalizedHomepageText(language, page.labelVi, page.labelZh);

                  return (
                    <Link
                      key={page.key}
                      href={`/support/${page.slug}`}
                      className={`block rounded-[22px] px-4 py-3 text-sm transition ${
                        isActive
                          ? "bg-stone-900 text-white"
                          : "bg-white text-stone-600 hover:bg-[#f6efe2] hover:text-stone-900"
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
