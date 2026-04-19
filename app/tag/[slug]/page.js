import { notFound } from "next/navigation";
import StorefrontClient from "@/components/storefront-client";
import {
  getActiveFomoItems,
  getActiveProducts,
  getActiveTags,
  getSettings,
  getTagBySlug,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const tag = await getTagBySlug(resolvedParams?.slug, { activeOnly: true });

  if (!tag) {
    return {
      title: "Maison Shop",
    };
  }

  return {
    title: `${tag.name} | Maison Shop`,
    description: `Khám phá sản phẩm theo tag ${tag.name} tại Maison Shop.`,
    alternates: {
      canonical: `/tag/${tag.slug}`,
    },
  };
}

export default async function TagPage({ params }) {
  const resolvedParams = await params;
  const tag = await getTagBySlug(resolvedParams?.slug, { activeOnly: true });

  if (!tag) {
    notFound();
  }

  const [products, settings, fomoItems, tags] = await Promise.all([
    getActiveProducts(),
    getSettings(),
    getActiveFomoItems(),
    getActiveTags(),
  ]);

  return (
    <StorefrontClient
      products={products}
      settings={settings}
      fomoItems={fomoItems}
      tags={tags}
      activeTagSlug={tag.slug}
    />
  );
}
