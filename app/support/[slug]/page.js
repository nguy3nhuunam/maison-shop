import { notFound } from "next/navigation";
import SupportPageClient from "@/components/support-page-client";
import { getSettings } from "@/lib/db";
import { getSupportPageBySlug } from "@/lib/support-pages-config";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const settings = await getSettings();
  const page = getSupportPageBySlug(settings?.supportPages, resolvedParams?.slug);

  if (!page) {
    return {
      title: "MAISON SHOP",
    };
  }

  return {
    title: `${page.titleVi || page.labelVi} | MAISON SHOP`,
    description: page.summaryVi || "Thông tin hỗ trợ tại MAISON SHOP.",
    alternates: {
      canonical: `/support/${page.slug}`,
    },
  };
}

export default async function SupportPage({ params }) {
  const resolvedParams = await params;
  const settings = await getSettings();
  const page = getSupportPageBySlug(settings?.supportPages, resolvedParams?.slug);

  if (!page) {
    notFound();
  }

  return <SupportPageClient currentPage={page} supportPages={settings.supportPages} />;
}
