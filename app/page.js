import StorefrontClient from "@/components/storefront-client";
import { getActiveFomoItems, getActiveProducts, getActiveTags, getSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
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
      activeTagSlug="all"
    />
  );
}
