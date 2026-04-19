"use client";

import { useCurrency } from "@/contexts/CurrencyContext";
import { useTranslation } from "@/lib/use-translation";
import { formatCurrency } from "@/lib/currency";
import { getDiscountedUnitPrice } from "@/lib/pricing";

export default function ProductCard({ product, onSelect }) {
  const { t } = useTranslation();
  const { currency } = useCurrency();
  const soldOut = product.totalStock <= 0;
  const discountedPrice = getDiscountedUnitPrice(product.basePrice, product.discountPercent);

  return (
    <article className="luxury-card group flex h-full flex-col rounded-[30px] p-3 lg:p-4">
      <button
        type="button"
        onClick={() => onSelect(product.id)}
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
              <p className="text-sm uppercase tracking-[0.2em] text-[#b38a45]">{t("fromLabel")}</p>
              <div className="text-right">
                {product.discountPercent > 0 ? (
                  <p className="text-sm text-stone-400 line-through">
                    {formatCurrency(product.basePrice, currency)}
                  </p>
                ) : null}
                <p className="text-lg font-bold">{formatCurrency(discountedPrice, currency)}</p>
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
            onClick={() => onSelect(product.id)}
            className="rounded-full bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#b38a45] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t.buyNow}
          </button>
          <button
            type="button"
            disabled={soldOut}
            onClick={() => onSelect(product.id)}
            className="rounded-full border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-[#b38a45] hover:text-[#b38a45] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t.addToCart}
          </button>
        </div>
      </div>
    </article>
  );
}
