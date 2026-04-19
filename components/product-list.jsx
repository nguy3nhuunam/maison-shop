import { formatCurrency } from "@/lib/currency";
import { getDiscountedUnitPrice } from "@/lib/pricing";

export default function ProductList({
  products = [],
  currency,
  language,
  t,
  onProductSelect,
  emptyMessage,
}) {
  return (
    <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
      {products.length === 0 ? (
        <div className="luxury-card col-span-full rounded-[32px] p-10 text-center text-sm text-stone-500">
          {emptyMessage}
        </div>
      ) : null}

      {products.map((product) => {
        const soldOut = product.totalStock <= 0;
        const discountedPrice = getDiscountedUnitPrice(product.basePrice, product.discountPercent);

        return (
          <article
            key={product.id}
            className="luxury-card group flex h-full flex-col rounded-[30px] p-3 lg:p-4"
          >
            <button
              type="button"
              onClick={() => onProductSelect(product.id)}
              className="overflow-hidden rounded-[24px] bg-[#f2eadf] text-left"
            >
              <img
                src={product.image}
                alt={product.name}
                className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </button>

            <div className="flex flex-1 flex-col px-1 pt-4">
              <div className="flex flex-1 flex-col">
                <div className="space-y-2">
                  <h3 className="text-base font-semibold lg:text-lg">{product.name}</h3>
                  <p
                    className="min-h-[3rem] overflow-hidden text-sm leading-6 text-stone-500"
                    style={{
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: 2,
                    }}
                  >
                    {product.shortDescription || product.description}
                  </p>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {product.discountPercent > 0 ? (
                      <span className="rounded-full bg-stone-900 px-3 py-1 text-[11px] font-semibold text-white">
                        {t("discountBadge", { percent: product.discountPercent })}
                      </span>
                    ) : null}
                    {product.isFreeShip ? (
                      <span className="rounded-full bg-[#f6efe2] px-3 py-1 text-[11px] font-semibold text-[#b38a45]">
                        {t("freeShipBadge")}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm uppercase tracking-[0.2em] text-[#b38a45]">
                      {t("fromLabel")}
                    </p>
                    <div className="text-right">
                      {product.discountPercent > 0 ? (
                        <p className="text-sm text-stone-400 line-through">
                          {formatCurrency(product.basePrice, currency, language)}
                        </p>
                      ) : null}
                      <p className="text-lg font-bold">
                        {formatCurrency(discountedPrice, currency, language)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-stone-400">
                    <span>{t("variantCountLabel", { count: product.variants.length })}</span>
                    <span>
                      {soldOut ? t("soldOut") : t("stockLeft", { count: product.totalStock })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-auto grid gap-2 pt-4">
                <button
                  type="button"
                  disabled={soldOut}
                  onClick={() => onProductSelect(product.id)}
                  className="rounded-full bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#b38a45] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t.buyNow}
                </button>
                <button
                  type="button"
                  disabled={soldOut}
                  onClick={() => onProductSelect(product.id)}
                  className="rounded-full border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-[#b38a45] hover:text-[#b38a45] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t.addToCart}
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
