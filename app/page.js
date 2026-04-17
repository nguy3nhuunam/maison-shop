import StorefrontClient from "@/components/storefront-client";
import { getActiveFomoItems, getActiveProducts, getSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, settings, fomoItems] = await Promise.all([
    getActiveProducts(),
    getSettings(),
    getActiveFomoItems(),
  ]);

  return <StorefrontClient products={products} settings={settings} fomoItems={fomoItems} />;
}
