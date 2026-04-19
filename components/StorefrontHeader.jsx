"use client";

import Image from "next/image";
import Link from "next/link";
import CurrencyDropdown from "@/components/CurrencyDropdown";
import LanguageDropdown from "@/components/LanguageDropdown";
import { useTranslation } from "@/lib/use-translation";

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 stroke-current">
      <path
        d="M3 4h2l2.4 10.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 7H7"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="19" r="1.2" />
      <circle cx="17" cy="19" r="1.2" />
    </svg>
  );
}

export default function StorefrontHeader({
  brandLogoSrc,
  logoVisible,
  onLogoError,
  cartCount,
  onCartOpen,
}) {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-30 border-b border-[#ddd4ca] bg-[#eae3da]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:py-4 lg:px-8">
        <Link href="/" className="group flex min-w-0 items-center gap-2 rounded-2xl px-1 py-1 sm:gap-3.5">
          <div className="flex shrink-0 items-center justify-center rounded-xl border border-[#e5ded5] bg-white/75 p-1.5 shadow-[0_8px_24px_rgba(120,95,60,0.06)] transition-colors group-hover:border-[#d8c8b6] sm:p-1.5">
            {logoVisible ? (
              <Image
                src={brandLogoSrc}
                alt="MAISON"
                width={72}
                height={72}
                priority
                onError={onLogoError}
                className="h-auto w-[46px] shrink-0 rounded-[10px] object-contain transition-opacity group-hover:opacity-85 sm:w-[54px] lg:w-[68px]"
              />
            ) : (
              <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[10px] bg-white text-sm font-bold tracking-[0.2em] text-stone-900 sm:h-[54px] sm:w-[54px] lg:h-[68px] lg:w-[68px]">
                M
              </div>
            )}
          </div>

          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-[9px] uppercase tracking-[0.28em] text-stone-500 sm:text-[11px] sm:tracking-[0.38em]">
              MAISONSHOP.STORE
            </p>
            <h1 className="mt-1 truncate text-[0.9rem] font-extrabold tracking-[0.2em] text-stone-900 sm:text-2xl sm:tracking-[0.28em]">
              {t.logo}
            </h1>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <LanguageDropdown />
          <CurrencyDropdown />
          <button
            type="button"
            onClick={onCartOpen}
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-900 text-white transition hover:bg-[#b38a45]"
            aria-label={t.viewCart}
          >
            <CartIcon />
            <span className="absolute -right-1 -top-1 rounded-full bg-[#b38a45] px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
